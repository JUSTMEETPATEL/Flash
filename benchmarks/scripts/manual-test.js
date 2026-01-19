#!/usr/bin/env node

// Manual test - keeps server running until you press Enter

const { Server } = require("../../dist/src/native");

console.log("[Manual Test] Creating server on port 5627...");
const server = new Server(5627);

console.log("[Manual Test] Starting server...");
server.start();

console.log(
  "[Manual Test] Server should be listening on http://localhost:5627"
);
console.log("[Manual Test] Test with: curl http://localhost:5627/hello");
console.log("[Manual Test]");
console.log("[Manual Test] Press Enter to stop...");

process.stdin.once("data", () => {
  console.log("[Manual Test] Stopping server...");
  server.stop();
  console.log("[Manual Test] Done!");
  process.exit(0);
});
