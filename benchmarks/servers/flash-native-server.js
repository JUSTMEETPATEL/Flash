#!/usr/bin/env node

/**
 * Flash Native C++ Server - Benchmark Test
 *
 * Uses the native C++ server directly for maximum performance
 */

const { Server } = require("../../dist/src/native");

const PORT = process.env.PORT || 5627;

console.log("[Flash Native] Creating C++ server on port", PORT);
const server = new Server(PORT);

console.log("[Flash Native] Starting server (non-blocking)...");
server.start();

console.log("[Flash Native] Server is starting in background thread");
console.log("[Flash Native] Press Ctrl+C to stop");

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n[Flash Native] Received SIGINT, stopping server...");
  try {
    server.stop();
    console.log("[Flash Native] Server stopped");
    process.exit(0);
  } catch (error) {
    console.error("[Flash Native] Error stopping server:", error);
    process.exit(1);
  }
});

process.on("SIGTERM", () => {
  console.log("\n[Flash Native] Received SIGTERM, stopping server...");
  try {
    server.stop();
    console.log("[Flash Native] Server stopped");
    process.exit(0);
  } catch (error) {
    console.error("[Flash Native] Error stopping server:", error);
    process.exit(1);
  }
});

// Keep the process alive
setInterval(() => {
  // Server runs in background, main thread just keeps process alive
}, 1000);
