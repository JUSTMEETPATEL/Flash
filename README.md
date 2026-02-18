# Flash Framework

> High-performance C++/TypeScript HTTP server framework

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![C++ Standard](https://img.shields.io/badge/C%2B%2B-20-blue)](https://en.cppreference.com/w/cpp/20)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ⚡ Performance

Benchmarked with `wrk` (4 threads, 100 connections, 10s duration) on Node.js v23.

**Raw C++ I/O** — Static pre-computed responses handled entirely in C++ (TCP + socket write):

| Metric       | Flash   | Express.js | Improvement     |
| ------------ | ------- | ---------- | --------------- |
| Requests/sec | 152,988 | 25,088     | **6.1x faster** |
| P50 Latency  | 84μs    | 3.70ms     | **44x lower**   |

**Dynamic Responses** — Route matching + response building in C++:

| Metric       | Flash  | Express.js | Improvement           |
| ------------ | ------ | ---------- | --------------------- |
| Requests/sec | 24,598 | 24,476     | **~1x (parity)**      |

> The raw I/O benchmark measures the C++ TCP layer's throughput with zero-copy static responses. The dynamic benchmark includes HTTP parsing, route matching, and response serialization — where Flash matches Express. Real-world performance depends on handler complexity (database calls, business logic), which is the bottleneck in both frameworks.

Flash Framework combines the performance of C++ with the developer experience of TypeScript. It uses N-API to bridge the two languages, providing a high-performance HTTP server with a clean, modern API.

### Prerequisites

- **Node.js 20+**
- **Docker** (Recommended) OR **C++20 Compiler** (Clang 12+ / GCC 10+)
- **CMake 3.20+**

### 🐳 Docker Quick Start (Recommended)

The easiest way to start developing with Flash is using the provided Docker environment, which includes hot-reloading, debugging, and all dependencies.

```bash
# Clone the repository
git clone https://github.com/JUSTMEETPATEL/Flash.git
cd Flash

# Set up development environment
./dev-setup.sh

# Start development container
npm run docker:dev
```

- **Server:** http://localhost:3000
- **Debug Port:** 9229

### 🛠️ Manual Setup (macOS/Linux)

If you prefer running natively:

```bash
# 1. Install Dependencies
# macOS
brew install node cmake llvm python3
# Ubuntu/Debian
sudo apt install -y build-essential cmake clang nodejs npm python3

# 2. Setup Project
git clone https://github.com/JUSTMEETPATEL/Flash.git
cd Flash
npm install

# 3. Build & Run
npm run build
npm run dev
```

## 📖 Usage

```typescript
import { Flash } from "flash-framework";

const app = new Flash({ workers: 4 });

app.get("/api/users/:id", async (req, res) => {
  const user = await getUserById(req.params.id);
  res.json(user);
});

app.listen(5627, () => {
  console.log("Flash server running on port 5627");
});
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│     User Application (TypeScript)       │
│  ┌────────────────────────────────────┐ │
│  │   app.get('/route', handler)       │ │
│  └────────────────┬───────────────────┘ │
└───────────────────┼─────────────────────┘
                    │
┌───────────────────┼─────────────────────┐
│  Flash Framework  │  (TypeScript Layer) │
│  ┌────────────────▼───────────────────┐ │
│  │  Router │ Middleware │ Types       │ │
│  └────────────────┬───────────────────┘ │
└───────────────────┼─────────────────────┘
                    │ N-API
┌───────────────────┼─────────────────────┐
│   N-API Bridge    │                     │
│  ┌────────────────▼───────────────────┐ │
│  │  Type Conv │ Async Queue │ Errors  │ │
│  └────────────────┬───────────────────┘ │
└───────────────────┼─────────────────────┘
                    │
┌───────────────────┼─────────────────────┐
│   C++ Core        │                     │
│  ┌────────────────▼───────────────────┐ │
│  │     HTTP Server (kqueue/epoll)     │ │
│  ├────────────────────────────────────┤ │
│  │     Worker Thread Pool             │ │
│  ├────────────────────────────────────┤ │
│  │     Request/Response Objects       │ │
│  ├────────────────────────────────────┤ │
│  │     Connection Manager             │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## 🧪 Testing

```bash
# Run all tests
npm run test:all

# Run TypeScript tests only
npm test

# Run C++ tests only
npm run test:cpp

# Run with coverage
npm run test:coverage
```

## 📊 Benchmarking

```bash
# Run benchmarks
npm run benchmark

# Or using Docker
docker-compose up benchmark
```

## 🐳 Docker Commands

````bash
# Build Docker image
docker build -t flash-framework .

# Run container
```bash
docker run -p 5627:5627 flash-framework

# Development with hot reload
docker-compose up dev

# Production deployment
docker-compose up -d app
````

## 📁 Project Structure

```
flash-framework/
├── cpp/                    # C++ source code
│   ├── include/           # Public headers
│   ├── src/              # Implementation files
│   ├── binding/          # N-API bridge code
│   └── tests/            # C++ unit tests
├── src/                   # TypeScript source
│   ├── index.ts          # Main exports
│   ├── router.ts         # Routing logic
│   ├── middleware/       # Middleware components
│   └── types/            # TypeScript definitions
├── tests/                # Test suites
│   ├── unit/            # Unit tests
│   └── integration/     # Integration tests
├── examples/             # Example applications
├── benchmarks/           # Performance tests
├── docs/                 # Documentation
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose setup
├── CMakeLists.txt       # C++ build configuration
├── binding.gyp          # Node-gyp configuration
├── package.json         # Node.js dependencies
├── tsconfig.json        # TypeScript configuration
└── README.md
```

## 🤝 Contributing

This is a learning project! Contributions are welcome, especially:

- Bug fixes
- Performance improvements
- Documentation improvements
- Example applications

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Documentation](./docs/)
- [API Reference](./docs/api-reference.md)
- [Architecture Guide](./docs/architecture.md)

# Flash
