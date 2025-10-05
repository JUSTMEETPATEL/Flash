# Phase 2: N-API Integration (Weeks 5-8)

> **Learning Focus:** Bridge C++ server to Node.js/TypeScript using N-API  
> **Goal:** Create a TypeScript API that uses your C++ HTTP server under the hood  
> **Approach:** TODO-driven learning with hints, just like Phase 1

---

## 📅 Timeline Overview

```
Week 5: N-API Basics & Setup           (Days 1-7)
Week 6: Server Wrapper & Type Bridge   (Days 8-14)
Week 7: TypeScript API Layer           (Days 15-21)
Week 8: Testing & Integration          (Days 22-28)
```

---

## 🎯 Phase 2 Learning Objectives

By the end of Phase 2, you will understand:

1. **N-API Fundamentals:**

   - How Node.js native addons work
   - Memory management across C++/JavaScript boundary
   - Type conversions between languages
   - Error handling in N-API

2. **ObjectWrap Pattern:**

   - Wrapping C++ classes for JavaScript
   - Managing C++ object lifecycle from JavaScript
   - Exposing C++ methods to JavaScript

3. **Async Operations:**

   - Using AsyncWorker for non-blocking operations
   - Promises in N-API
   - Event loop integration

4. **TypeScript Integration:**
   - Creating type definitions for native modules
   - Building a fluent API
   - Testing native modules with Jest

---

## 📚 Week 5: N-API Basics & Setup

### Day 1-2: Environment Setup & Basic N-API

**Files to create/modify:**

- `cpp/binding/addon.cpp` - Main addon entry point
- `cpp/binding/type_converter.h` - Type conversion declarations
- `cpp/binding/type_converter.cpp` - Type conversion implementations
- `package.json` - Add build scripts
- `tsconfig.json` - TypeScript configuration

**Learning Path:**

#### Task 5.1: Initialize Node.js Environment

```bash
# You'll need to run these commands
npm init -y  # If not already done
npm install node-addon-api
npm install --save-dev @types/node typescript jest ts-jest @types/jest
```

#### Task 5.2: Update binding.gyp (Already done! ✅)

Your `binding.gyp` looks good. It:

- Links to node-addon-api
- Includes C++ headers
- Sets C++20 standard
- Configures for macOS

#### Task 5.3: Build Script Setup

Add to `package.json`:

```json
{
  "scripts": {
    "build": "node-gyp rebuild",
    "build:debug": "node-gyp rebuild --debug",
    "clean": "node-gyp clean",
    "test": "jest",
    "test:native": "node tests/test_native.js"
  }
}
```

### Day 3-4: Type Converter Fundamentals

**File: `cpp/binding/type_converter.h`**

```cpp
#pragma once
#include <napi.h>
#include <string>
#include <optional>
#include "../include/http_request.h"
#include "../include/http_response.h"

namespace flash {
namespace binding {

// =============================================================================
// WEEK 5, DAY 3: TYPE CONVERSION UTILITIES
// =============================================================================
// These functions convert between C++ and JavaScript types
// This is crucial for passing data across the language boundary

// TODO 5.3.1: Convert JavaScript string to C++ std::string
// HINT 1: Use Napi::String::Utf8Value() to get C-style string
// HINT 2: Check if value.IsString() first
// HINT 3: Return std::nullopt if conversion fails
std::optional<std::string> js_to_string(const Napi::Value& value);

// TODO 5.3.2: Convert C++ string to JavaScript string
// HINT 1: Use Napi::String::New(env, str)
// HINT 2: Handle empty strings properly
Napi::String string_to_js(Napi::Env env, const std::string& str);

// TODO 5.3.3: Convert JavaScript number to C++ int
// HINT 1: Check value.IsNumber() first
// HINT 2: Use value.As<Napi::Number>().Int32Value()
// HINT 3: Consider range validation (1-65535 for ports)
std::optional<int> js_to_int(const Napi::Value& value);

// TODO 5.3.4: Convert JavaScript object to C++ HttpRequest
// HINT 1: Extract properties: method, path, headers, body
// HINT 2: Headers are a JavaScript object, iterate with HasOwnProperty()
// HINT 3: Body might be null/undefined, use std::optional
std::optional<HttpRequest> js_to_request(const Napi::Object& obj);

// TODO 5.3.5: Convert C++ HttpResponse to JavaScript object
// HINT 1: Create new object: Napi::Object::New(env)
// HINT 2: Set properties: obj.Set("status", ...)
// HINT 3: Convert headers map to JavaScript object
// HINT 4: Convert body string to JavaScript string
Napi::Object response_to_js(Napi::Env env, const HttpResponse& response);

} // namespace binding
} // namespace flash
```

