/**
 * @file flash.ts
 * @brief Flash Framework - Express-like HTTP Server API
 * 
 * This module provides the main Flash class that combines the Router,
 * Middleware, and Server components into an easy-to-use Express-like API.
 */

import { Router } from "./router";
import { Request } from "./request";
import { Response } from "./response";
import { RouteHandler } from "./types";
import { MiddlewareManager, MiddlewareFunction, NextFunction } from "./middleware";
import { createServer, IncomingMessage, ServerResponse, Server as HttpServer } from "http";
import { URL } from "url";

/**
 * Flash configuration options
 */
export interface FlashOptions {
  /** Port to listen on (default: 5627) */
  port?: number;
  /** Enable request logging (default: true) */
  logger?: boolean;
  /** Number of worker threads (default: 4) */
  workers?: number;
}

/**
 * Flash Framework main class
 * 
 * Provides an Express-like API for creating HTTP servers.
 * 
 * @example
 * ```typescript
 * const app = new Flash();
 * 
 * app.get("/hello", (req, res) => {
 *   res.send("Hello, World!");
 * });
 * 
 * app.listen(5627, () => {
 *   console.log("Server running on port 5627");
 * });
 * ```
 */
export class Flash {
  private router: Router;
  private middleware: MiddlewareManager;
  private options: FlashOptions;
  private server: HttpServer | null = null;

  constructor(options: FlashOptions = {}) {
    this.options = {
      port: options.port ?? 5627,
      logger: options.logger ?? true,
      workers: options.workers ?? 4,
    };
    this.router = new Router();
    this.middleware = new MiddlewareManager();
  }

  /**
   * Add middleware to the application
   */
  use(middleware: MiddlewareFunction): this {
    this.middleware.use(middleware);
    return this;
  }

  /**
   * Register a GET route
   */
  get(path: string, ...handlers: RouteHandler[]): this {
    if (handlers.length === 1) {
      this.router.get(path, handlers[0]);
    } else {
      // Multiple handlers = middleware chain + final handler
      const finalHandler = handlers[handlers.length - 1];
      const middlewares = handlers.slice(0, -1) as unknown as MiddlewareFunction[];
      
      this.router.get(path, async (req: Request, res: Response) => {
        // Run all middlewares
        for (const mw of middlewares) {
          await new Promise<void>((resolve) => {
            mw(req, res, resolve);
          });
        }
        
        // Finally call the handler
        await finalHandler(req, res);
      });
    }
    return this;
  }

  /**
   * Register a POST route
   */
  post(path: string, handler: RouteHandler): this {
    this.router.post(path, handler);
    return this;
  }

  /**
   * Register a PUT route
   */
  put(path: string, handler: RouteHandler): this {
    this.router.put(path, handler);
    return this;
  }

  /**
   * Register a DELETE route
   */
  delete(path: string, handler: RouteHandler): this {
    this.router.delete(path, handler);
    return this;
  }

  /**
   * Parse query string into object
   */
  private parseQuery(urlString: string): Record<string, string> {
    const query: Record<string, string> = {};
    try {
      const url = new URL(urlString, "http://localhost");
      url.searchParams.forEach((value, key) => {
        query[key] = value;
      });
    } catch {
      // Ignore parsing errors
    }
    return query;
  }

  /**
   * Extract path from URL (without query string)
   */
  private extractPath(urlString: string): string {
    try {
      const url = new URL(urlString, "http://localhost");
      return url.pathname;
    } catch {
      return urlString.split("?")[0] || "/";
    }
  }

  /**
   * Start the server
   */
  listen(port?: number, callback?: () => void): HttpServer {
    const listenPort = port ?? this.options.port ?? 5627;
    
    this.server = createServer(async (nodeReq: IncomingMessage, nodeRes: ServerResponse) => {
      try {
        // Parse request body for POST/PUT
        let body = "";
        if (nodeReq.method === "POST" || nodeReq.method === "PUT") {
          body = await new Promise<string>((resolve) => {
            let data = "";
            nodeReq.on("data", (chunk) => { data += chunk; });
            nodeReq.on("end", () => resolve(data));
          });
        }

        const urlString = nodeReq.url || "/";
        const path = this.extractPath(urlString);
        const query = this.parseQuery(urlString);
        const headers: Record<string, string> = {};
        
        // Convert headers to simple Record
        for (const [key, value] of Object.entries(nodeReq.headers)) {
          if (typeof value === "string") {
            headers[key] = value;
          } else if (Array.isArray(value)) {
            headers[key] = value.join(", ");
          }
        }

        // Create Flash Request object with proper signature
        const req = new Request(
          nodeReq.method || "GET",
          path,
          {},  // params - will be populated by router
          query,
          headers,
          body || undefined
        );

        // Create Flash Response object that writes to Node response
        const res = new Response();
        
        // Override send method to actually write to Node response
        const originalSend = res.send.bind(res);
        res.send = (data: string) => {
          nodeRes.writeHead(res.getStatusCode(), res.getHeaders());
          nodeRes.end(data);
        };

        // Override json method to actually write to Node response
        const originalJson = res.json.bind(res);
        res.json = (data: any) => {
          res.header("Content-Type", "application/json");
          nodeRes.writeHead(res.getStatusCode(), res.getHeaders());
          nodeRes.end(JSON.stringify(data));
        };

        // Run global middleware
        await this.middleware.execute(req, res);

        // Handle the request with router
        await this.router.handleRequest(req, res);
      } catch (error) {
        console.error("Request error:", error);
        nodeRes.writeHead(500, { "Content-Type": "application/json" });
        nodeRes.end(JSON.stringify({ error: "Internal Server Error" }));
      }
    });

    this.server.listen(listenPort, () => {
      if (this.options.logger) {
        console.log(`Flash server listening on port ${listenPort}`);
      }
      if (callback) {
        callback();
      }
    });

    return this.server;
  }

  /**
   * Stop the server
   */
  close(callback?: () => void): void {
    if (this.server) {
      this.server.close(() => {
        if (callback) callback();
      });
    }
  }
}

/**
 * Factory function to create a Flash instance
 */
export function createFlash(options?: FlashOptions): Flash {
  return new Flash(options);
}

export default Flash;
