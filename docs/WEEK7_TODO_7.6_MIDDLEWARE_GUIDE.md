# Week 7 - TODO 7.6: Middleware System 🔗

## Overview

In this TODO, you'll build a **middleware system** for the Flash Framework. Middleware functions are like checkpoints that requests pass through before reaching their final destination (route handlers). They enable powerful features like logging, authentication, CORS, body parsing, and more.

---

## 📚 Background Knowledge

### What is Middleware?

Middleware functions are functions that have access to the request and response objects, and the `next()` function that passes control to the next middleware.

**Flow:**

```
Request → Middleware 1 → Middleware 2 → Middleware 3 → Route Handler → Response
```

**Each middleware can:**

1. Execute code
2. Modify request/response objects
3. End the request-response cycle
4. Call `next()` to pass control to the next middleware

**Example in Express:**

```typescript
app.use((req, res, next) => {
  console.log("Middleware executed!");
  next(); // Pass to next middleware
});

app.get("/users", (req, res) => {
  res.json({ users: [] });
});
```

### Why Middleware?

Middleware provides:

- **Separation of concerns**: Each middleware handles one responsibility
- **Reusability**: Write once, use everywhere
- **Composability**: Chain multiple middleware together
- **Clean code**: Keep route handlers focused on business logic

### Common Middleware Use Cases

1. **Logging**: Log every request
2. **Authentication**: Verify user identity
3. **Authorization**: Check user permissions
4. **CORS**: Handle cross-origin requests
5. **Body Parsing**: Parse JSON/form data
6. **Error Handling**: Catch and handle errors
7. **Rate Limiting**: Prevent abuse
8. **Compression**: Compress responses

---

## 🎯 Learning Objectives

By completing this TODO, you will learn:

1. **Function Composition**: How to chain functions together
2. **Async Flow Control**: Managing asynchronous middleware execution
3. **Closure Pattern**: How middleware captures and uses context
4. **HTTP Headers**: Understanding CORS and other header mechanisms
5. **Error Handling**: Centralized error management
6. **Design Patterns**: Chain of Responsibility pattern

---

## 📋 Implementation Checklist

### TODO 7.6.1: Define Middleware Types ✅

**Concepts:**

- TypeScript function types
- Union types (`void | Promise<void>`)
- Callback patterns

**What to implement:**

```typescript
export type NextFunction = () => void | Promise<void>;
export type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;
```

**Why these types?**

- `NextFunction`: Simple callback to trigger next middleware
- `void | Promise<void>`: Supports both sync and async middleware
- Three parameters: Give middleware access to everything it needs

---

### TODO 7.6.2: Create Middleware Manager 🔧

**Concepts:**

- Array management
- Recursion/iteration
- Async/await
- Function chaining

**What to implement:**

```typescript
class MiddlewareManager {
  private middlewares: MiddlewareFunction[] = [];

  use(middleware: MiddlewareFunction): void;
  async execute(req: Request, res: Response): Promise<void>;
}
```

**The Challenge: Chaining Middleware**

This is the **heart of the middleware system**. We need to execute middleware in sequence, where each calls `next()` to trigger the next one.

**Approach 1: Recursive (Recommended)**

```typescript
async execute(req: Request, res: Response): Promise<void> {
  let index = 0;

  const executeNext = async (): Promise<void> => {
    if (index >= this.middlewares.length) {
      return; // Done - no more middleware
    }

    const middleware = this.middlewares[index];
    index++; // Move to next before calling

    await middleware(req, res, executeNext);
  };

  await executeNext();
}
```

**How it works:**

1. Start with `index = 0`
2. Create `executeNext()` function
3. Check if we've reached the end
4. Get current middleware, increment index
5. Call middleware with `executeNext` as the `next` parameter
6. Middleware calls `next()`, which triggers `executeNext()` again
7. Repeat until all middleware executed

**Example flow:**

```typescript
// Middleware setup
manager.use((req, res, next) => {
  console.log("Middleware 1");
  next();
});
manager.use((req, res, next) => {
  console.log("Middleware 2");
  next();
});

// Execution:
await manager.execute(req, res);

// Output:
// Middleware 1
// Middleware 2
```

