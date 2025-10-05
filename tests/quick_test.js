/**
 * Quick test to verify the native addon loads
 */

console.log("Loading Flash native addon...");

try {
  const flash = require("../build/Release/flash_native.node");
  console.log("✅ Addon loaded successfully!");
  console.log("✅ Available exports:", Object.keys(flash));

  // Check if Server class is available
  if (flash.Server) {
    console.log("✅ Server class is available!");

    // Try creating a server instance (it will have stub methods for now)
    console.log("\nTrying to create a Server instance...");
    try {
      const server = new flash.Server(5627);
      console.log("✅ Server instance created!");
      console.log("✅ Server object:", server);
    } catch (error) {
      console.log("❌ Error creating server:", error.message);
    }
  } else {
    console.log("❌ Server class not found in exports");
  }
} catch (error) {
  console.log("❌ Failed to load addon:", error.message);
  console.log(error.stack);
}
