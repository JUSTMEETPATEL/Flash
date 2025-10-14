#!/usr/bin/env node

/**
 * Simple benchmark - just test raw throughput with curl
 */

const { spawn } = require("child_process");
const { exec } = require("child_process");

async function startServer(name, script, port) {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 Starting ${name} on port ${port}...`);

    const server = spawn("node", [script], {
      env: { ...process.env, PORT: port },
      stdio: ["ignore", "pipe", "pipe"],
    });

    const timeout = setTimeout(() => {
      server.kill();
      reject(new Error(`${name} failed to start`));
    }, 5000);

    server.stdout.on("data", (data) => {
      const output = data.toString();
      console.log(`  ${name}: ${output.trim()}`);

      if (output.includes("listening") || output.includes("started")) {
        clearTimeout(timeout);
        console.log(`✅ ${name} started successfully`);
        resolve(server);
      }
    });

    server.stderr.on("data", (data) => {
      console.error(`❌ ${name} error: ${data.toString().trim()}`);
    });

    server.on("close", (code) => {
      console.log(`${name} exited with code ${code}`);
    });
  });
}

async function testEndpoint(port, path) {
  return new Promise((resolve, reject) => {
    exec(`curl -s http://localhost:${port}${path}`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

async function simpleBenchmark(name, port) {
  console.log(`\n📊 Testing ${name}...`);

  try {
    // Test hello endpoint
    const response = await testEndpoint(port, "/hello");
    console.log(`  Response: ${response.substring(0, 50)}...`);

    // Simple timing test - 100 requests
    const start = Date.now();
    for (let i = 0; i < 100; i++) {
      await testEndpoint(port, "/hello");
    }
    const end = Date.now();
    const duration = (end - start) / 1000;
    const rps = 100 / duration;

    console.log(`  ✅ 100 requests in ${duration.toFixed(2)}s`);
    console.log(`  📈 ~${rps.toFixed(0)} req/s`);

    return rps;
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return 0;
  }
}

async function main() {
  console.log("🚀 Simple Flash vs Express Benchmark\n");
  console.log("Testing with 100 sequential requests...\n");

  const servers = [];

  try {
    // Start Express
    const express = await startServer(
      "Express",
      "benchmarks/servers/express-server.js",
      5629
    );
    servers.push(express);

    // Wait a bit
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Benchmark Express
    const expressRps = await simpleBenchmark("Express", 5629);

    // Start Flash
    // const flash = await startServer('Flash', 'benchmarks/servers/flash-server.js', 5627);
    // servers.push(flash);

    // Wait a bit
    // await new Promise(resolve => setTimeout(resolve, 1000));

    // Benchmark Flash
    // const flashRps = await simpleBenchmark('Flash', 5627);

    // Compare
    console.log("\n" + "=".repeat(60));
    console.log("📊 RESULTS");
    console.log("=".repeat(60));
    console.log(`Express: ~${expressRps.toFixed(0)} req/s`);
    // console.log(`Flash:   ~${flashRps.toFixed(0)} req/s`);
    // if (flashRps > 0 && expressRps > 0) {
    //   const improvement = ((flashRps - expressRps) / expressRps * 100).toFixed(1);
    //   console.log(`\nImprovement: ${improvement}% (${(flashRps / expressRps).toFixed(2)}x)`);
    // }
    console.log("=".repeat(60));
  } finally {
    // Cleanup
    console.log("\n🛑 Stopping servers...");
    servers.forEach((s) => s.kill());
    process.exit(0);
  }
}

main().catch((error) => {
  console.error("❌ Benchmark failed:", error);
  process.exit(1);
});
