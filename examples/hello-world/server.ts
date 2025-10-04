import { Flash } from '../../src';

const app = new Flash({ workers: 2 });

app.get('/', (req, res) => {
  res.json({
    message: 'Hello from Flash Framework!',
    timestamp: new Date().toISOString(),
    version: '0.1.0-alpha'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.get('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  res.json({
    id: userId,
    name: `User ${userId}`,
    email: `user${userId}@example.com`
  });
});

const port = parseInt(process.env.PORT || '3000', 10);
app.listen(port, () => {
  console.log(`🚀 Flash server running on http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
});