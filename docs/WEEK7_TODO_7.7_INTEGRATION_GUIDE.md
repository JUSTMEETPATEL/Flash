# Week 7 - TODO 7.7: Integration & Complete Framework 🎉

## Overview

**This is it!** The final TODO where you bring everything together. You'll create the main `Flash` class that integrates the Server, Router, and Middleware systems into a complete, production-ready HTTP framework.

After completing this TODO, you'll have built a **real HTTP framework** from scratch! 🚀

---

## 📚 Background Knowledge

### What is Integration?

Integration is the process of combining independent components into a cohesive system. In our case:

- **Server** (C++ backend) handles HTTP connections
- **Router** matches requests to handlers
- **Middleware** processes requests in a pipeline
- **Flash** orchestrates all three

**The Challenge:** Make these components work together seamlessly while providing a clean, intuitive API.

### Framework Architecture

```
┌─────────────────────────────────────────┐
│           Flash Class (API)             │
│  - Configuration                        │
│  - Method shortcuts (get, post, etc.)   │
│  - Server lifecycle (listen, close)     │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┼─────────┐
        │         │         │
        ▼         ▼         ▼
   ┌────────┐ ┌────────┐ ┌─────────┐
   │ Server │ │ Router │ │ Middle  │
   │ (C++)  │ │  (TS)  │ │ ware    │
   └────────┘ └────────┘ └─────────┘
```

### Request Flow

```
1. Client makes HTTP request
2. Server receives connection (C++ layer)
3. Flash.handleRequest() is called
4. Middleware pipeline executes
   - Logger logs request
   - CORS sets headers
   - Body parser parses JSON
   - Custom middleware runs
5. Router matches path and method
6. Route handler executes
7. Response sent to client
```

---

## 🎯 Learning Objectives

By completing this TODO, you will learn:

1. **System Integration**: Combining independent components
2. **API Design**: Creating intuitive, developer-friendly APIs
3. **Configuration Management**: Flexible, option-based configuration
4. **Method Chaining**: Fluent interface pattern
5. **Error Handling**: Centralized error management
6. **Lifecycle Management**: Server start/stop operations

---

## 📋 Implementation Checklist

### TODO 7.7.1: Define Flash Configuration Options ⚙️

**Concepts:**

- Optional properties
- Flexible configuration
- Sensible defaults

**What to implement:**

```typescript
export interface FlashOptions {
  port?: number; // Default: 3000
  logger?: boolean; // Default: true
  cors?: boolean | CorsOptions; // Default: false
  bodyParser?: boolean; // Default: true
}
```

**Why this structure?**

- **Optional everything**: Users can use defaults
- **Boolean OR object**: `cors: true` for quick setup, or `cors: { origin: '...' }` for config
- **Intuitive defaults**: Logger and body parser on by default, CORS off (security)

---

### TODO 7.7.2: Create Flash Class 🏗️

**Concepts:**

- Composition over inheritance
- Private encapsulation
- Constructor initialization

**What to implement:**

```typescript
export class Flash {
  private server: Server;
  private router: Router;
  private middlewareManager: MiddlewareManager;
  private options: FlashOptions;

  constructor(options: FlashOptions = {}) {
    // Set defaults
    // Create component instances
    // Setup middleware
  }
}
```

**Design Decisions:**

- **Private properties**: Hide implementation details
- **Composition**: Flash HAS-A server, router, middleware (not IS-A)
- **Constructor injection**: All setup happens at creation time

---

### TODO 7.7.3: Setup Default Middleware 🔧

**Concepts:**

- Convention over configuration
- Conditional setup
- Order matters

**What to implement:**

```typescript
private setupDefaultMiddleware(): void {
  if (this.options.logger) {
    this.middlewareManager.use(createLoggerMiddleware());
  }

  if (this.options.cors) {
    const corsOptions = typeof this.options.cors === 'object'
      ? this.options.cors
      : undefined;
    this.middlewareManager.use(createCorsMiddleware(corsOptions));
  }

  if (this.options.bodyParser) {
    this.middlewareManager.use(createJsonBodyParser());
  }
}
```

**Critical: Middleware Order**

