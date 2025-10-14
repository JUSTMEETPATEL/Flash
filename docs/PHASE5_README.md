# Phase 5: Performance & Testing

> **Goal:** Comprehensive testing, benchmarking, and optimization to ensure production-ready quality

**Timeline:** Week 13-14 (2 weeks)  
**Status:** 🚀 IN PROGRESS  
**Focus:** Quality Assurance & Performance Validation

---

## 🎯 Overview

Phase 5 is the quality assurance phase where we:

1. **Test thoroughly** - Achieve 80%+ coverage in C++ and TypeScript
2. **Benchmark performance** - Validate 2x improvement over Express
3. **Profile and optimize** - Identify and fix bottlenecks
4. **Detect memory leaks** - Ensure zero leaks
5. **Document results** - Complete performance and testing guides

---

## 🚀 Quick Start

### 1. Install Tools

```bash
# Run the automated setup
./scripts/setup-phase5.sh
```

This installs:

- **wrk** - HTTP load testing
- **lcov** - C++ code coverage
- **Instruments** (macOS) or **Valgrind** (Linux) - Memory profiling

### 2. Build Project

```bash
npm run build
```

### 3. Run Tests

```bash
# Run all tests
npm test

# C++ tests only
npm run test:cpp

# TypeScript tests only
npm run test:ts
```

### 4. Check Coverage

```bash
# Both C++ and TypeScript
npm run coverage

# TypeScript only
npm run coverage:ts

# C++ only
npm run coverage:cpp
```

### 5. Run Benchmarks

```bash
npm run benchmark
```

### 6. Check for Memory Leaks

```bash
npm run check:leaks
```

### 7. Full Performance Suite

```bash
# Run everything: tests, coverage, benchmarks, leak detection
npm run perf
```

---

## 📊 Performance Targets

### Throughput Goals

| Scenario       | Target (req/s) | Baseline (Express) | Improvement |
| -------------- | -------------- | ------------------ | ----------- |
| Hello World    | 50,000+        | 25,000             | 2.0x        |
| JSON Response  | 40,000+        | 20,000             | 2.0x        |
| Path Params    | 35,000+        | 18,000             | ~2.0x       |
| Query Strings  | 35,000+        | 18,000             | ~2.0x       |
| Middleware     | 30,000+        | 15,000             | 2.0x        |

### Latency Goals

| Percentile | Target | Baseline (Express) |
| ---------- | ------ | ------------------ |
| p50        | < 2ms  | 3-5ms              |
| p95        | < 5ms  | 8-12ms             |
| p99        | < 10ms | 15-25ms            |

### Coverage Goals

| Component      | Target |
| -------------- | ------ |
| C++ Code       | 90%+   |
| TypeScript Code| 85%+   |
| Overall        | 80%+   |

### Memory Goals

- **No memory leaks** - 0 bytes/request growth
- **Idle memory** - < 20MB
- **Under load** - < 100MB (1000 connections)

---

## 🧪 Testing Strategy

### Unit Tests

**C++ (Google Test):**

```bash
cd build
./flash_tests
```

Tests all C++ components:

- HttpServer
- HttpParser
- HttpResponse
- WorkerPool
- FileHandler
- Connection management

**TypeScript (Jest):**

```bash
npm test
```

Tests all TypeScript components:

- Router
- Request/Response
- Middleware
- Type definitions
- Error handling

### Integration Tests

End-to-end testing of:

- Full request/response cycles
- N-API boundary crossing
- Error propagation
- Async operations
- Middleware chains

### Performance Tests

Benchmark scenarios:

1. **Hello World** - Raw throughput
2. **JSON Response** - Serialization performance
3. **Path Parameters** - Route matching
4. **Query Strings** - Parsing performance
5. **Middleware Chain** - Middleware overhead

---

## 📈 Benchmarking

### Running Benchmarks

```bash
npm run benchmark
```

This:

1. Starts Flash, Node.js, and Express servers
2. Warms up each server (5 seconds)
3. Runs load tests (30 seconds each)
4. Compares results
5. Generates JSON report

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
  ✅ 52340 req/s | p99: 4.21ms | avg: 1.89ms

📊 Benchmarking: Express.js - hello-world
   Simple "Hello, World!" response
  ✅ 26170 req/s | p99: 8.45ms | avg: 3.78ms

================================================================================
📊 BENCHMARK SUMMARY
================================================================================

hello-world:
  Flash:    52340 req/s
  Express:  26170 req/s
  Improvement: 100.0% (2.00x faster)
