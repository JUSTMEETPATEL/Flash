#!/usr/bin/env node

/**
 * Express Baseline Benchmark
 *
 * Since Flash server has blocking architecture, run Express-only
 * benchmark to establish baseline for future comparison.
 */

const { spawn } = require("child_process");
const path = require("path");

// Configuration
const EXPRESS_PORT = 3000;
const DURATION = 10; // 10 seconds for quick test
const CONNECTIONS = 100;
const THREADS = 4;

// Colors
const RESET = "\x1b[0m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[34m";
const CYAN = "\x1b[36m";

console.log(`${CYAN}╔════════════════════════════════════════════╗${RESET}`);
console.log(`${CYAN}║   Flash Framework - Express Baseline      ║${RESET}`);
console.log(`${CYAN}╚════════════════════════════════════════════╝${RESET}\n`);

// Test scenarios
const scenarios = [
  {
    name: "Hello World",
    path: "/hello",
    description: "Simple text response",
  },
  {
    name: "JSON Response",
    path: "/api/user",
    description: "JSON serialization",
  },
  {
    name: "Path Parameters",
    path: "/users/123",
    description: "Dynamic routing",
  },
  {
    name: "Query String",
    path: "/search?q=test&limit=10",
    description: "Query parsing",
  },
  {
    name: "Middleware Chain",
    path: "/protected",
    description: "Multiple middleware",
  },
];

/**
 * Start Express server
 */
function startExpress() {
  return new Promise((resolve, reject) => {
    console.log(`${BLUE}[Express]${RESET} Starting server...`);

    const serverPath = path.join(
      __dirname,
      "..",
      "servers",
      "express-server.js"
    );
    const server = spawn("node", [serverPath], {
      env: { ...process.env, PORT: EXPRESS_PORT },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let output = "";

    server.stdout.on("data", (data) => {
      output += data.toString();
      if (output.includes(`listening on port ${EXPRESS_PORT}`)) {
        console.log(
          `${GREEN}[Express]${RESET} Server ready on port ${EXPRESS_PORT}\n`
        );
        resolve(server);
      }
    });

    server.stderr.on("data", (data) => {
      console.error(`${RED}[Express Error]${RESET}`, data.toString());
    });

    server.on("error", reject);

    // Timeout after 5 seconds
    setTimeout(() => {
      if (!output.includes("listening on port")) {
        server.kill();
        reject(new Error("Server failed to start within 5 seconds"));
      }
    }, 5000);
  });
}

/**
 * Run wrk benchmark
 */
function runWrk(port, path) {
  return new Promise((resolve, reject) => {
    const url = `http://localhost:${port}${path}`;
    const args = [
      "-t",
      THREADS.toString(),
      "-c",
      CONNECTIONS.toString(),
      "-d",
      `${DURATION}s`,
      "--latency",
      url,
    ];

    const wrk = spawn("wrk", args, { stdio: ["ignore", "pipe", "pipe"] });

    let output = "";

    wrk.stdout.on("data", (data) => {
      output += data.toString();
    });

    wrk.on("close", (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`wrk exited with code ${code}`));
      }
    });

    wrk.on("error", (err) => {
      reject(new Error(`Failed to run wrk: ${err.message}`));
    });
  });
}

/**
 * Parse wrk output
 */
function parseWrkOutput(output) {
  const result = {
    requestsPerSec: 0,
    avgLatency: 0,
    p50Latency: 0,
    p99Latency: 0,
    totalRequests: 0,
  };

  // Requests/sec: 12345.67
  const reqSecMatch = output.match(/Requests\/sec:\s+([\d.]+)/);
  if (reqSecMatch) {
    result.requestsPerSec = parseFloat(reqSecMatch[1]);
  }

  // Latency avg
  const avgMatch = output.match(/Latency\s+([\d.]+)(us|ms|s)/);
  if (avgMatch) {
    let latency = parseFloat(avgMatch[1]);
    if (avgMatch[2] === "s") latency *= 1000;
    if (avgMatch[2] === "us") latency /= 1000;
    result.avgLatency = latency;
  }

  // 50% latency
  const p50Match = output.match(/50%\s+([\d.]+)(us|ms|s)/);
  if (p50Match) {
    let latency = parseFloat(p50Match[1]);
    if (p50Match[2] === "s") latency *= 1000;
    if (p50Match[2] === "us") latency /= 1000;
    result.p50Latency = latency;
  }

  // 99% latency
  const p99Match = output.match(/99%\s+([\d.]+)(us|ms|s)/);
  if (p99Match) {
    let latency = parseFloat(p99Match[1]);
    if (p99Match[2] === "s") latency *= 1000;
    if (p99Match[2] === "us") latency /= 1000;
    result.p99Latency = latency;
  }

  // Total requests
  const totalMatch = output.match(/([\d]+) requests in/);
  if (totalMatch) {
    result.totalRequests = parseInt(totalMatch[1]);
  }

  return result;
}

