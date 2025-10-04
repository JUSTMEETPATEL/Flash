# Flash Framework - Quick Reference

## Daily Development Workflow

### Starting Development

```bash
# With Docker (recommended)
make docker-dev

# Local development
make dev
```

### Common Commands

```bash
make help          # Show all commands
make build         # Build everything
make test          # Run tests
make lint          # Check code quality
make clean         # Clean build artifacts
```

## Directory Structure Quick Reference

```
cpp/include/       → C++ headers (.h files)
cpp/src/           → C++ implementation (.cpp files)
cpp/binding/       → N-API bridge (C++ ↔ TypeScript)
src/               → TypeScript source files
tests/             → TypeScript tests
examples/          → Example applications
```

## File Naming Conventions

- **C++ Headers**: `snake_case.h` (e.g., `http_server.h`)
- **C++ Source**: `snake_case.cpp` (e.g., `http_server.cpp`)
- **TypeScript**: `kebab-case.ts` (e.g., `http-server.ts`)
- **Tests**: `*.test.ts` or `test_*.cpp`

## Code Style Snippets

### C++ Class Template

```cpp
#pragma once
#include <memory>

namespace flash {

class MyClass {
public:
    explicit MyClass(int value);
    ~MyClass();

    void do_something();

private:
    int value_;
};

} // namespace flash
```

### TypeScript Module Template

```typescript
export interface MyInterface {
  prop: string;
}

export class MyClass implements MyInterface {
  constructor(public prop: string) {}

  public async doSomething(): Promise<void> {
    // Implementation
  }
}
```

### Jest Test Template

```typescript
describe("MyClass", () => {
  let instance: MyClass;

  beforeEach(() => {
    instance = new MyClass("test");
  });

  test("should do something", () => {
    expect(instance.prop).toBe("test");
  });
});
```

## VS Code Shortcuts

- **Build**: `Cmd/Ctrl + Shift + B`
- **Run**: `F5`
- **Debug**: `F5` (with breakpoints)
- **Test**: `Cmd/Ctrl + Shift + P` → "Jest: Run All Tests"
- **Terminal**: `` Ctrl + ` ``

## Git Workflow

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: feat, fix, docs, style, refactor, perf, test, chore

**Examples**:

```
feat(http-parser): add chunked encoding support
fix(router): handle empty path parameters
docs(readme): update installation instructions
```

## Debugging

### Debug TypeScript (VS Code)

1. Set breakpoint in `.ts` file
2. Press `F5`
3. Select "Debug TypeScript"

### Debug with Docker

1. Run `make docker-dev`
2. Press `F5`
3. Select "Debug with Docker"

### Debug C++ (CLI)

```bash
npm run build:debug
lldb node -- examples/hello-world/server.js
```

## Performance Tips

### Profiling

```bash
# Node.js profiling
node --prof examples/hello-world/server.js
node --prof-process isolate-*.log

# Benchmarking
npm run benchmark
```

### Memory Leaks

```bash
# Check for leaks
node --inspect examples/hello-world/server.js
# Open chrome://inspect in Chrome
```

## Troubleshooting

### Build Fails

```bash
make clean
rm -rf node_modules
npm install
make build
```

### Port Already in Use

```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Or change port in examples
```

### Docker Issues

```bash
# Rebuild image
docker-compose build --no-cache dev

# View logs
docker-compose logs dev

# Clean everything
docker-compose down
docker system prune -a
```

## Testing Patterns

### Unit Test

```typescript
test("function returns expected value", () => {
  expect(myFunction(input)).toBe(expected);
});
```

### Async Test

```typescript
test("async function works", async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

### Mock Test

```typescript
const mockFn = jest.fn();
mockFn.mockReturnValue("mocked");
expect(mockFn()).toBe("mocked");
```

## Environment Variables

```bash
NODE_ENV=development  # development | production | test
DEBUG=flash:*        # Enable debug logging
PORT=3000            # Server port
```

## Docker Commands

```bash
# Development
docker-compose up dev              # Start dev server
docker-compose up -d dev           # Start in background
docker-compose logs -f dev         # View logs
docker-compose exec dev bash       # Shell into container
docker-compose down                # Stop all services

# Production
docker build -t flash .            # Build prod image
docker run -p 3000:3000 flash      # Run prod container
```

## Package Management

```bash
# Add dependency
npm install <package>

# Add dev dependency
npm install -D <package>

# Update dependencies
npm update

# Audit security
npm audit
npm audit fix
```

## Current Phase: Phase 1 - Foundation

**Goal**: Build basic C++ HTTP server core

**Key Files to Create**:

- `cpp/include/server.h` - Server class definition
- `cpp/src/server.cpp` - Server implementation
- `cpp/tests/test_server.cpp` - Server tests

**Next Steps**:

1. Implement TCP socket server in C++
2. Handle incoming connections
3. Parse basic HTTP requests
4. Send HTTP responses

## Resources

- **PRD**: `docs/PRD.md` - Full project requirements
- **Development Guide**: `DEVELOPMENT.md` - Detailed setup
- **Copilot Instructions**: `.github/copilot-instructions.md` - Coding standards
- **Getting Started**: `docs/getting-started.md` - Usage examples

## Getting Help

1. Check this reference card
2. Read `DEVELOPMENT.md`
3. Review `.github/copilot-instructions.md`
4. Check `docs/PRD.md` for requirements
5. Ask in discussions/issues

---

**Last Updated**: October 4, 2025  
**Current Version**: 0.1.0-alpha  
**Status**: Phase 1 - Foundation
