# Getting Started with Flash Framework

This guide will help you get up and running with Flash Framework quickly.

## Prerequisites

Before you begin, ensure you have one of the following setups:

### Option 1: Docker (Recommended)

- Docker Desktop or Docker Engine
- Docker Compose
- 4GB+ RAM available

### Option 2: Native Development

- **Node.js 20+** with npm
- **CMake 3.20+**
- **C++20 compatible compiler:**
  - macOS: Xcode Command Line Tools (Clang)
  - Linux: GCC 10+ or Clang 12+
- **Python 3.x** (for node-gyp)

## Quick Start with Docker

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd flash-framework
   ```

2. **Start the development environment:**

   ```bash
   make docker-dev
   # or
   docker-compose up dev
   ```

3. **Open your browser:**

   - Main app: http://localhost:5627
   - Health check: http://localhost:5627/health

4. **Test the API:**
   ```bash
   curl http://localhost:5627/
   curl http://localhost:5627/health
   curl http://localhost:5627/api/users/123
   ```

## Manual Setup (macOS)

1. **Install dependencies:**

   ```bash
   # Install Node.js (if not already installed)
   brew install node

   # Install CMake and LLVM
   brew install cmake llvm python3

   # Verify installations
   node --version  # Should be 18+
   cmake --version # Should be 3.20+
   clang --version # Should be 12+
   ```

2. **Clone and setup:**

   ```bash
   git clone <repository-url>
   cd flash-framework

   # Install Node.js dependencies
   npm install
   ```

3. **Build the project:**

   ```bash
   # Build everything
   make build

   # Or step by step
   npm run build:cpp  # Build C++ components
   npm run build:ts   # Build TypeScript
   ```

4. **Run the example:**
   ```bash
   make dev
   # or
   npm run dev
   ```

## Manual Setup (Linux)

1. **Install dependencies:**

   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install -y build-essential cmake clang nodejs npm python3

   # Verify installations
   node --version  # Should be 18+
   cmake --version # Should be 3.20+
   clang --version # Should be 12+
   ```

2. **Follow steps 2-4 from macOS setup above**

## Project Structure

After setup, your project should look like this:

```
flash-framework/
├── cpp/                    # C++ source code
│   ├── include/           # Public headers
│   ├── src/              # Implementation files
│   ├── binding/          # N-API bridge code
│   └── tests/            # C++ unit tests
├── src/                   # TypeScript source
│   ├── index.ts          # Main exports
│   ├── types/            # TypeScript definitions
│   └── middleware/       # Middleware components
├── examples/             # Example applications
│   └── hello-world/     # Basic example
├── tests/                # Test suites
├── docs/                 # Documentation
├── build/                # C++ build artifacts (generated)
├── dist/                 # TypeScript build output (generated)
├── node_modules/         # Node.js dependencies (generated)
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose setup
├── CMakeLists.txt       # C++ build configuration
├── package.json         # Node.js configuration
└── tsconfig.json        # TypeScript configuration
```

## Development Workflow

### Using Make Commands

```bash
# Build everything
make build

# Start development server
make dev

# Run tests
make test

# Run linter
make lint

# Clean build artifacts
make clean
```

### Using npm Scripts

```bash
# Build C++ components
npm run build:cpp

# Build TypeScript
npm run build:ts

# Run TypeScript tests
npm test

# Run C++ tests
npm run test:cpp

# Start development
npm run dev
```

### Using Docker

```bash
# Development environment
make docker-dev

# Production environment
make docker-prod

# Run benchmarks
make docker-benchmark
```

## Your First Application

Create a new file `my-app.ts`:

```typescript
import { Flash } from "./src";

const app = new Flash({ workers: 4 });

app.get("/hello", (req, res) => {
  res.json({ message: "Hello, Flash!" });
});

app.listen(5627, () => {
  console.log("My first Flash app is running!");
});
```

Run it:

```bash
npx ts-node my-app.ts
```

## Testing Your Setup

### Manual Testing

```bash
# Test the hello world example
curl http://localhost:3000/

# Should return:
# {"message":"Hello from Flash Framework!","timestamp":"2025-10-04T...","version":"0.1.0-alpha"}
```

### Automated Testing

```bash
# Run all tests
make test

# Run with coverage
make test-coverage
```

### Performance Testing

````bash
# Run basic benchmarks
make benchmark

# Or use wrk for load testing
```bash
wrk -t4 -c100 -d30s http://localhost:5627/
````

## Troubleshooting

### Common Issues

**Build fails with "CMake not found"**

- Install CMake: `brew install cmake` (macOS) or `sudo apt install cmake` (Linux)

**Node-gyp fails**

- Ensure Python 3 is available: `python3 --version`
- Try: `npm config set python python3`

**C++ compilation errors**

- Ensure you have a C++20 compatible compiler
- macOS: Install Xcode Command Line Tools
- Linux: `sudo apt install build-essential clang`

**Port already in use**

- Kill existing process: `lsof -ti:5627 | xargs kill`
- Or use a different port: `PORT=3001 npm run dev`

**Docker issues**

- Ensure Docker Desktop is running
- Try: `docker system prune` to clean up

### Getting Help

- Check the [API Documentation](./api-reference.md)
- Review the [Architecture Guide](./architecture.md)
- Open an issue on GitHub
- Check existing issues for similar problems

## Next Steps

1. **Explore the examples** in the `examples/` directory
2. **Read the API documentation** to understand available features
3. **Run the benchmarks** to see current performance
4. **Start building** your own applications
5. **Contribute** by fixing bugs or adding features

Happy coding with Flash Framework! 🚀
