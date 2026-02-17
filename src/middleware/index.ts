/**
 * @file middleware/index.ts
 * @brief Middleware system for Flash Framework
 *
 * Provides middleware types, the middleware manager,
 * and built-in middleware factories.
 */

import { Request } from "../request";
import { Response } from "../response";

/**
 * Next function — call to pass control to the next middleware
 */
export type NextFunction = () => void;

/**
 * Standard middleware function signature
 */
export type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

/**
 * Error-handling middleware function signature
 */
export type ErrorMiddlewareFunction = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

/**
 * CORS configuration options
 */
export interface CorsOptions {
  origin?: string | string[];
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
}

/**
 * Middleware Manager — runs a chain of middleware functions
 */
export class MiddlewareManager {
  private middlewares: MiddlewareFunction[] = [];

  /**
   * Add a middleware function to the chain
   */
  use(fn: MiddlewareFunction): void {
    this.middlewares.push(fn);
  }

  /**
   * Execute all middleware in order
   */
  async execute(req: Request, res: Response): Promise<void> {
    for (const mw of this.middlewares) {
      await new Promise<void>((resolve) => {
        mw(req, res, resolve);
      });
    }
  }
}

// ─── Built-in Middleware Factories ────────────────────────────────────────────

/**
 * Creates a request logger middleware
 */
export function createLoggerMiddleware(): MiddlewareFunction {
  return (req: Request, _res: Response, next: NextFunction) => {
    const start = Date.now();
    console.log(`→ ${req.method} ${req.path}`);
    next();
    const duration = Date.now() - start;
    console.log(`← ${req.method} ${req.path} (${duration}ms)`);
  };
}

/**
 * Creates a CORS middleware
 */
export function createCorsMiddleware(options: CorsOptions = {}): MiddlewareFunction {
  const {
    origin = "*",
    methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders = ["Content-Type", "Authorization"],
    credentials = false,
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const originValue = Array.isArray(origin) ? origin.join(", ") : origin;
    res.header("Access-Control-Allow-Origin", originValue);
    res.header("Access-Control-Allow-Methods", methods.join(", "));
    res.header("Access-Control-Allow-Headers", allowedHeaders.join(", "));

    if (credentials) {
      res.header("Access-Control-Allow-Credentials", "true");
    }

    // Handle preflight
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    next();
  };
}

/**
 * Creates a JSON body parser middleware
 */
export function createJsonBodyParser(): MiddlewareFunction {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (req.body && typeof req.body === "string") {
      try {
        (req as any).body = JSON.parse(req.body);
      } catch {
        // Not valid JSON, leave as-is
      }
    }
    next();
  };
}

/**
 * Creates a global error handler middleware
 */
export function createErrorHandler(): ErrorMiddlewareFunction {
  return (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("[Flash] Unhandled error:", err.message);
    res.status(500).json({
      error: "Internal Server Error",
      message: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  };
}
