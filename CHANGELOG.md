# Changelog

All notable changes to Flash Framework will be documented in this file.

## [0.1.0] - 2026-01-19

### 🚀 Initial Release

#### Performance
- **173,000+ requests/second** benchmark throughput
- **6.9x faster** than Express.js
- **80μs P50 latency** (46x faster than Express.js)
- HTTP Keep-Alive with persistent connections
- Auto-scaling worker thread pool (2x CPU cores)
- Pre-computed static responses for hot paths

#### C++ Core
- TCP socket server with LISTEN_BACKLOG 1024
- HTTP/1.1 request parser
- Response builder with fluent API
- Worker pool with task queue
- Graceful shutdown handling

#### TypeScript API
- Express-like routing (`app.get()`, `app.post()`, etc.)
- Middleware support (logger, CORS, JSON parser)
- Request/Response objects
- Path parameters and query strings

#### Developer Experience
- Docker support for development
- CMake build system
- Google Test unit tests
- Benchmark suite with wrk

### 📚 Documentation
- Created documentation website
- Updated README with benchmarks
- API reference and architecture guide

---

**Full Changelog**: https://github.com/JUSTMEETPATEL/flash/commits/v0.1.0
