import { CodeBlock } from "@/components/ui/code-block";

export default function QuickStartPage() {
  return (
    <div className="prose prose-zinc dark:prose-invert max-w-none">
      <h1>Quick Start</h1>
      <p className="lead text-xl text-muted-foreground">
        Build a REST API with Flash in 5 minutes.
      </p>

      <h2>Step 1: Create Your Server</h2>
      <p>Create a file called <code>server.ts</code>:</p>
      <CodeBlock
        language="typescript"
        filename="server.ts"
        code={`import { Flash, Request, Response } from "flash-framework";

const app = new Flash({ port: 3000, logger: true });`}
      />
      <p>
        The <code>Flash</code> constructor accepts an optional configuration object. Here we set the port and enable request logging.
      </p>

      <h2>Step 2: Add Routes</h2>
      <p>Flash supports all common HTTP methods — <code>get</code>, <code>post</code>, <code>put</code>, and <code>delete</code>:</p>
      <CodeBlock
        language="typescript"
        code={`// Simple GET route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to Flash!" });
});

// GET with route parameters
app.get("/users/:id", (req: Request, res: Response) => {
  const userId = req.params.id;
  res.json({
    id: userId,
    name: \`User \${userId}\`,
    email: \`user\${userId}@example.com\`,
  });
});

// POST route — receive data
app.post("/users", (req: Request, res: Response) => {
  const body = req.body;
  res.status(201).json({
    message: "User created",
    user: body,
  });
});

// PUT route — update data
app.put("/users/:id", (req: Request, res: Response) => {
  res.json({
    message: \`Updated user \${req.params.id}\`,
    data: req.body,
  });
});

// DELETE route
app.delete("/users/:id", (req: Request, res: Response) => {
  res.json({ message: \`Deleted user \${req.params.id}\` });
});`}
      />

      <h2>Step 3: Add a Health Check</h2>
      <p>A common pattern is to add a health check endpoint for monitoring:</p>
      <CodeBlock
        language="typescript"
        code={`app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});`}
      />

      <h2>Step 4: Start the Server</h2>
      <CodeBlock
        language="typescript"
        code={`app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});`}
      />

      <h2>Step 5: Test It</h2>
      <p>Run the server:</p>
      <CodeBlock language="bash" code="npx ts-node server.ts" />

      <p>Then test your routes with <code>curl</code>:</p>
      <CodeBlock
        language="bash"
        code={`# GET request
curl http://localhost:3000/

# GET with parameter
curl http://localhost:3000/users/42

# POST with JSON body
curl -X POST http://localhost:3000/users \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Alice", "email": "alice@example.com"}'

# Health check
curl http://localhost:3000/health`}
      />

      <h2>Full Example</h2>
      <p>Here&apos;s the complete code in one file:</p>
      <CodeBlock
        language="typescript"
        filename="server.ts"
        code={`import { Flash, Request, Response } from "flash-framework";

const app = new Flash({ port: 3000, logger: true });

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to Flash!" });
});

app.get("/users/:id", (req: Request, res: Response) => {
  res.json({
    id: req.params.id,
    name: \`User \${req.params.id}\`,
  });
});

app.post("/users", (req: Request, res: Response) => {
  res.status(201).json({ message: "User created", user: req.body });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});`}
      />

      <h2>Next Steps</h2>
      <ul>
        <li>Learn about <a href="/docs/routing">Routing</a> patterns and dynamic parameters</li>
        <li>Add <a href="/docs/middleware">Middleware</a> for CORS, logging, and body parsing</li>
        <li>Explore the full <a href="/docs/api/server">API Reference</a></li>
      </ul>
    </div>
  );
}
