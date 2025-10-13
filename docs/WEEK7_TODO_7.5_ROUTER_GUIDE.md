# Week 7 - TODO 7.5: Router Implementation Guide

## 🎯 Learning Objectives

By completing TODO 7.5, you will learn:

1. **Pattern Matching**: Converting string patterns like `/users/:id` into regular expressions
2. **Parameter Extraction**: Parsing dynamic segments from URLs
3. **Route Registration**: Building a fluent API with method chaining
4. **Request Routing**: Matching incoming requests to appropriate handlers
5. **Regex Fundamentals**: Using regular expressions for URL pattern matching

---

## 📚 Background Knowledge

### What is a Router?

A router maps incoming HTTP requests to handler functions based on:

- **HTTP Method** (GET, POST, PUT, DELETE)
- **URL Path** (e.g., `/users/123/posts/456`)

```typescript
// User writes this:
router.get("/users/:id", (req, res) => {
  const userId = req.params.id; // "123"
  res.json({ userId });
});

// Router internally:
// 1. Converts "/users/:id" to regex: /^\/users\/([^\/]+)$/
// 2. When request comes for "/users/123":
//    - Tests regex against path
//    - Extracts "123" from captured group
//    - Calls handler with req.params = { id: "123" }
```

### Key Concepts

**1. Route Patterns**

```
/users           - Static path (exact match)
/users/:id       - Dynamic path (matches /users/123, /users/abc)
/posts/:id/edit  - Mixed static/dynamic
```

**2. Regular Expressions for Routing**

```javascript
Pattern: /users/:id
Regex:   /^\/users\/([^\/]+)$/

Breakdown:
- ^          : Start of string
- \/users\/  : Literal "/users/"
- ([^\/]+)   : Capture group - one or more non-slash characters
- $          : End of string
```

**3. Parameter Extraction**

```typescript
Path pattern: /users/:userId/posts/:postId
Actual path:  /users/123/posts/456

paramNames: ["userId", "postId"]
Captured groups: ["123", "456"]
Result: { userId: "123", postId: "456" }
```

---

## 🏗️ Implementation Plan

### Overview of Router Structure

```
Router Class
├── routes: Route[]                    // Array of registered routes
├── get(path, handler)                 // Register GET route
├── post(path, handler)                // Register POST route
├── put(path, handler)                 // Register PUT route
├── delete(path, handler)              // Register DELETE route
├── registerRoute(method, path, handler) // Core registration logic
├── parsePathParams(path)              // Extract :param names
├── pathToRegex(path)                  // Convert pattern to regex
├── findRoute(method, path)            // Match incoming request
└── handleRequest(req, res)            // Execute matched route
```

---

## 📝 Step-by-Step TODOs

### TODO 7.5.1: Define Route Interface

**Goal**: Create a type to represent a single route

**Location**: Top of `src/router.ts`

**What you need**:

```typescript
interface Route {
  method: string; // "GET", "POST", etc.
  path: string; // Original pattern "/users/:id"
  handler: RouteHandler; // Function to execute
  regex: RegExp; // For matching paths
  paramNames: string[]; // ["id"] from :id
}
```

**Why?**:

- We need to store multiple pieces of information about each route
- TypeScript interfaces give us type safety
- Makes the code self-documenting

**Test it**:

```typescript
const route: Route = {
  method: "GET",
  path: "/users/:id",
  handler: (req, res) => {},
  regex: /^\/users\/([^\/]+)$/,
  paramNames: ["id"],
};
```

---

### TODO 7.5.2: Create Router Class

**Goal**: Initialize the Router with an empty routes array

**Location**: `src/router.ts` - Router class

**Hints**:

- Create `private routes: Route[] = [];`
- Private because external code shouldn't modify it directly

**Why?**:

- Encapsulation - routes are internal implementation detail
- Array allows us to store multiple routes
- Initialize as empty (no routes at start)

---

### TODO 7.5.3: Implement Route Registration Methods

**Goal**: Create convenient methods for registering routes

**Methods to implement**:

1. `get(path, handler)`
2. `post(path, handler)`
3. `put(path, handler)`
4. `delete(path, handler)`

**Pattern for each method**:

```typescript
get(path: string, handler: RouteHandler): this {
  return this.registerRoute('GET', path, handler);
}
```

**Key points**:

