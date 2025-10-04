# GitHub Copilot Instructions for Flash Framework

> These instructions guide AI assistants (Copilot, Claude, etc.) when working on the Flash Framework project.

---

## Project Overview

**Project Name:** Flash Framework v0.1  
**Type:** Learning project - High-performance C++/TypeScript HTTP server  
**Current Phase:** Foundation building (4-month timeline)  
**Tech Stack:** C++20, TypeScript, N-API, CMake, Jest, Google Test

**Core Goal:** Build a minimal HTTP server with C++ core and TypeScript API layer to learn systems programming and language interoperability.

**NOT building (yet):** Production framework, multi-server architecture, dynamic resource allocation, advanced features.

---

## Code Style & Conventions

### C++ Code Style

```cpp
// File: cpp/include/server.h
// Use: PascalCase for classes, snake_case for functions/variables

#pragma once
#include <string>
#include <memory>

namespace flash {

class HttpServer {
public:
    HttpServer(int port, int worker_count);
    ~HttpServer();
    
    // Use explicit for single-arg constructors
    explicit HttpServer(int port);
    
    // Prefer unique_ptr, use shared_ptr only when needed
    std::unique_ptr<Connection> accept_connection();
    
    // Use const correctness
    int get_port() const;
    
private:
    int port_;
    int worker_count_;
    // Suffix member variables with underscore
};

} // namespace flash
```

**Key Rules:**
- ✅ Use modern C++20 features (smart pointers, auto, lambdas)
- ✅ RAII for all resources (no manual delete)
- ✅ const correctness everywhere
- ✅ Prefer stack allocation over heap when possible
- ✅ Use `std::string_view` for read-only string parameters
- ✅ Header guards: `#pragma once`
- ✅ Namespace: All code in `namespace flash`
- ❌ No raw pointers except when interfacing with C APIs
- ❌ No manual memory management (new/delete)
- ❌ No C-style casts (use static_cast, etc.)

### TypeScript Code Style

```typescript
// File: src/router.ts
// Use: PascalCase for classes/interfaces, camelCase for functions/variables

import { Request, Response } from './types';

export interface RouteHandler {
  (req: Request, res: Response): Promise<void> | void;
}

export class Router {
  private routes: Map<string, RouteHandler> = new Map();
  
  // Use async/await, not .then()
  public async handleRequest(req: Request, res: Response): Promise<void> {
    const handler = this.routes.get(req.path);
    if (!handler) {
      res.status(404).json({ error: 'Not Found' });
      return;
    }
    
    await handler(req, res);
  }
  
  // Method chaining for DX
  public get(path: string, handler: RouteHandler): this {
    this.routes.set(path, handler);
    return this;
  }
}
```

**Key Rules:**
- ✅ Strict TypeScript (`strict: true` in tsconfig)
- ✅ Explicit return types for public APIs
- ✅ Use interfaces for public contracts
- ✅ Async/await over promises chains
- ✅ Functional programming where appropriate
- ✅ Descriptive variable names (not abbreviated)
- ❌ No `any` type (use `unknown` if needed)
- ❌ No implicit returns in complex functions
- ❌ No console.log in production code (use logger)

### N-API Bridge Code Style

```cpp
// File: cpp/binding/addon.cpp
// Special conventions for N-API code

#include <napi.h>

// Use Napi::ObjectWrap for wrapping C++ classes
class ServerWrap : public Napi::ObjectWrap<ServerWrap> {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    ServerWrap(const Napi::CallbackInfo& info);
    
private:
    // Always validate arguments from JavaScript
    Napi::Value Start(const Napi::CallbackInfo& info);
    
    // Use AsyncWorker for long-running operations
    class StartWorker : public Napi::AsyncWorker {
    public:
        StartWorker(Napi::Function& callback, HttpServer* server);
        void Execute() override;
        void OnOK() override;
    private:
        HttpServer* server_;
    };
    
    std::unique_ptr<HttpServer> server_;
};
```

