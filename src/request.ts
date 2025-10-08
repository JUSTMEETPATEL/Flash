/**
 * @file request.ts
 * @brief Request wrapper with Express-like API
 * @author Flash Framework Team
 * @date 2025-10-07
 *
 * This module provides a clean Request class for accessing HTTP request data.
 */

// =============================================================================
// TODO 7.3: Create Request Wrapper
// =============================================================================

/**
 * Request interface - defines properties for HTTP requests
 */
export interface Request {
  readonly method: string;
  readonly path: string;
  readonly params: Record<string, string>;
  readonly query: Record<string, string>;
  readonly headers: Record<string, string>;
  readonly body?: any;
}

/**
 * Request class - Implements Express-like request object
 *
 * Features:
 * - Read-only properties for request data
 * - Helper methods for accessing headers and parameters
 * - Type-safe data access
 */
export class Request implements Request {
  constructor(
    public readonly method: string,
    public readonly path: string,
    public readonly params: Record<string, string>,
    public readonly query: Record<string, string>,
    public readonly headers: Record<string, string>,
    public readonly body?: any
  ) {}

  /**
   * Get a header value by name (case-insensitive)
   *
   * @param name - Header name
   * @returns Header value or undefined if not found
   */
  getHeader(name: string): string | undefined {
    // TODO 7.3.4: Implement case-insensitive header lookup
    // HINT: Convert both header names to lowercase for comparison
    const lowerName = name.toLowerCase();
    for (const [key, value] of Object.entries(this.headers)) {
      if (key.toLowerCase() === lowerName) {
        return value;
      }
    }
    return undefined;
  }

  /**
   * Check if a header exists (case-insensitive)
   *
   * @param name - Header name
   * @returns true if header exists, false otherwise
   */
  hasHeader(name: string): boolean {
    // TODO 7.3.4: Use getHeader to check existence
    // HINT: A header exists if getHeader returns a value
    return this.getHeader(name) !== undefined;
  }

  /**
   * Get a query parameter value
   *
   * @param name - Query parameter name
   * @returns Parameter value or undefined if not found
   */
  getQueryParam(name: string): string | undefined {
    // TODO 7.3.4: Return query parameter value
    // HINT: Access the query object directly
    return this.query[name];
  }

  /**
   * Get a route parameter value
   *
   * @param name - Route parameter name
   * @returns Parameter value or undefined if not found
   */
  getRouteParam(name: string): string | undefined {
    // TODO 7.3.4: Return route parameter value
    // HINT: Access the params object directly
    return this.params[name];
  }
}
