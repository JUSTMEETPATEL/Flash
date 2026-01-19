#!/usr/bin/env node

// Comprehensive debug test

const { Server } = require("../../dist/src/native");

console.log("=".repeat(80));
console.log("FLASH SERVER DEBUG TEST");
console.log("=".repeat(80));
console.log();

console.log("[Test] Step 1: Creating server on port 5627...");
const server = new Server(5627);
console.log("[Test] Server object created\n");

console.log("[Test] Step 2: Starting server (should return immediately)...");
const startTime = Date.now();
server.start();
const elapsed = Date.now() - startTime;
console.log(
  `[Test] start() returned in ${elapsed}ms (should be < 100ms for non-blocking)\n`
);

console.log("[Test] Step 3: Main thread is FREE - server runs in background");
console.log("[Test] Waiting 2 seconds for server to fully initialize...\n");

setTimeout(() => {
  console.log("[Test] Step 4: Server should be ready now!");
  console.log("[Test] Try this in another terminal:");
  console.log("[Test]   curl -v http://localhost:5627/hello");
  console.log("[Test]   curl -v http://localhost:5627/api/user");
  console.log();
  console.log("[Test] Waiting 25 more seconds before stopping...");
  console.log("[Test] (Press Ctrl+C to stop early)");
  console.log("=".repeat(80));
}, 2000);

setTimeout(() => {
  console.log();
  console.log("=".repeat(80));
  console.log("[Test] Step 5: Stopping server...");
  server.stop();
  console.log("[Test] Done!");
  console.log("=".repeat(80));
  process.exit(0);
}, 27000);

// Handle Ctrl+C
process.on("SIGINT", () => {
  console.log("\n[Test] Interrupted - stopping server...");
  server.stop();
  process.exit(0);
});
