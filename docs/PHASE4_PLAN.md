# Phase 4: Advanced Features - Implementation Plan

**Timeline:** Weeks 11-12 (2 weeks)  
**Start Date:** October 14, 2025  
**Status:** 🚀 STARTING

---

## 📋 Overview

Phase 4 builds upon the solid foundation of Phases 1-3 to add production-ready features that make Flash Framework truly competitive with modern web frameworks like Express.js, Fastify, and Koa.

### What We're Building

**Week 11: Static File Serving & Advanced Routing**

- Static file server with streaming
- Path pattern improvements (wildcards, optional segments)
- Route grouping and prefixes
- File upload handling

**Week 12: Advanced Middleware & Performance**

- Compression middleware (gzip/deflate)
- Rate limiting
- Request validation
- Caching strategies
- Performance monitoring

---

## 🎯 Learning Objectives

By the end of Phase 4, you will have mastered:

1. **File I/O in C++**: Efficient file reading with mmap/sendfile
2. **Stream Processing**: Chunked transfer encoding for large files
3. **Validation Patterns**: Schema-based request validation
4. **Rate Limiting Algorithms**: Token bucket, sliding window
5. **Compression**: zlib integration for HTTP compression
6. **Performance Monitoring**: Metrics collection and reporting

---

## 🏗️ Architecture Overview

### Current Architecture (Phase 3)

```
┌─────────────────────────────────────────────┐
│             TypeScript Layer                │
│  ┌──────────┐  ┌─────────┐  ┌────────────┐ │
│  │  Flash   │  │ Router  │  │ Middleware │ │
│  └──────────┘  └─────────┘  └────────────┘ │
│         │            │              │       │
│         └────────────┴──────────────┘       │
│                      │                       │
│              ┌───────▼────────┐            │
│              │  N-API Bridge  │            │
│              └───────┬────────┘            │
└──────────────────────┼──────────────────────┘
                       │
┌──────────────────────▼──────────────────────┐
│               C++ Layer                     │
│  ┌──────────────┐  ┌─────────────────────┐ │
│  │  HttpServer  │  │   WorkerPool        │ │
│  │              │──│  (Thread Pool)      │ │
│  └──────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Phase 4 Architecture (Target)

```
┌────────────────────────────────────────────────────────┐
│                  TypeScript Layer                      │
│  ┌──────────┐  ┌─────────┐  ┌──────────────────────┐ │
│  │  Flash   │  │ Router  │  │  Middleware Stack    │ │
│  └──────────┘  └─────────┘  │ - Compression        │ │
│                              │ - Rate Limiting      │ │
│                              │ - Validation         │ │
│                              │ - Static Files       │ │
│                              │ - Cache              │ │
│                              └──────────────────────┘ │
│              ┌───────────────────┐                    │
│              │   N-API Bridge    │                    │
│              └─────────┬─────────┘                    │
└────────────────────────┼──────────────────────────────┘
                         │
┌────────────────────────▼──────────────────────────────┐
│                   C++ Layer                           │
│  ┌──────────────┐  ┌─────────────────────┐           │
│  │  HttpServer  │  │   WorkerPool        │           │
│  │              │──│  (Thread Pool)      │           │
│  └──────┬───────┘  └─────────────────────┘           │
│         │                                              │
│  ┌──────▼───────────────────────────────────────┐    │
│  │         Static File Handler                  │    │
│  │  - Memory-mapped I/O                        │    │
│  │  - sendfile() optimization                  │    │
│  │  - MIME type detection                      │    │
│  │  - Range requests (partial content)         │    │
│  └──────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────┘
```

---

## 📅 Week 11: Static File Serving & Advanced Routing

### Day 1-2: Static File Server (C++ Core)

**Goal:** Implement high-performance static file serving in C++

#### TODO 11.1: File Handler Implementation

**Files to Create/Modify:**

- `cpp/include/file_handler.h` - Static file handler header
- `cpp/src/file_handler.cpp` - Implementation
- `cpp/tests/test_file_handler.cpp` - Unit tests

**Features:**

```cpp
class FileHandler {
public:
    // Constructor with root directory
    explicit FileHandler(const std::string& root_dir);

    // Serve a file (returns file content or error)
    std::optional<FileResponse> serve(const std::string& path);

    // Check if file exists and is readable
    bool exists(const std::string& path) const;