**File: `cpp/binding/type_converter.cpp`**

This is where you'll implement the functions declared above. Each TODO should be tackled one at a time.

### Day 5-6: Basic Addon Structure

**File: `cpp/binding/addon.cpp`**

```cpp
#include <napi.h>
#include "server_wrap.h"

// =============================================================================
// WEEK 5, DAY 5: ADDON INITIALIZATION
// =============================================================================
// This is the entry point for the Node.js addon
// It registers all C++ classes and functions to be used from JavaScript

// TODO 5.5.1: Initialize the addon module
// HINT 1: This function is called when Node.js loads the addon
// HINT 2: You need to register the ServerWrap class here
// HINT 3: Use ServerWrap::Init(env, exports) to register the class
// HINT 4: Return the exports object so JavaScript can use it
Napi::Object Init(Napi::Env env, Napi::Object exports) {
    // TODO: Call ServerWrap::Init() to register the Flash server class

    return exports;
}

// TODO 5.5.2: Register the addon with Node.js
// HINT 1: This macro tells Node.js where to find the Init function
// HINT 2: First parameter is the module name (flash_native)
// HINT 3: Second parameter is the Init function
NODE_API_MODULE(flash_native, Init)
```

### Day 7: Week 5 Testing

Create a simple test to verify your type converters work:

**File: `tests/week5_type_converter_test.cpp`** (Google Test)

```cpp
// Test your type converters in isolation
// This helps verify conversions work before using them in the full addon
```

**Success Criteria for Week 5:**

- ✅ Environment set up with node-addon-api
- ✅ Type converter functions implemented
- ✅ Addon compiles without errors
- ✅ Basic type conversion tests pass

---

## 📚 Week 6: Server Wrapper & ObjectWrap Pattern

### Day 8-10: ServerWrap Class Structure

**File: `cpp/binding/server_wrap.h`**

```cpp
#pragma once
#include <napi.h>
#include <memory>
#include "../include/server.h"

namespace flash {
namespace binding {

// =============================================================================
// WEEK 6, DAY 8: OBJECTWRAP PATTERN
// =============================================================================
// ObjectWrap allows you to expose C++ classes to JavaScript
// JavaScript can create instances: new Flash.Server(port)
// JavaScript can call methods: server.start(), server.stop()

// TODO 6.8.1: Create ServerWrap class that wraps flash::HttpServer
// HINT 1: Inherit from Napi::ObjectWrap<ServerWrap>
// HINT 2: ObjectWrap manages the C++ object lifetime from JavaScript
// HINT 3: When JavaScript object is garbage collected, C++ object is destroyed
class ServerWrap : public Napi::ObjectWrap<ServerWrap> {
public:
    // TODO 6.8.2: Declare static Init method
    // HINT 1: This registers the class with JavaScript
    // HINT 2: Returns the constructor function that JavaScript will use
    // HINT 3: Takes env (Node environment) and exports (module.exports)
    static Napi::Object Init(Napi::Env env, Napi::Object exports);

    // TODO 6.8.3: Declare constructor
    // HINT 1: Takes Napi::CallbackInfo which contains constructor arguments
    // HINT 2: JavaScript: new Flash.Server(5627) calls this
    // HINT 3: You'll extract port from info[0]
    ServerWrap(const Napi::CallbackInfo& info);

private:
    // TODO 6.8.4: Declare JavaScript-callable methods
    // HINT 1: These are instance methods: server.start(), server.stop()
    // HINT 2: Return Napi::Value (JavaScript value)
    // HINT 3: Take const Napi::CallbackInfo& for arguments

    // Start server (blocking - we'll make it async in Week 7)
    Napi::Value Start(const Napi::CallbackInfo& info);

    // Stop server gracefully
    Napi::Value Stop(const Napi::CallbackInfo& info);

    // Get server status
    Napi::Value IsRunning(const Napi::CallbackInfo& info);

    // Get port number
    Napi::Value GetPort(const Napi::CallbackInfo& info);

    // TODO 6.8.5: Store the C++ HttpServer instance
    // HINT 1: Use unique_ptr for automatic cleanup
    // HINT 2: Created in constructor, destroyed in destructor
    std::unique_ptr<HttpServer> server_;

    // TODO 6.8.6: Store route handlers (for Week 7)
    // HINT 1: JavaScript passes route handlers as functions
    // HINT 2: Store them so we can call them when requests arrive
    // We'll implement this in Week 7
};

} // namespace binding
} // namespace flash
```

