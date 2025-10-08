/**
 * @file server.integration.test.ts
 * @brief Integration tests for Server class with real native addon
 * @author Flash Framework Team
 * @date 2025-10-07
 */

import { Server } from "../../src/server";

describe("Server Integration", () => {
  let server: Server;

  beforeEach(() => {
    server = new Server(3000);
  });

  afterEach(async () => {
    // Note: We can't reliably stop a server that's blocking in accept()
    // In a real application, the server would run in a background thread
  });

  test("should create server successfully", () => {
    expect(server).toBeDefined();
    expect(server.getPort()).toBe(3000);
    expect(server.isRunning()).toBe(false);
  });

  test("should validate port numbers", () => {
    expect(() => new Server(1)).not.toThrow();
    expect(() => new Server(65535)).not.toThrow();
    expect(() => new Server(0)).toThrow("Invalid port number");
    expect(() => new Server(65536)).toThrow("Invalid port number");
    expect(() => new Server(-1)).toThrow("Invalid port number");
  });

  test("should create multiple server instances", () => {
    const server2 = new Server(3001);
    const server3 = new Server(3002);

    expect(server.getPort()).toBe(3000);
    expect(server2.getPort()).toBe(3001);
    expect(server3.getPort()).toBe(3002);

    expect(server.isRunning()).toBe(false);
    expect(server2.isRunning()).toBe(false);
    expect(server3.isRunning()).toBe(false);
  });

  // Note: We can't test actual server start/stop in integration tests
  // because the current implementation blocks the event loop.
  // In a real application, the server would run in a background thread.
  // The unit tests with mocks verify the logic works correctly.
});