    // Get MIME type for file extension
    std::string get_mime_type(const std::string& path) const;

    // Get file size
    size_t get_file_size(const std::string& path) const;

private:
    std::string root_dir_;
    std::unordered_map<std::string, std::string> mime_types_;

    // Prevent directory traversal attacks
    bool is_safe_path(const std::string& path) const;

    // Read file efficiently (use mmap for large files)
    std::string read_file(const std::string& path);
};
```

**Key Concepts:**

- **Directory Traversal Protection**: Validate paths to prevent `../../../etc/passwd` attacks
- **MIME Type Detection**: Map file extensions to content types
- **Efficient I/O**: Use `mmap()` for large files, regular `read()` for small files
- **Error Handling**: Handle missing files, permission errors, etc.

**Success Criteria:**

- ✅ Can serve files from a directory
- ✅ Blocks directory traversal attempts
- ✅ Sets correct Content-Type headers
- ✅ Handles binary files (images, PDFs)
- ✅ Returns 404 for missing files

---

#### TODO 11.2: Static Middleware (TypeScript)

**Files to Create:**

- `src/middleware/static.ts` - Static file middleware
- `tests/unit/static.test.ts` - Tests

**API Design:**

```typescript
/**
 * Static file serving middleware
 *
 * @param root - Root directory to serve files from
 * @param options - Configuration options
 * @returns Middleware function
 *
 * @example
 * app.use(createStaticMiddleware('./public', {
 *   index: 'index.html',
 *   maxAge: 3600,
 *   dotfiles: 'ignore'
 * }));
 */
export function createStaticMiddleware(
  root: string,
  options?: StaticOptions
): MiddlewareFunction;

export interface StaticOptions {
  // Default file to serve for directories
  index?: string | string[];

  // Cache-Control max-age in seconds
  maxAge?: number;

  // How to handle dotfiles: 'allow' | 'deny' | 'ignore'
  dotfiles?: "allow" | "deny" | "ignore";

  // Enable/disable ETag generation
  etag?: boolean;

  // Custom MIME type mappings
  mimeTypes?: Record<string, string>;
}
```

**Implementation Steps:**

1. Parse request path
2. Resolve file path (handle `index` option)
3. Check if file exists (call C++ via N-API)
4. Set headers (Content-Type, Cache-Control, ETag)
5. Stream file content to response
6. Handle errors (404, 403)

**Success Criteria:**

- ✅ Serves static files from directory
- ✅ Serves index.html for directory requests
- ✅ Sets proper headers
- ✅ Handles 404 gracefully
- ✅ Supports custom options

---

### Day 3-4: Advanced Routing Features

#### TODO 11.3: Route Groups and Prefixes

**Files to Modify:**

- `src/router.ts` - Add grouping support

**New API:**

```typescript
class Router {
  /**
   * Create a route group with common prefix
   *
   * @example
   * const api = router.group('/api/v1');
   * api.get('/users', handler);      // Matches /api/v1/users
   * api.post('/users', handler);     // Matches /api/v1/users
   */
  group(prefix: string): Router;

  /**
   * Mount a router at a specific path
   *
   * @example
   * const userRouter = new Router();
   * userRouter.get('/', listUsers);
   * userRouter.get('/:id', getUser);
   *
   * app.mount('/users', userRouter);
   */
  mount(prefix: string, router: Router): this;
}
```

**Success Criteria:**

- ✅ Groups share common prefix
- ✅ Can nest groups
- ✅ Mount routers at different paths
- ✅ Middleware applies to groups

---

#### TODO 11.4: Wildcard and Optional Segments

**Features to Add:**

```typescript
// Wildcard routes (match anything after prefix)
router.get("/files/*", handler); // /files/a/b/c.txt

// Optional segments
router.get("/users/:id?", handler); // /users OR /users/123

// Multiple parameters
router.get("/posts/:year/:month/:slug", handler);

// Regular expression constraints
router.get("/users/:id(\\d+)", handler); // Only numbers
```

**Implementation:**

- Update `pathToRegex()` to handle wildcards
- Support optional parameters with `?`
- Add parameter validation with regex patterns

**Success Criteria:**

- ✅ Wildcard routes work
- ✅ Optional parameters handled
- ✅ Regex constraints enforced
- ✅ Tests for all patterns

---

### Day 5: File Upload Support

#### TODO 11.5: Multipart Form Data Parser

**Files to Create:**

- `src/middleware/multipart.ts` - Multipart parser
- `cpp/include/multipart_parser.h` - C++ parser (optional)

**API:**

```typescript
interface UploadOptions {
  // Max file size in bytes
  maxFileSize?: number;