### Day 11-13: ServerWrap Implementation

**File: `cpp/binding/server_wrap.cpp`**

```cpp
#include "server_wrap.h"
#include "type_converter.h"
#include <iostream>

namespace flash {
namespace binding {

// =============================================================================
// WEEK 6, DAY 11: IMPLEMENTING OBJECTWRAP
// =============================================================================

// TODO 6.11.1: Implement Init() - Register class with JavaScript
// HINT 1: Create a constructor function that JavaScript can call
// HINT 2: Use DefineClass() to define the class
// HINT 3: Specify instance methods with InstanceMethod()
// HINT 4: Set the constructor on exports so JavaScript can access it
Napi::Object ServerWrap::Init(Napi::Env env, Napi::Object exports) {
    // TODO: Create a function template for the constructor
    // JavaScript will call: new Flash.Server(port)

    Napi::Function func = DefineClass(env, "Server", {
        // TODO 6.11.2: Register instance methods
        // HINT 1: InstanceMethod("name", &ServerWrap::Method)
        // HINT 2: Register: start, stop, isRunning, getPort
        // EXAMPLE: InstanceMethod("start", &ServerWrap::Start)
    });

    // TODO 6.11.3: Store constructor for later use
    // HINT 1: Create a persistent reference to the constructor
    // HINT 2: This allows creating instances from C++ later

    // TODO 6.11.4: Export the constructor
    // HINT 1: Set it on exports: exports.Set("Server", func)
    // HINT 2: JavaScript can now: const server = new Flash.Server(3000)

    return exports;
}

// TODO 6.11.5: Implement Constructor
// HINT 1: Call the parent constructor: ObjectWrap(info)
// HINT 2: Extract port from info[0]
// HINT 3: Validate port is a number and in range 1-65535
// HINT 4: Create HttpServer instance: server_ = std::make_unique<HttpServer>(port)
// HINT 5: Throw Napi::TypeError if validation fails
ServerWrap::ServerWrap(const Napi::CallbackInfo& info)
    : Napi::ObjectWrap<ServerWrap>(info) {
    Napi::Env env = info.Env();

    // TODO: Validate arguments
    // Check: info.Length() >= 1
    // Check: info[0].IsNumber()
    // Extract: int port = info[0].As<Napi::Number>().Int32Value()
    // Validate: port >= 1 && port <= 65535
    // Create: server_ = std::make_unique<HttpServer>(port, 4)
}

// =============================================================================
// WEEK 6, DAY 12: IMPLEMENTING METHODS
// =============================================================================

// TODO 6.12.1: Implement Start() method
// HINT 1: Call server_->start() to start the C++ server
// HINT 2: This will BLOCK - we'll fix this in Week 7 with AsyncWorker
// HINT 3: Catch any exceptions and convert to Napi::Error
// HINT 4: Return undefined: return env.Undefined()
Napi::Value ServerWrap::Start(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    try {
        // TODO: Start the server
        // server_->start();

        // For now, just return success
        return env.Undefined();
    } catch (const std::exception& e) {
        // TODO: Throw JavaScript error
        // Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
        return env.Null();
    }
}

// TODO 6.12.2: Implement Stop() method
// HINT 1: Call server_->stop() to stop the C++ server
// HINT 2: Return undefined
Napi::Value ServerWrap::Stop(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    // TODO: Implement server stop logic
    return env.Undefined();
}

// TODO 6.12.3: Implement IsRunning() method
// HINT 1: Check server_->is_running()
// HINT 2: Return boolean: Napi::Boolean::New(env, is_running)
Napi::Value ServerWrap::IsRunning(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    // TODO: Return server running status
    return Napi::Boolean::New(env, false);
}

// TODO 6.12.4: Implement GetPort() method
// HINT 1: Get port: server_->get_port()
// HINT 2: Return number: Napi::Number::New(env, port)
Napi::Value ServerWrap::GetPort(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    // TODO: Return server port
    return Napi::Number::New(env, 0);
}

} // namespace binding
} // namespace flash
```

### Day 14: Week 6 Testing

Create Node.js test to verify the wrapper works:

