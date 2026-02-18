# Flash Framework — Technical Deep Dive

## What is Flash?

Flash is a high-performance HTTP server framework that combines a **C++20 core** with a **TypeScript developer API**. It provides an Express-like developer experience while executing performance-critical operations — HTTP parsing, TCP socket management, connection handling, and concurrent request processing — in native C++.

The framework was built from scratch starting October 2025 as a systems programming project to understand how modern web frameworks work at the lowest level.

---

## Performance

| Metric       | Flash   | Express.js | Improvement |
| ------------ | ------- | ---------- | ----------- |
| Requests/sec | 173,244 | 25,088     | 6.9x faster |
| P50 Latency  | 80μs   | 3.7ms      | 46x lower   |

These numbers come from the C++ layer handling raw TCP I/O and HTTP parsing at native speed, while the TypeScript layer provides developer ergonomics without adding meaningful overhead.

---

## Architecture

```
┌─────────────────────────────────────────┐
│     User Application (TypeScript)       │
│     app.get("/route", handler)          │
└───────────────────┬─────────────────────┘
                    │
┌───────────────────┼─────────────────────┐
│  TypeScript API   │                     │
│  Flash · Router · Middleware · Req/Res  │
└───────────────────┬─────────────────────┘
                    │ N-API Bridge
┌───────────────────┼─────────────────────┐
│   C++ Core        │                     │
│   HttpServer · HttpParser · WorkerPool  │
│   HttpRequest · HttpResponse · FileHandler │
└─────────────────────────────────────────┘
```

Flash is structured as a **three-layer system**:

1. **C++ Core** — Low-level TCP server, HTTP parser, worker thread pool, and connection management.
2. **N-API Bridge** — Node.js native addon interface that connects C++ objects to JavaScript.
3. **TypeScript API** — Express-like classes (Flash, Router, Request, Response, Middleware) that developers interact with.

---

## Layer 1: C++ Core

The C++ layer lives in `cpp/include/` (headers) and `cpp/src/` (implementations). It is compiled as a native Node.js addon via `node-gyp` and `binding.gyp`.

### HttpServer (`server.h`, `server.cpp`)

The central component. Manages the entire TCP lifecycle:

- **Socket Creation**: Creates a TCP socket using `socket(AF_INET, SOCK_STREAM, 0)` with `SO_REUSEADDR` and configurable buffer sizes (64KB send/receive).
- **Event Loop**: Uses OS-level I/O multiplexing — `kqueue` on macOS, `epoll` on Linux — for non-blocking event-driven connection handling.
- **Connection Handling**: Accepts incoming connections, reads raw HTTP data into an 8KB buffer, parses requests via `HttpParser`, and writes responses back through `HttpResponse`.
- **Keep-Alive**: Supports persistent connections with a 5-second timeout and up to 1,000 requests per connection (`MAX_KEEPALIVE_REQUESTS`).
- **Concurrency**: Delegates request processing to a `WorkerPool` for multi-threaded execution.
- **RAII**: Follows strict RAII patterns — the constructor acquires the socket, the destructor releases it. Copy is deleted; move is supported.

Key constants:

```
LISTEN_BACKLOG = 1024
READ_BUFFER_SIZE = 8192 (8KB)
SOCKET_SEND_BUFFER = 65536 (64KB)
SOCKET_RECV_BUFFER = 65536 (64KB)
KEEPALIVE_TIMEOUT = 5 seconds
MAX_KEEPALIVE_REQUESTS = 1000
```

### HttpParser (`http_parser.h`, `http_parser.cpp`)

A hand-written HTTP/1.1 parser (no third-party dependencies):

- **Request Line Parsing**: Extracts method, path, and HTTP version from the first line (`GET /hello HTTP/1.1`).
- **Header Parsing**: Iterates through header lines, splits on `: `, trims whitespace, and populates a key-value map.
- **Body Extraction**: Detects the `\r\n\r\n` boundary and extracts the body for POST/PUT requests.
- **Return Type**: Returns `std::optional<HttpRequest>` — either a fully parsed request or `std::nullopt` on parse failure.

### WorkerPool (`worker_pool.h`, `worker_pool.cpp`)

A thread pool for concurrent request processing:

- **Thread Management**: Creates N worker threads (defaults to `std::thread::hardware_concurrency()`).
- **Task Queue**: Uses a `std::queue<std::function<void()>>` protected by a `std::mutex` and `std::condition_variable`.
- **Lifecycle**: `start()` launches threads, `submit(task)` enqueues work, `shutdown()` drains the queue and joins all threads.
- **Thread Safety**: Uses `std::atomic<bool>` for state flags and proper mutex locking for the queue.

### HttpRequest (`http_request.h`, `http_request.cpp`)

