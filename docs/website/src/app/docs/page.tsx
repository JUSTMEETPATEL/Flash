export default function DocsPage() {
  return (
    <div className="prose prose-zinc dark:prose-invert max-w-none">
      <h1>Introduction</h1>
      <p className="lead">
        Flash is a high-performance HTTP server framework for Node.js, built on top of a C++ core.
      </p>
      
      <h2>Why Flash?</h2>
      <p>
        Node.js is great, but sometimes you need raw speed. Flash bridges the gap between C++ performance and TypeScript developer experience.
      </p>
      
      <ul>
        <li><strong>Speed:</strong> 173k requests per second benchmark.</li>
        <li><strong>Ease:</strong> Write standard TypeScript code.</li>
        <li><strong>Modern:</strong> Built for C++20 and Node.js 20+.</li>
      </ul>

      <h2>Architecture</h2>
      <p>
        Flash uses N-API to bind a multi-threaded C++ HTTP server to Node.js. Request handling happens in C++ worker threads, while your business logic runs in the Node.js event loop (or optional C++ handlers).
      </p>
    </div>
  );
}
