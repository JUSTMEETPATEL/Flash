import Link from "next/link";
import { CodeBlock } from "@/components/ui/code-block";

export default function DocsPage() {
  return (
    <div className="prose prose-zinc dark:prose-invert max-w-none">
      <h1>Introduction</h1>
      <p className="lead text-xl text-muted-foreground">
        Flash is a high-performance HTTP server framework for Node.js, powered by a C++ core. It gives you <strong>Express-like simplicity</strong> with <strong>153,000 req/s performance</strong>.
      </p>

      <div className="not-prose my-8 flex gap-4">
        <Link
          href="/docs/installation"
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Get Started →
        </Link>
        <Link
          href="/docs/quick-start"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent transition-colors"
        >
          Quick Start Guide
        </Link>
      </div>

      <h2>Why Flash?</h2>
      <p>
        Node.js is great for developer experience, but raw HTTP throughput can be a bottleneck. Flash bridges the gap between C++ performance and TypeScript developer experience.
      </p>

      <div className="not-prose my-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "⚡ Fast", desc: "153k req/s — 6x faster than Express in raw I/O throughput." },
          { title: "✍️ Familiar", desc: "Express-like API. If you know Express, you already know Flash." },
          { title: "🔒 Type-safe", desc: "Written in TypeScript with full type definitions included." },
        ].map((item) => (
          <div key={item.title} className="rounded-lg border border-border/50 p-4">
            <h3 className="text-base font-semibold mb-1">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>

      <h2>Quick Example</h2>
      <CodeBlock
        language="typescript"
        code={`import { Flash } from "flash-framework";

const app = new Flash();

app.get("/", (req, res) => {
  res.json({ message: "Hello, World!" });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});`}
      />

      <h2>Architecture</h2>
      <p>
        Flash uses N-API to bind a multi-threaded C++ HTTP server to Node.js. Request handling happens in C++ worker threads, while your business logic runs in the Node.js event loop. The primary <code>Flash</code> class also works without the C++ addon, using Node&apos;s built-in <code>http</code> module as a fallback.
      </p>

      <p>
        Ready to get started? <Link href="/docs/installation" className="text-primary hover:underline">Install Flash</Link> or jump right into the <Link href="/docs/quick-start" className="text-primary hover:underline">Quick Start guide</Link>.
      </p>
    </div>
  );
}
