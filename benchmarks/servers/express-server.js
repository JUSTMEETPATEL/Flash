/**
 * Express.js Benchmark Server
 *
 * Baseline comparison using Express.js (the most popular Node.js framework)
 */

const express = require("express");
const app = express();

// Middleware for logging (scenario: middleware-chain)
const logger = (req, res, next) => {
  next();
};

const auth = (req, res, next) => {
  next();
};

const validation = (req, res, next) => {
  next();
};

// Scenario 1: Hello World
app.get("/hello", (req, res) => {
  res.send("Hello, World!");
});

// Scenario 2: JSON Response
app.get("/api/user", (req, res) => {
  res.json({
    id: 123,
    name: "John Doe",
    email: "john@example.com",
    created_at: "2025-01-01T00:00:00Z",
    active: true,
  });
});

// Scenario 3: Path Parameters
app.get("/users/:id", (req, res) => {
  res.json({
    id: req.params.id,
    type: "user",
  });
});

// Scenario 4: Query String
app.get("/search", (req, res) => {
  res.json({
    query: req.query.q || "",
    limit: req.query.limit || 10,
    results: [],
  });
});

// Scenario 5: Middleware Chain
app.get("/protected", logger, auth, validation, (req, res) => {
  res.json({
    message: "Protected resource",
    authenticated: true,
  });
});

const PORT = process.env.PORT || 5629;

app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});
