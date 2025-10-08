# Phase 2 Week 7: TypeScript Wrapper Layer - Learning Guide

## Overview

Welcome to **Phase 2 Week 7**! We've successfully built our C++ HTTP server and N-API bindings. Now we're creating a beautiful TypeScript API layer that developers will love to use.

**Current Status:** ✅ TODO 7.1 & 7.2 Complete
**Next:** TODO 7.3 - Request Wrapper

---

## TODO 7.3: Create Request Wrapper (`src/request.ts`)

**Goal:** Wrap raw HTTP request data into a clean, Express-like Request object

**Learning Objectives:**

- Object-oriented design patterns
- Property getters and encapsulation
- Type-safe data access
- Clean API design

**Files to create:**

- `src/request.ts` - Request wrapper class

### Step-by-Step Implementation:

**Step 1: Define the Request Interface**

```typescript
// TODO 7.3.1: Define Request interface
// HINT: Think about what properties a request should have
// - method: string (GET, POST, etc.)
// - path: string (the URL path)
// - headers: Record<string, string>
// - query: Record<string, string> (URL parameters)
// - params: Record<string, string> (route parameters)
// - body: any (request body)
export interface Request {
  readonly method: string;
  readonly path: string;
  readonly headers: Record<string, string>;
  readonly query: Record<string, string>;
  readonly params: Record<string, string>;
  readonly body: any;
}
```

**Step 2: Create Request Class**

```typescript
// TODO 7.3.2: Create Request class
// HINT: This class will wrap the native request data
// - Constructor should take raw request data
// - Parse the raw data into clean properties
// - Provide helper methods for common operations
export class Request implements Request {
  // TODO: Implement constructor
  // TODO: Implement property getters
  // TODO: Add helper methods
}
```

**Step 3: Implement Property Getters**

```typescript
// TODO 7.3.3: Implement property getters
// HINT: Each getter should return the appropriate data type
// - get method(): string
// - get path(): string
// - get headers(): Record<string, string>
// - get query(): Record<string, string>
// - get params(): Record<string, string>
// - get body(): any
```

**Step 4: Add Helper Methods**

```typescript
// TODO 7.3.4: Add helper methods
// HINT: These make the API more convenient
// - getHeader(name: string): string | undefined
// - hasHeader(name: string): boolean
// - getQueryParam(name: string): string | undefined
// - getRouteParam(name: string): string | undefined
```

---

## TODO 7.4: Create Response Wrapper (`src/response.ts`)

**Goal:** Create a response builder with Express-like API for sending HTTP responses

**Learning Objectives:**

- Builder pattern
- Method chaining
- Response formatting
- HTTP status codes

**Files to create:**

- `src/response.ts` - Response wrapper class

### Step-by-Step Implementation:

**Step 1: Define Response Interface**

```typescript
// TODO 7.4.1: Define Response interface
// HINT: Think about response operations
// - status(code: number): this (method chaining)
// - header(name: string, value: string): this
// - json(data: any): void
// - send(data: string | Buffer): void
// - end(): void
export interface Response {
  status(code: number): this;
  header(name: string, value: string): this;
  json(data: any): void;
  send(data: string | Buffer): void;
  end(): void;
}
```

**Step 2: Create Response Class**

```typescript
// TODO 7.4.2: Create Response class
// HINT: This will build and send HTTP responses
// - Track status code, headers, and body
// - Provide chainable methods
// - Handle different content types
export class Response implements Response {
  private statusCode: number = 200;
  private headers: Record<string, string> = {};
  private body: string | Buffer | null = null;
  private sent: boolean = false;

  // TODO: Implement all interface methods
}
```

**Step 3: Implement Status Method**

```typescript
// TODO 7.4.3: Implement status method
// HINT: Should allow method chaining
// - Set the status code
// - Return 'this' for chaining
// - Validate status code range
status(code: number): this {
  // TODO: Validate code is between 100-599
  // TODO: Set this.statusCode = code
  // TODO: Return this
}
```

**Step 4: Implement Header Method**

