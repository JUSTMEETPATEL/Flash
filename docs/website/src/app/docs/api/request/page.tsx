import { CodeBlock } from "@/components/ui/code-block";

export default function RequestApiPage() {
  return (
    <div className="prose prose-zinc dark:prose-invert max-w-none">
      <h1>API: Request</h1>
      <p className="lead text-xl text-muted-foreground">
        The <code>Request</code> object — read-only access to incoming HTTP request data.
      </p>

      <h2>Import</h2>
      <CodeBlock language="typescript" code='import { Request } from "flash-framework";' />

      <h2>Properties</h2>
      <p>All properties are <strong>read-only</strong>:</p>
      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 font-semibold">Property</th>
              <th className="text-left py-2 px-3 font-semibold">Type</th>
              <th className="text-left py-2 px-3 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/50">
              <td className="py-2 px-3 font-mono">method</td>
              <td className="py-2 px-3 font-mono">string</td>
              <td className="py-2 px-3">HTTP method (<code>&quot;GET&quot;</code>, <code>&quot;POST&quot;</code>, etc.)</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 px-3 font-mono">path</td>
              <td className="py-2 px-3 font-mono">string</td>
              <td className="py-2 px-3">URL path without query string (<code>&quot;/users/42&quot;</code>)</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 px-3 font-mono">params</td>
              <td className="py-2 px-3 font-mono">{`Record<string, string>`}</td>
              <td className="py-2 px-3">Route parameters (<code>{`{ id: "42" }`}</code>)</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 px-3 font-mono">query</td>
              <td className="py-2 px-3 font-mono">{`Record<string, string>`}</td>
              <td className="py-2 px-3">Query string parameters (<code>{`{ page: "1" }`}</code>)</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 px-3 font-mono">headers</td>
              <td className="py-2 px-3 font-mono">{`Record<string, string>`}</td>
              <td className="py-2 px-3">Request headers</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 px-3 font-mono">body</td>
              <td className="py-2 px-3 font-mono">any?</td>
              <td className="py-2 px-3">Request body (string by default, object with JSON parser)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Example: Accessing Properties</h2>
      <CodeBlock
        language="typescript"
        code={`// Route: /users/:id?role=admin
// Request: GET /users/42?role=admin

app.get("/users/:id", (req, res) => {
  req.method;      // "GET"
  req.path;        // "/users/42"
  req.params.id;   // "42"
  req.query.role;  // "admin"
  req.headers;     // { "host": "localhost:3000", ... }

  res.json({ user: req.params.id });
});`}
      />

      <h2>Methods</h2>

      <h3><code>req.getHeader(name)</code></h3>
      <p>Get a header value by name. <strong>Case-insensitive.</strong></p>
      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 font-semibold">Param</th>
              <th className="text-left py-2 px-3 font-semibold">Type</th>
              <th className="text-left py-2 px-3 font-semibold">Returns</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/50">
              <td className="py-2 px-3 font-mono">name</td>
              <td className="py-2 px-3 font-mono">string</td>
              <td className="py-2 px-3 font-mono">string | undefined</td>
            </tr>
          </tbody>
        </table>
      </div>
      <CodeBlock
        language="typescript"
        code={`const contentType = req.getHeader("Content-Type");   // "application/json"
const auth = req.getHeader("authorization");          // "Bearer token..."
const missing = req.getHeader("X-Custom");            // undefined`}
      />

      <h3><code>req.hasHeader(name)</code></h3>
      <p>Check if a header exists. <strong>Case-insensitive.</strong></p>
      <CodeBlock
        language="typescript"
        code={`if (req.hasHeader("Authorization")) {
  // User sent auth credentials
}

if (!req.hasHeader("Content-Type")) {
  res.status(400).json({ error: "Missing Content-Type" });
  return;
}`}
      />

      <h3><code>req.getQueryParam(name)</code></h3>
      <p>Get a query parameter value.</p>
      <CodeBlock
        language="typescript"
        code={`// GET /search?q=flash&limit=10
const q = req.getQueryParam("q");         // "flash"
const limit = req.getQueryParam("limit"); // "10"
const page = req.getQueryParam("page");   // undefined`}
      />

      <h3><code>req.getRouteParam(name)</code></h3>
      <p>Get a route parameter value.</p>
      <CodeBlock
        language="typescript"
        code={`// Route: /users/:userId/posts/:postId
// Request: GET /users/5/posts/99

const userId = req.getRouteParam("userId");   // "5"
const postId = req.getRouteParam("postId");   // "99"
const missing = req.getRouteParam("other");   // undefined`}
      />

      <h2>Common Patterns</h2>

      <h3>Type-safe Parameter Parsing</h3>
      <CodeBlock
        language="typescript"
        code={`app.get("/users/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  res.json({ userId: id });
});`}
      />

      <h3>Pagination from Query Params</h3>
      <CodeBlock
        language="typescript"
        code={`app.get("/posts", (req, res) => {
  const page = parseInt(req.query.page || "1", 10);
  const limit = parseInt(req.query.limit || "20", 10);
  const offset = (page - 1) * limit;

  res.json({ page, limit, offset, data: [] });
});`}
      />
    </div>
  );
}
