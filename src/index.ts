import { FlashOptions, RouteHandler, Request, Response } from "./types";
import * as http from "http";
import * as url from "url";

export class Flash {
  private routes: Map<string, RouteHandler> = new Map();
  private options: FlashOptions;
  private server?: http.Server;

  constructor(options: FlashOptions = {}) {
    this.options = {
      // Default options
      port: 5627,
  }

  get(path: string, handler: RouteHandler): this {
    this.routes.set(`GET ${path}`, handler);
    return this;
  }

  post(path: string, handler: RouteHandler): this {
    this.routes.set(`POST ${path}`, handler);
    return this;
  }

  put(path: string, handler: RouteHandler): this {
    this.routes.set(`PUT ${path}`, handler);
    return this;
  }

  delete(path: string, handler: RouteHandler): this {
    this.routes.set(`DELETE ${path}`, handler);
    return this;
  }

  listen(port?: number, callback?: () => void): void {
        // Start the C++ server
    const serverPort = port || this.options.port || 5627;

    this.server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });

    this.server.listen(serverPort, () => {
      console.log(`🚀 Flash server listening on port ${serverPort}`);
      if (callback) {
        callback();
      }
    });
  }

  private handleRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): void {
    const method = req.method || "GET";
    const urlPath = req.url || "/";
    const parsedUrl = url.parse(urlPath, true);

    // Find matching route
    const routeKey = `${method} ${parsedUrl.pathname}`;
    const handler = this.routes.get(routeKey);

    if (!handler) {
      // 404 Not Found
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not Found" }));
      return;
    }

    // Create request object
    const request: Request = {
      method,
      path: parsedUrl.pathname || "/",
      params: this.extractParams(
        parsedUrl.pathname || "/",
        routeKey.replace(`${method} `, "")
      ),
      query: parsedUrl.query as Record<string, string>,
      headers: req.headers as Record<string, string>,
      body: null,
    };

    // Create response object
    const response: Response = {
      status: (code: number) => {
        res.statusCode = code;
        return response;
      },
      json: (data: any) => {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(data));
      },
      send: (data: string) => {
        res.end(data);
      },
      end: () => {
        res.end();
      },
    };

    // Call handler
    try {
      const result = handler(request, response);
      if (result && typeof result.then === "function") {
        result.catch((error: any) => {
          console.error("Handler error:", error);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Internal Server Error" }));
        });
      }
    } catch (error) {
      console.error("Handler error:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal Server Error" }));
    }
  }

  private extractParams(
    pathname: string,
    routePattern: string
  ): Record<string, string> {
    const params: Record<string, string> = {};
    const pathParts = pathname.split("/").filter((p) => p);
    const routeParts = routePattern.split("/").filter((p) => p);

    for (let i = 0; i < routeParts.length; i++) {
      const routePart = routeParts[i];
      if (routePart.startsWith(":")) {
        const paramName = routePart.slice(1);
        params[paramName] = pathParts[i] || "";
      }
    }

    return params;
  }
}
