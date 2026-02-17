import { CodeBlock } from "@/components/ui/code-block";

export default function ServerApiPage() {
  return (
    <div className="prose prose-zinc dark:prose-invert max-w-none">
      <h1>API: Server (Flash)</h1>
      <p className="lead text-xl text-muted-foreground">
        The main <code>Flash</code> class — your application entry point.
      </p>

      <h2>Import</h2>
      <CodeBlock language="typescript" code='import { Flash } from "flash-framework";' />

      <h2>Constructor</h2>
      <CodeBlock language="typescript" code="const app = new Flash(options?: FlashOptions);" />

      <h3>FlashOptions</h3>
      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 font-semibold">Option</th>
              <th className="text-left py-2 px-3 font-semibold">Type</th>
              <th className="text-left py-2 px-3 font-semibold">Default</th>
              <th className="text-left py-2 px-3 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/50">
              <td className="py-2 px-3 font-mono">port</td>
              <td className="py-2 px-3 font-mono">number</td>
              <td className="py-2 px-3 font-mono">5627</td>
              <td className="py-2 px-3">Default port for <code>listen()</code></td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 px-3 font-mono">logger</td>
              <td className="py-2 px-3 font-mono">boolean</td>
              <td className="py-2 px-3 font-mono">true</td>
              <td className="py-2 px-3">Log server start message</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 px-3 font-mono">workers</td>
              <td className="py-2 px-3 font-mono">number</td>
              <td className="py-2 px-3 font-mono">4</td>
              <td className="py-2 px-3">Number of worker threads (native mode)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <CodeBlock
        language="typescript"
        code={`// All options are optional
const app = new Flash();

// With configuration
const app = new Flash({
  port: 3000,
  logger: true,
  workers: 8,
});`}
      />

      <h2>Methods</h2>

      <h3><code>app.get(path, handler)</code></h3>
      <p>Register a <code>GET</code> route.</p>
      <CodeBlock
        language="typescript"
        code={`app.get("/users", (req, res) => {
  res.json([{ id: 1, name: "Alice" }]);
});`}
      />

      <h3><code>app.post(path, handler)</code></h3>
      <p>Register a <code>POST</code> route.</p>
      <CodeBlock
        language="typescript"
        code={`app.post("/users", (req, res) => {
  res.status(201).json({ created: true });
});`}
      />

      <h3><code>app.put(path, handler)</code></h3>
      <p>Register a <code>PUT</code> route.</p>
      <CodeBlock
        language="typescript"
        code={`app.put("/users/:id", (req, res) => {
  res.json({ updated: req.params.id });
});`}
      />

      <h3><code>app.delete(path, handler)</code></h3>
      <p>Register a <code>DELETE</code> route.</p>
      <CodeBlock
        language="typescript"
        code={`app.delete("/users/:id", (req, res) => {
  res.json({ deleted: req.params.id });
});`}
      />

      <h3><code>app.use(middleware)</code></h3>
      <p>Register a global middleware function.</p>
      <CodeBlock
        language="typescript"
        code={`app.use((req, res, next) => {
  console.log(\`\${req.method} \${req.path}\`);
  next();
});`}
      />
      <p>Returns <code>this</code> for chaining.</p>

      <h3><code>app.listen(port?, callback?)</code></h3>
      <p>Start the server and listen for connections.</p>
      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 font-semibold">Param</th>
              <th className="text-left py-2 px-3 font-semibold">Type</th>
              <th className="text-left py-2 px-3 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/50">
              <td className="py-2 px-3 font-mono">port</td>
              <td className="py-2 px-3 font-mono">number?</td>
              <td className="py-2 px-3">Overrides the port from options</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 px-3 font-mono">callback</td>
              <td className="py-2 px-3 font-mono">() =&gt; void</td>
              <td className="py-2 px-3">Called when server starts listening</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>Returns the underlying <code>http.Server</code> instance.</p>
      <CodeBlock
        language="typescript"
        code={`// Simple
app.listen(3000);

// With callback
app.listen(3000, () => {
  console.log("Server ready!");
});

// Use default port from options
app.listen();`}
      />

      <h3><code>app.close(callback?)</code></h3>
      <p>Gracefully stop the server.</p>
      <CodeBlock
        language="typescript"
        code={`app.close(() => {
  console.log("Server stopped.");
});`}
      />

      <h2>Factory Function</h2>
      <p>You can also use the <code>createFlash</code> factory:</p>
      <CodeBlock
        language="typescript"
        code={`import { createFlash } from "flash-framework";

const app = createFlash({ port: 3000 });`}
      />
    </div>
  );
}