  // Max total request size
  maxFieldSize?: number;

  // Allowed file types
  allowedTypes?: string[];

  // Upload directory
  uploadDir?: string;
}

/**
 * Handle file uploads
 */
export function createMultipartMiddleware(
  options?: UploadOptions
): MiddlewareFunction;

// Usage
app.post(
  "/upload",
  createMultipartMiddleware({
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ["image/png", "image/jpeg"],
    uploadDir: "./uploads",
  }),
  (req, res) => {
    // req.files contains uploaded files
    res.json({ files: req.files });
  }
);
```

**Success Criteria:**

- ✅ Parse multipart/form-data
- ✅ Save files to disk
- ✅ Enforce size limits
- ✅ Validate file types
- ✅ Clean up on errors

---

## 📅 Week 12: Advanced Middleware & Performance

### Day 1-2: Compression Middleware

#### TODO 12.1: HTTP Compression (gzip/deflate)

**Files to Create:**

- `src/middleware/compression.ts` - Compression middleware
- Consider using `zlib` (built into Node.js)

**API:**

```typescript
interface CompressionOptions {
  // Compression level (1-9)
  level?: number;

  // Minimum response size to compress
  threshold?: number;

  // MIME types to compress
  filter?: (req: Request, res: Response) => boolean;
}

/**
 * Compress response bodies
 */
export function createCompressionMiddleware(
  options?: CompressionOptions
): MiddlewareFunction;
```

**Implementation:**

```typescript
import { gzip, deflate } from "zlib";
import { promisify } from "util";

const gzipAsync = promisify(gzip);
const deflateAsync = promisify(deflate);

export function createCompressionMiddleware(options = {}): MiddlewareFunction {
  const { level = 6, threshold = 1024, filter } = options;

  return async (req, res, next) => {
    const acceptEncoding = req.headers["accept-encoding"] || "";

    // Store original send method
    const originalSend = res.send.bind(res);

    // Override send to compress
    res.send = async (body: any) => {
      if (typeof body === "string" && body.length >= threshold) {
        if (acceptEncoding.includes("gzip")) {
          const compressed = await gzipAsync(body, { level });
          res.setHeader("Content-Encoding", "gzip");
          return originalSend(compressed);
        } else if (acceptEncoding.includes("deflate")) {
          const compressed = await deflateAsync(body, { level });
          res.setHeader("Content-Encoding", "deflate");
          return originalSend(compressed);
        }
      }
      return originalSend(body);
    };

    await next();
  };
}
```

**Success Criteria:**

- ✅ Compresses large responses
- ✅ Skips small responses
- ✅ Respects Accept-Encoding
- ✅ Sets proper headers
- ✅ Configurable threshold

---

### Day 3: Rate Limiting

#### TODO 12.2: Rate Limiting Middleware

**Files to Create:**

- `src/middleware/rate-limit.ts` - Rate limiter

**Algorithms:**

1. **Token Bucket**: Fixed capacity, tokens refill over time
2. **Sliding Window**: Count requests in time window
3. **Fixed Window**: Simple counter per time period

**API:**

```typescript
interface RateLimitOptions {
  // Max requests per window
  max?: number;

  // Window duration in milliseconds
  windowMs?: number;

  // Message to send when limit exceeded
  message?: string;

  // Status code to return
  statusCode?: number;

  // Key generator function
  keyGenerator?: (req: Request) => string;

  // Skip function
  skip?: (req: Request) => boolean;
}

/**
 * Rate limit middleware
 */
export function createRateLimiter(
  options?: RateLimitOptions
): MiddlewareFunction;

// Usage
app.use(
  createRateLimiter({
    max: 100, // 100 requests
    windowMs: 15 * 60 * 1000, // per 15 minutes
    message: "Too many requests, please try again later",
  })
);
```

**Implementation (Token Bucket):**

```typescript
interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

