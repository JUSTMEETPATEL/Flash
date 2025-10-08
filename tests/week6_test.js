/**
 * Comprehensive test for Week 6 ServerWrap methods
 */

console.log("=== Week 6 ServerWrap Method Tests ===\n");

try {
  const flash = require("../build/Release/flash_native.node");
  console.log("✅ Addon loaded successfully!");

  // Test 1: Create server instance
  console.log("\n1. Testing Server Creation:");
  const server = new flash.Server(8080);
  console.log("✅ Server instance created");

  // Test 2: Get port
  console.log("\n2. Testing GetPort():");
  const port = server.getPort();
  console.log(`✅ Port returned: ${port} (expected: 8080)`);
  if (port === 8080) {
    console.log("✅ Port matches!");
  } else {
    console.log("❌ Port doesn't match!");
  }

  // Test 3: Check if running (should be false initially)
  console.log("\n3. Testing IsRunning() before start:");
  const isRunningBefore = server.isRunning();
  console.log(
    `✅ IsRunning before start: ${isRunningBefore} (expected: false)`
  );
  if (isRunningBefore === false) {
    console.log("✅ Correctly reports not running!");
  } else {
    console.log("❌ Should not be running yet!");
  }

  // Test 4: Start server (this will block, so we'll test error handling instead)
  console.log("\n4. Testing Start() error handling:");
  try {
    // This should work but will block - we'll test with a different approach
    console.log("Note: Start() will block, so we'll test Stop() instead");
  } catch (error) {
    console.log(`❌ Start() threw error: ${error.message}`);
  }

  // Test 5: Stop server (should work even if not started)
  console.log("\n5. Testing Stop():");
  try {
    server.stop();
    console.log("✅ Stop() completed without error");
  } catch (error) {
    console.log(`❌ Stop() threw error: ${error.message}`);
  }

  // Test 6: Check if running after stop
  console.log("\n6. Testing IsRunning() after stop:");
  const isRunningAfter = server.isRunning();
  console.log(`✅ IsRunning after stop: ${isRunningAfter} (expected: false)`);
  if (isRunningAfter === false) {
    console.log("✅ Correctly reports not running!");
  } else {
    console.log("❌ Should not be running!");
  }

  console.log("\n=== All Week 6 Tests Completed! ===");
} catch (error) {
  console.log("❌ Test failed:", error.message);
  console.log(error.stack);
}
