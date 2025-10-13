/**
 * @file flash.ts
 * @brief Main Flash Framework class - integrates all components
 * @author Flash Framework Team
 * @date 2025-10-09
 *
 * This module provides the main Flash class that integrates:
 * - HTTP Server (native C++ backend)
 * - Router (request routing)
 * - Middleware (request processing pipeline)
 * - Complete framework functionality
 */

import { Server } from "./server";
import { Router } from "./router";
import { RouteHandler } from "./types";
import {
  MiddlewareManager,
  MiddlewareFunction,
  createLoggerMiddleware,
  createCorsMiddleware,
  createJsonBodyParser,
  createErrorHandler,
  CorsOptions,
} from "./middleware";
import { Request } from "./request";
import { Response } from "./response";

// =============================================================================
// TODO 7.7.1: Define Flash Configuration Options
// =============================================================================
// LEARNING: Configuration objects provide a clean way to pass multiple
// optional parameters to constructors.
//
// TASK: Define interface for Flash configuration options

/**
 * Configuration options for Flash framework
 */
// TODO 7.7.1.1: Define FlashOptions interface
// HINT: Include optional properties for:
//       - port (number) - default: 3000
//       - logger (boolean) - enable/disable logging - default: true
//       - cors (boolean | CorsOptions) - CORS configuration - default: false
//       - bodyParser (boolean) - enable JSON body parser - default: true
//
// INTERFACE:
//   export interface FlashOptions {
//     port?: number;
//     logger?: boolean;
//     cors?: boolean | CorsOptions;
//     bodyParser?: boolean;
//   }

export interface FlashOptions {
  port?: number;
  logger?: boolean;
  cors?: boolean | CorsOptions;
  bodyParser?: boolean;
}

/**
 * Default configuration values
 */
const DEFAULT_PORT = 5267;
const DEFAULT_LOGGER = true;
const DEFAULT_CORS = false;
const DEFAULT_BODY_PARSER = true;

// =============================================================================
// TODO 7.7.2: Create Flash Class
// =============================================================================
// LEARNING: The Flash class is the main API entry point. It integrates
// Server, Router, and MiddlewareManager into a unified interface.
//
// TASK: Create the Flash class that brings everything together

/**
 * Flash Framework - Main class
 *
 * Integrates HTTP server, routing, and middleware into a unified framework.
 * Provides Express-like API for building web applications.
 *
 * @example
 * ```typescript
 * const app = new Flash();
 *
 * app.get('/users/:id', (req, res) => {
 *   res.json({ id: req.params.id, name: 'Alice' });
 * });
 *
 * app.listen(3000);
 * ```
 */
export class Flash {
  // TODO 7.7.2.1: Declare private properties
  // HINT: We need instances of Server, Router, and MiddlewareManager
  // HINT: Also store the configuration options
  //
  // PROPERTIES:
  //   private server: Server;
  //   private router: Router;
  //   private middlewareManager: MiddlewareManager;
  //   private options: FlashOptions;

  private server: Server;
  private router: Router;
  private middlewareManager: MiddlewareManager;
  private options: FlashOptions;

  /**
   * Create a new Flash application
   *
   * @param options - Configuration options
   */
  // TODO 7.7.2.2: Implement constructor
  // HINT: Accept optional FlashOptions parameter
  // HINT: Set default values for options (port: 3000, logger: true, cors: false, bodyParser: true)
  // HINT: Create instances of Server, Router, and MiddlewareManager
  // HINT: Call setupDefaultMiddleware() to configure built-in middleware
  //
  // IMPLEMENTATION:
  //   constructor(options: FlashOptions = {}) {
  //     this.options = {
  //       port: options.port || 3000,
  //       logger: options.logger !== false,
  //       cors: options.cors || false,
  //       bodyParser: options.bodyParser !== false,
  //     };
  //
  //     this.server = new Server();
  //     this.router = new Router();
  //     this.middlewareManager = new MiddlewareManager();
  //
  //     this.setupDefaultMiddleware();
  //   }