export function createRateLimiter(options = {}): MiddlewareFunction {
  const {
    max = 100,
    windowMs = 15 * 60 * 1000,
    message = "Too many requests",
    statusCode = 429,
    keyGenerator = (req) => req.ip || "unknown",
    skip = () => false,
  } = options;

  const buckets = new Map<string, TokenBucket>();
  const refillRate = max / (windowMs / 1000); // tokens per second

  return async (req, res, next) => {
    if (skip(req)) {
      return next();
    }

    const key = keyGenerator(req);
    const now = Date.now();

    let bucket = buckets.get(key);

    if (!bucket) {
      bucket = { tokens: max, lastRefill: now };
      buckets.set(key, bucket);
    }

    // Refill tokens based on time elapsed
    const elapsed = (now - bucket.lastRefill) / 1000;
    bucket.tokens = Math.min(max, bucket.tokens + elapsed * refillRate);
    bucket.lastRefill = now;

    // Check if request is allowed
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;

      // Set rate limit headers
      res.setHeader("X-RateLimit-Limit", max.toString());
      res.setHeader(
        "X-RateLimit-Remaining",
        Math.floor(bucket.tokens).toString()
      );

      return next();
    } else {
      // Rate limit exceeded
      res.status(statusCode).json({ error: message });
    }
  };
}
```

**Success Criteria:**

- ✅ Limits requests per IP
- ✅ Configurable limits
- ✅ Custom key generation
- ✅ Rate limit headers
- ✅ Memory-efficient

---

### Day 4: Request Validation

#### TODO 12.3: Schema Validation Middleware

**Files to Create:**

- `src/middleware/validation.ts` - Validation middleware

**API:**

```typescript
interface ValidationSchema {
  body?: Record<string, Validator>;
  query?: Record<string, Validator>;
  params?: Record<string, Validator>;
  headers?: Record<string, Validator>;
}

interface Validator {
  type: "string" | "number" | "boolean" | "array" | "object";
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: any[];
  custom?: (value: any) => boolean;
}

/**
 * Validate request data against schema
 */
export function createValidator(schema: ValidationSchema): MiddlewareFunction;

