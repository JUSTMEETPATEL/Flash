/**
 * @file middleware.ts
 * @brief Middleware system for Flash Framework
 * @author Flash Framework Team
 * @date 2025-10-07
 *
 * This module provides middleware functionality with:
 * - Middleware chaining
 * - Logger middleware (request logging)
 * - CORS middleware (cross-origin handling)
 * - Body parser middleware (JSON/form parsing)
 * - Custom middleware support
 */

import { Request } from "./request";
import { Response } from "./response";

/**
 * Next function to call the next middleware in the chain.
 * Allows both synchronous and asynchronous middleware execution.
 */
export type NextFunction = () => void | Promise<void>;

/**
 * Middleware function signature.
 *
 * @param req - Request object
 * @param res - Response object
 * @param next - Function to call the next middleware in the chain
 *
 * @example
 * ```typescript
 * const logger: MiddlewareFunction = (req, res, next) => {
 *   console.log(`${req.method} ${req.path}`);
 *   next(); // Pass to next middleware
 * };
 * ```
 */
export type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

/**
 * Middleware manager for handling middleware chains.
 * Executes middleware in sequence using the Chain of Responsibility pattern.
 */
export class MiddlewareManager {
  private middlewares: MiddlewareFunction[] = [];

  /**
   * Register a middleware function to be executed for all requests.
   * Middleware functions are executed in the order they are registered.
   *
   * @param middleware - Middleware function to register
   *
   * @example
   * ```typescript
   * const manager = new MiddlewareManager();
   * manager.use((req, res, next) => {
   *   console.log('Request received');
   *   next();
   * });
   * ```
   */
  use(middleware: MiddlewareFunction): void {
    this.middlewares.push(middleware);
  }

  /**
   * Execute all registered middleware in sequence.
   * Each middleware must call next() to pass control to the next middleware.
   * If a middleware doesn't call next(), the chain stops.
   *
   * @param req - Request object
   * @param res - Response object
   *
   * @example
   * ```typescript
   * await manager.execute(req, res);
   * ```
   */
  async execute(req: Request, res: Response): Promise<void> {
    let index = 0;

    const executeNext = async (): Promise<void> => {
      if (index >= this.middlewares.length) {
        return;
      }

      const middleware = this.middlewares[index];
      index++;

      await middleware(req, res, executeNext);
    };

    await executeNext();
  }

  /**
   * Get all registered middleware functions.
   * Returns a copy of the middleware array.
   *
   * @returns Array of registered middleware functions
   */
  getMiddlewares(): MiddlewareFunction[] {
    return [...this.middlewares];
  }

  /**
   * Clear all registered middleware.
   * Useful for testing or resetting middleware state.
   */
  clearMiddlewares(): void {
    this.middlewares = [];
  }
}

/**
 * Creates a logger middleware that logs incoming requests.
 * Logs timestamp, HTTP method, and request path for each request.
 *
 * @returns Middleware function that logs requests
 *
 * @example
 * ```typescript
 * const logger = createLoggerMiddleware();
 * app.use(logger);
 * // Logs: [2025-10-07T10:30:45.123Z] GET /users/123
 * ```
 */
export function createLoggerMiddleware(): MiddlewareFunction {
  return (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
  };
}

/**
 * CORS (Cross-Origin Resource Sharing) middleware options.
 */
export interface CorsOptions {
  /** Allowed origin (default: '*') */
  origin?: string;
  /** Allowed HTTP methods (default: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']) */
  methods?: string[];
  /** Allowed headers (default: ['Content-Type', 'Authorization']) */
  allowedHeaders?: string[];
  /** Allow credentials (default: false) */
  credentials?: boolean;
}

/**
 * Creates a CORS middleware that handles cross-origin requests.
 * Adds appropriate CORS headers to allow cross-origin resource sharing.
 *
 * @param options - CORS configuration options
 * @returns Middleware function that sets CORS headers
 *
 * @example
 * ```typescript
 * // Allow all origins
 * app.use(createCorsMiddleware());
 *
 * // Restrict to specific origin
 * app.use(createCorsMiddleware({
 *   origin: 'https://example.com',
 *   methods: ['GET', 'POST'],
 *   credentials: true
 * }));
 * ```
 */
export function createCorsMiddleware(
  options: CorsOptions = {}
): MiddlewareFunction {
  const origin = options.origin || "*";
  const methods = options.methods || [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "OPTIONS",
  ];
  const headers = options.allowedHeaders || ["Content-Type", "Authorization"];
  const credentials = options.credentials || false;

  return (req, res, next) => {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Methods", methods.join(", "));
    res.header("Access-Control-Allow-Headers", headers.join(", "));
    if (credentials) {
      res.header("Access-Control-Allow-Credentials", "true");
    }
    next();
  };
}

/**
 * Creates a JSON body parser middleware.
 * Parses JSON request bodies and makes them accessible via req.body.
 * Sends a 400 Bad Request response if JSON parsing fails.
 *
 * @returns Middleware function that parses JSON bodies
 *
 * @example
 * ```typescript
 * app.use(createJsonBodyParser());
 *
 * app.post('/users', (req, res) => {
 *   console.log(req.body); // { name: 'Alice', email: 'alice@example.com' }
 *   res.json({ success: true });
 * });
 * ```
 *
 * @remarks
 * This is a simplified implementation for learning purposes.
 * In production, this would read from the request stream and handle
 * various content types and encoding.
 */
export function createJsonBodyParser(): MiddlewareFunction {
  return (req, res, next) => {
    if (typeof req.body === "string") {
      try {
        // Type assertion needed because body is readonly
        (req as any).body = JSON.parse(req.body);
      } catch (error) {
        res.status(400).json({ error: "Invalid JSON" });
        return;
      }
    }
    next();
  };
}

/**
 * Error handling middleware function signature.
 * Takes 4 parameters instead of 3 (error is first parameter).
 */
export type ErrorMiddlewareFunction = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

/**
 * Creates an error handling middleware.
 * Catches and handles errors from other middleware and route handlers.
 * Provides centralized error logging and response formatting.
 *
 * @returns Error middleware function that handles errors
 *
 * @example
 * ```typescript
 * // Register error handler last
 * app.use(createErrorHandler());
 *
 * // Any errors thrown will be caught and handled
 * app.get('/error', (req, res) => {
 *   throw new Error('Something went wrong!');
 * });
 * ```
 *
 * @remarks
 * Error middleware should be registered after all other middleware
 * and route handlers to catch errors from the entire request chain.
 */
export function createErrorHandler(): ErrorMiddlewareFunction {
  return (error, req, res, next) => {
    console.error("Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  };
}