```typescript
// TODO 7.4.4: Implement header method
// HINT: Build headers object
// - Add header to this.headers
// - Allow method chaining
// - Handle multiple calls to same header
header(name: string, value: string): this {
  // TODO: Set this.headers[name.toLowerCase()] = value
  // TODO: Return this
}
```

**Step 5: Implement Send Methods**

```typescript
// TODO 7.4.5: Implement send methods
// HINT: Different ways to send response body
// - json(): Convert object to JSON string
// - send(): Send string/buffer directly
// - Both should set appropriate headers
// - Both should call end() internally
json(data: any): void {
  // TODO: Set Content-Type: application/json
  // TODO: Convert data to JSON string
  // TODO: Call this.send(jsonString)
}

send(data: string | Buffer): void {
  // TODO: Set body
  // TODO: Call this.end()
}
```

---

## TODO 7.5: Create Router (`src/router.ts`)

**Goal:** Implement Express-like routing with path matching and parameter extraction

**Learning Objectives:**

- Route pattern matching
- Parameter extraction
- Middleware integration
- Function composition

**Files to create:**

- `src/router.ts` - Router class

### Step-by-Step Implementation:

**Step 1: Define Route Handler Type**

```typescript
// TODO 7.5.1: Define route handler type
// HINT: Function that takes Request and Response
// - Should be async/await compatible
// - Should handle both sync and async operations
export type RouteHandler = (
  req: Request,
  res: Response
) => void | Promise<void>;
```

**Step 2: Create Route Interface**

```typescript
// TODO 7.5.2: Define Route interface
// HINT: Internal representation of a route
// - method: string (GET, POST, etc.)
// - path: string (pattern like '/users/:id')
// - handler: RouteHandler
// - paramNames: string[] (extracted from path)
export interface Route {
  method: string;
  path: string;
  handler: RouteHandler;
  paramNames: string[];
}
```

**Step 3: Create Router Class**

```typescript
// TODO 7.5.3: Create Router class
// HINT: Manages routes and handles requests
// - Store routes in a Map or array
// - Provide methods like get(), post(), etc.
// - Implement route matching logic
export class Router {
  private routes: Route[] = [];

  // TODO: Implement route registration methods
  // TODO: Implement request handling
}
```

**Step 4: Implement Route Registration**

```typescript
// TODO 7.5.4: Implement route registration
// HINT: Methods for each HTTP method
// - get(path, handler)
// - post(path, handler)
// - put(path, handler)
// - delete(path, handler)
// - All should return 'this' for chaining
get(path: string, handler: RouteHandler): this {
  // TODO: Parse path for parameters
  // TODO: Create Route object
  // TODO: Add to this.routes
  // TODO: Return this
}
```

**Step 5: Implement Route Matching**

```typescript
// TODO 7.5.5: Implement route matching
// HINT: Find route that matches request
// - Compare method
// - Match path pattern
// - Extract parameters
// - Return matched route or null
private matchRoute(method: string, path: string): { route: Route; params: Record<string, string> } | null {
  // TODO: Loop through this.routes
  // TODO: Check method match
  // TODO: Check path pattern match
  // TODO: Extract parameters
  // TODO: Return result
}
```

---

## TODO 7.6: Create Middleware System (`src/middleware/`)

**Goal:** Add middleware support for request preprocessing (logging, CORS, body parsing)

**Learning Objectives:**

- Middleware pattern
- Function composition
- Request/response interception
- Common web framework features

**Files to create:**

- `src/middleware/index.ts` - Middleware exports
- `src/middleware/logger.ts` - Request logging
- `src/middleware/cors.ts` - CORS handling
- `src/middleware/parser.ts` - Body parsing

### Step-by-Step Implementation:

**Step 1: Define Middleware Types**

```typescript
// TODO 7.6.1: Define middleware types
// HINT: Middleware functions intercept requests
// - Take (req, res, next) parameters
// - Call next() to continue processing
// - Can modify req/res or send response
export type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: () => void | Promise<void>
) => void | Promise<void>;
```

**Step 2: Create Middleware Runner**

