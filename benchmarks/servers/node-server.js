/**
 * Pure Node.js HTTP Server Benchmark
 * 
 * Baseline comparison using only Node.js built-in http module
 */

const http = require('http');
const url = require('url');

// Simple router
const routes = new Map();

function addRoute(method, path, handler) {
  const key = `${method}:${path}`;
  routes.set(key, handler);
}

// Parse path parameters
function matchRoute(method, pathname) {
  // Try exact match first
  const exactKey = `${method}:${pathname}`;
  if (routes.has(exactKey)) {
    return { handler: routes.get(exactKey), params: {} };
  }

  // Try pattern matching
  for (const [key, handler] of routes.entries()) {
    const [routeMethod, routePath] = key.split(':');
    if (routeMethod !== method) continue;

    const routeParts = routePath.split('/');
    const pathParts = pathname.split('/');

    if (routeParts.length !== pathParts.length) continue;

    const params = {};
    let match = true;

    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        params[routeParts[i].slice(1)] = pathParts[i];
      } else if (routeParts[i] !== pathParts[i]) {
        match = false;
        break;
      }
    }

    if (match) {
      return { handler, params };
    }
  }

  return null;
}

// Middleware chain
const middlewares = [];

function use(middleware) {
  middlewares.push(middleware);
}

// Scenario 1: Hello World
addRoute('GET', '/hello', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello, World!');
});

// Scenario 2: JSON Response
addRoute('GET', '/api/user', (req, res) => {
  const data = {
    id: 123,
    name: 'John Doe',
    email: 'john@example.com',
    created_at: '2025-01-01T00:00:00Z',
    active: true,
  };
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
});

// Scenario 3: Path Parameters
addRoute('GET', '/users/:id', (req, res) => {
  const data = {
    id: req.params.id,
    type: 'user',
  };
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
});

// Scenario 4: Query String
addRoute('GET', '/search', (req, res) => {
  const data = {
    query: req.query.q || '',
    limit: req.query.limit || 10,
    results: [],
  };
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
});

// Scenario 5: Middleware Chain
const logger = (req, res, next) => next();
const auth = (req, res, next) => next();
const validation = (req, res, next) => next();

addRoute('GET', '/protected', (req, res) => {
  // Execute middleware chain
  let index = 0;
  const mw = [logger, auth, validation];

  const next = () => {
    if (index < mw.length) {
      const middleware = mw[index++];
      middleware(req, res, next);
    } else {
      const data = {
        message: 'Protected resource',
        authenticated: true,
      };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    }
  };

  next();
});

// Create server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  req.params = {};
  req.query = query;

  const route = matchRoute(req.method, pathname);

  if (route) {
    req.params = route.params;
    route.handler(req, res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const PORT = process.env.PORT || 5628;

server.listen(PORT, () => {
  console.log(`Node.js server listening on port ${PORT}`);
});