  constructor(options: FlashOptions = {}) {
    this.options = {
      port: options.port ?? DEFAULT_PORT,
      logger: options.logger ?? DEFAULT_LOGGER,
      cors: options.cors ?? DEFAULT_CORS,
      bodyParser: options.bodyParser ?? DEFAULT_BODY_PARSER,
    };

    this.server = new Server(this.options.port!);
    this.router = new Router();
    this.middlewareManager = new MiddlewareManager();

    this.setupDefaultMiddleware();
  }
  // =============================================================================
  // TODO 7.7.3: Setup Default Middleware
  // =============================================================================
  // LEARNING: Default middleware provides common functionality out-of-the-box.
  // Users can override or extend this configuration.
  //
  // TASK: Configure default middleware based on options

  /**
   * Setup default middleware based on configuration options
   */
  // TODO 7.7.3.1: Implement setupDefaultMiddleware()
  // HINT: Check each option and add corresponding middleware
  // HINT: Order matters! Logger should be first, error handler last
  // HINT: Use conditional checks: if (this.options.logger) { ... }
  //
  // ORDER:
  //   1. Logger (if enabled)
  //   2. CORS (if enabled)
  //   3. Body Parser (if enabled)
  //
  // IMPLEMENTATION:
  //   private setupDefaultMiddleware(): void {
  //     if (this.options.logger) {
  //       this.middlewareManager.use(createLoggerMiddleware());
  //     }
  //
  //     if (this.options.cors) {
  //       const corsOptions = typeof this.options.cors === 'object'
  //         ? this.options.cors
  //         : undefined;
  //       this.middlewareManager.use(createCorsMiddleware(corsOptions));
  //     }
  //
  //     if (this.options.bodyParser) {
  //       this.middlewareManager.use(createJsonBodyParser());
  //     }
  //   }

  private setupDefaultMiddleware(): void {
    if (this.options.logger) {
      this.middlewareManager.use(createLoggerMiddleware());
    }

    if (this.options.cors) {
      const corsOptions =
        typeof this.options.cors === "object" ? this.options.cors : undefined;
      this.middlewareManager.use(createCorsMiddleware(corsOptions));
    }

    if (this.options.bodyParser) {
      this.middlewareManager.use(createJsonBodyParser());
    }
  }

  // =============================================================================
  // TODO 7.7.4: Implement Middleware Registration
  // =============================================================================
  // LEARNING: Allow users to add custom middleware to the pipeline.
  //
  // TASK: Create method to register custom middleware

  /**
   * Register a middleware function
   *
   * @param middleware - Middleware function to register
   * @returns This Flash instance for method chaining
   *
   * @example
   * ```typescript
   * app.use((req, res, next) => {
   *   console.log('Custom middleware');
   *   next();
   * });
   * ```
   */
  public use(middleware: MiddlewareFunction): this {
    this.middlewareManager.use(middleware);
    return this;
  }

  // =============================================================================
  // TODO 7.7.5: Implement HTTP Method Shortcuts
  // =============================================================================
  // LEARNING: Provide Express-like shortcuts for common HTTP methods.
  //
  // TASK: Create shortcut methods that delegate to router

  /**
   * Register a GET route handler
   *
   * @param path - Route path (can include parameters like /users/:id)
   * @param handler - Route handler function
   * @returns This Flash instance for method chaining
   */
  public get(path: string, handler: RouteHandler): this {
    this.router.get(path, handler);
    return this;
  }

  /**
   * Register a POST route handler
   *
   * @param path - Route path
   * @param handler - Route handler function
   * @returns This Flash instance for method chaining
   */
  public post(path: string, handler: RouteHandler): this {
    this.router.post(path, handler);
    return this;
  }

  /**
   * Register a PUT route handler
   *
   * @param path - Route path
   * @param handler - Route handler function
   * @returns This Flash instance for method chaining
   */
  public put(path: string, handler: RouteHandler): this {
    this.router.put(path, handler);
    return this;
  }