A plain data structure representing a parsed HTTP request:

- `method` (string) — GET, POST, PUT, DELETE
- `path` (string) — The URL path
- `version` (string) — HTTP/1.1
- `headers` (map<string, string>) — Key-value header pairs
- `body` (string) — Request body content

### HttpResponse (`http_response.h`, `http_response.cpp`)

Builds HTTP response strings:

- Sets status codes and reason phrases
- Manages response headers
- Serializes the response into a raw HTTP string (status line + headers + body)
- Supports common content types (JSON, HTML, plain text)

### FileHandler (`file_handler.h`, `file_handler.cpp`)

Handles static file serving:

- MIME type detection based on file extension
- File reading and response construction
- Directory traversal protection

---

## Layer 2: N-API Bridge

The bridge between C++ and JavaScript lives in `src/native.ts` and `cpp/binding/`.

### How It Works

1. **Compilation**: `node-gyp` compiles the C++ code into a `.node` binary (`build/Release/flash_native.node`).
2. **Loading**: `native.ts` loads the binary using `require()`.
3. **Type Safety**: TypeScript interfaces (`NativeServer`, `NativeAddon`) define the shape of the C++ objects.
4. **Wrapper**: `NativeServerWrapper` wraps the raw native calls with error handling and TypeScript types.
5. **Graceful Fallback**: If the C++ addon isn't compiled, the framework falls back to Node.js's built-in `http` module. The native addon is optional.

```typescript
// The typed interface for the native C++ server
interface NativeServer {
  start(): void;
  stop(): void;
  isRunning(): boolean;
  getPort(): number;
}
```

---

## Layer 3: TypeScript API

This is what developers interact with. It provides an Express-like API.

### Flash Class (`flash.ts`)

The main entry point. Combines Router, MiddlewareManager, and the HTTP server:

```typescript
const app = new Flash({ port: 5627, logger: true, workers: 4 });

app.use(loggerMiddleware);
app.get("/users/:id", async (req, res) => {
  res.json({ id: req.params.id });
});

app.listen(5627);
```

**Internal Flow** (per request):

1. Node's `http.createServer` receives a raw `IncomingMessage`.
2. Flash reads the body (for POST/PUT), parses the URL, extracts query params, and converts headers.
3. A `Request` object and `Response` object are created.
4. Global middleware is executed via `MiddlewareManager.execute()`.
5. The `Router.handleRequest()` finds a matching route and invokes the handler.
6. The `Response` object writes back to the Node.js `ServerResponse`.

### Router (`router.ts`)

Pattern-matching HTTP router:

- **Route Registration**: `get()`, `post()`, `put()`, `delete()` register handler functions for path patterns.
- **Path Parameters**: Supports `:param` syntax (e.g., `/users/:id/posts/:postId`).
- **Pattern Compilation**: Each registered path is compiled into a `RegExp` at registration time (not per-request).
- **Matching**: On each request, iterates through registered routes, tests the regex, and extracts named parameters.
- **Method Chaining**: All registration methods return `this` for fluent API usage.

### Request (`request.ts`)

Immutable request data object:

- `method`, `path`, `params`, `query`, `headers`, `body` — all `readonly`
- Helper methods: `getHeader()` (case-insensitive), `hasHeader()`, `getQueryParam()`, `getRouteParam()`

### Response (`response.ts`)

Chainable response builder:

- `status(code)` — Set HTTP status (validates 100-599)
- `header(name, value)` — Set response header (case-insensitive storage)
- `json(data)` — Serialize and send JSON
- `send(data)` — Send raw string
- `end()` — Close the response
- Double-send protection (throws if response already sent)

### Middleware (`middleware/index.ts`)

Composable middleware pipeline:

- **MiddlewareManager**: Stores an array of middleware functions and executes them sequentially.
- **Signature**: `(req: Request, res: Response, next: NextFunction) => void`
- **Built-in Factories**:
  - `createLoggerMiddleware()` — Logs `→ METHOD /path` and `← METHOD /path (Xms)`
  - `createCorsMiddleware(options)` — Sets CORS headers, handles preflight OPTIONS
  - `createJsonBodyParser()` — Parses JSON request bodies
  - `createErrorHandler()` — Global error handler with dev/prod mode awareness

---

## Project Structure