// Usage
app.post(
  "/users",
  createValidator({
    body: {
      name: { type: "string", required: true, min: 3, max: 50 },
      email: {
        type: "string",
        required: true,
        pattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
      },
      age: { type: "number", min: 18, max: 120 },
      role: { type: "string", enum: ["user", "admin"] },
    },
  }),
  (req, res) => {
    // req.body is validated
    res.json({ success: true });
  }
);
```

**Implementation:**

```typescript
export function createValidator(schema: ValidationSchema): MiddlewareFunction {
  return async (req, res, next) => {
    const errors: string[] = [];

    // Validate body
    if (schema.body) {
      for (const [field, validator] of Object.entries(schema.body)) {
        const value = req.body?.[field];
        const error = validateField(field, value, validator);
        if (error) errors.push(error);
      }
    }

    // Validate query params
    if (schema.query) {
      for (const [field, validator] of Object.entries(schema.query)) {
        const value = req.query?.[field];
        const error = validateField(field, value, validator);
        if (error) errors.push(error);
      }
    }

    // Validate path params
    if (schema.params) {
      for (const [field, validator] of Object.entries(schema.params)) {
        const value = req.params?.[field];
        const error = validateField(field, value, validator);
        if (error) errors.push(error);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    await next();
  };
}

function validateField(
  field: string,
  value: any,
  validator: Validator
): string | null {
  // Check required
  if (validator.required && (value === undefined || value === null)) {
    return `${field} is required`;
  }

  if (value === undefined || value === null) {
    return null; // Optional field not provided
  }

  // Check type
  const actualType = Array.isArray(value) ? "array" : typeof value;
  if (actualType !== validator.type) {
    return `${field} must be ${validator.type}`;
  }

  // Check min/max for strings and numbers
  if (validator.type === "string" && typeof value === "string") {
    if (validator.min && value.length < validator.min) {
      return `${field} must be at least ${validator.min} characters`;
    }
    if (validator.max && value.length > validator.max) {
      return `${field} must be at most ${validator.max} characters`;
    }
  }

  if (validator.type === "number" && typeof value === "number") {
    if (validator.min !== undefined && value < validator.min) {
      return `${field} must be at least ${validator.min}`;
    }
    if (validator.max !== undefined && value > validator.max) {
      return `${field} must be at most ${validator.max}`;
    }
  }

  // Check pattern
  if (validator.pattern && typeof value === "string") {
    if (!validator.pattern.test(value)) {
      return `${field} format is invalid`;
    }
  }

  // Check enum
  if (validator.enum && !validator.enum.includes(value)) {
    return `${field} must be one of: ${validator.enum.join(", ")}`;
  }

  // Custom validator
  if (validator.custom && !validator.custom(value)) {
    return `${field} validation failed`;
  }

  return null;
}
```

**Success Criteria:**

- ✅ Validates body, query, params
- ✅ Type checking
- ✅ Range validation
- ✅ Pattern matching
- ✅ Custom validators

---

### Day 5: Caching

#### TODO 12.4: Response Caching Middleware

**Files to Create:**

- `src/middleware/cache.ts` - Cache middleware

**API:**

```typescript
interface CacheOptions {
  // Cache duration in seconds
  ttl?: number;

  // Cache key generator
  keyGenerator?: (req: Request) => string;

  // Methods to cache
  methods?: string[];

  // Skip caching for certain requests
  skip?: (req: Request) => boolean;
}

/**
 * Cache responses in memory
 */
export function createCacheMiddleware(
  options?: CacheOptions
): MiddlewareFunction;
```

**Implementation:**

```typescript
interface CacheEntry {
  body: any;
  headers: Record<string, string>;
  statusCode: number;
  timestamp: number;
}

export function createCacheMiddleware(options = {}): MiddlewareFunction {
  const {
    ttl = 300, // 5 minutes default
    keyGenerator = (req) => `${req.method}:${req.path}`,
    methods = ["GET", "HEAD"],
    skip = () => false,
  } = options;

  const cache = new Map<string, CacheEntry>();

  // Clean up expired entries periodically
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of cache.entries()) {
      if (now - entry.timestamp > ttl * 1000) {
        cache.delete(key);
      }
    }
  }, 60000); // Every minute

  return async (req, res, next) => {
    // Only cache certain methods
    if (!methods.includes(req.method)) {
      return next();
    }

    if (skip(req)) {
      return next();
    }

    const key = keyGenerator(req);
    const cached = cache.get(key);

    // Return cached response if valid
    if (cached) {
      const age = Math.floor((Date.now() - cached.timestamp) / 1000);

      if (age < ttl) {
        // Set cache headers
        res.setHeader("X-Cache", "HIT");
        res.setHeader("Age", age.toString());

        // Set original headers
        for (const [name, value] of Object.entries(cached.headers)) {
          res.setHeader(name, value);
        }

        return res.status(cached.statusCode).send(cached.body);
      } else {
        cache.delete(key);
      }
    }

    // Cache miss - intercept response
    res.setHeader("X-Cache", "MISS");

    const originalSend = res.send.bind(res);
    res.send = (body: any) => {
      // Cache the response
      cache.set(key, {
        body,
        headers: res.getHeaders(),
        statusCode: res.statusCode,
        timestamp: Date.now(),
      });

      return originalSend(body);
    };

    await next();
  };
}
```

**Success Criteria:**

- ✅ Caches GET requests
- ✅ TTL expiration
- ✅ Cache headers (X-Cache, Age)
- ✅ Memory cleanup
- ✅ Configurable

---

### Day 6-7: Performance Monitoring

#### TODO 12.5: Metrics Collection

**Files to Create:**

- `src/middleware/metrics.ts` - Performance metrics

**API:**

```typescript
interface MetricsOptions {
  // Enable request timing
  timing?: boolean;

  // Enable memory tracking
  memory?: boolean;

  // Endpoint to expose metrics
  endpoint?: string;
}

/**
 * Collect performance metrics
 */
export function createMetricsMiddleware(
  options?: MetricsOptions
): MiddlewareFunction;

// Metrics interface
export interface Metrics {
  requests: {
    total: number;
    success: number;
    errors: number;
    byMethod: Record<string, number>;
    byStatus: Record<string, number>;
  };
  timing: {
    mean: number;
    p50: number;
    p95: number;
    p99: number;
  };
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
}
```

**Implementation:**

```typescript
class MetricsCollector {
  private requests = {
    total: 0,
    success: 0,
    errors: 0,
    byMethod: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
  };

  private timings: number[] = [];

