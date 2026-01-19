import { Flash, Request, Response } from "../../src";

const app = new Flash({ port: 3000, logger: true });

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Hello from Flash Framework!",
    timestamp: new Date().toISOString(),
    version: "0.1.0-alpha",
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.get("/api/users/:id", (req: Request, res: Response) => {
  const userId = req.params.id;
  res.json({
    id: userId,
    name: `User ${userId}`,
    email: `user${userId}@example.com`,
  });
});

const port = parseInt(process.env.PORT || "5627", 10);
app.listen(port, () => {
  console.log(`🚀 Flash server running on http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
});
