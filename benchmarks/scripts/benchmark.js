/**
 * Benchmark Runner for Flash Framework
 *
 * Compares Flash Framework performance against:
 * - Pure Node.js HTTP server
 * - Express.js
 * - Fastify
 *
 * Uses wrk for load testing
 */

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

// Benchmark configuration
const BENCHMARK_CONFIG = {
  duration: "30s",
  threads: 4,
  connections: 100,
  warmupDuration: "5s",
  scenarios: [
    {
      name: "hello-world",
      path: "/hello",
      description: 'Simple "Hello, World!" response',
    },
    {
      name: "json-response",
      path: "/api/user",
      description: "JSON response with object data",
    },
    {
      name: "path-params",
      path: "/users/123",
      description: "Route with path parameter extraction",
    },
    {
      name: "query-string",
      path: "/search?q=test&limit=10",
      description: "Route with query string parsing",
    },
    {
      name: "middleware-chain",
      path: "/protected",
      description: "Route with 3 middleware functions",
    },
  ],
};

// Servers to benchmark
const SERVERS = {
  flash: {
    name: "Flash Framework",
    script: "benchmarks/servers/flash-server.js",
    port: 5627,
  },
  node: {
    name: "Pure Node.js",
    script: "benchmarks/servers/node-server.js",
    port: 5628,
  },
  express: {
    name: "Express.js",
    script: "benchmarks/servers/express-server.js",
    port: 5629,
  },
};

/**
 * Run wrk benchmark
 */
function runWrk(url, config) {
  return new Promise((resolve, reject) => {
    const args = [
      "-t",
      config.threads.toString(),
      "-c",
      config.connections.toString(),
      "-d",
      config.duration,
      "--latency",
      url,
    ];

    console.log(`  Running: wrk ${args.join(" ")}`);

    let output = "";
    const wrk = spawn("wrk", args);

    wrk.stdout.on("data", (data) => {
      output += data.toString();
    });

    wrk.stderr.on("data", (data) => {
      console.error(`wrk error: ${data}`);
    });

    wrk.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`wrk exited with code ${code}`));
      } else {
        resolve(parseWrkOutput(output));
      }
    });
  });
}

/**
 * Parse wrk output to extract metrics
 */
function parseWrkOutput(output) {
  const metrics = {
    requestsPerSec: 0,
    transferPerSec: "",
    latency: {
      avg: "",
      stdev: "",
      max: "",
      p50: "",
      p75: "",
      p90: "",
      p99: "",
    },
    requests: {
      total: 0,
      errors: 0,
    },
  };

  // Extract requests/sec
  const reqSecMatch = output.match(/Requests\/sec:\s+([\d.]+)/);
  if (reqSecMatch) {
    metrics.requestsPerSec = parseFloat(reqSecMatch[1]);
  }

  // Extract transfer/sec
  const transferMatch = output.match(/Transfer\/sec:\s+(\S+)/);
  if (transferMatch) {
    metrics.transferPerSec = transferMatch[1];
  }

  // Extract latency stats
  const latencyMatch = output.match(
    /Latency\s+([\d.]+\w+)\s+([\d.]+\w+)\s+([\d.]+\w+)/
  );
  if (latencyMatch) {
    metrics.latency.avg = latencyMatch[1];
    metrics.latency.stdev = latencyMatch[2];
    metrics.latency.max = latencyMatch[3];
  }

  // Extract percentile latencies
  const p50Match = output.match(/50%\s+([\d.]+\w+)/);
  const p75Match = output.match(/75%\s+([\d.]+\w+)/);
  const p90Match = output.match(/90%\s+([\d.]+\w+)/);
  const p99Match = output.match(/99%\s+([\d.]+\w+)/);

  if (p50Match) metrics.latency.p50 = p50Match[1];
  if (p75Match) metrics.latency.p75 = p75Match[1];
  if (p90Match) metrics.latency.p90 = p90Match[1];
  if (p99Match) metrics.latency.p99 = p99Match[1];

  // Extract total requests
  const totalMatch = output.match(/([\d]+) requests in/);
  if (totalMatch) {
    metrics.requests.total = parseInt(totalMatch[1]);
  }

  return metrics;
}

/**
 * Start a server
 */
function startServer(serverConfig) {
  return new Promise((resolve, reject) => {
    console.log(`  Starting ${serverConfig.name}...`);

    const serverProcess = spawn("node", [serverConfig.script], {
      stdio: ["ignore", "pipe", "pipe"],
    });

    let started = false;

    // Wait for server to start
    const timeout = setTimeout(() => {
      if (!started) {
        serverProcess.kill();
        reject(new Error(`${serverConfig.name} failed to start`));
      }
    }, 10000);

    serverProcess.stdout.on("data", (data) => {
      const output = data.toString();
      if (output.includes("listening") || output.includes("started")) {
        if (!started) {
          started = true;
          clearTimeout(timeout);
          // Give it a moment to fully start
          setTimeout(() => resolve(serverProcess), 1000);
        }
      }
    });

    serverProcess.stderr.on("data", (data) => {
      console.error(`${serverConfig.name} error: ${data}`);
    });

    serverProcess.on("close", (code) => {
      if (!started) {
        clearTimeout(timeout);
        reject(new Error(`${serverConfig.name} exited with code ${code}`));
      }
    });
  });
}

/**
 * Stop a server
 */
function stopServer(serverProcess) {
  return new Promise((resolve) => {
    if (!serverProcess) {
      resolve();
      return;
    }

    serverProcess.on("close", () => {
      resolve();
    });

    serverProcess.kill("SIGTERM");

    // Force kill after 5 seconds
    setTimeout(() => {
      serverProcess.kill("SIGKILL");
      resolve();
    }, 5000);
  });
}

