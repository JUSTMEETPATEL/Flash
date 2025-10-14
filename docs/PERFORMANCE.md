# Performance Testing Guide

This document describes how to run performance tests and benchmarks for Flash Framework.

---

## 📋 Overview

Flash Framework includes comprehensive performance testing tools to:

- Benchmark throughput (requests/second)
- Measure latency (p50, p95, p99 percentiles)
- Compare against baseline implementations
- Profile CPU and memory usage
- Detect performance regressions

---

## 🛠️ Prerequisites

### Required Tools

**macOS:**

```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install wrk for HTTP benchmarking
brew install wrk

# Xcode Command Line Tools (for Instruments)
xcode-select --install
```

**Linux:**

```bash
# Install wrk
sudo apt-get update
sudo apt-get install wrk

# Install perf tools
sudo apt-get install linux-tools-common linux-tools-generic

# Install Valgrind for memory profiling
sudo apt-get install valgrind
```

### Optional Tools

- **Flamegraph**: For visualizing CPU profiles
- **heaptrack**: For detailed memory analysis (Linux)

---

## 🚀 Running Benchmarks

### Quick Start

```bash
# Build the project
npm run build

# Run all benchmarks
npm run benchmark
```

This will:

1. Start each server (Flash, Node.js, Express)
2. Warm up each server (5 seconds)
3. Run load tests (30 seconds each)
4. Generate comparison report
5. Display results

### Benchmark Output

```
🚀 Flash Framework Benchmark Suite
================================================================================
Duration: 30s per test
Threads: 4
Connections: 100
Scenarios: 5
Servers: 3
================================================================================

📊 Benchmarking: Flash Framework - hello-world
   Simple "Hello, World!" response
  Starting Flash Framework...
  Warming up (5s)...
  Running benchmark (30s)...
  ✅ 52340 req/s | p99: 4.21ms | avg: 1.89ms

📊 Benchmarking: Express.js - hello-world
   Simple "Hello, World!" response
  Starting Express.js...
  Warming up (5s)...
  Running benchmark (30s)...
  ✅ 26170 req/s | p99: 8.45ms | avg: 3.78ms

================================================================================
📊 BENCHMARK SUMMARY
================================================================================

hello-world:
  Flash:    52340 req/s
  Express:  26170 req/s
  Improvement: 100.0% (2.00x faster)

json-response:
  Flash:    48230 req/s
  Express:  24115 req/s
  Improvement: 100.0% (2.00x faster)
```

### Individual Scenario Testing

Test a specific scenario:

```bash
# Edit benchmarks/scripts/benchmark.js to comment out other scenarios
node benchmarks/scripts/benchmark.js
```

### Custom Configuration

Modify `benchmarks/scripts/benchmark.js`:

```javascript
const BENCHMARK_CONFIG = {
  duration: "60s", // Longer test
  threads: 8, // More threads
  connections: 200, // More concurrent connections
  warmupDuration: "10s",
  // ... scenarios
};
```

---

## 📊 Benchmark Scenarios

### 1. Hello World

Simple text response - tests raw server throughput.

```typescript
app.get("/hello", (req, res) => {
  res.send("Hello, World!");
});
```

**Expected Performance:**

- Flash: 50,000+ req/s
- Express: 25,000 req/s
- Target: 2x improvement

### 2. JSON Response

Object serialization - tests JSON performance.

```typescript
app.get("/api/user", (req, res) => {
  res.json({
    id: 123,
    name: "John Doe",
    email: "john@example.com",
    created_at: "2025-01-01T00:00:00Z",
    active: true,
  });
});
```

**Expected Performance:**

- Flash: 40,000+ req/s
- Express: 20,000 req/s
- Target: 2x improvement

### 3. Path Parameters

Route matching and parameter extraction.

```typescript
app.get("/users/:id", (req, res) => {
  res.json({
    id: req.params.id,
    type: "user",
  });
});
```

**Expected Performance:**

- Flash: 35,000+ req/s
- Express: 18,000 req/s
- Target: ~2x improvement

### 4. Query Strings

Query parameter parsing.

```typescript
app.get("/search", (req, res) => {
  res.json({
    query: req.query.q || "",
    limit: req.query.limit || 10,
    results: [],
  });
});
```

**Expected Performance:**

- Flash: 35,000+ req/s
- Express: 18,000 req/s
- Target: ~2x improvement

### 5. Middleware Chain

Multiple middleware functions.

```typescript
app.get("/protected", logger, auth, validation, (req, res) => {
  res.json({
    message: "Protected resource",
    authenticated: true,
  });
});
```

**Expected Performance:**

- Flash: 30,000+ req/s
- Express: 15,000 req/s
- Target: 2x improvement

---

## 🔬 Profiling

### CPU Profiling

**macOS (Instruments):**

```bash
# Build release version
mkdir build-release
cd build-release
cmake .. -DCMAKE_BUILD_TYPE=Release
make

# Profile with Instruments
instruments -t "Time Profiler" -D profile.trace ./flash_tests

# Open profile
open profile.trace
```

**Linux (perf):**