- Return `this` to enable method chaining
- All methods delegate to `registerRoute()`
- Only difference is the HTTP method string

**Why method chaining?**

```typescript
// User can write:
router
  .get("/users", getAllUsers)
  .post("/users", createUser)
  .get("/users/:id", getUser);
```

---

### TODO 7.5.4: Implement Core Registration Logic

**Goal**: Parse route pattern and store in routes array

**Method**: `registerRoute(method, path, handler)`

**Steps**:

1. Extract parameter names: `const paramNames = this.parsePathParams(path);`
2. Convert to regex: `const regex = this.pathToRegex(path);`
3. Create route object: `const route: Route = { method, path, handler, regex, paramNames };`
4. Add to array: `this.routes.push(route);`
5. Return this: `return this;`

**Example**:

```typescript
// Input: registerRoute('GET', '/users/:id', handler)

// After step 1: paramNames = ['id']
// After step 2: regex = /^\/users\/([^\/]+)$/
// After step 3: route = { method: 'GET', path: '/users/:id', ... }
// After step 4: this.routes = [route]
// After step 5: return this (for chaining)
```

---

### TODO 7.5.5: Implement Path Parsing

**Goal**: Extract parameter names from path pattern

**Method**: `parsePathParams(path: string): string[]`

**Algorithm**:

```typescript
Input:  "/users/:id/posts/:postId"
Output: ["id", "postId"]

Steps:
1. Find all matches of :paramName pattern
2. Extract the parameter name (without colon)
3. Return as array
```

**Regex pattern**: `/:([a-zA-Z_][a-zA-Z0-9_]*)/g`

- `:` - Literal colon
- `([a-zA-Z_][a-zA-Z0-9_]*)` - Capture group: letter/underscore, then letters/numbers/underscores
- `g` flag - Global (find all matches)

**Implementation hint**:

```typescript
private parsePathParams(path: string): string[] {
  const matches = path.match(/:([a-zA-Z_][a-zA-Z0-9_]*)/g);
  if (!matches) return [];

  // Remove the colon from each match
  return matches.map(m => m.slice(1));
}
```

**Test cases**:

```typescript
parsePathParams("/users"); // → []
parsePathParams("/users/:id"); // → ['id']
parsePathParams("/users/:userId/posts/:id"); // → ['userId', 'id']
```

---

### TODO 7.5.6: Implement Path to Regex Conversion

**Goal**: Convert route pattern to regular expression

**Method**: `pathToRegex(path: string): RegExp`

**Transformation**:

```
Input:  /users/:id/posts/:postId
Step 1: \/users\/:id\/posts\/:postId        (escape slashes)
Step 2: \/users\/([^\/]+)\/posts\/([^\/]+)  (replace :param)
Step 3: ^\/users\/([^\/]+)\/posts\/([^\/]+)$ (add anchors)
Output: /^\/users\/([^\/]+)\/posts\/([^\/]+)$/
```

**Why each step?**