```
flash/
├── cpp/                          # C++ Core
│   ├── include/                  # Public headers
│   │   ├── server.h              # TCP server (kqueue/epoll)
│   │   ├── http_parser.h         # HTTP/1.1 parser
│   │   ├── http_request.h        # Request data structure
│   │   ├── http_response.h       # Response builder
│   │   ├── worker_pool.h         # Thread pool
│   │   └── file_handler.h        # Static file serving
│   ├── src/                      # Implementations
│   │   ├── server.cpp            # Server implementation (19KB)
│   │   ├── http_parser.cpp       # Parser implementation
│   │   ├── http_response.cpp     # Response implementation
│   │   ├── worker_pool.cpp       # Thread pool implementation
│   │   ├── file_handler.cpp      # File handler implementation
│   │   └── main.cpp              # N-API module registration
│   ├── binding/                  # N-API bridge code
│   └── tests/                    # C++ unit tests
├── src/                          # TypeScript API
│   ├── flash.ts                  # Main Flash class
│   ├── router.ts                 # HTTP router
│   ├── request.ts                # Request wrapper
│   ├── response.ts               # Response wrapper
│   ├── middleware/index.ts       # Middleware system
│   ├── native.ts                 # N-API wrapper
│   ├── server.ts                 # Server bridge
│   ├── types.ts                  # Shared type definitions
│   └── index.ts                  # Public exports
├── tests/                        # Test suites
├── benchmarks/                   # Performance benchmarks
├── examples/                     # Example applications
├── docs/website/                 # Documentation website (Next.js)
├── CMakeLists.txt                # C++ build config
├── binding.gyp                   # Node-gyp config
├── package.json                  # Node.js manifest
└── tsconfig.json                 # TypeScript config
```

---

## Build System

Flash uses a dual build system:

1. **C++ Build**: `node-gyp` (configured via `binding.gyp`) compiles the C++ source into a native `.node` addon. CMake is used for standalone C++ builds and testing.
2. **TypeScript Build**: `tsc` compiles TypeScript to JavaScript in the `dist/` directory.
3. **Docker**: A Dockerfile and docker-compose.yml provide a containerized development environment with hot-reloading and all dependencies pre-installed.

Key build commands:

```bash
npm run build          # Build both C++ and TypeScript
npm run build:cpp      # Build C++ addon only (node-gyp rebuild)
npm run build:ts       # Build TypeScript only (tsc)
npm run test           # Run TypeScript tests (Jest)
npm run test:cpp       # Run C++ tests (CTest)
npm run benchmark      # Run performance benchmarks
```

---

## Documentation Website

The documentation site is a **Next.js** application located in `docs/website/`. It features:

- A modern landing page with animated hero section and Bento Grid feature showcase
- Full API reference pages for Server, Request, Response, Router, and Middleware
- Custom branding with a geometric lightning bolt logo
- Dark-mode-first design with glassmorphism and spotlight effects
- Built with Tailwind CSS, Framer Motion, and Lucide icons

---

## Technology Stack

| Layer            | Technology                                       | Purpose                                |
| ---------------- | ------------------------------------------------ | -------------------------------------- |
| Core Server      | C++20                                            | TCP sockets, HTTP parsing, thread pool |
| I/O Multiplexing | kqueue (macOS) / epoll (Linux)                   | Non-blocking event-driven I/O          |
| Concurrency      | std::thread, std::mutex, std::condition_variable | Worker thread pool                     |
| Bridge           | Node.js N-API                                    | Connect C++ objects to JavaScript      |
| API              | TypeScript                                       | Developer-facing framework API         |
| Build (C++)      | node-gyp, CMake                                  | Native addon compilation               |
| Build (TS)       | tsc                                              | TypeScript compilation                 |
| Testing          | Jest (TS), CTest (C++)                           | Unit and integration tests             |
| Docs Website     | Next.js, Tailwind CSS, Framer Motion             | Documentation                          |
| Containerization | Docker, Docker Compose                           | Development environment                |

---

## Design Decisions

1. **Why C++ for the core?** JavaScript is single-threaded and garbage-collected. For raw TCP I/O and HTTP parsing, C++ eliminates GC pauses and allows direct system call access (kqueue/epoll), resulting in significantly lower latency.
2. **Why N-API and not FFI?** N-API is the official, stable, ABI-compatible interface for Node.js native addons. It survives Node.js version upgrades without recompilation, unlike raw V8 bindings.
3. **Why a hand-written HTTP parser?** Third-party parsers (like llhttp) add dependencies and complexity. A custom parser optimized for our use case keeps the codebase minimal and educational.
4. **Why Express-like API?** Express is the most widely understood Node.js API. Matching its patterns (`app.get()`, `req.params`, `res.json()`) removes the learning curve while delivering fundamentally different performance.
5. **Why optional native addon?** Not all environments have C++ compilers. Flash gracefully falls back to Node.js's built-in `http` module, so the TypeScript API always works regardless of native compilation.

---

## Author

Created by **Meet Patel**

- Website: [meetpatel.live](https://meetpatel.live)
- GitHub: [JUSTMEETPATEL](https://github.com/JUSTMEETPATEL)

---

## License

MIT License. See [LICENSE](./LICENSE) for details.
