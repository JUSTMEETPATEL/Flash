/**
 * @file response.ts
 * @brief Response wrapper with Express-like API
 * @author Flash Framework Team
 * @date 2025-10-07
 *
 * This module provides a clean Response class for building HTTP responses.
 */

// =============================================================================
// TODO 7.4: Create Response Wrapper
// =============================================================================

/**
 * Response interface - defines methods for building HTTP responses
 */
export interface Response {
  status(code: number): Response;
  header(name: string, value: string): Response;
  json(data: any): void;
  send(data: string): void;
  end(): void;
}

/**
 * Response class - Implements Express-like response building
 *
 * Features:
 * - Method chaining for status and headers
 * - JSON response helper
 * - Validation and error handling
 */
export class Response implements Response {
  private statusCode: number = 200;
  private headers: Record<string, string> = {};
  private body: string | null = null;
  private sent: boolean = false;

  /**
   * Set HTTP status code
   *
   * @param code - HTTP status code (100-599)
   * @returns this for method chaining
   */
  status(code: number): Response {
    // TODO 7.4.3: Validate status code range
    // HINT: Valid HTTP status codes are 100-599
    if (code < 100 || code > 599) {
      throw new Error(
        `Invalid status code: ${code}. Must be between 100 and 599.`
      );
    }
    this.statusCode = code;
    return this;
  }

  /**
   * Set a response header
   *
   * @param name - Header name
   * @param value - Header value
   * @returns this for method chaining
   */
  header(name: string, value: string): Response {
    // TODO 7.4.4: Store header in lowercase for case-insensitive access
    // HINT: HTTP headers are case-insensitive
    this.headers[name.toLowerCase()] = value;
    return this;
  }

  /**
   * Send JSON response
   *
   * @param data - Data to serialize as JSON
   */
  json(data: any): void {
    // TODO 7.4.5: Implement JSON response
    // HINT: Set Content-Type header and stringify the data
    if (this.sent) {
      throw new Error("Response has already been sent.");
    }
    this.header("Content-Type", "application/json");
    this.send(JSON.stringify(data));
  }

  /**
   * Send response data
   *
   * @param data - Response body as string
   */
  send(data: string): void {
    // TODO 7.4.5: Implement send method
    // HINT: Check if response already sent, store body, mark as sent
    if (this.sent) {
      throw new Error("Response has already been sent.");
    }
    this.body = data;
    // NOTE: In real implementation, this would write to socket
    // For now, we just log it for testing
    console.log(`Response [${this.statusCode}]:`, data);
    this.sent = true;
  }

  /**
   * End the response
   */
  end(): void {
    // TODO 7.4.5: Implement end method
    // HINT: Mark response as sent
    if (this.sent) {
      throw new Error("Response has already been ended.");
    }
    // NOTE: In real implementation, this would close socket
    console.log(`Response [${this.statusCode}] ended.`);
    this.sent = true;
  }

  /**
   * Get the current status code (for testing)
   */
  getStatusCode(): number {
    return this.statusCode;
  }

  /**
   * Get all headers (for testing)
   */
  getHeaders(): Record<string, string> {
    return { ...this.headers };
  }

  /**
   * Check if response was sent (for testing)
   */
  isSent(): boolean {
    return this.sent;
  }
}
