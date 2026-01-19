# Flash vs Express Benchmark Results

## Test Setup
- **Date**: January 2025
- **Hardware**: M-series Mac
- **Node.js**: v23.10.0
- **Tool**: wrk (4 threads, 100 connections, 10s duration)

## Flash Server Results (WITH DEBUG LOGGING)

### Test 1: /hello
```
Running 10s test @ http://localhost:5627/hello
  4 threads and 100 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency    19.71ms    1.43ms  28.51ms   95.70%
    Req/Sec     1.26k    33.67     1.32k    87.14%
  Latency Distribution
     50%   19.75ms
     75%   20.12ms
     90%   20.49ms
     99%   22.51ms
  **1,746 requests/sec**
```

## Express Baseline Results

### Test 1: /hello
```
**24,476 requests/sec** (average across 5 runs)
```

## Analysis

**Flash is currently 14x SLOWER than Express** (1,746 vs 24,476 req/sec)

### Known Performance Issues:
1. **Debug Logging**: Massive std::cout usage in hot path
2. **No I/O Synchronization**: Multiple threads writing to cout simultaneously
3. **Log Interleaving**: Garbled output indicates contention

### Next Steps:
1. Remove ALL debug logging from production code
2. Re-run benchmarks with clean build
3. Profile to identify remaining bottlenecks
4. Optimize hot paths

