#!/usr/bin/env node

// Quick test to see if server accepts connections

const { Server } = require("../../dist/src/native");

console.log("[Test] Creating server on port 5627...");
const server = new Server(5627);

console.log("[Test] Starting server...");
server.start();

console.log("[Test] Server is starting... waiting for it to be ready...");

// Wait a bit for server to fully start
setTimeout(() => {
  console.log("[Test] Server should be ready now!");
  console.log("[Test] Try: curl http://localhost:5627/hello");
  console.log("[Test] Keeping server alive for 30 seconds...");
}, 1000);

setTimeout(() => {
  console.log("[Test] Stopping server...");
  server.stop();
  console.log("[Test] Done!");
  process.exit(0);
}, 30000);