/**
 * Run benchmark for a specific server and scenario
 */
async function benchmarkScenario(serverKey, serverConfig, scenario) {
  console.log(`\n📊 Benchmarking: ${serverConfig.name} - ${scenario.name}`);
  console.log(`   ${scenario.description}`);

  let serverProcess = null;

  try {
    // Start server
    serverProcess = await startServer(serverConfig);

    // Warmup
    console.log(`  Warming up (${BENCHMARK_CONFIG.warmupDuration})...`);
    await runWrk(`http://localhost:${serverConfig.port}${scenario.path}`, {
      ...BENCHMARK_CONFIG,
      duration: BENCHMARK_CONFIG.warmupDuration,
    });

    // Actual benchmark
    console.log(`  Running benchmark (${BENCHMARK_CONFIG.duration})...`);
    const metrics = await runWrk(
      `http://localhost:${serverConfig.port}${scenario.path}`,
      BENCHMARK_CONFIG
    );

    console.log(
      `  ✅ ${metrics.requestsPerSec.toFixed(0)} req/s | ` +
        `p99: ${metrics.latency.p99} | avg: ${metrics.latency.avg}`
    );

    return {
      server: serverKey,
      scenario: scenario.name,
      metrics,
    };
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return {
      server: serverKey,
      scenario: scenario.name,
      error: error.message,
    };
  } finally {
    // Stop server
    if (serverProcess) {
      await stopServer(serverProcess);
    }
  }
}

/**
 * Generate comparison report
 */
function generateReport(results, outputPath) {
  const report = {
    timestamp: new Date().toISOString(),
    config: BENCHMARK_CONFIG,
    results: results,
    comparison: {},
  };

  // Group by scenario
  const byScenario = {};
  results.forEach((result) => {
    if (!result.error) {
      if (!byScenario[result.scenario]) {
        byScenario[result.scenario] = {};
      }
      byScenario[result.scenario][result.server] = result.metrics;
    }
  });

  // Calculate improvements
  Object.keys(byScenario).forEach((scenario) => {
    const flashMetrics = byScenario[scenario]["flash"];
    const expressMetrics = byScenario[scenario]["express"];

    if (flashMetrics && expressMetrics) {
      const improvement = (
        ((flashMetrics.requestsPerSec - expressMetrics.requestsPerSec) /
          expressMetrics.requestsPerSec) *
        100
      ).toFixed(1);

      report.comparison[scenario] = {
        flash_rps: flashMetrics.requestsPerSec,
        express_rps: expressMetrics.requestsPerSec,
        improvement: `${improvement}%`,
        improvement_factor: (
          flashMetrics.requestsPerSec / expressMetrics.requestsPerSec
        ).toFixed(2),
      };
    }
  });

  // Write report
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Report written to: ${outputPath}`);

  return report;
}

/**
 * Print summary
 */
function printSummary(report) {
  console.log("\n" + "=".repeat(80));
  console.log("📊 BENCHMARK SUMMARY");
  console.log("=".repeat(80));

  Object.keys(report.comparison).forEach((scenario) => {
    const comp = report.comparison[scenario];
    console.log(`\n${scenario}:`);
    console.log(`  Flash:    ${comp.flash_rps.toFixed(0)} req/s`);
    console.log(`  Express:  ${comp.express_rps.toFixed(0)} req/s`);
    console.log(
      `  Improvement: ${comp.improvement} (${comp.improvement_factor}x faster)`
    );
  });

  console.log("\n" + "=".repeat(80));
}

/**
 * Main benchmark runner
 */
async function main() {
  console.log("🚀 Flash Framework Benchmark Suite");
  console.log("=".repeat(80));
  console.log(`Duration: ${BENCHMARK_CONFIG.duration} per test`);
  console.log(`Threads: ${BENCHMARK_CONFIG.threads}`);
  console.log(`Connections: ${BENCHMARK_CONFIG.connections}`);
  console.log(`Scenarios: ${BENCHMARK_CONFIG.scenarios.length}`);
  console.log(`Servers: ${Object.keys(SERVERS).length}`);
  console.log("=".repeat(80));

  const results = [];

  // Run benchmarks for each server and scenario
  for (const [serverKey, serverConfig] of Object.entries(SERVERS)) {
    console.log(`\n🔧 Testing: ${serverConfig.name}`);

    for (const scenario of BENCHMARK_CONFIG.scenarios) {
      const result = await benchmarkScenario(serverKey, serverConfig, scenario);
      results.push(result);
    }
  }

  // Generate report
  const reportPath = path.join(
    __dirname,
    "..",
    "results",
    `benchmark-${Date.now()}.json`
  );

  // Create results directory if it doesn't exist
  const resultsDir = path.dirname(reportPath);
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const report = generateReport(results, reportPath);
  printSummary(report);

  console.log("\n✅ Benchmarking complete!");
}

// Check if wrk is installed
function checkWrk() {
  return new Promise((resolve) => {
    const wrk = spawn("wrk", ["--version"]);
    wrk.on("close", (code) => {
      if (code !== 0) {
        console.error("❌ wrk is not installed!");
        console.error(
          "Install with: brew install wrk (macOS) or apt-get install wrk (Linux)"
        );
        process.exit(1);
      }
      resolve();
    });
  });
}

// Run main with error handling
checkWrk().then(() => {
  main().catch((error) => {
    console.error("❌ Benchmark failed:", error);
    process.exit(1);
  });
});
