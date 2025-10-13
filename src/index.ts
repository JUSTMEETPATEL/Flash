/**
 * @file index.ts
 * @brief Main entry point for Flash Framework
 *
 * Exports all public APIs for the Flash Framework.
 */

// Export main Flash class and factory
export { Flash, createFlash, FlashOptions } from "./flash";

// Export core components
export { Server } from "./server";
export { Router } from "./router";
export { Request } from "./request";
export { Response } from "./response";

// Export middleware system
export {
  MiddlewareManager,
  MiddlewareFunction,
  NextFunction,
  ErrorMiddlewareFunction,
  createLoggerMiddleware,
  createCorsMiddleware,
  createJsonBodyParser,
  createErrorHandler,
  CorsOptions,
} from "./middleware";

// Export types
export { RouteHandler } from "./types";

// Export native wrapper (for advanced use)
export { NativeServerWrapper } from "./native";