```typescript
// TODO 7.6.2: Create middleware runner
// HINT: Execute middleware chain
// - Run middlewares in order
// - Handle async operations
// - Call final handler when done
export class MiddlewareRunner {
  private middlewares: MiddlewareFunction[] = [];

  use(middleware: MiddlewareFunction): this {
    // TODO: Add middleware to array
    // TODO: Return this for chaining
  }

  async run(
    req: Request,
    res: Response,
    finalHandler: RouteHandler
  ): Promise<void> {
    // TODO: Execute middleware chain
    // TODO: Call final handler at end
  }
}
```

**Step 3: Implement Logger Middleware**

```typescript
// TODO 7.6.3: Create logger middleware
// HINT: Log incoming requests
// - Log method, path, timestamp
// - Call next() to continue
// - Don't modify request/response
export function logger(): MiddlewareFunction {
  return (req, res, next) => {
    // TODO: Log request details
    // TODO: Call next()
  };
}
```

**Step 4: Implement CORS Middleware**

```typescript
// TODO 7.6.4: Create CORS middleware
// HINT: Handle Cross-Origin requests
// - Add CORS headers to response
// - Handle preflight OPTIONS requests
// - Configurable allowed origins/methods
export function cors(options?: CorsOptions): MiddlewareFunction {
  return (req, res, next) => {
    // TODO: Add CORS headers
    // TODO: Handle OPTIONS requests
    // TODO: Call next()
  };
}
```

---

## TODO 7.7: Integration and Testing

**Goal:** Connect all components and write comprehensive tests

**Learning Objectives:**

- Component integration
- Test-driven development
- Mocking strategies
- End-to-end testing

**Files to create/modify:**

- `src/index.ts` - Main exports
- `tests/unit/request.test.ts` - Request wrapper tests
- `tests/unit/response.test.ts` - Response wrapper tests
- `tests/unit/router.test.ts` - Router tests
- `tests/integration/full.test.ts` - Full integration tests

### Step-by-Step Implementation:

**Step 1: Create Main Export**

```typescript
// TODO 7.7.1: Create main export (src/index.ts)
// HINT: Export the main Flash class
// - Import Server, Router, middleware
// - Create Flash class that extends Server
// - Add convenience methods
export class Flash extends Server {
  private router: Router;

  constructor(port?: number) {
    // TODO: Call super(port)
    // TODO: Initialize router
  }

  // TODO: Add HTTP method convenience methods
  get(path: string, handler: RouteHandler): this {
    // TODO: Delegate to router
    // TODO: Return this
  }
}
```

**Step 2: Write Unit Tests**

```typescript
// TODO 7.7.2: Write comprehensive unit tests
// HINT: Test each component in isolation
// - Mock dependencies
// - Test happy path and error cases
// - Test edge cases
describe("Request", () => {
  // TODO: Test Request class
});

describe("Response", () => {
  // TODO: Test Response class
});

describe("Router", () => {
  // TODO: Test Router class
});
```

**Step 3: Write Integration Tests**

```typescript
// TODO 7.7.3: Write integration tests
// HINT: Test components working together
// - Test full request/response cycle
// - Test middleware chain
// - Test routing
describe("Full Integration", () => {
  test("should handle complete request flow", async () => {
    // TODO: Create server
    // TODO: Add routes and middleware
    // TODO: Make HTTP request
    // TODO: Verify response
  });
});
```

---

## Learning Path for Week 7

1. **Start with TODO 7.3** - Request wrapper (easiest)
2. **TODO 7.4** - Response wrapper (similar patterns)
3. **TODO 7.5** - Router (more complex logic)
4. **TODO 7.6** - Middleware (function composition)
5. **TODO 7.7** - Integration and testing

**Remember:** Focus on learning the concepts, not rushing to finish. Each TODO builds your understanding of TypeScript API design.

**Pro Tips:**

- Test your code after each step
- Read the hints carefully
- Look at Express.js source for inspiration
- Keep the API clean and intuitive

Ready to start with **TODO 7.3: Request Wrapper**? 🚀</content>
<parameter name="filePath">/Users/meet/Developer/flash/docs/WEEK7_LEARNING_GUIDE.md