```

### Results Location

Results saved to: `benchmarks/results/benchmark-<timestamp>.json`

---

## 🔍 Code Coverage

### TypeScript Coverage

```bash
npm run coverage:ts
```

Generates:

- Console summary
- HTML report (`coverage/index.html`)
- LCOV report for CI

**Coverage Thresholds:**

- Lines: 80%
- Statements: 80%
- Functions: 80%
- Branches: 80%

### C++ Coverage

```bash
npm run coverage:cpp
```

Generates:

- Console summary
- HTML report (`build-coverage/coverage-html/index.html`)
- LCOV report

**Coverage Target:** 80%+

---

## 🐛 Memory Leak Detection

### Running Leak Detection

```bash
npm run check:leaks
```

**macOS:** Uses Instruments (Leaks template)  
**Linux:** Uses Valgrind

### What It Checks

- Memory allocations/deallocations
- Leaked blocks
- Reachable/unreachable memory
- Memory growth over time

### Success Criteria

- ✅ 0 definitely lost bytes
- ✅ 0 indirectly lost bytes
- ✅ No memory growth over 100k requests

---

## 🔬 Profiling

### CPU Profiling

**macOS:**

```bash
cd build-release
instruments -t "Time Profiler" -D profile.trace ./flash_tests
open profile.trace
```

**Linux:**

```bash
cd build-release
perf record -g ./flash_tests
perf report
```

### Memory Profiling

**macOS:**

```bash
instruments -t "Allocations" -D allocations.trace ./flash_tests
open allocations.trace
```

**Linux:**

```bash
valgrind --tool=massif ./flash_tests
ms_print massif.out.* > memory_profile.txt
```

---

## 📁 Project Structure

```
flash/
├── benchmarks/
│   ├── scripts/
│   │   └── benchmark.js          # Automated benchmark runner
│   ├── servers/
│   │   ├── flash-server.js       # Flash implementation
│   │   ├── node-server.js        # Pure Node.js baseline
│   │   └── express-server.js     # Express baseline
│   └── results/                  # Benchmark results (JSON)
├── scripts/
│   ├── coverage-cpp.sh           # C++ coverage analysis
│   ├── coverage-ts.sh            # TypeScript coverage
│   ├── check-leaks.sh            # Memory leak detection
│   └── setup-phase5.sh           # Tool installation
├── docs/
│   ├── PHASE5_PLAN.md           # Detailed implementation plan
│   ├── PHASE5_PROGRESS.md       # Progress tracking
│   └── PERFORMANCE.md           # Performance testing guide
└── jest.config.js               # Jest configuration
```

---

## 📋 Week-by-Week Plan

### Week 13: Testing

**Day 1-2:** Test coverage analysis & improvement ✅  
**Day 3-4:** Integration testing  
**Day 5:** Memory leak testing

### Week 14: Performance

**Day 1-2:** Benchmark suite & baseline comparison  
**Day 3-4:** Profiling & optimization  
**Day 5:** Documentation & Phase 5 completion

---

## 🎓 Learning Objectives

### What You'll Learn

1. **Performance Testing**
   - Load testing with wrk
   - Interpreting benchmark results
   - Statistical significance
   - Performance regression detection

2. **Code Coverage**
   - Coverage metrics (lines, branches, functions)
   - Test gap analysis
   - Coverage-driven testing
   - CI integration

3. **Memory Profiling**
   - Memory leak detection
   - Allocation patterns
   - Memory growth analysis
   - RAII verification

4. **CPU Profiling**
   - Hot path identification
   - Call graph analysis
   - Optimization opportunities
   - Before/after comparison

---

## 🔧 Troubleshooting

### Tools Not Found

Run the setup script:

```bash
./scripts/setup-phase5.sh
```

### Coverage Build Fails

```bash
# Clean and rebuild
rm -rf build-coverage
mkdir build-coverage
cd build-coverage
cmake .. -DCMAKE_BUILD_TYPE=Coverage
make
```

### Benchmark Servers Won't Start

```bash
# Kill any existing servers
lsof -ti:5627 | xargs kill -9
lsof -ti:5628 | xargs kill -9
lsof -ti:5629 | xargs kill -9

# Rebuild project
npm run build
```

### Low Coverage Results

1. Review coverage HTML report
2. Identify untested code paths
3. Write tests for gaps
4. Focus on error paths
5. Test edge cases

---

## 📚 Documentation

- **[PHASE5_PLAN.md](./PHASE5_PLAN.md)** - Detailed 2-week plan
- **[PHASE5_PROGRESS.md](./PHASE5_PROGRESS.md)** - Progress tracking
- **[PERFORMANCE.md](./PERFORMANCE.md)** - Performance testing guide
- **[PRD.md](./PRD.md)** - Product requirements

---

## ✅ Success Criteria

Phase 5 is complete when:

- ✅ Test coverage ≥ 80% (C++ and TypeScript)
- ✅ Throughput ≥ 2x Express baseline
- ✅ P99 latency < 10ms
- ✅ No memory leaks detected
- ✅ All documentation complete
- ✅ Automated testing infrastructure works
- ✅ Ready for Phase 6 (Polish)

---

## 🚀 Next Steps

After Phase 5:

1. **Phase 6: Polish** - Example apps, final docs, GitHub release
2. **Community Feedback** - Share with developers
3. **Real-World Testing** - Use in actual projects
4. **Continuous Improvement** - Iterate based on feedback

---

## 🤝 Contributing

This is a learning project, but feedback is welcome!

- Report issues
- Suggest improvements
- Share benchmark results
- Contribute test cases

---

**Last Updated:** October 14, 2025  
**Phase:** 5 of 6  
**Status:** Infrastructure complete, testing in progress  
**Next Milestone:** Coverage analysis and test expansion
