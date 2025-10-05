// =============================================================================
// WEEK 6, DAY 14: TESTING THE N-API BINDING
// =============================================================================
// LEARNING OBJECTIVE: Learn how to test native addons from JavaScript
//
// This file tests the basic functionality of the Flash native addon
// Run this with: node tests/test_native_binding.js

// =============================================================================
// TODO 6.14.0: Load the native addon
// =============================================================================
// WHAT: Loads the compiled native addon
// WHY: We need to access the C++ functionality from JavaScript
//
// HINT 1: Use require() to load the .node file
// HINT 2: Path is relative to this file: '../build/Release/flash_native.node'
// HINT 3: You might need to build first: npm run build
//
// UNCOMMENT THIS:
// const flash = require('../build/Release/flash_native.node');

console.log("=".repeat(80));
console.log("Testing Flash N-API Binding");
console.log("=".repeat(80));
console.log();

// =============================================================================
// TODO 6.14.1: Test creating a server instance
// =============================================================================
// WHAT: Test that we can create a Server instance
// WHY: Verify the ObjectWrap binding works
//
// STEP 1: Create server instance
//   const server = new flash.Server(5627);
//
// STEP 2: Verify it's an object
//   if (typeof server !== 'object') {
//       console.error('❌ FAIL: Server is not an object');
//       process.exit(1);
//   }
//
// STEP 3: Verify it has the expected methods
//   if (typeof server.start !== 'function') {
//       console.error('❌ FAIL: Server has no start() method');
//       process.exit(1);
//   }
//   // Check stop, isRunning, getPort too
//
console.log("Test 1: Creating server instance");
console.log("TODO: Uncomment and implement this test");
console.log();

// =============================================================================
// TODO 6.14.2: Test getPort() method
// =============================================================================
// WHAT: Test that getPort() returns the correct port
// WHY: Verify instance methods work
//
// STEP 1: Create server with specific port
//   const server = new flash.Server(5627);
//
// STEP 2: Get port
//   const port = server.getPort();
//
// STEP 3: Verify port matches
//   if (port !== 5627) {
//       console.error(`❌ FAIL: Expected port 5627, got ${port}`);
//       process.exit(1);
//   }
//   console.log(`✅ PASS: getPort() returned ${port}`);
//
console.log("Test 2: getPort() method");
console.log("TODO: Uncomment and implement this test");
console.log();

// =============================================================================
// TODO 6.14.3: Test isRunning() before start
// =============================================================================
// WHAT: Test that isRunning() returns false before starting
// WHY: Verify state management works
//
// STEP 1: Create server
//   const server = new flash.Server(5627);
//
// STEP 2: Check if running (should be false)
//   const running = server.isRunning();
//
// STEP 3: Verify it's false
//   if (running !== false) {
//       console.error('❌ FAIL: Server should not be running yet');
//       process.exit(1);
//   }
//   console.log('✅ PASS: isRunning() correctly returned false');
//
console.log("Test 3: isRunning() before start");
console.log("TODO: Uncomment and implement this test");
console.log();

// =============================================================================
// TODO 6.14.4: Test error handling with invalid port
// =============================================================================
// WHAT: Test that invalid ports throw errors
// WHY: Verify error handling works across the language boundary
//
// TEST CASE 1: Negative port
//   try {
//       const server = new flash.Server(-1);
//       console.error('❌ FAIL: Should have thrown error for negative port');
//       process.exit(1);
//   } catch (error) {
//       console.log('✅ PASS: Correctly threw error for negative port');
//       console.log(`   Error message: ${error.message}`);
//   }
//
// TEST CASE 2: Port too large
//   try {
//       const server = new flash.Server(99999);
//       console.error('❌ FAIL: Should have thrown error for port > 65535');
//       process.exit(1);
//   } catch (error) {
//       console.log('✅ PASS: Correctly threw error for port > 65535');
//       console.log(`   Error message: ${error.message}`);
//   }
//
// TEST CASE 3: Not a number
//   try {
//       const server = new flash.Server("not a number");
//       console.error('❌ FAIL: Should have thrown error for non-number');
//       process.exit(1);
//   } catch (error) {
//       console.log('✅ PASS: Correctly threw error for non-number');
//       console.log(`   Error message: ${error.message}`);
//   }
//
console.log("Test 4: Error handling with invalid ports");
console.log("TODO: Uncomment and implement this test");
console.log();

// =============================================================================
// TODO 6.14.5: Test method chaining (if implemented)
// =============================================================================
// This is optional for Week 6, but good to think about!
//
// WHAT: Test that methods return 'this' for chaining
// WHY: Provides better developer experience
//
// EXAMPLE:
//   const result = server.start().stop();
//   // Check that result is the server instance
//
console.log("Test 5: Method chaining (optional)");
console.log("TODO: Implement this in Week 7");
console.log();

// =============================================================================
// SUMMARY
// =============================================================================
console.log("=".repeat(80));
console.log("All basic binding tests defined!");
console.log("TODO: Uncomment the tests above and implement them");
console.log("=".repeat(80));
console.log();
console.log("Next steps:");
console.log("1. Implement the TODOs in server_wrap.cpp");
console.log("2. Build the addon: npm run build");
console.log("3. Uncomment and run these tests");
console.log("4. Fix any errors until all tests pass");
console.log();