  recordRequest(method: string, statusCode: number, duration: number) {
    this.requests.total++;

    if (statusCode >= 200 && statusCode < 400) {
      this.requests.success++;
    } else {
      this.requests.errors++;
    }

    this.requests.byMethod[method] = (this.requests.byMethod[method] || 0) + 1;
    this.requests.byStatus[statusCode] =
      (this.requests.byStatus[statusCode] || 0) + 1;

    this.timings.push(duration);

    // Keep only last 1000 timings for percentiles
    if (this.timings.length > 1000) {
      this.timings.shift();
    }
  }

  getMetrics(): Metrics {
    const sorted = [...this.timings].sort((a, b) => a - b);

    return {
      requests: this.requests,
      timing: {
        mean: sorted.reduce((a, b) => a + b, 0) / sorted.length || 0,
        p50: this.percentile(sorted, 50),
        p95: this.percentile(sorted, 95),
        p99: this.percentile(sorted, 99),
      },
      memory: process.memoryUsage(),
    };
  }

  private percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    const index = Math.ceil((sorted.length * p) / 100) - 1;
    return sorted[index] || 0;
  }
}

const collector = new MetricsCollector();

export function createMetricsMiddleware(options = {}): MiddlewareFunction {
  const { timing = true, memory = true, endpoint = "/metrics" } = options;

  return async (req, res, next) => {
    // Serve metrics endpoint
    if (req.path === endpoint) {
      return res.json(collector.getMetrics());
    }

    // Record request timing
    const start = Date.now();

    // Intercept response to capture status code
    const originalSend = res.send.bind(res);
    res.send = (body: any) => {
      const duration = Date.now() - start;
      collector.recordRequest(req.method, res.statusCode, duration);

      // Add timing header
      if (timing) {
        res.setHeader("X-Response-Time", `${duration}ms`);
      }

      return originalSend(body);
    };

    await next();
  };
}

// Export metrics getter
export function getMetrics(): Metrics {
  return collector.getMetrics();
}
```

**Success Criteria:**

- ✅ Tracks request counts
- ✅ Measures response times
- ✅ Calculates percentiles
- ✅ Memory metrics
- ✅ Metrics endpoint

---

## 🧪 Testing Strategy

### Unit Tests

For each middleware:

```typescript
describe("CompressionMiddleware", () => {
  it("should compress large responses", async () => {
    const middleware = createCompressionMiddleware({ threshold: 100 });
    const req = createMockRequest({ headers: { "accept-encoding": "gzip" } });
    const res = createMockResponse();

    await middleware(req, res, async () => {});

    const largeBody = "x".repeat(1000);
    await res.send(largeBody);

    expect(res.getHeader("Content-Encoding")).toBe("gzip");
  });

  it("should skip small responses", async () => {
    // Test implementation
  });

  it("should respect Accept-Encoding header", async () => {
    // Test implementation
  });
});
```

### Integration Tests

**Static File Serving:**

```typescript
describe("Static File Integration", () => {
  let app: Flash;

  beforeAll(async () => {
    app = new Flash();
    app.use(createStaticMiddleware("./public"));
    await app.listen(3000);
  });

  afterAll(async () => {
    await app.close();
  });

  it("should serve index.html for root", async () => {
    const res = await fetch("http://localhost:3000/");
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/html");
  });

  it("should return 404 for missing files", async () => {
    const res = await fetch("http://localhost:3000/missing.txt");
    expect(res.status).toBe(404);
  });
});
```

**Rate Limiting:**

```typescript
describe("Rate Limit Integration", () => {
  it("should block after max requests", async () => {
    const app = new Flash();
    app.use(createRateLimiter({ max: 5, windowMs: 10000 }));
    app.get("/", (req, res) => res.send("OK"));

    await app.listen(3000);

    // Make 5 successful requests
    for (let i = 0; i < 5; i++) {
      const res = await fetch("http://localhost:3000/");
      expect(res.status).toBe(200);
    }

    // 6th request should be blocked
    const res = await fetch("http://localhost:3000/");
    expect(res.status).toBe(429);

    await app.close();
  });
});
```

### Performance Tests

**Compression Benchmark:**

```typescript
import { performance } from "perf_hooks";