1. **Escape slashes**: `/` is special in regex, need `\/`
2. **Replace `:param`**: Becomes `([^\/]+)` which means:
   - `(...)` - Capture group (we'll extract this value)
   - `[^\/]` - Any character except slash
   - `+` - One or more times
3. **Add anchors**: `^...$` ensures exact match (no trailing characters)

**Implementation hint**:

```typescript
private pathToRegex(path: string): RegExp {
  // Step 1: Escape slashes
  let pattern = path.replace(/\//g, '\\/');

  // Step 2: Replace :param with capture group
  pattern = pattern.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, '([^\\/]+)');

  // Step 3: Add anchors
  pattern = `^${pattern}$`;

  return new RegExp(pattern);
}
```

**Test cases**:

```typescript
pathToRegex("/users").test("/users"); // → true
pathToRegex("/users").test("/users/"); // → false (extra slash)
pathToRegex("/users/:id").test("/users/123"); // → true
pathToRegex("/users/:id").test("/users/123/x"); // → false (extra segment)
```

---

### TODO 7.5.7: Implement Route Matching

**Goal**: Find route that matches incoming request

**Method**: `findRoute(method, path): { route, params } | null`

**Algorithm**:

```
1. Loop through all routes
2. Check if method matches
3. Check if path matches regex
4. Extract parameter values from captured groups
5. Return { route, params }
6. If no match, return null
```

**Extracting parameters**:

```typescript
// Example:
route.regex = /^\/users\/([^\/]+)\/posts\/([^\/]+)$/;
route.paramNames = ["userId", "postId"];
path = "/users/123/posts/456";

const match = route.regex.exec(path);
// match = ['/users/123/posts/456', '123', '456']
// match[0] = full match
// match[1] = first capture group ('123')
// match[2] = second capture group ('456')

// Build params object:
const params = {};
route.paramNames.forEach((name, i) => {
  params[name] = match[i + 1]; // i+1 because match[0] is full match
});
// params = { userId: '123', postId: '456' }
```

**Implementation hint**:

```typescript
findRoute(method: string, path: string): { route: Route; params: Record<string, string> } | null {
  for (const route of this.routes) {
    // Check method
    if (route.method !== method) continue;

    // Check path with regex
    const match = route.regex.exec(path);
    if (!match) continue;

    // Extract params
    const params: Record<string, string> = {};
    route.paramNames.forEach((name, i) => {
      params[name] = match[i + 1];
    });

    return { route, params };
  }

  return null; // No match found
}
```

**Test cases**:

```typescript
router.get("/users/:id", handler);

findRoute("GET", "/users/123");
// → { route: {...}, params: { id: '123' } }

findRoute("POST", "/users/123");
// → null (method mismatch)

findRoute("GET", "/users/123/extra");
// → null (path mismatch)
```

---

### TODO 7.5.8: Implement Request Handling

**Goal**: Execute the handler for a matched route

**Method**: `async handleRequest(req, res): Promise<void>`

**Flow**:

```
1. Find matching route
2. If no match → 404 Not Found
3. Add extracted params to request
4. Execute handler
5. Handle errors → 500 Internal Server Error
```

**Implementation hint**:

```typescript
async handleRequest(req: Request, res: Response): Promise<void> {
  // Find route
  const match = this.findRoute(req.method, req.path);

  // No match → 404
  if (!match) {
    res.status(404).json({ error: 'Not Found' });
    return;
  }

  // Add params to request
  Object.assign(req.params, match.params);

  // Execute handler with error handling
  try {
    await match.route.handler(req, res);
  } catch (error) {
    console.error('Route handler error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
```

**Why async?**

- Handlers might do async operations (database queries, API calls)
- We use `await` to wait for handler completion
- Allows proper error handling

---

## 🧪 Testing Strategy

### Test Plan

Create `tests/unit/router.test.ts` with these test cases:

**1. Route Registration**

```typescript
test("should register GET route", () => {
  const router = new Router();
  const handler = jest.fn();

  router.get("/users", handler);

  const routes = router.getRoutes();
  expect(routes).toHaveLength(1);
  expect(routes[0].method).toBe("GET");
  expect(routes[0].path).toBe("/users");
});
```

**2. Method Chaining**

```typescript
test("should support method chaining", () => {
  const router = new Router();

  const result = router.get("/users", jest.fn()).post("/users", jest.fn());

  expect(result).toBe(router);
  expect(router.getRoutes()).toHaveLength(2);
});
```

**3. Parameter Parsing**

```typescript
test("should parse route parameters", () => {
  const router = new Router();
  router.get("/users/:id/posts/:postId", jest.fn());

  const routes = router.getRoutes();
  expect(routes[0].paramNames).toEqual(["id", "postId"]);
});
```

**4. Regex Matching**

```typescript
test("should match static routes", () => {
  const router = new Router();
  const handler = jest.fn();
  router.get("/users", handler);

  const match = router.findRoute("GET", "/users");
  expect(match).not.toBeNull();
  expect(match?.params).toEqual({});
});

test("should match dynamic routes", () => {
  const router = new Router();
  const handler = jest.fn();
  router.get("/users/:id", handler);

  const match = router.findRoute("GET", "/users/123");
  expect(match).not.toBeNull();
  expect(match?.params).toEqual({ id: "123" });
});
```

**5. Request Handling**

```typescript
test("should execute matched route handler", async () => {
  const router = new Router();
  const handler = jest.fn();
  router.get("/users/:id", handler);

  const req = new Request("GET", "/users/123", {}, {}, {}, null);
  const res = new Response();

  await router.handleRequest(req, res);

  expect(handler).toHaveBeenCalled();
  expect(req.params.id).toBe("123");
});

test("should return 404 for unmatched routes", async () => {
  const router = new Router();
  const req = new Request("GET", "/unknown", {}, {}, {}, null);
  const res = new Response();

  await router.handleRequest(req, res);

  expect(res.getStatusCode()).toBe(404);
});
```

---

## 🎓 Learning Checkpoints

After implementing each TODO, verify your understanding:

### Checkpoint 1: Route Interface (7.5.1)

- [ ] Can you explain what each property in Route interface stores?
- [ ] Why do we need both `path` and `regex`?
- [ ] What is the purpose of `paramNames`?

### Checkpoint 2: Route Registration (7.5.2-7.5.4)

- [ ] What does `return this` enable?
- [ ] Why do get/post/put/delete all call `registerRoute`?
- [ ] What happens when you register multiple routes?

### Checkpoint 3: Pattern Parsing (7.5.5)

- [ ] Can you write the regex that matches `:paramName`?
- [ ] Why do we use `slice(1)` on the matches?
- [ ] What happens if there are no parameters in the path?

### Checkpoint 4: Regex Conversion (7.5.6)

- [ ] What does `([^\/]+)` match?
- [ ] Why do we need `^` and `$` anchors?
- [ ] What would happen without escaping slashes?

### Checkpoint 5: Route Matching (7.5.7)

- [ ] What does `regex.exec()` return?
- [ ] Why is `match[i + 1]` used instead of `match[i]`?
- [ ] When does `findRoute` return null?

### Checkpoint 6: Request Handling (7.5.8)

- [ ] Why is this method async?
- [ ] What happens if a route handler throws an error?
- [ ] Why do we use `Object.assign(req.params, match.params)`?

---

## 🐛 Common Pitfalls

### 1. Regex Escaping

```typescript
// WRONG - Slashes not escaped
let pattern = path.replace(/:/g, "([^/]+)");
// Creates: /users/([^/]+) which is invalid regex

// CORRECT - Escape slashes
let pattern = path.replace(/\//g, "\\/");
// Creates: \/users\/... which is valid
```

### 2. Capture Group Indexing

```typescript
// WRONG
const params = {};
route.paramNames.forEach((name, i) => {
  params[name] = match[i]; // match[0] is full match!
});

// CORRECT
const params = {};
route.paramNames.forEach((name, i) => {
  params[name] = match[i + 1]; // Start from match[1]
});
```

### 3. Missing Anchors

```typescript
// WRONG - Matches prefixes
pathToRegex("/users/:id"); // → /\/users\/([^\/]+)/
// Matches /users/123/posts/456 (BAD!)

// CORRECT - Exact match only
pathToRegex("/users/:id"); // → /^\/users\/([^\/]+)$/
// Only matches /users/123 (GOOD!)
```

### 4. Forgetting Error Handling

```typescript
// WRONG - Errors crash the server
async handleRequest(req, res) {
  const match = this.findRoute(req.method, req.path);
  await match.route.handler(req, res); // Can throw!
}

// CORRECT - Catch and handle errors
async handleRequest(req, res) {
  try {
    const match = this.findRoute(req.method, req.path);
    await match.route.handler(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
```

---

## 📊 Progress Checklist

Track your progress as you implement:

- [ ] TODO 7.5.1: Route interface defined
- [ ] TODO 7.5.2: Router class with routes array
- [ ] TODO 7.5.3: GET/POST/PUT/DELETE methods
- [ ] TODO 7.5.4: registerRoute implementation
- [ ] TODO 7.5.5: parsePathParams implementation
- [ ] TODO 7.5.6: pathToRegex implementation
- [ ] TODO 7.5.7: findRoute implementation
- [ ] TODO 7.5.8: handleRequest implementation
- [ ] Tests created and passing
- [ ] Manual testing with example app

---

## 🚀 Next Steps

After completing TODO 7.5:

1. **Test thoroughly**: Create comprehensive unit tests
2. **Manual testing**: Create example app using the router
3. **Move to TODO 7.6**: Implement middleware system
4. **Refactor**: Clean up code based on learnings

---

## 💡 Pro Tips

1. **Start simple**: Test with static routes first (`/users`) before dynamic ones
2. **Console.log is your friend**: Print regex patterns to understand them
3. **Test regex online**: Use regex101.com to experiment with patterns
4. **One TODO at a time**: Don't try to implement everything at once
5. **Ask for help**: If stuck for >30 minutes, ask questions!

---

**Good luck! You're building a real routing system! 🎉**
