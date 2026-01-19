/**
 * @file native.ts
 * @brief Native addon wrapper for Flash Framework
 * @author Flash Framework Team
 * @date 2025-10-07
 *
 * This module provides a clean, type-safe wrapper around the native N-API addon.
 * It handles loading the addon, error handling, and provides typed interfaces.
 */

// =============================================================================
// TODO 7.1: Create Native Wrapper
// =============================================================================

// Helper function to safely extract error messages
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// STEP 1: Load native addon with error handling
let nativeAddon: any;
try {
  nativeAddon = require("../build/Release/flash_native.node");
} catch (error) {
  throw new Error(
    'Failed to load Flash native addon. Make sure to run "npm run build:cpp" first.\n' +
      `Original error: ${getErrorMessage(error)}`
  );
}

// STEP 2: Define typed interfaces for native addon
export interface NativeServer {
  start(): void;
  stop(): void;
  isRunning(): boolean;
  getPort(): number;
}

export interface NativeAddon {
  Server: new (port: number) => NativeServer;
}

// STEP 3: Type assertion and validation
const addon = nativeAddon as NativeAddon;

// Validate that required exports exist
if (!addon.Server) {
  throw new Error("Native addon missing Server class export");
}

// STEP 4: Create wrapper class with error handling
export class NativeServerWrapper implements NativeServer {
  private nativeServer: NativeServer;

  constructor(port: number) {
    try {
      this.nativeServer = new addon.Server(port);
    } catch (error) {
      throw new Error(
        `Failed to create native server: ${getErrorMessage(error)}`
      );
    }
  }

  start(): void {
    try {
      this.nativeServer.start();
    } catch (error) {
      throw new Error(`Failed to start server: ${getErrorMessage(error)}`);
    }
  }

  stop(): void {
    try {
      this.nativeServer.stop();
    } catch (error) {
      throw new Error(`Failed to stop server: ${getErrorMessage(error)}`);
    }
  }

  isRunning(): boolean {
    try {
      return this.nativeServer.isRunning();
    } catch (error) {
      console.warn(`Failed to check server status: ${getErrorMessage(error)}`);
      return false;
    }
  }

  getPort(): number {
    try {
      return this.nativeServer.getPort();
    } catch (error) {
      throw new Error(`Failed to get server port: ${getErrorMessage(error)}`);
    }
  }
}

// STEP 5: Export the wrapper class
export { NativeServerWrapper as Server };

// STEP 6: Export utility functions
export function createServer(port: number): NativeServerWrapper {
  return new NativeServerWrapper(port);
}

// STEP 7: Export version info
export const VERSION = "0.1.0-alpha";
export const NATIVE_VERSION = "0.1.0";