/**
 * Format number with commas
 */
function formatNumber(num) {
  return num.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

/**
 * Run all benchmarks
 */
async function runBenchmarks() {
  let expressServer;
  const results = [];

  try {
    // Start Express
    expressServer = await startExpress();

    // Run each scenario
    for (const scenario of scenarios) {
      console.log(`${YELLOW}▶ Testing: ${scenario.name}${RESET}`);
      console.log(`  ${scenario.description}`);
      console.log(`  URL: http://localhost:${EXPRESS_PORT}${scenario.path}\n`);

      const output = await runWrk(EXPRESS_PORT, scenario.path);
      const metrics = parseWrkOutput(output);

      results.push({
        scenario: scenario.name,
        ...metrics,
      });

      // Display results
      console.log(
        `  ${GREEN}Requests/sec:${RESET} ${formatNumber(
          metrics.requestsPerSec
        )}`
      );
      console.log(
        `  ${GREEN}Avg Latency:${RESET}  ${formatNumber(metrics.avgLatency)}ms`
      );
      console.log(
        `  ${GREEN}P50 Latency:${RESET}  ${formatNumber(metrics.p50Latency)}ms`
      );
      console.log(
        `  ${GREEN}P99 Latency:${RESET}  ${formatNumber(metrics.p99Latency)}ms`
      );
      console.log(
        `  ${GREEN}Total Reqs:${RESET}   ${formatNumber(
          metrics.totalRequests
        )}\n`
      );
    }

    // Summary table
    console.log(
      `\n${CYAN}╔════════════════════════════════════════════╗${RESET}`
    );
    console.log(
      `${CYAN}║           Benchmark Summary                ║${RESET}`
    );
    console.log(
      `${CYAN}╚════════════════════════════════════════════╝${RESET}\n`
    );

    console.log("Scenario              | Req/sec  | Avg (ms) | P99 (ms)");
    console.log("---------------------|----------|----------|----------");

    results.forEach((r) => {
      const name = r.scenario.padEnd(20);
      const rps = formatNumber(r.requestsPerSec).padStart(8);
      const avg = formatNumber(r.avgLatency).padStart(8);
      const p99 = formatNumber(r.p99Latency).padStart(8);
      console.log(`${name} | ${rps} | ${avg} | ${p99}`);
    });

    console.log();

    // Calculate average
    const avgRps =
      results.reduce((sum, r) => sum + r.requestsPerSec, 0) / results.length;
    console.log(
      `${GREEN}Average Throughput:${RESET} ${formatNumber(avgRps)} req/sec`
    );

    // Expected Flash performance (2x)
    console.log(
      `\n${CYAN}Expected Flash Performance (2x improvement):${RESET}`
    );
    console.log(`Target Throughput: ${formatNumber(avgRps * 2)} req/sec`);

    // Save results
    const resultData = {
      timestamp: new Date().toISOString(),
      framework: "Express",
      duration: DURATION,
      connections: CONNECTIONS,
      threads: THREADS,
      scenarios: results,
      averageThroughput: avgRps,
    };

    const fs = require("fs");
    const resultsDir = path.join(__dirname, "..", "results");
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = path.join(
      resultsDir,
      `express-baseline-${timestamp}.json`
    );
    fs.writeFileSync(filename, JSON.stringify(resultData, null, 2));

    console.log(`\n${GREEN}Results saved:${RESET} ${filename}\n`);
  } catch (error) {
    console.error(`\n${RED}Error:${RESET}`, error.message);
    process.exit(1);
  } finally {
    // Cleanup
    if (expressServer) {
      console.log(`${BLUE}[Express]${RESET} Stopping server...`);
      expressServer.kill();
    }
  }
}

// Run benchmarks
runBenchmarks()
  .then(() => {
    console.log(`${GREEN}✓ Benchmark complete!${RESET}\n`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(`\n${RED}Fatal error:${RESET}`, error);
    process.exit(1);
  });
