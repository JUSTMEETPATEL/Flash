import { CodeBlock } from "@/components/ui/code-block";

export default function RoutingPage() {
  return (
    <div className="prose prose-zinc dark:prose-invert max-w-none">
      <h1>Routing</h1>
      <p className="lead text-xl text-muted-foreground">
        Define routes with an Express-like API. Support for dynamic parameters, query strings, and all HTTP methods.
      </p>

      <h2>Basic Routes</h2>
      <p>
        Routes are defined on the <code>Flash</code> instance using methods named after HTTP verbs:
      </p>

      <CodeBlock
        language="typescript"
        code={`import { Flash, Request, Response } from "flash-framework";

const app = new Flash();

// GET request
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

// POST request
app.post("/users", (req: Request, res: Response) => {
  res.status(201).json({ created: true });
});

// PUT request
app.put("/users/:id", (req: Request, res: Response) => {
  res.json({ updated: req.params.id });
});

// DELETE request
app.delete("/users/:id", (req: Request, res: Response) => {
  res.json({ deleted: req.params.id });
});

app.listen(3000);`}
      />

      <h2>Route Parameters</h2>
      <p>
        You can define dynamic route parameters using the colon syntax (<code>:paramName</code>). They are accessible via <code>req.params</code>.
      </p>

      <CodeBlock
        language="typescript"
        code={`app.get("/users/:userId/posts/:postId", (req, res) => {
  const { userId, postId } = req.params;
  
  res.json({
    user: userId,
    post: postId,
  });
});`}
      />

      <div className="not-prose my-6 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
        <p className="text-sm"><strong>How it works:</strong> Flash converts <code>/users/:id</code> into the regex <code>{`/^\\/users\\/([^\\/]+)$/`}</code> and extracts matched groups as parameter values.</p>
      </div>

      <h2>Query Strings</h2>
      <p>
        Query string parameters are automatically parsed and available in <code>req.query</code>.
      </p>

      <CodeBlock
        language="typescript"
        code={`// GET /search?q=flash&limit=10
app.get("/search", (req, res) => {
  const query = req.query.q;
  const limit = req.query.limit;

  res.json({
    results: [],
    meta: { query, limit },
  });
});`}
      />

      <p>You can also use the helper method:</p>
      <pre className="bg-zinc-900 rounded-lg p-4 overflow-x-auto"><code className="text-sm text-zinc-300">{`const page = req.getQueryParam("page");   // "1" or undefined
const sort = req.getQueryParam("sort");   // "name" or undefined`}</code></pre>

      <h2>Request Body</h2>
      <p>
        To access the request body, use <code>req.body</code>. For JSON bodies, ensure you used the JSON middleware (or parse it manually if using raw Flash).
      </p>

      <CodeBlock
        language="typescript"
        code={`import { json } from "flash-framework/middleware";

app.use(json());

app.post("/api/data", (req, res) => {
  // req.body is now a JavaScript object
  console.log(req.body); 
  res.json({ received: req.body });
});`}
      />

      <div className="not-prose my-6 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
        <p className="text-sm"><strong>Tip:</strong> Use the built-in <code>createJsonBodyParser()</code> middleware to automatically parse JSON bodies. See the <a href="/docs/middleware" className="text-primary hover:underline">Middleware</a> docs.</p>
      </div>

      <h2>Route Handler Signature</h2>
      <p>Every route handler receives two arguments:</p>
      <pre className="bg-zinc-900 rounded-lg p-4 overflow-x-auto"><code className="text-sm text-zinc-300">{`type RouteHandler = (req: Request, res: Response) => void | Promise<void>;`}</code></pre>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 font-semibold">Argument</th>
              <th className="text-left py-2 px-3 font-semibold">Type</th>
              <th className="text-left py-2 px-3 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/50">
              <td className="py-2 px-3 font-mono">req</td>
              <td className="py-2 px-3 font-mono">Request</td>
              <td className="py-2 px-3">Incoming request data (method, path, params, query, headers, body)</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 px-3 font-mono">res</td>
              <td className="py-2 px-3 font-mono">Response</td>
              <td className="py-2 px-3">Response builder with chainable methods (status, header, json, send)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Async Handlers</h2>
      <p>Route handlers can be <code>async</code> — Flash handles promises automatically:</p>
      <pre className="bg-zinc-900 rounded-lg p-4 overflow-x-auto"><code className="text-sm text-zinc-300">{`app.get("/users/:id", async (req, res) => {
  const user = await fetchUserFromDatabase(req.params.id);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(user);
});`}</code></pre>

      <h2>Method Chaining</h2>
      <p>Route methods return <code>this</code>, so you can chain them:</p>
      <pre className="bg-zinc-900 rounded-lg p-4 overflow-x-auto"><code className="text-sm text-zinc-300">{`const app = new Flash()
  .get("/", (req, res) => res.send("Home"))
  .get("/about", (req, res) => res.send("About"))
  .get("/contact", (req, res) => res.send("Contact"));

app.listen(3000);`}</code></pre>
    </div>
  );
}
