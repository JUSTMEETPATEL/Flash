/**
 * @file types.ts
 * @brief Common type definitions for Flash Framework
 * @author Flash Framework Team
 * @date 2025-10-07
 */

import { Request } from "./request";
import { Response } from "./response";

/**
 * Route handler function type
 * Handles incoming HTTP requests
 */
export type RouteHandler = (
  req: Request,
  res: Response
) => void | Promise<void>;

/**
 * Flash framework options
 */
export interface FlashOptions {
  workers?: number;
  port?: number;
}