**File: `tests/test_native_binding.js`**

```javascript
// =============================================================================
// WEEK 6, DAY 14: TESTING THE N-API BINDING
// =============================================================================

const flash = require("../build/Release/flash_native.node");

console.log("Testing Flash N-API Binding...\n");

// TODO 6.14.1: Test creating a server instance
// HINT 1: const server = new flash.Server(5627);
// HINT 2: Check that server is an object
// HINT 3: Check that server has methods: start, stop, isRunning, getPort

// TODO 6.14.2: Test getPort() method
// HINT 1: const port = server.getPort();
// HINT 2: Verify port === 5627

// TODO 6.14.3: Test isRunning() before start
// HINT 1: const running = server.isRunning();
// HINT 2: Verify running === false

// TODO 6.14.4: Test error handling with invalid port
// HINT 1: Try new flash.Server(-1)
// HINT 2: Should throw TypeError
// HINT 3: Use try-catch to verify

console.log("✅ All basic binding tests passed!");
```

**Success Criteria for Week 6:**

- ✅ ServerWrap class compiles
- ✅ Can create server instances from JavaScript
- ✅ Methods are callable from JavaScript
- ✅ Error handling works (invalid arguments throw errors)
- ✅ Server lifecycle works (create, start, stop)

---

## 📚 Week 7: TypeScript API Layer

### Day 15-17: TypeScript Wrapper

**File: `src/index.ts`**

```typescript
// =============================================================================
// WEEK 7, DAY 15: TYPESCRIPT API LAYER
// =============================================================================
// This provides the developer-friendly API that users will interact with
// It wraps the native addon with a clean, Express-like interface

// TODO 7.15.1: Import the native addon
// HINT 1: const native = require('../build/Release/flash_native.node');
// HINT 2: This gives you access to native.Server class
// HINT 3: You'll wrap this in a TypeScript class

import { IncomingMessage, ServerResponse } from "http";

// TODO 7.15.2: Define types for route handlers
// HINT 1: Handlers should be async-capable: (req, res) => void | Promise<void>
// HINT 2: Request should have: method, url, headers, body
// HINT 3: Response should have: status(), json(), send(), end()

export interface Request {
  method: string;
  url: string;
  path: string;
  query: Record<string, string>;
  params: Record<string, string>;
  headers: Record<string, string>;
  body: any;
}

export interface Response {
  status(code: number): Response;
  json(data: any): void;
  send(data: string): void;
  end(): void;
  setHeader(name: string, value: string): Response;
}

export type RouteHandler = (
  req: Request,
  res: Response
) => void | Promise<void>;

// TODO 7.15.3: Create Flash class
// HINT 1: This wraps the native server
// HINT 2: Stores routes in a Map
// HINT 3: Provides Express-like API: get(), post(), listen()
export class Flash {
  private nativeServer: any;
  private routes: Map<string, Map<string, RouteHandler>>;

  // TODO 7.15.4: Constructor
  // HINT 1: Initialize routes map
  // HINT 2: Don't create native server yet (wait for listen())
  constructor() {
    // TODO: Initialize routes map
    // this.routes = new Map();
  }

  // TODO 7.15.5: Implement get() method
  // HINT 1: Store handler in routes map
  // HINT 2: Key by method (GET) and path
  // HINT 3: Return this for method chaining
  public get(path: string, handler: RouteHandler): this {
    // TODO: Store GET route
    return this;
  }

  // TODO 7.15.6: Implement post() method
  // HINT 1: Similar to get(), but for POST
  public post(path: string, handler: RouteHandler): this {
    // TODO: Store POST route
    return this;
  }

  // TODO 7.15.7: Implement put() method
  public put(path: string, handler: RouteHandler): this {
    // TODO: Store PUT route
    return this;
  }

  // TODO 7.15.8: Implement delete() method
  public delete(path: string, handler: RouteHandler): this {
    // TODO: Store DELETE route
    return this;
  }

  // TODO 7.15.9: Implement listen() method
  // HINT 1: Create native server: new native.Server(port)
  // HINT 2: Register request handler callback
  // HINT 3: Start native server
  // HINT 4: Return Promise for async/await support
  public listen(port: number): Promise<void> {
    // TODO: Create and start native server
    return Promise.resolve();
  }

  // TODO 7.15.10: Implement request handler
  // HINT 1: Called by native server for each request
  // HINT 2: Match route based on method and path
  // HINT 3: Call handler with Request and Response objects
  // HINT 4: Handle 404 if no route matches
  private async handleRequest(nativeReq: any): Promise<any> {
    // TODO: Route matching and handler execution
  }
}
```

