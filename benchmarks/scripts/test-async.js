#!/usr/bin/env node

// Simple test to see if AsyncWorker is working

const { Server } = require("../../dist/src/native");

console.log("[Test] Creating server on port 5627...");
const server = new Server(5627);

console.log("[Test] Starting server (should be non-blocking now)...");
server.start();

console.log("[Test] Server.start() returned! (non-blocking works!)");
console.log("[Test] Checking if running:", server.isRunning());

// Keep process alive for 5 seconds
setTimeout(() => {
  console.log("[Test] Stopping server...");
  server.stop();
  console.log("[Test] Done!");
  process.exit(0);
}, 5000);

console.log("[Test] Main thread is free to do other work!");
