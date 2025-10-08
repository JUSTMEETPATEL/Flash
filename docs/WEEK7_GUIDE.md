# Week 7: TypeScript Wrapper Layer

## Overview

Week 7 focuses on creating a clean TypeScript API layer that wraps our native N-API addon. This provides an Express-like developer experience while leveraging the high-performance C++ core.

**Goal:** Transform our low-level N-API bindings into a beautiful, type-safe TypeScript API.

**Key Concepts:**

- TypeScript class wrappers
- Async/await patterns
- Error handling
- Clean API design
- Type safety

---

## Week 7 TODOs

### TODO 7.1: Create Native Wrapper (`src/native.ts`)

**Goal:** Create a clean wrapper around the native addon

**Files to create:**

- `src/native.ts` - Main native interface

**Requirements:**

- Load the native addon safely
- Export typed interfaces
- Handle addon loading errors
- Provide clean error messages

**Step-by-step:**

1. Import the native addon
2. Create typed interfaces for native methods
3. Add error handling for missing addon
4. Export everything needed by other modules

---

### TODO 7.2: Create Server Class (`src/server.ts`)

**Goal:** Create the main Server class with Express-like API

**Files to create:**

- `src/server.ts` - Main Server class

**Requirements:**

- Constructor that takes port
- `listen()` method (async)
- `close()` method (async)
- Event handling
- Type-safe method signatures

**Step-by-step:**

1. Import native wrapper
2. Create Server class
3. Implement constructor with port validation
4. Implement async listen() method
5. Implement async close() method
6. Add proper error handling

---

### TODO 7.3: Create Request Wrapper (`src/request.ts`)

**Goal:** Wrap native request data in a clean TypeScript interface

**Files to create:**

- `src/request.ts` - Request wrapper class

**Requirements:**

- Parse native request data
- Provide clean property accessors
- Type-safe headers access
- Body parsing helpers

**Step-by-step:**

1. Define Request interface
2. Create Request class
3. Implement property getters (method, path, headers, body)
4. Add header access methods
5. Add body parsing helpers

---

### TODO 7.4: Create Response Wrapper (`src/response.ts`)

**Goal:** Create response builder with Express-like API

**Files to create:**

- `src/response.ts` - Response wrapper class

**Requirements:**

- Status code management
- Header manipulation
- Body setting
- Send methods
- Type-safe API

**Step-by-step:**

1. Define Response interface
2. Create Response class
3. Implement status() method
4. Implement header manipulation
5. Implement body setting
6. Add send() convenience methods

---

### TODO 7.5: Create Router (`src/router.ts`)

**Goal:** Implement Express-like routing system

**Files to create:**

- `src/router.ts` - Router class

**Requirements:**

- Route registration (get, post, etc.)
- Route matching
- Parameter extraction
- Middleware support
- Type-safe handlers

**Step-by-step:**

1. Define RouteHandler type
2. Create Router class
3. Implement route registration methods
4. Implement route matching logic
5. Add parameter extraction
6. Integrate with Server class

---

### TODO 7.6: Create Middleware System (`src/middleware/`)

**Goal:** Add middleware support for request processing

**Files to create:**

- `src/middleware/index.ts` - Middleware exports
- `src/middleware/logger.ts` - Request logging
- `src/middleware/cors.ts` - CORS handling
- `src/middleware/parser.ts` - Body parsing

**Requirements:**

- Middleware function types
- Middleware chaining
- Error handling in middleware
- Common middleware implementations

**Step-by-step:**

1. Define MiddlewareFunction type
2. Create middleware runner
3. Implement logger middleware
4. Implement CORS middleware
5. Implement body parser middleware

---

### TODO 7.7: Write TypeScript Tests

**Goal:** Test the TypeScript wrapper layer

**Files to create:**

- `tests/unit/native.test.ts` - Native wrapper tests
- `tests/unit/server.test.ts` - Server class tests
- `tests/unit/router.test.ts` - Router tests
- `tests/integration/server.test.ts` - Integration tests

**Requirements:**

- Unit tests for all classes
- Mock the native addon
- Test error conditions
- Integration tests

**Step-by-step:**

1. Set up Jest for TypeScript
2. Mock native addon
3. Write unit tests for each class
4. Write integration tests
5. Test error handling

---

## Success Criteria

By end of Week 7, you should be able to:

```typescript
import { Flash } from "./src";

// Create server
const app = new Flash();

// Add routes
app.get("/api/users", (req, res) => {
  res.json({ users: [] });
});

app.post("/api/users", (req, res) => {
  const user = req.body;
  res.status(201).json({ id: 1, ...user });
});

// Start server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

---

## Learning Objectives

1. **TypeScript Class Design** - Creating clean, type-safe APIs
2. **Async/Await Patterns** - Proper asynchronous programming
3. **Error Handling** - Converting native errors to TypeScript errors
4. **API Design** - Creating intuitive developer experiences
5. **Testing TypeScript** - Unit and integration testing

---

## Files to Create This Week

```
src/
├── native.ts           # Native addon wrapper
├── server.ts           # Main Server class
├── request.ts          # Request wrapper
├── response.ts         # Response wrapper
├── router.ts           # Router class
└── middleware/
    ├── index.ts        # Middleware exports
    ├── logger.ts       # Request logging
    ├── cors.ts         # CORS handling
    └── parser.ts       # Body parsing

tests/unit/
├── native.test.ts      # Native wrapper tests
├── server.test.ts      # Server tests
├── router.test.ts      # Router tests
└── middleware.test.ts  # Middleware tests

tests/integration/
└── server.test.ts      # Integration tests
```

---

## Getting Started

1. **Create the directory structure:**

   ```bash
   mkdir -p src/middleware tests/unit tests/integration
   ```

2. **Start with TODO 7.1** - Create `src/native.ts`
   This provides the foundation for everything else.

3. **Build incrementally** - Each TODO builds on the previous ones.

4. **Test as you go** - Run `npm test` after each major change.

---

## Common Patterns

### Error Handling Pattern:

```typescript
try {
  // Call native method
  const result = nativeAddon.someMethod();
  return result;
} catch (error) {
  // Convert to user-friendly error
  throw new Error(`Operation failed: ${error.message}`);
}
```

### Async Method Pattern:

```typescript
async listen(port: number): Promise<void> {
  // Validate port
  if (port < 1 || port > 65535) {
    throw new Error('Invalid port number');
  }

  // Call native method
  await this.nativeServer.start(port);
}
```

---

## Testing Strategy

- **Mock the native addon** for unit tests
- **Test error conditions** thoroughly
- **Use integration tests** for end-to-end flows
- **Test TypeScript types** with strict mode

---

**Ready to start Week 7? Let's create `src/native.ts` first!** 🚀</content>
<parameter name="filePath">/Users/meet/Developer/flash/docs/WEEK7_PLAN.md
