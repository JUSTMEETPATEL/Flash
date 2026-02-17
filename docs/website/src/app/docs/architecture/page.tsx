import { CodeBlock } from "@/components/ui/code-block";

export default function ArchitecturePage() {
  return (
    <div className="prose prose-zinc dark:prose-invert max-w-none">
      <h1>Architecture</h1>
      <p className="lead text-xl text-muted-foreground">
        How Flash achieves C++ speed with TypeScript simplicity.
      </p>

      <h2>Overview</h2>
      <p>
        Flash has a <strong>dual-layer architecture</strong>: a high-level TypeScript API that any Node.js developer can use, and an optional low-level C++ server for maximum throughput.
      </p>

      <CodeBlock
        language="bash"
        code={`┌──────────────────────────────────────────┐
│           Your Application Code          │
│          (TypeScript / JavaScript)        │
├──────────────────────────────────────────┤
│              Flash API Layer             │
│   Flash · Router · Middleware · Request  │
│              Response · Types            │
├──────────────────────────────────────────┤
│          Node.js http module             │
│    (default, works everywhere)           │
├──────────────┬───────────────────────────┤
│  Optional:   │   C++ Native Server       │
│  N-API       │   (worker pool, epoll)    │
│  Bridge      │   173k req/s              │
└──────────────┴───────────────────────────┘`}
      />

      <h2>The Two Modes</h2>

      <h3>Standard Mode (Default)</h3>
      <p>
        When you <code>import {"{ Flash }"} from &quot;flash-framework&quot;</code>, you get a server built on Node.js&apos;s built-in <code>http</code> module. This works on any platform, requires no C++ compiler, and provides the full Express-like API:
      </p>
      <CodeBlock
        language="typescript"
        code={`import { Flash } from "flash-framework";

const app = new Flash();
app.get("/", (req, res) => res.json({ hello: "world" }));
app.listen(3000);`}
      />

      <h3>Native Mode (Optional)</h3>
      <p>
        For advanced users who need maximum throughput, Flash provides a <code>NativeServerWrapper</code> that binds directly to a C++ HTTP server via N-API:
      </p>
      <CodeBlock
        language="typescript"
        code={`import { NativeServerWrapper } from "flash-framework";

// Requires: npm run build:cpp
const server = new NativeServerWrapper(3000);
server.start();`}
      />

      <h2>Request Lifecycle</h2>
      <p>Here&apos;s how a request flows through Flash in standard mode:</p>
      <CodeBlock
        language="bash"
        code={`Client Request
      │
      ▼
 Node.js http.Server
      │
      ▼
 Flash.listen() handler
      │
      ├── 1. Parse URL → path + query
      ├── 2. Parse headers → Record<string, string>
      ├── 3. Read body (POST/PUT)
      │
      ▼
 Create Request & Response objects
      │
      ▼
 Run global middleware chain
      │
      ▼
 Router.handleRequest()
      ├── Match route pattern
      ├── Extract :params
      └── Call route handler
      │
      ▼
 Response sent to client`}
      />

      <h2>Key Components</h2>

      <div className="not-prose my-6 space-y-4">
        {[
          { name: "Flash", desc: "Main application class. Creates the HTTP server, registers routes, manages middleware, and handles the request/response cycle." },
          { name: "Router", desc: "Pattern-matching engine. Converts route patterns like /users/:id into regex, extracts parameters, and dispatches to handlers." },
          { name: "Request", desc: "Read-only wrapper around the incoming HTTP request. Provides access to method, path, params, query, headers, and body." },
          { name: "Response", desc: "Builder for HTTP responses. Supports method chaining: res.status(201).header('X-Custom', 'value').json(data)." },
          { name: "MiddlewareManager", desc: "Runs a chain of middleware functions before the route handler executes. Supports async middleware." },
        ].map((comp) => (
          <div key={comp.name} className="rounded-lg border border-border/50 p-4">
            <h4 className="text-sm font-semibold font-mono mb-1">{comp.name}</h4>
            <p className="text-sm text-muted-foreground">{comp.desc}</p>
          </div>
        ))}
      </div>

      <h2>C++ Native Layer</h2>
      <p>
        The optional C++ layer is compiled via <code>node-gyp</code> and provides:
      </p>
      <ul>
        <li><strong>Worker Pool</strong> — Multi-threaded request handling with configurable thread count</li>
        <li><strong>Custom HTTP Parser</strong> — Zero-copy parsing written in C++20</li>
        <li><strong>Direct Socket I/O</strong> — Bypasses Node.js&apos;s libuv for raw TCP performance</li>
      </ul>
      <p>
        The native addon is bound to Node.js via <strong>N-API</strong>, ensuring ABI stability across Node.js versions.
      </p>
    </div>
  );
}
