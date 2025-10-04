# Development Guide for Flash Framework

This guide will help you set up your development environment and start contributing to the Flash Framework.

## Prerequisites

Before you begin, ensure you have the following installed:

### Required

- **Node.js 20+** - JavaScript runtime
- **npm** - Package manager (comes with Node.js)
- **Docker & Docker Compose** - For containerized development
- **Git** - Version control

### Optional (for local C++ development)

- **CMake 3.20+** - Build system
- **Clang 12+ or GCC 10+** - C++20 compiler
- **Python 3.x** - For node-gyp
- **clang-format** - Code formatting

## Quick Start with Docker (Recommended)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd flash
chmod +x dev-setup.sh
./dev-setup.sh
```

### 2. Start Development Environment

```bash
npm run docker:dev
```

This will:

- Build the development Docker image with all dependencies
- Start the development server with hot reload
- Mount your local code into the container
- Enable Node.js debugging on port 9229

### 3. Access Your Application

- **Server**: http://localhost:3000
- **Debug Port**: localhost:9229
- **Redis**: localhost:6379 (if enabled)

### 4. Stop Development Environment

Press `Ctrl+C` or run:

```bash
docker-compose down
```

## Local Development (Without Docker)

### macOS Setup

```bash
# Install dependencies
brew install node cmake llvm python3

# Install global npm packages
npm install -g typescript ts-node nodemon

# Install project dependencies
npm install

# Build the project
npm run build

# Run development server
npm run dev
```

### Linux Setup (Ubuntu/Debian)

```bash
# Install system dependencies
sudo apt update
sudo apt install -y build-essential cmake clang nodejs npm python3 git

# Install global npm packages
npm install -g typescript ts-node nodemon

# Install project dependencies
npm install

# Build the project
npm run build

# Run development server
npm run dev
```

## Development Workflow

### Building the Project

```bash
# Build everything (C++ + TypeScript)
npm run build

# Build only C++ components
npm run build:cpp

# Build only TypeScript
npm run build:ts

# Build in debug mode (with symbols)
npm run build:debug
```

### Running the Development Server

```bash
# Run with hot reload (TypeScript only)
npm run dev

# Run in Docker with full hot reload
npm run docker:dev
```

### Testing

```bash
# Run all TypeScript tests
npm test

# Run C++ tests (requires local build)
npm run test:cpp

# Run all tests
npm run test:all

# Run tests in watch mode
npm test -- --watch
```

### Code Quality

```bash
# Lint TypeScript code
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format C++ code (requires clang-format)
find cpp -name "*.cpp" -o -name "*.h" | xargs clang-format -i
```

### Cleaning Build Artifacts

```bash
npm run clean
```

## VS Code Integration

The project includes VS Code configuration for optimal development experience.

### Recommended Extensions

Install these extensions (VS Code will prompt you):

- C/C++ (Microsoft)
- clangd (LLVM)
- ESLint
- Prettier
- Docker
- Jest
- GitHub Copilot (optional)

### Debugging

#### Debug TypeScript Code

1. Open `examples/hello-world/server.ts`
2. Press `F5` or go to Run & Debug
3. Select "Debug TypeScript"

#### Debug with Docker

1. Start the dev container: `npm run docker:dev`
2. Press `F5` and select "Debug with Docker"
3. Set breakpoints in your TypeScript code

#### Debug C++ Code (Advanced)

```bash
# Build in debug mode
npm run build:debug

# Run with lldb (macOS) or gdb (Linux)
lldb node -- examples/hello-world/server.js
```

### Tasks

Press `Cmd+Shift+B` (macOS) or `Ctrl+Shift+B` (Linux) to see available build tasks:

- Build All
- Build C++
- Build TypeScript
- Run Dev Server
- Run Tests
- Docker: Build Dev Image
- Docker: Start Dev
- Docker: Stop All
- Clean All

## Project Structure

```
flash/
├── .github/              # GitHub configuration
│   └── copilot-instructions.md  # AI assistant guidelines
├── .vscode/              # VS Code configuration
│   ├── launch.json       # Debug configurations
│   ├── tasks.json        # Build tasks
│   └── settings.json     # Editor settings
├── cpp/                  # C++ source code
│   ├── include/          # Public headers
│   ├── src/              # Implementation files
│   ├── binding/          # N-API bridge code
│   └── tests/            # C++ unit tests
├── src/                  # TypeScript source
│   ├── index.ts          # Main entry point
│   ├── router.ts         # Routing logic
│   └── types/            # Type definitions
├── tests/                # TypeScript tests
├── examples/             # Example applications
├── benchmarks/           # Performance benchmarks
├── docs/                 # Documentation
│   ├── PRD.md            # Product requirements
│   └── getting-started.md
├── CMakeLists.txt        # CMake configuration
├── binding.gyp           # N-API build config
├── Dockerfile            # Production Docker image
├── Dockerfile.dev        # Development Docker image
├── docker-compose.yml    # Docker Compose config
└── package.json          # Node.js configuration
```

## Common Development Tasks

### Adding a New TypeScript Module

1. Create the file in `src/`
2. Export it from `src/index.ts`
3. Write tests in `tests/unit/`
4. Run tests: `npm test`

### Adding a New C++ Component

1. Create header in `cpp/include/`
2. Create implementation in `cpp/src/`
3. Add to `CMakeLists.txt` if needed
4. Write tests in `cpp/tests/`
5. Build: `npm run build:cpp`
6. Test: `npm run test:cpp`

### Updating N-API Bindings

1. Edit `cpp/binding/addon.cpp`
2. Update `binding.gyp` if needed
3. Rebuild: `npm run build:cpp`
4. Test the binding from TypeScript

### Running Benchmarks

```bash
# Run benchmarks locally
npm run benchmark

# Run in Docker (production-like)
docker-compose run benchmark
```

## Troubleshooting

### Build Failures

**Node-gyp errors:**

```bash
# Clear cache and rebuild
npm run clean
rm -rf node_modules
npm install
```

**CMake errors:**

```bash
# Ensure CMake is installed
cmake --version  # Should be 3.20+

# Rebuild from scratch
rm -rf build
mkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Debug
make
```

### Docker Issues

**Container won't start:**

```bash
# Check Docker is running
docker info

# Rebuild image
docker-compose build --no-cache dev

# View logs
docker-compose logs dev
```

**Permission errors:**

```bash
# Fix file permissions
sudo chown -R $USER:$USER .
```

### Runtime Errors

**Module not found:**

```bash
# Rebuild native addon
npm run build:cpp
```

**Port already in use:**

```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

## Contributing

Please read our contributing guidelines and follow the code style conventions in `.github/copilot-instructions.md`.

### Before Submitting a PR

1. Run tests: `npm run test:all`
2. Run linter: `npm run lint:fix`
3. Format code
4. Update documentation if needed
5. Write clear commit messages (see Conventional Commits)

## Getting Help

- Read the [PRD](./docs/PRD.md) for project goals and scope
- Check [Getting Started](./docs/getting-started.md) for usage examples
- Review the [Copilot Instructions](./.github/copilot-instructions.md) for coding standards
- Open an issue on GitHub

## Next Steps

Once your environment is set up, check out:

1. **Phase 1**: Start implementing the C++ HTTP server core
2. Read `docs/PRD.md` for detailed requirements
3. Explore `examples/` for usage patterns
4. Run `npm test` to see current test coverage

Happy coding! 🚀