**Key Rules:**
- ✅ Always check JavaScript argument types/count
- ✅ Use `Napi::AsyncWorker` for any blocking operations
- ✅ Proper error handling with `Napi::Error::New()`
- ✅ Memory safety: C++ owns objects, JS holds references
- ✅ Convert types explicitly (don't assume)
- ❌ Never block the event loop in N-API functions
- ❌ Don't throw C++ exceptions across N-API boundary
- ❌ Don't assume JavaScript values are valid

---

## Project Structure Context

```
flash/
├── cpp/                    # C++ source code
│   ├── include/           # Public headers
│   │   ├── server.h       # Main HTTP server
│   │   ├── http_parser.h  # Request parsing
│   │   ├── worker_pool.h  # Thread pool
│   │   └── connection.h   # Connection handling
│   ├── src/              # Implementation files
│   ├── binding/          # N-API bridge code
│   └── tests/            # Google Test unit tests
├── src/                   # TypeScript source
│   ├── index.ts          # Main exports
│   ├── router.ts         # Routing logic
│   ├── request.ts        # Request wrapper
│   ├── response.ts       # Response wrapper
│   └── types/            # TypeScript definitions
├── tests/                # TypeScript tests
└── examples/             # Example applications
```

**When creating new files:**
- C++ headers → `cpp/include/`
- C++ implementation → `cpp/src/`
- N-API bindings → `cpp/binding/`
- TypeScript source → `src/`
- Tests mirror source structure

---

## Development Guidelines

### When Writing C++ Code

1. **Always consider performance:**
   ```cpp
   // GOOD: Pass large objects by const reference
   void process_request(const HttpRequest& req);
   
   // BAD: Pass large objects by value (copies)
   void process_request(HttpRequest req);
   ```

2. **Thread safety is critical:**
   ```cpp
   // Always document thread safety
   class ConnectionPool {
   public:
       // Thread-safe: Uses internal mutex
       Connection* acquire();
       
       // NOT thread-safe: Caller must lock
       size_t unsafe_size() const;
   private:
       std::mutex mutex_;
       std::vector<Connection*> connections_;
   };
   ```

3. **Error handling:**
   ```cpp
   // Use std::optional for operations that might fail
   std::optional<HttpRequest> parse_request(const std::string& raw);
   
   // Use exceptions for unexpected errors
   void connect(const std::string& host) {
       if (host.empty()) {
           throw std::invalid_argument("Host cannot be empty");
       }
   }
   ```

### When Writing TypeScript Code

1. **API design should be intuitive:**
   ```typescript
   // GOOD: Clear, chainable API
   app
     .get('/users', getAllUsers)
     .post('/users', createUser)
     .listen(3000);
   
   // BAD: Confusing, unclear
   app.addRoute('GET', '/users', getAllUsers);
   app.addRoute('POST', '/users', createUser);
   app.startServer(3000);
   ```

2. **Type safety everywhere:**
   ```typescript
   // GOOD: Explicit types
   interface RouteParams {
     id: string;
   }
   
   app.get<RouteParams>('/users/:id', (req, res) => {
     const id = req.params.id; // TypeScript knows this exists
   });
   
   // BAD: No type safety
   app.get('/users/:id', (req: any, res: any) => {
     const id = req.params.id; // No IntelliSense
   });
   ```

3. **Handle async operations properly:**
   ```typescript
   // GOOD: Await with error handling
   try {
     const result = await heavyOperation();
     res.json(result);
   } catch (error) {
     res.status(500).json({ error: error.message });
   }
   
   // BAD: Unhandled promise rejection
   heavyOperation().then(result => res.json(result));
   ```

### When Writing N-API Bridge Code

1. **Validate everything from JavaScript:**
   ```cpp
   Napi::Value Start(const Napi::CallbackInfo& info) {
       Napi::Env env = info.Env();
       
       // Check argument count
       if (info.Length() < 1) {
           Napi::TypeError::New(env, "Expected 1 argument")
               .ThrowAsJavaScriptException();
           return env.Null();
       }
       
       // Check argument type
       if (!info[0].IsNumber()) {
           Napi::TypeError::New(env, "Argument must be a number")
               .ThrowAsJavaScriptException();
           return env.Null();
       }
       
       int port = info[0].As<Napi::Number>().Int32Value();
       
       // Validate value
       if (port < 1 || port > 65535) {
           Napi::RangeError::New(env, "Port must be between 1 and 65535")
               .ThrowAsJavaScriptException();
           return env.Null();
       }
       
       // Now safe to use
       server_->start(port);
       return env.Undefined();
   }
   ```

2. **Use AsyncWorker for blocking operations:**
   ```cpp
   // GOOD: Non-blocking async operation
   class ListenWorker : public Napi::AsyncWorker {
   public:
       ListenWorker(Napi::Function& callback, HttpServer* server, int port)
           : AsyncWorker(callback), server_(server), port_(port) {}
       
       void Execute() override {
           // This runs on worker thread - OK to block
           server_->listen(port_);
       }
       
       void OnOK() override {
           // Back on main thread - resolve promise
           Callback().Call({Env().Undefined()});
       }
       
   private:
       HttpServer* server_;
       int port_;
   };
   
   // BAD: Blocking main thread
   void Listen(const Napi::CallbackInfo& info) {
       server_->listen(port); // Blocks event loop!
   }
   ```

---

## Testing Guidelines

### C++ Unit Tests (Google Test)

```cpp
// File: cpp/tests/test_http_parser.cpp
#include <gtest/gtest.h>
#include "http_parser.h"

namespace flash {
namespace test {

class HttpParserTest : public ::testing::Test {
protected:
    void SetUp() override {
        parser_ = std::make_unique<HttpParser>();
    }
    
    std::unique_ptr<HttpParser> parser_;
};

TEST_F(HttpParserTest, ParsesSimpleGetRequest) {
    std::string raw = "GET /index.html HTTP/1.1\r\n\r\n";
    auto request = parser_->parse(raw);
    
    ASSERT_TRUE(request.has_value());
    EXPECT_EQ(request->method, "GET");
    EXPECT_EQ(request->path, "/index.html");
    EXPECT_EQ(request->version, "HTTP/1.1");
}

TEST_F(HttpParserTest, HandlesInvalidRequest) {
    std::string raw = "INVALID REQUEST";
    auto request = parser_->parse(raw);
    
    EXPECT_FALSE(request.has_value());
}

} // namespace test
} // namespace flash
```

### TypeScript Unit Tests (Jest)

```typescript
// File: tests/unit/router.test.ts
import { Router } from '../../src/router';
import { Request, Response } from '../../src/types';

describe('Router', () => {
  let router: Router;
  let mockReq: Request;
  let mockRes: Response;

  beforeEach(() => {
    router = new Router();
    mockReq = {
      method: 'GET',
      path: '/test',
      headers: {},
      query: {},
      params: {},
      body: null,
    } as Request;
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    } as unknown as Response;
  });

  test('should register and execute GET route', async () => {
    const handler = jest.fn();
    router.get('/test', handler);
    
    await router.handleRequest(mockReq, mockRes);
    
    expect(handler).toHaveBeenCalledWith(mockReq, mockRes);
  });

  test('should return 404 for unregistered route', async () => {
    await router.handleRequest(mockReq, mockRes);
    
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Not Found' });
  });

  test('should handle async handlers', async () => {
    const handler = jest.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    
    router.get('/test', handler);
    await router.handleRequest(mockReq, mockRes);
    
    expect(handler).toHaveBeenCalled();
  });
});
```

**Testing Rules:**
- ✅ Test public APIs, not implementation details
- ✅ Use descriptive test names
- ✅ One assertion per test (when possible)
- ✅ Mock external dependencies
- ✅ Test error cases, not just happy path
- ❌ Don't test private methods directly
- ❌ Don't make tests depend on each other

---

## Performance Considerations

### Always Profile Before Optimizing

```cpp
// PREMATURE: Optimizing without data
// Don't do this unless profiling shows it's a bottleneck
inline __attribute__((always_inline)) void tiny_function() { }

// GOOD: Profile first, then optimize hot paths
void handle_request() {
    // Use profiling tools to identify bottlenecks:
    // - Instruments (macOS)
    // - perf (Linux)
    // - Valgrind callgrind
}
```

### Memory Allocation Patterns

```cpp
// GOOD: Reserve capacity upfront
std::vector<Connection> connections;
connections.reserve(1000);  // Avoid reallocations

// GOOD: Reuse objects in hot paths
class ConnectionPool {
    std::vector<std::unique_ptr<Connection>> pool_;
    
    Connection* acquire() {
        if (!pool_.empty()) {
            auto conn = std::move(pool_.back());
            pool_.pop_back();
            return conn.release();  // Reuse existing
        }
        return new Connection();  // Allocate only if needed
    }
};

// BAD: Allocating in tight loops
for (int i = 0; i < 1000000; ++i) {
    auto buffer = new char[1024];  // SLOW!
    // process...
    delete[] buffer;
}
```

### Zero-Copy Techniques

```cpp
// GOOD: Use string_view to avoid copying
void process_header(std::string_view header) {
    // No copy, just a view into existing string
}

// GOOD: Move semantics for transferring ownership
std::string build_response() {
    std::string response;
    response.reserve(1024);
    // build response...
    return response;  // Move, not copy (NRVO)
}

// BAD: Unnecessary copies
void process_data(std::string data) {  // Copy!
    // process...
}
std::string original = "large data";
process_data(original);  // Copied again!
```

---

## Error Handling Strategy

### C++ Error Handling

```cpp
// Use std::optional for expected failures
std::optional<HttpRequest> parse_request(std::string_view data) {
    if (data.empty()) {
        return std::nullopt;  // Expected case
    }
    // parse...
    return request;
}

// Use exceptions for unexpected errors
void allocate_resource() {
    auto ptr = malloc(huge_size);
    if (!ptr) {
        throw std::bad_alloc();  // Unexpected, can't continue
    }
}

// Use error codes for C interop
enum class ErrorCode {
    Success = 0,
    InvalidArgument,
    NetworkError,
    Timeout
};

ErrorCode connect(const char* host, int port);
```

### TypeScript Error Handling

```typescript
// GOOD: Typed errors with context
class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

// Usage
if (!user) {
  throw new HttpError(404, 'User not found', { userId: req.params.id });
}

// GOOD: Error middleware pattern
app.use((error: Error, req: Request, res: Response) => {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({
      error: error.message,
      context: error.context,
    });
  } else {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### N-API Error Handling

```cpp
// GOOD: Convert C++ exceptions to JavaScript errors
Napi::Value ProcessData(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    try {
        // C++ code that might throw
        auto result = risky_operation();
        return Napi::String::New(env, result);
    } catch (const std::exception& e) {
        // Convert to JavaScript error
        Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
        return env.Null();
    } catch (...) {
        // Catch all - never let C++ exceptions escape to JS
        Napi::Error::New(env, "Unknown error occurred")
            .ThrowAsJavaScriptException();
        return env.Null();
    }
}
```

---

## Documentation Standards

### Code Comments

```cpp
/**
 * @brief Parses an HTTP request from raw string data
 * 
 * This parser handles HTTP/1.1 requests and supports:
 * - GET, POST, PUT, DELETE methods
 * - Headers and query parameters
 * - JSON and form-encoded bodies
 * 
 * @param data Raw request data (must be complete)
 * @return Parsed request on success, std::nullopt on parse error
 * 
 * @note This function does not validate request semantics,
 *       only syntax. Validation should be done by the application.
 * 
 * @warning Not thread-safe. Create separate parser instances
 *          for each thread.
 * 
 * Example:
 * @code
 * HttpParser parser;
 * auto req = parser.parse("GET /index.html HTTP/1.1\r\n\r\n");
 * if (req) {
 *     std::cout << "Method: " << req->method << std::endl;
 * }
 * @endcode
 */
std::optional<HttpRequest> parse_request(std::string_view data);
```

```typescript
/**
 * Registers a middleware function to be executed for all requests
 * 
 * Middleware functions are executed in the order they are registered.
 * Each middleware must call `next()` to pass control to the next one,
 * or send a response to end the chain.
 * 
 * @param middleware - Function to execute for each request
 * @returns The router instance for method chaining
 * 
 * @example
 * ```typescript
 * app.use(async (req, res, next) => {
 *   console.log(`${req.method} ${req.path}`);
 *   await next();
 * });
 * ```
 */
public use(middleware: MiddlewareFunction): this {
  this.middlewares.push(middleware);
  return this;
}
```

### File Headers

```cpp
// File: cpp/include/http_parser.h
/**
 * @file http_parser.h
 * @brief HTTP/1.1 request parser implementation
 * @author Your Name
 * @date 2025-10-04
 * 
 * This file contains the HTTP parser that converts raw socket
 * data into structured HttpRequest objects. It's designed for
 * performance and handles partial requests.
 */

#pragma once

#include <string>
#include <optional>
```

```typescript
/**
 * @module Router
 * @description Core routing functionality for Flash Framework
 * 
 * This module provides Express-like routing with support for:
 * - Path parameters (/users/:id)
 * - Query strings (?search=term)
 * - Middleware chaining
 * - Async handlers
 */

import type { Request, Response } from './types';
```

---

## Debugging Guidelines

### C++ Debugging

```cpp
// Use logging, not printf
#include <iostream>
#include <iomanip>

#ifdef DEBUG
#define LOG_DEBUG(msg) \
    std::cout << "[DEBUG] " << __FILE__ << ":" << __LINE__ \
              << " " << msg << std::endl
#else
#define LOG_DEBUG(msg) // No-op in release
#endif

// Use assertions for invariants
#include <cassert>

void process_connection(Connection* conn) {
    assert(conn != nullptr && "Connection must not be null");
    assert(conn->is_open() && "Connection must be open");
    // process...
}

// Use sanitizers during development
// Compile with: clang++ -fsanitize=address,undefined
```

### Common Issues to Watch For

```cpp
// ISSUE: Use after free
void bad_example() {
    auto ptr = std::make_unique<Data>();
    process(ptr.get());
    ptr.reset();
    process(ptr.get());  // CRASH! Use after free
}

// FIX: Be careful with ownership
void good_example() {
    auto ptr = std::make_unique<Data>();
    process(ptr.get());
    // ptr automatically cleaned up
}

// ISSUE: Race condition
class BadCounter {
    int count_ = 0;
public:
    void increment() { ++count_; }  // NOT thread-safe!
};

// FIX: Use atomics or mutexes
class GoodCounter {
    std::atomic<int> count_{0};
public:
    void increment() { ++count_; }  // Thread-safe
};

// ISSUE: Deadlock
void potential_deadlock() {
    std::lock_guard<std::mutex> lock1(mutex1_);
    std::lock_guard<std::mutex> lock2(mutex2_);  // Can deadlock
}

// FIX: Always lock in same order, or use std::scoped_lock
void safe_locking() {
    std::scoped_lock lock(mutex1_, mutex2_);  // Deadlock-free
}
```

---

## Build Configuration

### CMakeLists.txt

```cmake
cmake_minimum_required(VERSION 3.20)
project(FlashFramework VERSION 0.1.0 LANGUAGES CXX)

# C++20 standard
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Compiler flags
if(CMAKE_CXX_COMPILER_ID MATCHES "Clang|GNU")
    add_compile_options(
        -Wall -Wextra -Wpedantic
        -Werror  # Treat warnings as errors
        $<$<CONFIG:Debug>:-g -O0 -fsanitize=address,undefined>
        $<$<CONFIG:Release>:-O3 -DNDEBUG>
    )
endif()

# Source files
file(GLOB_RECURSE SOURCES "cpp/src/*.cpp")
file(GLOB_RECURSE HEADERS "cpp/include/*.h")

# Library target
add_library(flash_core STATIC ${SOURCES} ${HEADERS})
target_include_directories(flash_core PUBLIC cpp/include)

# Google Test
include(FetchContent)
FetchContent_Declare(
    googletest
    GIT_REPOSITORY https://github.com/google/googletest.git
    GIT_TAG release-1.12.1
)
FetchContent_MakeAvailable(googletest)

# Test target
file(GLOB_RECURSE TEST_SOURCES "cpp/tests/*.cpp")
add_executable(flash_tests ${TEST_SOURCES})
target_link_libraries(flash_tests flash_core gtest_main)

enable_testing()
add_test(NAME flash_tests COMMAND flash_tests)
```

### binding.gyp (for N-API)

```json
{
  "targets": [
    {
      "target_name": "flash_native",
      "sources": [
        "cpp/binding/addon.cpp",
        "cpp/binding/type_converter.cpp"
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
        "cpp/include"
      ],
      "dependencies": [
        "<!(node -p \"require('node-addon-api').gyp\")"
      ],
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "cflags_cc": [ "-std=c++20" ],
      "defines": [ "NAPI_DISABLE_CPP_EXCEPTIONS" ],
      "conditions": [
        ["OS=='mac'", {
          "xcode_settings": {
            "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
            "CLANG_CXX_LANGUAGE_STANDARD": "c++20",
            "MACOSX_DEPLOYMENT_TARGET": "10.15"
          }
        }]
      ]
    }
  ]
}
```

---

## Git Commit Conventions

Follow Conventional Commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding/updating tests
- `chore`: Build process, dependencies

**Examples:**

```
feat(http-parser): add support for chunked encoding

Implemented HTTP/1.1 chunked transfer encoding to support
streaming request bodies. This improves memory efficiency
for large uploads.

Closes #42
```

```
fix(n-api): prevent memory leak in async workers

AsyncWorker instances were not being properly deleted after
completion. Added proper cleanup in destructor.

Fixes #58
```

```
perf(worker-pool): implement work-stealing queue

Replaced simple mutex-based queue with lock-free work-stealing
approach. Benchmarks show 30% improvement in throughput under
high concurrency.
```

---

## Common Patterns & Anti-Patterns

### ✅ DO: Resource Acquisition Is Initialization (RAII)

```cpp
class File {
public:
    explicit File(const std::string& path) {
        fd_ = open(path.c_str(), O_RDONLY);
        if (fd_ < 0) {
            throw std::runtime_error("Failed to open file");
        }
    }
    
    ~File() {
        if (fd_ >= 0) {
            close(fd_);  // Automatic cleanup
        }
    }
    
    // Delete copy, allow move
    File(const File&) = delete;
    File& operator=(const File&) = delete;
    File(File&& other) noexcept : fd_(other.fd_) {
        other.fd_ = -1;
    }
    
private:
    int fd_;
};
```

### ❌ DON'T: Manual Resource Management

```cpp
// BAD: Easy to leak resources
void process_file(const std::string& path) {
    int fd = open(path.c_str(), O_RDONLY);
    if (fd < 0) return;  // Forgot to close!
    
    process(fd);
    
    if (error_condition) {
        return;  // Forgot to close!
    }
    
    close(fd);
}
```

### ✅ DO: Dependency Injection

```typescript
// GOOD: Testable, flexible
class UserService {
  constructor(private db: Database, private cache: Cache) {}
  
  async getUser(id: string): Promise<User> {
    const cached = await this.cache.get(id);
    if (cached) return cached;
    
    const user = await this.db.getUser(id);
    await this.cache.set(id, user);
    return user;
  }
}

// Easy to test
const mockDb = { getUser: jest.fn() };
const mockCache = { get: jest.fn(), set: jest.fn() };
const service = new UserService(mockDb, mockCache);
```

### ❌ DON'T: Global State

```typescript
// BAD: Hard to test, not thread-safe
let globalCache = new Map();

async function getUser(id: string): Promise<User> {
  if (globalCache.has(id)) {
    return globalCache.get(id);
  }
  // ...
}
```

---

## Performance Benchmarking

### Running Benchmarks

```bash
# HTTP load testing with wrk
wrk -t4 -c100 -d30s http://localhost:3000/api/users

# Expected output format:
# Running 30s test @ http://localhost:3000/api/users
#   4 threads and 100 connections
#   Thread Stats   Avg      Stdev     Max   +/- Stdev
#     Latency     5.21ms    2.34ms   50.12ms   87.23%
#     Req/Sec     5.12k     1.23k     8.45k    71.23%
#   612459 requests in 30.05s, 89.23MB read
# Requests/sec:  20384.32
# Transfer/sec:      2.97MB
```

### Baseline Comparisons

Always compare against baseline:

```typescript
// baseline-server.ts - Pure Node.js for comparison
import express from 'express';

const app = express();

app.get('/api/users/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'Test User' });
});