**Approach 2: Iterative**

```typescript
async execute(req: Request, res: Response): Promise<void> {
  for (const middleware of this.middlewares) {
    let nextCalled = false;

    await middleware(req, res, () => {
      nextCalled = true;
    });

    if (!nextCalled) {
      break; // Middleware didn't call next, stop chain
    }
  }
}
```

**Note:** Recursive approach is more flexible and allows middleware to control flow better.

---

### TODO 7.6.3: Implement Logger Middleware 📝

**Concepts:**

- ISO timestamps
- Console logging
- Middleware pattern

**What to implement:**

```typescript
export function createLoggerMiddleware(): MiddlewareFunction {
  return (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
  };
}
```

**Usage:**

```typescript
const logger = createLoggerMiddleware();
app.use(logger);

// Every request now logs:
// [2025-10-07T10:30:45.123Z] GET /users
// [2025-10-07T10:30:46.456Z] POST /users
```

**Design Pattern: Factory Function**

- `createLoggerMiddleware()` is a factory that returns middleware
- This allows for configurable middleware in the future:
  ```typescript
  createLoggerMiddleware({ format: "short" });
  ```

---

### TODO 7.6.4: Implement CORS Middleware 🌍

**Concepts:**

- HTTP headers
- Cross-Origin Resource Sharing (CORS)
- Security policies

**What is CORS?**

Browsers implement a **Same-Origin Policy** that blocks requests from different origins:

- `https://example.com` cannot call `https://api.other.com` by default
- CORS headers tell the browser: "It's OK to allow this"

**Required Headers:**

- `Access-Control-Allow-Origin`: Which origins can access (e.g., `*` or `https://example.com`)
- `Access-Control-Allow-Methods`: Which HTTP methods are allowed
- `Access-Control-Allow-Headers`: Which headers can be sent
- `Access-Control-Allow-Credentials`: Allow cookies/auth (optional)

**What to implement:**

```typescript
export interface CorsOptions {
  origin?: string;
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
}

export function createCorsMiddleware(
  options: CorsOptions = {}
): MiddlewareFunction {
  const origin = options.origin || "*";
  const methods = options.methods || [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "OPTIONS",
  ];
  const allowedHeaders = options.allowedHeaders || [
    "Content-Type",
    "Authorization",
  ];
  const credentials = options.credentials || false;

  return (req, res, next) => {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Methods", methods.join(", "));
    res.header("Access-Control-Allow-Headers", allowedHeaders.join(", "));
    if (credentials) {
      res.header("Access-Control-Allow-Credentials", "true");
    }
    next();
  };
}
```

**Usage:**

```typescript
// Allow all origins
app.use(createCorsMiddleware());

// Restrict to specific origin
app.use(
  createCorsMiddleware({
    origin: "https://myapp.com",
    credentials: true,
  })
);
```

**Security Note:** Using `origin: '*'` is convenient for development but should be restricted in production.

---

### TODO 7.6.5: Implement Body Parser Middleware 📦

**Concepts:**

- JSON parsing
- Request body handling
- Error handling

**What is Body Parsing?**

HTTP POST/PUT requests can include a body with data:

```http
POST /users HTTP/1.1
Content-Type: application/json

{"name": "Alice", "email": "alice@example.com"}
```

Body parser middleware:

1. Reads the raw body
2. Parses it based on `Content-Type`
3. Makes it accessible via `req.body`

**Simplified Implementation:**

```typescript
export function createJsonBodyParser(): MiddlewareFunction {
  return (req, res, next) => {
    // In production, read from request stream
    // For now, simulate by parsing string body
    if (typeof req.body === "string") {
      try {
        req.body = JSON.parse(req.body);
      } catch (error) {
        res.status(400).json({ error: "Invalid JSON" });
        return; // Don't call next() - request ends here
      }
    }
    next();
  };
}
```

**Usage:**

```typescript
app.use(createJsonBodyParser());

app.post("/users", (req, res) => {
  console.log(req.body); // { name: 'Alice', email: 'alice@example.com' }
  res.json({ success: true });
});
```

