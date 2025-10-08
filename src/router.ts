/**
 * @file router.ts
 * @brief Router class for handling HTTP routes with Express-like API
 * @author Flash Framework Team
 * @date 2025-10-07
 *
 * This module provides routing functionality with:
 * - Route pattern matching (/users/:id)
 * - Parameter extraction from URL paths
 * - HTTP method routing (GET, POST, PUT, DELETE)
 * - Middleware support
 */

import { Request } from "./request";
import { Response } from "./response";
import { RouteHandler } from "./types";

/**
 * Route interface representing a registered route
 */
export interface Route {
  method: string;
  path: string;
  handler: RouteHandler;
  regex: RegExp;
  paramNames: string[];
}

/**
 * Router class for handling HTTP routes with Express-like API
 */
export class Router {
  private routes: Route[] = [];

  /**
   * Register a GET route
   *
   * @param path - Route pattern (e.g., "/users/:id")
   * @param handler - Function to handle the request
   * @returns this for method chaining
   */
  get(path: string, handler: RouteHandler): this {
    return this.registerRoute("GET", path, handler);
  }

  /**
   * Register a POST route
   *
   * @param path - Route pattern (e.g., "/users")
   * @param handler - Function to handle the request
   * @returns this for method chaining
   */
  post(path: string, handler: RouteHandler): this {
    return this.registerRoute("POST", path, handler);
  }

  /**
   * Register a PUT route
   *
   * @param path - Route pattern (e.g., "/users/:id")
   * @param handler - Function to handle the request
   * @returns this for method chaining
   */
  put(path: string, handler: RouteHandler): this {
    return this.registerRoute("PUT", path, handler);
  }

  /**
   * Register a DELETE route
   *
   * @param path - Route pattern (e.g., "/users/:id")
   * @param handler - Function to handle the request
   * @returns this for method chaining
   */
  delete(path: string, handler: RouteHandler): this {
    return this.registerRoute("DELETE", path, handler);
  }

  /**
   * Register a route (internal method used by get, post, put, delete)
   *
   * @param method - HTTP method
   * @param path - Route pattern
   * @param handler - Route handler function
   * @returns this for method chaining
   */
  private registerRoute(
    method: string,
    path: string,
    handler: RouteHandler
  ): this {
    const paramNames = this.parsePathParams(path);
    const regex = this.pathToRegex(path);

    const route: Route = {
      method,
      path,
      handler,
      regex,
      paramNames,
    };

    this.routes.push(route);
    return this;
  }

  /**
   * Parse parameter names from path pattern
   *
   * @param path - Route pattern with :param syntax
   * @returns Array of parameter names
   *
   * @example
   * parsePathParams("/users/:id/posts/:postId") → ["id", "postId"]
   */
  private parsePathParams(path: string): string[] {
    const matches = path.match(/:([a-zA-Z_][a-zA-Z0-9_]*)/g);
    if (!matches) return [];
    return matches.map((m) => m.slice(1));
  }

  /**
   * Convert path pattern to regular expression for matching
   *
   * @param path - Route pattern
   * @returns Regular expression for matching
   *
   * @example
   * pathToRegex("/users/:id/posts/:postId")
   * // Returns: /^\/users\/([^\/]+)\/posts\/([^\/]+)$/
   */
  private pathToRegex(path: string): RegExp {
    let pattern = path.replace(/\//g, "\\/");
    pattern = pattern.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, "([^\\/]+)");
    pattern = `^${pattern}$`;
    return new RegExp(pattern);
  }

  /**
   * Find a route that matches the request
   *
   * @param method - HTTP method (GET, POST, etc.)
   * @param path - Request path (/users/123)
   * @returns Matched route and extracted params, or null if no match
   */
  findRoute(
    method: string,
    path: string
  ): { route: Route; params: Record<string, string> } | null {
    for (const route of this.routes) {
      if (route.method !== method) continue;

      const match = route.regex.exec(path);
      if (!match) continue;

      const params: Record<string, string> = {};
      route.paramNames.forEach((name, i) => {
        params[name] = match[i + 1];
      });

      return { route, params };
    }

    return null;
  }

  /**
   * Handle an incoming request by finding and executing matching route
   *
   * @param req - Request object
   * @param res - Response object
   */
  async handleRequest(req: Request, res: Response): Promise<void> {
    const match = this.findRoute(req.method, req.path);

    if (!match) {
      res.status(404).json({ error: "Not Found" });
      return;
    }

    Object.assign(req.params, match.params);

    try {
      await match.route.handler(req, res);
    } catch (error) {
      console.error("Route handler error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  /**
   * Get all registered routes (for testing)
   */
  getRoutes(): Route[] {
    return [...this.routes];
  }

  /**
   * Clear all routes (for testing)
   */
  clearRoutes(): void {
    this.routes = [];
  }
}