describe("Compression Performance", () => {
  it("should compress within reasonable time", async () => {
    const data = "x".repeat(100000); // 100KB
    const start = performance.now();

    const compressed = await gzipAsync(data);

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(50); // Should compress in <50ms

    const ratio = compressed.length / data.length;
    expect(ratio).toBeLessThan(0.1); // Should achieve >90% compression
  });
});
```

---

## 📊 Success Criteria

### Functionality

- [ ] Static file serving works with proper MIME types
- [ ] Route groups and wildcard patterns functional
- [ ] File uploads handled correctly
- [ ] Compression reduces response size by >50% for text
- [ ] Rate limiting blocks excessive requests
- [ ] Validation catches invalid data
- [ ] Cache improves response time by >80% for repeated requests
- [ ] Metrics endpoint provides accurate data

### Performance

- [ ] Static files served in <5ms
- [ ] Compression overhead <20ms for 1MB response
- [ ] Rate limiter checks in <1ms
- [ ] Validation overhead <5ms per request
- [ ] Cache lookup in <1ms
- [ ] Overall throughput still >5000 req/sec

### Code Quality

- [ ] 80%+ test coverage for new code
- [ ] All TypeScript types defined
- [ ] Documentation for all public APIs
- [ ] Zero TypeScript errors
- [ ] All tests passing

---

## 🎓 Key Learnings

### 1. Static File Serving Patterns

- **mmap vs read()**: When to use memory-mapped files
- **Directory traversal**: Security considerations
- **MIME types**: Content type detection

### 2. Compression Strategies

- **When to compress**: Threshold selection
- **Level vs speed**: Balancing compression ratio and CPU
- **Content types**: What to compress, what not to

### 3. Rate Limiting Algorithms

- **Token bucket**: Smooth rate limiting
- **Sliding window**: More accurate than fixed window
- **Memory efficiency**: How to track millions of IPs

### 4. Validation Design

- **Schema-based**: Declarative validation
- **Error messages**: User-friendly feedback
- **Type safety**: TypeScript integration

### 5. Caching Strategies

- **TTL selection**: How long to cache
- **Cache invalidation**: Hardest problem in CS
- **Memory management**: Preventing unbounded growth

---

## 🚀 Implementation Order

### Recommended Sequence:

1. **Start with Static Files** (High value, foundational)

   - Implement FileHandler in C++
   - Create static middleware in TypeScript
   - Test with real files

2. **Add Compression** (Big performance win)

   - Integrate zlib
   - Test compression ratios
   - Benchmark overhead

3. **Implement Validation** (Essential for production)

   - Schema-based validation
   - Comprehensive error messages
   - Test edge cases

4. **Add Rate Limiting** (Security critical)

   - Token bucket implementation
   - Test under load
   - Memory profiling

5. **Build Caching** (Optional but valuable)

   - In-memory cache first
   - Add TTL and cleanup
   - Benchmark improvements

6. **Add Metrics** (Nice to have)
   - Basic counters
   - Timing percentiles
   - Metrics endpoint

---

## 📈 Expected Outcomes

### Performance Improvements

- **Static files**: 10-50x faster than Node.js fs.readFile
- **Compression**: 50-90% bandwidth reduction
- **Caching**: 80-95% response time reduction for cached content
- **Overall**: 20-30% throughput improvement with all features

### Developer Experience

- **Express.js parity**: Similar API, better performance
- **Type safety**: Full TypeScript types
- **Flexibility**: Middleware composability
- **Production-ready**: Rate limiting, validation, metrics

### Learning Outcomes

- **Systems programming**: File I/O, compression, algorithms
- **API design**: Clean, intuitive interfaces
- **Performance**: Optimization techniques
- **Production**: Real-world concerns (security, monitoring)

---

## 🎯 Next Steps After Phase 4

With Phase 4 complete, Flash Framework will have:

- ✅ High-performance C++ core
- ✅ Clean TypeScript API
- ✅ Concurrent request handling
- ✅ Advanced middleware stack
- ✅ Production-ready features

**Phase 5 (Optional):**

- WebSocket support
- Server-Sent Events (SSE)
- HTTP/2 support
- Database connection pooling
- Distributed tracing

---

**Status:** 🚀 READY TO START  
**Estimated Time:** 10-14 days  
**Difficulty:** ⭐⭐⭐⭐☆ (Advanced)  
**Excitement Level:** 🔥🔥🔥🔥🔥

Let's build some awesome features! 🎉
