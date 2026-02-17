import { CodeBlock } from "@/components/ui/code-block";

export default function ResponseApiPage() {
  return (
    <div className="prose prose-zinc dark:prose-invert max-w-none">
      <h1>API: Response</h1>
      <p className="lead text-xl text-muted-foreground">
        The <code>Response</code> object — build and send HTTP responses with chainable methods.
      </p>

      <h2>Import</h2>
      <CodeBlock language="typescript" code='import { Response } from "flash-framework";' />

      <h2>Methods</h2>

      <h3><code>res.status(code)</code></h3>
      <p>Set the HTTP status code. Returns <code>this</code> for chaining.</p>
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
              <td className="py-2 px-3 font-mono">code</td>
              <td className="py-2 px-3 font-mono">number</td>
              <td className="py-2 px-3">HTTP status code (100–599)</td>
            </tr>
          </tbody>
        </table>
      </div>
      <CodeBlock
        language="typescript"
        code={`res.status(200);     // OK
res.status(201);     // Created
res.status(204);     // No Content
res.status(400);     // Bad Request
res.status(404);     // Not Found
res.status(500);     // Internal Server Error`}
      />

      <h3><code>res.header(name, value)</code></h3>
      <p>Set a response header. Returns <code>this</code> for chaining. Header names are stored in lowercase.</p>
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
              <td className="py-2 px-3 font-mono">name</td>
              <td className="py-2 px-3 font-mono">string</td>
              <td className="py-2 px-3">Header name</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 px-3 font-mono">value</td>
              <td className="py-2 px-3 font-mono">string</td>
              <td className="py-2 px-3">Header value</td>
            </tr>
          </tbody>
        </table>
      </div>
      <CodeBlock
        language="typescript"
        code={`res.header("Content-Type", "text/html");
res.header("X-Request-Id", "abc-123");
res.header("Cache-Control", "no-cache");`}
      />

      <h3><code>res.json(data)</code></h3>
      <p>Send a JSON response. Automatically sets <code>Content-Type: application/json</code> and stringifies the data.</p>
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
              <td className="py-2 px-3 font-mono">data</td>
              <td className="py-2 px-3 font-mono">any</td>
              <td className="py-2 px-3">Object to serialize as JSON</td>
            </tr>
          </tbody>
        </table>
      </div>
      <CodeBlock
        language="typescript"
        code={`// Send object
res.json({ message: "Hello" });
// Response body: {"message":"Hello"}

// Send array
res.json([1, 2, 3]);
// Response body: [1,2,3]

// With status code
res.status(201).json({ id: 1, created: true });`}
      />

      <h3><code>res.send(data)</code></h3>
      <p>Send a plain text response.</p>
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
              <td className="py-2 px-3 font-mono">data</td>
              <td className="py-2 px-3 font-mono">string</td>
              <td className="py-2 px-3">Response body as a string</td>
            </tr>
          </tbody>
        </table>
      </div>
      <CodeBlock
        language="typescript"
        code={`res.send("Hello, World!");
res.send("<h1>HTML works too</h1>");
res.status(404).send("Not Found");`}
      />

      <h3><code>res.end()</code></h3>
      <p>End the response without sending a body. Useful for <code>204 No Content</code> responses.</p>
      <CodeBlock language="typescript" code="res.status(204).end();" />

      <h2>Method Chaining</h2>
      <p>
        <code>status()</code> and <code>header()</code> return <code>this</code>, so you can chain them before calling <code>json()</code> or <code>send()</code>:
      </p>
      <CodeBlock
        language="typescript"
        code={`res
  .status(201)
  .header("X-Request-Id", "abc-123")
  .header("Cache-Control", "no-cache")
  .json({ created: true });`}
      />

      <div className="not-prose my-6 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
        <p className="text-sm"><strong>Important:</strong> You can only call <code>send()</code>, <code>json()</code>, or <code>end()</code> <strong>once</strong> per response. Calling them again throws an error: <code>&quot;Response has already been sent.&quot;</code></p>
      </div>

      <h2>Common Patterns</h2>

      <h3>REST API Responses</h3>
      <CodeBlock
        language="typescript"
        code={`// Success
res.json({ data: users });

// Created
res.status(201).json({ id: newUser.id });

// No Content (delete)
res.status(204).end();

// Bad Request
res.status(400).json({ error: "Email is required" });

// Not Found
res.status(404).json({ error: "User not found" });

// Server Error
res.status(500).json({ error: "Something went wrong" });`}
      />

      <h3>Custom Headers</h3>
      <CodeBlock
        language="typescript"
        code={`app.get("/api/data", (req, res) => {
  res
    .header("Cache-Control", "public, max-age=3600")
    .header("X-Powered-By", "Flash")
    .json({ data: "cached for 1 hour" });
});`}
      />

      <h3>Redirect Pattern</h3>
      <CodeBlock
        language="typescript"
        code={`app.get("/old-page", (req, res) => {
  res
    .status(301)
    .header("Location", "/new-page")
    .send("Redirecting...");
});`}
      />
    </div>
  );
}