**Real Implementation Note:**
In production, you'd read from the request stream:

```typescript
let body = "";
req.on("data", (chunk) => (body += chunk));
req.on("end", () => {
  req.body = JSON.parse(body);
  next();
});
```

For now, our simplified version is sufficient for learning.

---

### TODO 7.6.6: Implement Error Handling Middleware ⚠️

**Concepts:**

- Error propagation
- Centralized error handling
- 4-parameter middleware pattern

**What is Error Middleware?**

Error middleware catches errors from other middleware/handlers:

```typescript
app.use((req, res, next) => {
  throw new Error("Something broke!");
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: error.message });
});
```

**What to implement:**

```typescript
export type ErrorMiddlewareFunction = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

export function createErrorHandler(): ErrorMiddlewareFunction {
  return (error, req, res, next) => {
    console.error("Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  };
}
```

**Key Difference:** 4 parameters instead of 3 (`error` is first)

**Usage:**

```typescript
// Register error handler last
app.use(createErrorHandler());
```

**Note:** Full error handling integration requires try-catch in `MiddlewareManager.execute()` and `Router.handleRequest()`. We'll implement basic error handling here and integrate fully in TODO 7.7.

---

## 🧪 Testing Strategy

After implementing each TODO, test it:

### Test 7.6.1: Type Definitions

```typescript
test("NextFunction type accepts functions", () => {
  const next: NextFunction = () => {};
  expect(typeof next).toBe("function");
});
```

### Test 7.6.2: Middleware Manager

```typescript
test("executes middleware in order", async () => {
  const manager = new MiddlewareManager();
  const order: number[] = [];

  manager.use((req, res, next) => {
    order.push(1);
    next();
  });
  manager.use((req, res, next) => {
    order.push(2);
    next();
  });

  await manager.execute(mockReq, mockRes);
  expect(order).toEqual([1, 2]);
});

test("stops if next() not called", async () => {
  const manager = new MiddlewareManager();
  const order: number[] = [];

  manager.use((req, res, next) => {
    order.push(1);
    // Don't call next()
  });
  manager.use((req, res, next) => {
    order.push(2); // Should not execute
    next();
  });

  await manager.execute(mockReq, mockRes);
  expect(order).toEqual([1]);
});
```

### Test 7.6.3: Logger Middleware

```typescript
test("logs requests", async () => {
  const consoleSpy = jest.spyOn(console, "log");
  const logger = createLoggerMiddleware();

  await logger(mockReq, mockRes, jest.fn());

  expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("GET /test"));
});
```

### Test 7.6.4: CORS Middleware

```typescript
test("sets CORS headers", async () => {
  const cors = createCorsMiddleware();

  await cors(mockReq, mockRes, jest.fn());

  expect(mockRes.header).toHaveBeenCalledWith(
    "Access-Control-Allow-Origin",
    "*"
  );
});
```

### Test 7.6.5: Body Parser

```typescript
test("parses JSON body", async () => {
  const parser = createJsonBodyParser();
  mockReq.body = '{"name":"Alice"}';

  await parser(mockReq, mockRes, jest.fn());

  expect(mockReq.body).toEqual({ name: "Alice" });
});
```

### Test 7.6.6: Error Handler

```typescript
test("handles errors", () => {
  const handler = createErrorHandler();
  const error = new Error("Test error");

  handler(error, mockReq, mockRes, jest.fn());

  expect(mockRes.status).toHaveBeenCalledWith(500);
  expect(mockRes.json).toHaveBeenCalledWith(
    expect.objectContaining({ error: "Internal Server Error" })
  );
});
```

---

## 🎓 Learning Resources

### Chain of Responsibility Pattern

Middleware implements the **Chain of Responsibility** design pattern:

- Each handler (middleware) decides whether to process or pass to next
- Decouples sender (request) from receivers (middleware)
- Flexible and extensible

