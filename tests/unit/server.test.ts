/**
 * @file server.test.ts
 * @brief Unit tests for Server class
 * @author Flash Framework Team
 * @date 2025-10-07
 */

import { Server } from "../../src/server";

// Mock the native wrapper to avoid needing the actual native addon for unit tests
jest.mock("../../src/native", () => {
  const mockNativeServer = {
    start: jest.fn(),
    stop: jest.fn(),
    isRunning: jest.fn().mockReturnValue(false),
    getPort: jest.fn(),
  };

  const MockNativeServerWrapper = jest
    .fn()
    .mockImplementation((port: number) => {
      mockNativeServer.getPort.mockReturnValue(port);
      return mockNativeServer;
    });

  return {
    NativeServerWrapper: MockNativeServerWrapper,
  };
});

describe("Server", () => {
  let server: Server;
  let mockNativeServer: any;

  beforeEach(() => {
    // Get the mock instance
    const { NativeServerWrapper } = require("../../src/native");
    mockNativeServer = new NativeServerWrapper(3000);

    // Reset mock state for each test
    mockNativeServer.start.mockReset();
    mockNativeServer.stop.mockReset();
    mockNativeServer.isRunning.mockReset();
    mockNativeServer.getPort.mockReset();

    // Set default behaviors
    mockNativeServer.start.mockResolvedValue(undefined);
    mockNativeServer.stop.mockResolvedValue(undefined);
    mockNativeServer.isRunning.mockReturnValue(false);
    mockNativeServer.getPort.mockReturnValue(3000);

    // Create a new server for each test
    server = new Server(3000);
  });

  afterEach(async () => {
    // Clean up after each test
    if (server.isRunning()) {
      await server.close();
    }
  });

  describe("constructor", () => {
    test("should create server with valid port", () => {
      expect(() => new Server(3000)).not.toThrow();
      expect(() => new Server(8080)).not.toThrow();
      expect(() => new Server(1)).not.toThrow();
      expect(() => new Server(65535)).not.toThrow();
    });

    test("should throw error for invalid ports", () => {
      expect(() => new Server(0)).toThrow("Invalid port number: 0");
      expect(() => new Server(-1)).toThrow("Invalid port number: -1");
      expect(() => new Server(65536)).toThrow("Invalid port number: 65536");
      expect(() => new Server(3.14)).toThrow("Invalid port number: 3.14");
    });

    test("should set port correctly", () => {
      const server = new Server(8080);
      expect(server.getPort()).toBe(8080);
    });
  });

  describe("listen()", () => {
    test("should start server successfully", async () => {
      mockNativeServer.isRunning.mockReturnValue(true); // Server is now running
      await expect(server.listen()).resolves.not.toThrow();
      expect(server.isRunning()).toBe(true);
      expect(mockNativeServer.start).toHaveBeenCalledTimes(1);
    });

    test("should execute callback when provided", async () => {
      const callback = jest.fn();
      await server.listen(callback);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    test("should throw error if native server fails", async () => {
      mockNativeServer.start.mockImplementation(() => {
        throw new Error("Native server error");
      });

      await expect(server.listen()).rejects.toThrow(
        "Failed to start server on port 3000: Native server error"
      );
    });
  });

  describe("close()", () => {
    test("should stop server successfully", async () => {
      // Start server first
      mockNativeServer.isRunning.mockReturnValue(true);
      await server.listen();
      expect(server.isRunning()).toBe(true);

      // Now stop it
      mockNativeServer.isRunning.mockReturnValue(false);
      await expect(server.close()).resolves.not.toThrow();
      expect(server.isRunning()).toBe(false);
      expect(mockNativeServer.stop).toHaveBeenCalledTimes(1);
    });

    test("should execute callback when provided", async () => {
      await server.listen(); // Start first
      const callback = jest.fn();

      await server.close(callback);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    test("should throw error if native server fails", async () => {
      await server.listen(); // Start first

      mockNativeServer.stop.mockImplementation(() => {
        throw new Error("Native server stop error");
      });

      await expect(server.close()).rejects.toThrow(
        "Failed to stop server: Native server stop error"
      );
    });
  });

  describe("getPort()", () => {
    test("should return configured port", () => {
      expect(server.getPort()).toBe(3000);
    });
  });

  describe("isRunning()", () => {
    test("should return false when server not started", () => {
      mockNativeServer.isRunning.mockReturnValue(false);
      expect(server.isRunning()).toBe(false);
    });

    test("should return true when server is started", async () => {
      mockNativeServer.isRunning.mockReturnValue(true);
      await server.listen();
      expect(server.isRunning()).toBe(true);
    });

    test("should return false when server is stopped", async () => {
      mockNativeServer.isRunning.mockReturnValue(true);
      await server.listen();
      expect(server.isRunning()).toBe(true);

      mockNativeServer.isRunning.mockReturnValue(false);
      await server.close();
      expect(server.isRunning()).toBe(false);
    });
  });
});