```bash
# Build release version
mkdir build-release
cd build-release
cmake .. -DCMAKE_BUILD_TYPE=Release
make

# Record profile
perf record -g ./flash_tests

# View report
perf report

# Generate flamegraph (if installed)
perf script | stackcollapse-perf.pl | flamegraph.pl > flamegraph.svg
```

### Memory Profiling

**macOS (Instruments):**

```bash
instruments -t "Allocations" -D allocations.trace ./flash_tests
open allocations.trace
```

**Linux (Valgrind/Massif):**

```bash
valgrind --tool=massif ./flash_tests
ms_print massif.out.* > memory_profile.txt
less memory_profile.txt
```

---

## 📈 Performance Targets

### Throughput Goals

| Scenario       | Target (req/s) | Baseline Express | Improvement |
| -------------- | -------------- | ---------------- | ----------- |
| Hello World    | 50,000+        | 25,000           | 2x          |
| JSON Response  | 40,000+        | 20,000           | 2x          |
| Path Params    | 35,000+        | 18,000           | ~2x         |
| Query Strings  | 35,000+        | 18,000           | ~2x         |
| Middleware     | 30,000+        | 15,000           | 2x          |
| Static Files\* | 25,000+        | 10,000           | 2.5x        |

\*Static file serving requires Phase 4 completion

### Latency Goals

| Percentile | Target | Baseline Express | Improvement |
| ---------- | ------ | ---------------- | ----------- |
| p50        | < 2ms  | 3-5ms            | ~2x faster  |
| p95        | < 5ms  | 8-12ms           | ~2x faster  |
| p99        | < 10ms | 15-25ms          | ~2x faster  |
| p99.9      | < 20ms | 30-50ms          | ~2x faster  |

### Memory Goals

| Scenario          | Target Memory | Notes                         |
| ----------------- | ------------- | ----------------------------- |
| Idle server       | < 20MB        | Server running, no requests   |
| 1,000 connections | < 100MB       | Active concurrent connections |
| 10,000 requests   | < 150MB       | Peak memory during load       |
| Memory leak rate  | 0 bytes/req   | No growth over 100k requests  |

---

## 📋 Benchmark Results Format

Results are saved in `benchmarks/results/` as JSON:

```json
{
  "timestamp": "2025-10-14T10:30:00.000Z",
  "config": {
    "duration": "30s",
    "threads": 4,
    "connections": 100
  },
  "results": [
    {
      "server": "flash",
      "scenario": "hello-world",
      "metrics": {
        "requestsPerSec": 52340,
        "transferPerSec": "7.23MB",
        "latency": {
          "avg": "1.89ms",
          "stdev": "0.45ms",
          "max": "12.34ms",
          "p50": "1.72ms",
          "p75": "2.14ms",
          "p90": "2.89ms",
          "p99": "4.21ms"
        },
        "requests": {
          "total": 1570200,
          "errors": 0
        }
      }
    }
  ],
  "comparison": {
    "hello-world": {
      "flash_rps": 52340,
      "express_rps": 26170,
      "improvement": "100.0%",
      "improvement_factor": "2.00"
    }
  }
}
```

---

## 🔧 Troubleshooting

### wrk not found

```bash
# macOS
brew install wrk

# Linux
sudo apt-get install wrk

# Build from source (if package not available)
git clone https://github.com/wg/wrk.git
cd wrk
make
sudo cp wrk /usr/local/bin/
```

### Port already in use

```bash
# Find process using port
lsof -i :5627
lsof -i :5628
lsof -i :5629

# Kill processes
kill -9 <PID>
```

### Server fails to start

```bash
# Rebuild project
npm run clean
npm run build

# Check for errors
npm run build:cpp
npm run build:ts
```

### Low performance results

Check:

1. **Build type**: Ensure Release build (`cmake .. -DCMAKE_BUILD_TYPE=Release`)
2. **CPU throttling**: Disable power saving mode
3. **Background processes**: Close unnecessary applications
4. **Connections**: Increase connections for higher throughput
5. **Duration**: Longer tests = more accurate results

---

## 📝 Best Practices

### 1. Consistent Testing Environment

- Close unnecessary applications
- Disable power saving mode
- Use same hardware for comparisons
- Test at same time of day
- Multiple runs for accuracy

### 2. Warm-Up Period

Always include warm-up to:

- Initialize JIT compilation
- Populate caches
- Stabilize performance

### 3. Multiple Runs

Run benchmarks 3-5 times and average results:

```bash
for i in {1..5}; do
  npm run benchmark
  sleep 10
done
```

### 4. Document Results

- Record hardware specs
- Note OS version
- Document configuration
- Save raw data
- Track over time

### 5. Regression Testing

```bash
# Save baseline
npm run benchmark > baseline.txt

# After changes, compare
npm run benchmark > current.txt
diff baseline.txt current.txt
```

---

## 📚 Further Reading

- [wrk Documentation](https://github.com/wg/wrk)
- [Instruments User Guide](https://help.apple.com/instruments/mac/)
- [Linux perf Tutorial](https://perf.wiki.kernel.org/index.php/Tutorial)
- [Systems Performance by Brendan Gregg](http://www.brendangregg.com/systems-performance-2nd-edition-book.html)

---

**Last Updated:** October 14, 2025  
**Version:** 0.1.0-alpha
