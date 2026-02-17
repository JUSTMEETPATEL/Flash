import { CodeBlock } from "@/components/ui/code-block";
import { MiddlewareFlow } from "@/components/docs/MiddlewareFlow";

export default function MiddlewarePage() {
  return (
    <div className="prose prose-zinc dark:prose-invert max-w-none">
      <h1>Middleware</h1>
      <p className="lead text-xl text-muted-foreground">
        Add cross-cutting logic like logging, CORS, and body parsing with <code>app.use()</code>.
      </p>

      <h2>What is Middleware?</h2>
      <p>
        Middleware functions run <strong>before</strong> your route handlers. They can modify the request, add headers to the response, log data, or reject requests entirely.
      </p>

      <CodeBlock
        language="bash"
        code="Request  →  Middleware 1  →  Middleware 2  →  Route Handler  →  Response"
      />

      <MiddlewareFlow />

      <h2>Using Middleware</h2>
      <p>
        Register middleware with <code>app.use()</code>. Middleware runs in the order it&apos;s registered:
      </p>

      <CodeBlock
        language="typescript"
        code={`import { Flash, Request, Response } from "flash-framework";

const app = new Flash();

// This runs for every request
app.use((req, res, next) => {
  console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.path}\`);
  next(); // Call next() to continue to the next middleware/route
});

app.get("/", (req, res) => {
  res.json({ message: "Hello!" });
});

app.listen(3000);`}
      />

      <div className="not-prose my-6 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
        <p className="text-sm"><strong>Important:</strong> Always call <code>next()</code> in your middleware! If you don&apos;t, the request will hang and never reach your route handler.</p>
      </div>

      <h2>Built-in Middleware</h2>
      <p>
        Flash comes with a set of common middleware factories in headers.
      </p>

      <h3>Logger</h3>
      <p>Logs request method, path, and duration.</p>
      <CodeBlock
        language="typescript"
        code={`import { logger } from "flash-framework/middleware";

app.use(logger());`}
      />

      <h3>CORS</h3>
      <p>Enables Cross-Origin Resource Sharing. Configurable options.</p>
      <CodeBlock
        language="typescript"
        code={`import { cors } from "flash-framework/middleware";

// Default (allows all)
app.use(cors());

// Custom config
app.use(cors({
  origin: "https://example.com",
  methods: ["GET", "POST"],
  headers: ["Content-Type", "Authorization"],
}));`}
      />

      <h3>JSON Body Parser</h3>
      <p>Parses incoming JSON request bodies and populates <code>req.body</code>.</p>
      <CodeBlock
        language="typescript"
        code={`import { json } from "flash-framework/middleware";

app.use(json());

app.post("/data", (req, res) => {
  // Without this middleware, req.body would be a string
  console.log(req.body.someKey);
  res.json({ received: true });
});`}
      />

      <h3>Error Handler</h3>
      <p> Catches errors thrown in routes. </p>
      <CodeBlock
        language="typescript"
        code={`import { errorHandler } from "flash-framework/middleware";

app.use(errorHandler());

// If a route throws, this middleware catches it and sends a 500 response
app.get("/error", () => {
  throw new Error("Boom!");
});`}
      />

      <h2>Middleware Signature</h2>
      <p>
        Middleware functions take 3 arguments: <code>req</code>, <code>res</code>, and <code>next</code>.
      </p>

      <CodeBlock
        language="typescript"
        code={`type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;`}
      />

      <h2>Custom Middleware Patterns</h2>

      <h3>Authentication Middleware</h3>
      <CodeBlock
        language="typescript"
        code={`const requireAuth = (req: Request, res: Response, next: () => void) => {
  const token = req.getHeader("Authorization");

  if (!token || token !== "secret-token") {
    res.status(401).json({ error: "Unauthorized" });
    return; // Don't call next(), stop request here
  }

  next();
};

app.use(requireAuth);`}
      />
    </div>
  );
}