1. **Logger first**: Log every request, even ones that fail
2. **CORS second**: Set headers before any processing
3. **Body parser third**: Parse body before route handlers need it

**Never do this:**

```typescript
// BAD: Wrong order
this.middlewareManager.use(createJsonBodyParser()); // Body parser first?
this.middlewareManager.use(createLoggerMiddleware()); // Logger after parsing?
```

---

### TODO 7.7.4: Implement Middleware Registration 📝

**Concepts:**

- Method chaining
- Delegation pattern
- Fluent interface

**What to implement:**

```typescript
public use(middleware: MiddlewareFunction): this {
  this.middlewareManager.use(middleware);
  return this;
}
```

**Method Chaining Example:**

```typescript
app.use(customMiddleware1).use(customMiddleware2).get("/users", handler);
// Chaining makes code more readable
```

**Why return `this`?**

- Enables method chaining
- Common pattern in frameworks (Express, jQuery)
- Makes API more fluent and readable

---

### TODO 7.7.5: Implement HTTP Method Shortcuts 🔀

**Concepts:**

- Convenience methods
- Consistent interface
- Delegation pattern

**What to implement:**

```typescript
public get(path: string, handler: RouteHandler): this {
  this.router.get(path, handler);
  return this;
}

public post(path: string, handler: RouteHandler): this {
  this.router.post(path, handler);
  return this;
}

// put() and delete() similar
```

**Pattern Recognition:**

- All methods have same structure
- Delegate to router
- Return `this` for chaining
- This is the **Facade pattern**: simplify interface to complex subsystem

**Usage:**

```typescript
// Without shortcuts (verbose)
app.getRouter().get("/users", handler);

// With shortcuts (clean)
app.get("/users", handler);
```

---

### TODO 7.7.6: Implement Request Handling Pipeline 🔄

**Concepts:**

- Async/await flow
- Error handling
- Pipeline pattern

**What to implement:**

```typescript
private async handleRequest(req: Request, res: Response): Promise<void> {
  try {
    // Execute middleware pipeline
    await this.middlewareManager.execute(req, res);

    // Route the request
    await this.router.handleRequest(req, res);
  } catch (error) {
    // Handle errors
    console.error('Request handling error:', error);

    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
```

**This is the HEART of integration!**

**Flow:**

1. **Middleware first**: Processes request (logging, CORS, parsing)
2. **Then routing**: Finds and executes handler
3. **Error catching**: Any errors caught and handled gracefully

**Why `!res.headersSent`?**

- Once headers are sent, we can't send again
- Prevents "Headers already sent" errors
- Check before sending error response

**Error Handling Strategy:**

- Catch ALL errors in one place
- Log for debugging
- Send user-friendly response
- Don't expose internal details

---

### TODO 7.7.7: Implement Server Lifecycle Methods 🎬

**Concepts:**

- Server lifecycle
- Callback patterns
- Optional parameters

**What to implement:**

```typescript
public listen(port?: number, callback?: () => void): void {
  const listenPort = port || this.options.port || 3000;

  // Register request handler
  this.server.onRequest((req, res) => {
    this.handleRequest(req, res);
  });

  // Start server
  this.server.listen(listenPort);

  // Call callback if provided
  if (callback) {
    callback();
  }
}

public close(): void {
  this.server.close();
}
```

**Port Resolution Priority:**

1. `listen(port)` parameter (highest)
2. Constructor option `new Flash({ port })`
3. Default `3000` (lowest)

**Callback Pattern:**

```typescript
// With callback
app.listen(3000, () => {
  console.log("Server started!");
});

// Without callback
app.listen(3000);
```

**Request Handler Registration:**

- `this.server.onRequest()` connects server to our pipeline
- Every request flows through `handleRequest()`
- This is the integration point between C++ and TypeScript

---

### TODO 7.7.8: Implement Utility Methods 🛠️

**Concepts:**

- Getter methods
- Escape hatches
- Advanced API

**What to implement:**

```typescript
public getRouter(): Router {
  return this.router;
}

public getMiddlewareManager(): MiddlewareManager {
  return this.middlewareManager;
}

public getServer(): Server {
  return this.server;
}
```