**Reference:** [Refactoring Guru - Chain of Responsibility](https://refactoring.guru/design-patterns/chain-of-responsibility)

### Express Middleware Guide

Express has excellent middleware documentation:

- [Using Middleware](https://expressjs.com/en/guide/using-middleware.html)
- [Writing Middleware](https://expressjs.com/en/guide/writing-middleware.html)

### CORS Explained

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Understanding CORS](https://web.dev/cross-origin-resource-sharing/)

---

## 🚀 Implementation Order

Follow this order for best learning experience:

1. **TODO 7.6.1**: Type definitions (5 minutes)

   - Simple type aliases
   - Foundation for everything else

2. **TODO 7.6.2**: Middleware Manager (30 minutes)

   - Most challenging part
   - Take time to understand the chaining logic
   - Draw diagrams if needed

3. **TODO 7.6.3**: Logger Middleware (10 minutes)

   - Simple and practical
   - Good first middleware to implement

4. **TODO 7.6.4**: CORS Middleware (15 minutes)

   - Learn about HTTP headers
   - Understand security implications

5. **TODO 7.6.5**: Body Parser (15 minutes)

   - Learn about request body handling
   - Understand error handling in middleware

6. **TODO 7.6.6**: Error Handler (10 minutes)
   - Special 4-parameter pattern
   - Centralized error handling

**Total Time:** ~1.5-2 hours

---

## 🐛 Common Pitfalls

### 1. Forgetting to Call next()

```typescript
// BAD: next() not called
app.use((req, res, next) => {
  console.log("Hello");
  // Request hangs - never reaches route handler!
});

// GOOD: Always call next()
app.use((req, res, next) => {
  console.log("Hello");
  next();
});
```

### 2. Calling next() After Response

```typescript
// BAD: next() after sending response
app.use((req, res, next) => {
  res.json({ error: "Unauthorized" });
  next(); // Will cause errors!
});

// GOOD: Return after response
app.use((req, res, next) => {
  res.json({ error: "Unauthorized" });
  return; // Don't call next()
});
```

### 3. Not Handling Async Errors

```typescript
// BAD: Async error not caught
app.use(async (req, res, next) => {
  await riskyOperation(); // If this throws, error not caught
  next();
});

// GOOD: Wrap in try-catch
app.use(async (req, res, next) => {
  try {
    await riskyOperation();
    next();
  } catch (error) {
    // Handle error
    res.status(500).json({ error: "Failed" });
  }
});
```

### 4. Mutating Shared State

```typescript
// BAD: Global state in middleware
let requestCount = 0;
app.use((req, res, next) => {
  requestCount++; // Race condition in multi-threaded environment!
  next();
});

// GOOD: Use request-scoped data
app.use((req, res, next) => {
  req.timestamp = Date.now(); // Attached to request
  next();
});
```

---

## 🎯 Success Criteria

Your implementation is complete when:

✅ All type definitions compile without errors  
✅ MiddlewareManager executes middleware in order  
✅ MiddlewareManager stops if next() not called  
✅ Logger middleware logs requests correctly  
✅ CORS middleware sets all required headers  
✅ Body parser parses JSON and handles errors  
✅ Error handler catches and formats errors  
✅ All tests pass (aim for 25+ tests)  
✅ No TypeScript errors  
✅ Code is clean and documented

---

## 📚 What's Next?

After completing TODO 7.6, you'll move to **TODO 7.7: Integration**:

- Create main `Flash` class
- Integrate `Server`, `Router`, and `MiddlewareManager`
- Add middleware to router flow
- Create complete end-to-end tests
- Build example applications

The middleware system is the **last major component** before integration!

---

## 💡 Tips for Success

1. **Start with types** - Get the foundation right
2. **Test as you go** - Don't wait until the end
3. **Draw the flow** - Visualize middleware chaining
4. **Read Express docs** - See how professionals do it
5. **Experiment** - Try different middleware combinations
6. **Think about order** - Middleware order matters!
7. **Handle errors** - Always consider error cases
8. **Keep it simple** - Start simple, refine later

---

Good luck! Remember: Middleware is one of the most powerful patterns in web frameworks. Take your time to understand it thoroughly. 🚀