  /**
   * Register a DELETE route handler
   *
   * @param path - Route path
   * @param handler - Route handler function
   * @returns This Flash instance for method chaining
   */
  public delete(path: string, handler: RouteHandler): this {
    this.router.delete(path, handler);
    return this;
  }

  // =============================================================================
  // TODO 7.7.6: Implement Request Handling Pipeline
  // =============================================================================
  // LEARNING: This is where everything comes together! The pipeline:
  //   1. Execute middleware
  //   2. Route to handler
  //   3. Handle errors
  //
  // TASK: Create the main request handling method

  /**
   * Handle an incoming HTTP request
   *
   * This is the core integration point that ties together:
   * - Middleware execution
   * - Route matching
   * - Error handling
   *
   * @param req - Request object
   * @param res - Response object
   */
  private async handleRequest(req: Request, res: Response): Promise<void> {
    try {
      // Execute middleware pipeline
      await this.middlewareManager.execute(req, res);

      // Route the request
      await this.router.handleRequest(req, res);
    } catch (error) {
      // Handle errors
      console.error("Request handling error:", error);

      // Only send response if not already sent
      if (!res.isSent()) {
        res.status(500).json({
          error: "Internal Server Error",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  }

  // =============================================================================
  // TODO 7.7.7: Implement Server Lifecycle Methods
  // =============================================================================
  // LEARNING: Start and stop the HTTP server.
  //
  // TASK: Create methods to control server lifecycle

  /**
   * Start the HTTP server
   *
   * @param port - Port number to listen on (overrides constructor option)
   * @param callback - Optional callback when server starts
   *
   * @example
   * ```typescript
   * app.listen(3000, () => {
   *   console.log('Server running on port 3000');
   * });
   * ```
   */
  public async listen(port?: number, callback?: () => void): Promise<void> {
    const listenPort = port ?? this.options.port ?? DEFAULT_PORT;

    // Note: In current Phase 2 implementation, the C++ server handles requests directly
    // Request handling integration through the Flash pipeline will be implemented
    // when we add request callback support to the native Server class

    // Start server
    await this.server.listen(callback);
  }

  /**
   * Stop the HTTP server
   *
   * @example
   * ```typescript
   * app.close();
   * ```
   */
  public async close(): Promise<void> {
    await this.server.close();
  }

  // =============================================================================
  // TODO 7.7.8: Implement Utility Methods
  // =============================================================================
  // LEARNING: Provide access to internal components for advanced use cases.
  //
  // TASK: Create getter methods for internal components

  /**
   * Get the Router instance
   *
   * @returns Router instance
   */
  public getRouter(): Router {
    return this.router;
  }

  /**
   * Get the MiddlewareManager instance
   *
   * @returns MiddlewareManager instance
   */
  public getMiddlewareManager(): MiddlewareManager {
    return this.middlewareManager;
  }

  /**
   * Get the Server instance
   *
   * @returns Server instance
   */
  public getServer(): Server {
    return this.server;
  }
}

// =============================================================================
// TODO 7.7.9: Export Convenience Function
// =============================================================================
// LEARNING: Provide a factory function for quick app creation.
//
// TASK: Create factory function

/**
 * Create a new Flash application
 *
 * Convenience function for creating Flash instances.
 *
 * @param options - Configuration options
 * @returns New Flash instance
 *
 * @example
 * ```typescript
 * const app = createFlash({ port: 3000, cors: true });
 * ```
 */
export function createFlash(options?: FlashOptions): Flash {
  return new Flash(options);
}

// Export commonly used types and functions for convenience
export {
  Server,
  Router,
  MiddlewareManager,
  Request,
  Response,
  RouteHandler,
  MiddlewareFunction,
  createLoggerMiddleware,
  createCorsMiddleware,
  createJsonBodyParser,
  createErrorHandler,
  CorsOptions,
};