**Why provide these?**

- **Advanced users**: Direct access for complex scenarios
- **Testing**: Access internal state for tests
- **Extension**: Build on top of Flash

**Example use case:**

```typescript
const app = new Flash();

// Advanced: Directly manipulate router
app.getRouter().clearRoutes();

// Advanced: Add middleware after initialization
app.getMiddlewareManager().use(customMiddleware);

// Advanced: Access server for low-level operations
app.getServer().getConnectionCount();
```

---

### TODO 7.7.9: Export Convenience Function 🎁

**Concepts:**

- Factory function
- Convenience API
- Alternative creation pattern

**What to implement:**

```typescript
export function createFlash(options?: FlashOptions): Flash {
  return new Flash(options);
}
```

**Why a factory function?**

- Alternative to `new` keyword
- More functional style
- Common in modern frameworks

**Usage comparison:**

```typescript
// With new keyword
const app1 = new Flash({ port: 3000 });

// With factory function
const app2 = createFlash({ port: 3000 });
```

Both are valid - user preference!

---

## 🧪 Testing Strategy

### Unit Tests

Test each method in isolation:

```typescript
describe("Flash", () => {
  test("constructor sets default options", () => {
    const app = new Flash();
    expect(app).toBeDefined();
  });

  test("get() registers route", () => {
    const app = new Flash();
    app.get("/test", (req, res) => {});

    const routes = app.getRouter().getRoutes();
    expect(routes).toHaveLength(1);
  });

  test("use() registers middleware", () => {
    const app = new Flash();
    const middleware = jest.fn();
    app.use(middleware);

    const middlewares = app.getMiddlewareManager().getMiddlewares();
    expect(middlewares).toHaveLength(4); // 3 default + 1 custom
  });
});
```

### Integration Tests

Test components working together:

```typescript
describe('Flash Integration', () => {
  test('handles request through full pipeline', async () => {
    const app = new Flash();
    const handler = jest.fn((req, res) => {
      res.json({ success: true });
    });

    app.get('/test', handler);

    const mockReq = { method: 'GET', path: '/test', ... };
    const mockRes = { json: jest.fn(), ... };

    await app.handleRequest(mockReq, mockRes);

    expect(handler).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({ success: true });
  });
});
```

### End-to-End Tests

Test real HTTP requests (manual or with supertest):

```typescript
import request from "supertest";

describe("Flash E2E", () => {
  test("handles GET request", async () => {
    const app = new Flash();
    app.get("/users", (req, res) => {
      res.json({ users: ["Alice", "Bob"] });
    });

    app.listen(3001);

    const response = await request("http://localhost:3001")
      .get("/users")
      .expect(200);

    expect(response.body).toEqual({ users: ["Alice", "Bob"] });

    app.close();
  });
});
```

---

## 🎓 Design Patterns Used

### 1. Facade Pattern

Flash provides simplified interface to complex subsystems:

```typescript
// Without facade
const server = new Server();
const router = new Router();
server.onRequest((req, res) => router.handleRequest(req, res));

// With facade
const app = new Flash();
app.get("/users", handler);
```

### 2. Builder Pattern (via Method Chaining)

```typescript
app
  .use(middleware1)
  .use(middleware2)
  .get("/users", handler)
  .post("/users", handler)
  .listen(3000);
```

### 3. Factory Pattern

```typescript
export function createFlash(options) {
  return new Flash(options);
}
```

### 4. Composition Pattern

```typescript
// Flash is COMPOSED of components
class Flash {
  private server: Server; // HAS-A
  private router: Router; // HAS-A
  private middlewareManager: MiddlewareManager; // HAS-A
}
```

---

## 🚀 Example Complete Application

After implementing all TODOs, you'll be able to write this:

