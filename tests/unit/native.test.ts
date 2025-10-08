/**
 * @file native.test.ts
 * @brief Unit tests for native wrapper
 * @author Flash Framework Team
 * @date 2025-10-07
 */

import { Server, createServer } from "../../src/native";

describe("Native Wrapper", () => {
  test("should create server with Server class", () => {
    const server = new Server(3000);
    expect(server).toBeDefined();
    expect(server.getPort()).toBe(3000);
    expect(server.isRunning()).toBe(false);
    server.stop(); // Clean up
  });

  test("should create server with createServer function", () => {
    const server = createServer(3001);
    expect(server).toBeDefined();
    expect(server.getPort()).toBe(3001);
    expect(server.isRunning()).toBe(false);
    server.stop(); // Clean up
  });

  test("should handle server start and stop", () => {
    const server = new Server(3002);
    expect(server.isRunning()).toBe(false);

    // Note: We can't test actual start/stop in unit tests because
    // the current implementation blocks. This would be tested in
    // integration tests with proper threading.
    // For now, we just verify the server can be created and stopped.

    server.stop();
    expect(server.isRunning()).toBe(false);
  });
});
