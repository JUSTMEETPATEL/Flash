#!/usr/bin/env node

// Long-running server for benchmarking

const { Server } = require("../../dist/src/native");

console.log("[Benchmark Server] Starting on port 5627...");
const server = new Server(5627);
server.start();

console.log("[Benchmark Server] Ready! Server will run for 5 minutes.");
console.log("[Benchmark Server] Press Ctrl+C to stop early.");

// Run for 5 minutes
setTimeout(() => {
  console.log("[Benchmark Server] Timeout reached - stopping...");
  server.stop();
  process.exit(0);
}, 300000);

// Handle Ctrl+C
process.on("SIGINT", () => {
  console.log("\n[Benchmark Server] Interrupted - stopping...");
  server.stop();
  process.exit(0);
});