```typescript
import { Flash } from "./flash";

const app = new Flash({
  port: 3000,
  logger: true,
  cors: { origin: "https://myapp.com" },
  bodyParser: true,
});

// Custom middleware
app.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Flash!" });
});

app.get("/users/:id", (req, res) => {
  const userId = req.params.id;
  res.json({ id: userId, name: "Alice" });
});

app.post("/users", (req, res) => {
  const userData = req.body;
  res.json({ success: true, user: userData });
});

app.put("/users/:id", (req, res) => {
  const userId = req.params.id;
  const updates = req.body;
  res.json({ id: userId, ...updates });
});

app.delete("/users/:id", (req, res) => {
  const userId = req.params.id;
  res.json({ success: true, deleted: userId });
});

// Start server
app.listen(3000, () => {
  console.log("🚀 Flash server running on http://localhost:3000");
});
```

**Test it:**

```bash
curl http://localhost:3000/
curl http://localhost:3000/users/123
curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{"name":"Bob"}'
```

---

## 🐛 Common Pitfalls

### 1. Wrong Middleware Order

```typescript
// BAD: Body parser before logger
this.middlewareManager.use(createJsonBodyParser());
this.middlewareManager.use(createLoggerMiddleware());

// GOOD: Logger first
this.middlewareManager.use(createLoggerMiddleware());
this.middlewareManager.use(createJsonBodyParser());
```

### 2. Forgetting to Return `this`

```typescript
// BAD: Can't chain
public use(middleware: MiddlewareFunction): void {
  this.middlewareManager.use(middleware);
}

// GOOD: Chainable
public use(middleware: MiddlewareFunction): this {
  this.middlewareManager.use(middleware);
  return this;
}
```

### 3. Not Checking `headersSent`

```typescript
// BAD: May cause "Headers already sent" error
catch (error) {
  res.status(500).json({ error: 'Server Error' });
}

// GOOD: Check first
catch (error) {
  if (!res.headersSent) {
    res.status(500).json({ error: 'Server Error' });
  }
}
```

### 4. Forgetting Async/Await

```typescript
// BAD: Not awaiting async operations
private handleRequest(req, res) {
  this.middlewareManager.execute(req, res); // Not awaited!
  this.router.handleRequest(req, res);      // Not awaited!
}

// GOOD: Proper async/await
private async handleRequest(req, res) {
  await this.middlewareManager.execute(req, res);
  await this.router.handleRequest(req, res);
}
```

---

## 🎯 Success Criteria

Your implementation is complete when:

✅ All type definitions compile without errors  
✅ Constructor initializes all components  
✅ Default middleware configured correctly  
✅ HTTP method shortcuts work (get, post, put, delete)  
✅ Middleware registration works  
✅ Request pipeline integrates all components  
✅ Server starts and stops properly  
✅ Method chaining works  
✅ Error handling catches all errors  
✅ All tests pass (aim for 30+ tests)  
✅ Example app runs successfully

---

## 📚 What You've Built

After completing this TODO, you'll have:

🎉 **A complete HTTP framework** with:

- C++ high-performance server backend
- TypeScript API layer
- Express-like routing
- Middleware pipeline
- CORS support
- JSON body parsing
- Request logging
- Error handling

🎉 **Production-ready features:**

- Configurable options
- Method chaining
- Clean API design
- Comprehensive error handling
- Full async/await support

🎉 **Professional skills:**

- System integration
- API design
- Design patterns
- Framework architecture
- Testing strategies

---

## 💡 Tips for Success

1. **Implement in order** - TODOs build on each other
2. **Test each method** - Don't wait until the end
3. **Understand the flow** - Draw diagrams if helpful
4. **Check defaults** - Make sure options work correctly
5. **Test method chaining** - Verify return types
6. **Think about errors** - What can go wrong?
7. **Read the hints** - They contain key insights
8. **Run example app** - See it all work together!

---

## 🎓 Congratulations!

When you complete this TODO, you'll have built a **real HTTP framework from scratch**!

You'll have learned:

- ✅ C++ and TypeScript integration (N-API)
- ✅ HTTP server implementation
- ✅ Routing with pattern matching
- ✅ Middleware pipeline
- ✅ System architecture
- ✅ API design
- ✅ Testing strategies
- ✅ Design patterns

**This is a HUGE achievement!** You've gone from zero to a working web framework. That's the level of understanding that separates good developers from great ones.

Ready to complete your framework? Let's do this! 🚀💪✨