app.listen(3000);
```

```typescript
// flash-server.ts - Our implementation
import { Flash } from './src';

const app = new Flash();

app.get('/api/users/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'Test User' });
});

app.listen(3000);
```

**Success criteria:** Flash should be 2x faster than Express baseline.

---

## When to Ask for Help

### 🟢 Good Questions

- "How should I implement X feature given our architecture?"
- "What's the best way to test this N-API code?"
- "Is this the idiomatic way to do Y in C++20?"
- "How can I optimize this hot path I identified in profiling?"

### 🔴 Avoid Asking

- "Can you write this entire feature for me?"
- "Debug my code" (without providing context)
- "What should I build?" (refer to docs/PRD.md)

### 📝 Provide Context

When asking for help, always include:
1. What you're trying to achieve
2. What you've tried so far
3. Specific error messages or unexpected behavior
4. Relevant code snippets
5. Which phase/component you're working on

---

## Phase-Specific Focus

### Phase 1 (Weeks 1-4): C++ Foundation
**Current Focus:** Building HTTP server core  
**Key Files:** `cpp/src/server.cpp`, `cpp/include/server.h`  
**Priorities:** Correctness > Performance  
**Testing:** Manual testing with curl is OK  

### Phase 2 (Weeks 5-8): N-API Integration
**Current Focus:** Bridging C++ and TypeScript  
**Key Files:** `cpp/binding/addon.cpp`, `src/index.ts`  
**Priorities:** Type safety, Error handling  
**Testing:** Start writing unit tests  

### Phase 3 (Weeks 9-10): Concurrency
**Current Focus:** Worker thread pool  
**Key Files:** `cpp/src/worker_pool.cpp`  
**Priorities:** Thread safety, No race conditions  
**Testing:** Stress testing, race condition detection  

### Phase 4 (Weeks 11-12): API Layer
**Current Focus:** Developer experience  
**Key Files:** `src/router.ts`, `src/middleware/*.ts`  
**Priorities:** Clean API, TypeScript types  
**Testing:** Integration tests  

### Phase 5 (Weeks 13-14): Performance
**Current Focus:** Optimization  
**Priorities:** Profile before optimizing  
**Testing:** Benchmarking, comparison with baseline  

### Phase 6 (Weeks 15-16): Polish
**Current Focus:** Documentation and examples  
**Priorities:** Clarity, completeness  
**Testing:** User testing with examples  

---

## Quick Reference

### Build Commands
```bash
# Build C++ code
mkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Debug
make -j$(nproc)

# Run C++ tests
./flash_tests

# Build N-API addon
npm run build  # runs node-gyp rebuild

# Run TypeScript tests
npm test

# Run full suite
npm run test:all
```

### Common Issues

| Issue | Solution |
|-------|----------|
| N-API build fails | Check node-gyp setup, Python version |
| Memory leak detected | Run with ASan, check smart pointer usage |
| Segfault in N-API | Validate all JS arguments, check ownership |
| Tests timeout | Check for deadlocks, blocking operations |
| Poor performance | Profile first, then optimize hot paths |

---

## Final Reminders

1. **This is a learning project** - It's okay to make mistakes
2. **Follow the docs/PRD.md scope** - Don't add features from future vision yet
3. **Test as you go** - Don't accumulate technical debt
4. **Document why, not what** - Code shows what, comments explain why
5. **Ask when stuck** - But try to solve it first
6. **Commit frequently** - Small, atomic commits are better
7. **Profile before optimizing** - Premature optimization is evil
8. **Safety first** - Memory safety, thread safety, type safety

---

**Last Updated:** October 4, 2025  
**Current Phase:** Setup  
**Next Milestone:** Phase 1 - Foundation (C++ HTTP Server)