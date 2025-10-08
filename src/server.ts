/**
 * @file server.ts
 * @brief Main Server class with Express-like API
 * @author Flash Framework Team
 * @date 2025-10-07
 *
 * This module provides the main Server class that wraps the native server
 * and provides a clean, Express-like API for developers.
 */

// =============================================================================
// TODO 7.2: Create Server Class
// =============================================================================

import { NativeServerWrapper } from "./native";

/**
 * Callback function type for server events
 */
export type ServerCallback = () => void;

/**
 * Main Server class with Express-like API
 *
 * Provides a clean, type-safe interface for creating HTTP servers.
 * Wraps the native C++ server with TypeScript conveniences.
 */
export class Server {
  private nativeServer: NativeServerWrapper;
  private port: number;

  /**
   * Create a new HTTP server
   *
   * @param port - Port number to listen on (1-65535)
   * @throws Error if port is invalid
   */
  constructor(port: number) {
    // Validate port number
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error(
        `Invalid port number: ${port}. Must be between 1 and 65535.`
      );
    }

    this.port = port;
    this.nativeServer = new NativeServerWrapper(port);
  }

  /**
   * Start the server and begin listening for connections
   *
   * @param callback - Optional callback to execute when server starts
   * @returns Promise that resolves when server is ready
   * @throws Error if server fails to start
   */
  async listen(callback?: ServerCallback): Promise<void> {
    try {
      // Start the native server
      this.nativeServer.start();

      // Execute callback if provided
      if (callback) {
        callback();
      }
    } catch (error) {
      throw new Error(
        `Failed to start server on port ${this.port}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Stop the server and close all connections
   *
   * @param callback - Optional callback to execute when server stops
   * @returns Promise that resolves when server is stopped
   * @throws Error if server fails to stop
   */
  async close(callback?: ServerCallback): Promise<void> {
    try {
      // Stop the native server
      this.nativeServer.stop();

      // Execute callback if provided
      if (callback) {
        callback();
      }
    } catch (error) {
      throw new Error(
        `Failed to stop server: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Get the port number the server is configured to listen on
   *
   * @returns The port number
   */
  getPort(): number {
    return this.port;
  }

  /**
   * Check if the server is currently running
   *
   * @returns true if server is running, false otherwise
   */
  isRunning(): boolean {
    return this.nativeServer.isRunning();
  }
}

// Export the Server class as the default export for convenience
export default Server;