### Day 18-19: Request/Response Wrappers

**File: `src/request.ts`**

```typescript
// =============================================================================
// WEEK 7, DAY 18: REQUEST WRAPPER
// =============================================================================

import { Request } from "./index";

// TODO 7.18.1: Create RequestWrapper class
// HINT 1: Implements Request interface
// HINT 2: Wraps native request object
// HINT 3: Parses query string into object
// HINT 4: Parses path parameters (e.g., /users/:id)
export class RequestWrapper implements Request {
  public method: string;
  public url: string;
  public path: string;
  public query: Record<string, string>;
  public params: Record<string, string>;
  public headers: Record<string, string>;
  public body: any;

  // TODO 7.18.2: Constructor parses native request
  // HINT 1: Extract method, url, headers from native object
  // HINT 2: Parse URL to separate path and query
  // HINT 3: Parse query string: ?key=value&key2=value2
  constructor(nativeReq: any) {
    // TODO: Parse native request
    this.method = nativeReq.method;
    this.url = nativeReq.url;
    this.headers = nativeReq.headers;
    // Parse path and query...
  }

  // TODO 7.18.3: Add query parser helper
  // HINT 1: Split on '&': key1=value1&key2=value2
  // HINT 2: Split each on '=': key=value
  // HINT 3: URL decode values
  private parseQuery(queryString: string): Record<string, string> {
    // TODO: Implement query string parsing
    return {};
  }
}
```

**File: `src/response.ts`**

```typescript
// =============================================================================
// WEEK 7, DAY 18: RESPONSE WRAPPER
// =============================================================================

import { Response } from "./index";

// TODO 7.18.4: Create ResponseWrapper class
// HINT 1: Implements Response interface
// HINT 2: Wraps native response object
// HINT 3: Builds HTTP response using HttpResponse builder
export class ResponseWrapper implements Response {
  private nativeRes: any;
  private statusCode: number = 200;
  private headers: Map<string, string> = new Map();
  private sent: boolean = false;

  constructor(nativeRes: any) {
    this.nativeRes = nativeRes;
  }

  // TODO 7.18.5: Implement status() method
  // HINT 1: Store status code
  // HINT 2: Return this for chaining: res.status(200).json({})
  public status(code: number): Response {
    // TODO: Set status code
    this.statusCode = code;
    return this;
  }

  // TODO 7.18.6: Implement json() method
  // HINT 1: Set Content-Type header to application/json
  // HINT 2: Convert object to JSON string
  // HINT 3: Call send() with JSON string
  public json(data: any): void {
    // TODO: Send JSON response
    this.setHeader("Content-Type", "application/json");
    // this.send(JSON.stringify(data));
  }

  // TODO 7.18.7: Implement send() method
  // HINT 1: Build HTTP response with native response builder
  // HINT 2: Set status, headers, body
  // HINT 3: Mark as sent to prevent double-sending
  public send(data: string): void {
    // TODO: Send response
    if (this.sent) {
      throw new Error("Response already sent");
    }
    // Build and send response...
    this.sent = true;
  }

  // TODO 7.18.8: Implement setHeader() method
  // HINT 1: Store header in map
  // HINT 2: Return this for chaining
  public setHeader(name: string, value: string): Response {
    // TODO: Set header
    this.headers.set(name, value);
    return this;
  }

  // TODO 7.18.9: Implement end() method
  // HINT 1: Send empty response body
  public end(): void {
    this.send("");
  }
}
```

### Day 20-21: Type Definitions

**File: `src/types/index.d.ts`**

```typescript
// =============================================================================
// WEEK 7, DAY 20: TYPESCRIPT TYPE DEFINITIONS
// =============================================================================
// These provide IntelliSense and type checking for users of your framework

// TODO 7.20.1: Export main types
// HINT 1: This gives users proper TypeScript types
// HINT 2: IntelliSense will work in their editor
// HINT 3: Type errors will be caught at compile time

declare module "flash-framework" {
  // TODO 7.20.2: Define Request interface
  export interface Request {
    method: string;
    url: string;
    path: string;
    query: Record<string, string>;
    params: Record<string, string>;
    headers: Record<string, string>;
    body: any;
  }

  // TODO 7.20.3: Define Response interface
  export interface Response {
    status(code: number): Response;
    json(data: any): void;
    send(data: string): void;
    end(): void;
    setHeader(name: string, value: string): Response;
  }

  // TODO 7.20.4: Define route handler type
  export type RouteHandler = (
    req: Request,
    res: Response
  ) => void | Promise<void>;

  // TODO 7.20.5: Define Flash class
  export class Flash {
    constructor();
    get(path: string, handler: RouteHandler): this;
    post(path: string, handler: RouteHandler): this;
    put(path: string, handler: RouteHandler): this;
    delete(path: string, handler: RouteHandler): this;
    listen(port: number): Promise<void>;
  }
}
```

