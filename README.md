# Flash Framework

> High-performance C++/TypeScript HTTP server framework

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![C++ Standard](https://img.shields.io/badge/C%2B%2B-20-blue)](https://en.cppreference.com/w/cpp/20)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ⚡ Performance

| Metric | Flash | Express.js | Improvement |
|--------|-------|------------|-------------|
| **Requests/sec** | 173,244 | 25,088 | **6.9x faster** |
| **P50 Latency** | 80μs | 3.7ms | **46x lower** |

Flash Framework combines the performance of C++ with the developer experience of TypeScript. It uses N-API to bridge the two languages, providing a high-performance HTTP server with a clean, modern API.

## 🚀 Quick Start

### Using Docker (Recommended for Development)

```bash
# Clone the repository
git clone <repository-url>
cd flash-framework

# Run the development setup script
./dev-setup.sh

# Start development environment
npm run docker:dev
```

The development environment includes:

- ✅ Hot reloading for TypeScript changes
- ✅ Volume mounting for live code editing
- ✅ Debug port (9229) for Node.js debugging
- ✅ Redis for caching (optional)
- ✅ All development dependencies pre-installed

**Access Points:**

- Server: http://localhost:3000
- Debug: localhost:9229
- Redis: localhost:6379 (if enabled)

### Manual Setup

#### Prerequisites

- **Node.js 20+** with npm
- **CMake 3.20+**
- **C++20 compatible compiler** (Clang 12+ or GCC 10+)
- **Python 3.x** (for node-gyp)

#### macOS Setup

```bash
# Install dependencies
brew install node cmake llvm python3

# Clone and setup
git clone <repository-url>
cd flash-framework
npm install

# Build the project
npm run build

# Run example
npm run dev
```

#### Linux Setup

```bash
# Install dependencies (Ubuntu/Debian)
sudo apt update
sudo apt install -y build-essential cmake clang nodejs npm python3

# Clone and setup
git clone <repository-url>
cd flash-framework
npm install

# Build the project
npm run build

# Run example
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
