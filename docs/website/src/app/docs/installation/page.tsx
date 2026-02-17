import { CodeBlock } from "@/components/ui/code-block";

export default function InstallationPage() {
  return (
    <div className="prose prose-zinc dark:prose-invert max-w-none">
      <h1>Installation</h1>
      <p className="lead text-xl text-muted-foreground">
        Get Flash up and running in under a minute.
      </p>

      <h2>Prerequisites</h2>
      <ul>
        <li><strong>Node.js 20+</strong> — <a href="https://nodejs.org" target="_blank" rel="noreferrer">Download</a></li>
        <li><strong>npm</strong> (comes with Node.js)</li>
      </ul>

      <h2>Install via npm</h2>
      <CodeBlock language="bash" code="npm install flash-framework" />

      <p>That&apos;s it. The core Flash API uses Node&apos;s built-in <code>http</code> module and works out of the box — no C++ compiler required.</p>

      <h2>Optional: Native C++ Addon</h2>
      <p>
        For maximum performance, Flash includes an optional native C++ server. To use it, you&apos;ll need a C++ compiler:
      </p>
      <ul>
        <li><strong>macOS:</strong> <code>xcode-select --install</code></li>
        <li><strong>Ubuntu/Debian:</strong> <code>sudo apt install build-essential</code></li>
        <li><strong>Windows:</strong> Install <a href="https://visualstudio.microsoft.com/visual-cpp-build-tools/" target="_blank" rel="noreferrer">Visual C++ Build Tools</a></li>
      </ul>
      <p>Then build the native addon:</p>
      <CodeBlock language="bash" code="npm run build:cpp" />

      <h2>Create a New Project</h2>
      <p>Start a new project from scratch:</p>
      <CodeBlock
        language="bash"
        code={`# Create project directory
mkdir my-flash-app && cd my-flash-app

# Initialize Node.js project
npm init -y

# Install Flash
npm install flash-framework

# Install TypeScript (recommended)
npm install -D typescript @types/node ts-node

# Create tsconfig.json
npx tsc --init`}
      />

      <h2>Project Structure</h2>
      <p>A typical Flash project looks like this:</p>
      <CodeBlock
        language="bash"
        code={`my-flash-app/
├── src/
│   └── server.ts      # Your server code
├── package.json
└── tsconfig.json`}
      />

      <h2>Verify Installation</h2>
      <p>Create <code>src/server.ts</code>:</p>
      <CodeBlock
        language="typescript"
        filename="src/server.ts"
        code={`import { Flash } from "flash-framework";

const app = new Flash();

app.get("/", (req, res) => {
  res.json({ message: "Flash is working!" });
});

app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});`}
      />

      <p>Run it:</p>
      <CodeBlock language="bash" code="npx ts-node src/server.ts" />
      <p>
        Open <code>http://localhost:3000</code> in your browser. You should see <code>{`{"message":"Flash is working!"}`}</code>.
      </p>
    </div>
  );
}