**Success Criteria for Week 7:**

- ✅ TypeScript API compiles without errors
- ✅ Can register routes: app.get(), app.post(), etc.
- ✅ Method chaining works
- ✅ Request/Response wrappers work
- ✅ Type definitions provide IntelliSense

---

## 📚 Week 8: Testing & Integration

### Day 22-24: Jest Testing Setup

**File: `tests/typescript/flash.test.ts`**

```typescript
// =============================================================================
// WEEK 8, DAY 22: TYPESCRIPT TESTING WITH JEST
// =============================================================================

import { Flash } from "../../src/index";
import axios from "axios";

describe("Flash Framework", () => {
  let app: Flash;
  const TEST_PORT = 5628;

  beforeEach(() => {
    app = new Flash();
  });

  // TODO 8.22.1: Test route registration
  // HINT 1: Register a GET route
  // HINT 2: Start server
  // HINT 3: Make HTTP request with axios
  // HINT 4: Verify response
  test("should register and handle GET route", async () => {
    // TODO: Implement test
  });

  // TODO 8.22.2: Test method chaining
  // HINT 1: Chain multiple route registrations
  // HINT 2: Verify all routes work
  test("should support method chaining", async () => {
    // TODO: Implement test
  });

  // TODO 8.22.3: Test JSON responses
  // HINT 1: Handler calls res.json({ data: 'test' })
  // HINT 2: Verify Content-Type header
  // HINT 3: Verify JSON is parsed correctly
  test("should send JSON responses", async () => {
    // TODO: Implement test
  });

  // TODO 8.22.4: Test 404 handling
  // HINT 1: Request a route that doesn't exist
  // HINT 2: Verify 404 status code
  test("should return 404 for unknown routes", async () => {
    // TODO: Implement test
  });

  // TODO 8.22.5: Test query parameters
  // HINT 1: Request /api/test?name=value
  // HINT 2: Access req.query.name in handler
  // HINT 3: Verify query is parsed correctly
  test("should parse query parameters", async () => {
    // TODO: Implement test
  });
});
```

### Day 25-26: Integration Testing

**File: `tests/integration/end_to_end.test.ts`**

```typescript
// =============================================================================
// WEEK 8, DAY 25: END-TO-END INTEGRATION TESTING
// =============================================================================
// These tests verify the entire stack works together:
// JavaScript → N-API → C++ Server → HTTP Response → JavaScript

import { Flash } from "../../src/index";
import axios from "axios";

describe("End-to-End Integration", () => {
  // TODO 8.25.1: Test full request/response cycle
  // HINT 1: Start server with routes
  // HINT 2: Make real HTTP requests
  // HINT 3: Verify C++ server handles them correctly
  // TODO 8.25.2: Test concurrent requests
  // HINT 1: Make multiple requests simultaneously
  // HINT 2: Verify all are handled correctly
  // HINT 3: Check for race conditions
  // TODO 8.25.3: Test error handling across boundary
  // HINT 1: Throw error in JavaScript handler
  // HINT 2: Verify it's caught and returns 500
  // HINT 3: Server should not crash
  // TODO 8.25.4: Test large payloads
  // HINT 1: Send large POST body
  // HINT 2: Verify C++ parser handles it
  // HINT 3: Verify JavaScript receives it
});
```

### Day 27: Performance Benchmarking

**File: `benchmarks/phase2_benchmark.js`**

```javascript
// =============================================================================
// WEEK 8, DAY 27: PERFORMANCE BENCHMARKING
// =============================================================================
// Compare Flash (C++ backend) vs pure Node.js (Express)

// TODO 8.27.1: Benchmark Flash Framework
// HINT 1: Use wrk or autocannon for load testing
// HINT 2: Measure: requests/sec, latency, throughput
// HINT 3: Compare against baseline from Phase 1

// TODO 8.27.2: Compare with Express.js
// HINT 1: Create equivalent Express server
// HINT 2: Run same benchmark
// HINT 3: Calculate performance difference

// TODO 8.27.3: Document results
// HINT 1: Create PERFORMANCE.md
// HINT 2: Include graphs/charts
// HINT 3: Explain why Flash is faster (or not!)
```

### Day 28: Documentation & Celebration

**Files to create:**

- `docs/PHASE2_COMPLETE.md` - Completion report
- `docs/API_DOCUMENTATION.md` - API reference
- `examples/hello-world.ts` - Simple example
- `examples/rest-api.ts` - REST API example

**TODO 8.28.1: Create comprehensive API documentation**
**TODO 8.28.2: Create example applications**
**TODO 8.28.3: Update README.md with Phase 2 info**
**TODO 8.28.4: Create Phase 2 completion report**

**Success Criteria for Week 8:**

- ✅ All tests passing (TypeScript + Integration)
- ✅ Performance benchmarks completed
- ✅ Documentation complete
- ✅ Example applications work
- ✅ Phase 2 is production-ready!

---

## 🎯 Phase 2 Completion Checklist

By the end of Phase 2, you should have:

### Code

- [ ] N-API addon compiles and loads
- [ ] Type converters handle all data types
- [ ] ServerWrap exposes C++ server to JavaScript
- [ ] TypeScript API layer is complete
- [ ] Request/Response wrappers work
- [ ] Route registration works
- [ ] Error handling across boundary works

### Tests

- [ ] Type converter unit tests pass
- [ ] N-API binding tests pass
- [ ] TypeScript unit tests pass (Jest)
- [ ] Integration tests pass
- [ ] Performance benchmarks completed

### Documentation

- [ ] API documentation complete
- [ ] Type definitions for IntelliSense
- [ ] Example applications created
- [ ] Phase 2 completion report
- [ ] README updated

### Skills Learned

- [ ] N-API fundamentals
- [ ] ObjectWrap pattern
- [ ] Memory management across language boundary
- [ ] Type conversions
- [ ] Async operations in N-API
- [ ] TypeScript module authoring
- [ ] Testing native modules

---

## 📖 Learning Resources

### N-API Documentation

- Official N-API docs: https://nodejs.org/api/n-api.html
- node-addon-api docs: https://github.com/nodejs/node-addon-api

### Key Concepts to Study

1. **ObjectWrap Pattern** - Wrapping C++ classes for JavaScript
2. **Memory Management** - Who owns what across the boundary?
3. **Error Handling** - Converting C++ exceptions to JavaScript errors
4. **Async Operations** - Using AsyncWorker for non-blocking I/O
5. **Type Safety** - Validating JavaScript inputs in C++

### Example Pattern to Follow

```cpp
// Always validate JavaScript inputs
if (!info[0].IsNumber()) {
    Napi::TypeError::New(env, "Expected number").ThrowAsJavaScriptException();
    return env.Null();
}

// Extract value safely
int value = info[0].As<Napi::Number>().Int32Value();

// Validate range
if (value < 0) {
    Napi::RangeError::New(env, "Value must be positive").ThrowAsJavaScriptException();
    return env.Null();
}

// Use value safely
try {
    cpp_function(value);
} catch (const std::exception& e) {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
    return env.Null();
}
```

---

## 🎓 Learning Approach

Just like Phase 1, work through each TODO sequentially:

1. **Read the TODO and hints carefully**
2. **Research if needed** (N-API docs, examples)
3. **Implement the TODO**
4. **Test your implementation**
5. **Move to next TODO**

Don't skip ahead! Each TODO builds on previous knowledge.

**Remember:**

- It's okay to struggle - that's learning!
- Test each piece before moving on
- Ask for help when stuck
- Celebrate small wins

---

## 🚀 Getting Started

When you're ready to begin Week 5, start with:

1. Run `npm install` to get dependencies
2. Open `cpp/binding/type_converter.h`
3. Start with TODO 5.3.1 (js_to_string function)
4. Work through each TODO in order

Good luck! Phase 2 is challenging but incredibly rewarding. You're learning how Node.js native addons work - a skill that's valuable for any high-performance JavaScript application! 💪

---

**Created:** October 5, 2025  
**Phase:** 2 of 6  
**Duration:** 4 weeks  
**Difficulty:** Intermediate to Advanced
