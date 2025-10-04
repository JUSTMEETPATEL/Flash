# Phase 1 Quick Start - TL;DR

## What You're Building

A C++ HTTP server that responds to `curl http://localhost:5627/`

## Timeline

4 weeks to working echo server

## Files You'll Create (in order)

### Week 1: TCP Server

1. `cpp/include/server.h` - Server class definition
2. `cpp/src/server.cpp` - Socket programming implementation
3. `cpp/tests/test_server.cpp` - Unit tests

### Week 2: HTTP Parser

4. `cpp/include/http_request.h` - Request data structure
5. `cpp/include/http_parser.h` - Parser interface
6. `cpp/src/http_parser.cpp` - Parsing logic
7. `cpp/tests/test_http_parser.cpp` - Parser tests

### Week 3: HTTP Response

8. `cpp/include/http_response.h` - Response builder
9. `cpp/src/http_response.cpp` - Response implementation
10. `cpp/tests/test_http_response.cpp` - Response tests

### Week 4: Integration

11. `cpp/src/main.cpp` - Standalone server
12. Integration testing and bug fixes

## Essential Commands

```bash
# Build everything
npm run build:cpp
# or
cd build && cmake .. && make

# Run tests
npm run test:cpp
# or
./build/flash_tests

# Test your server manually
curl http://localhost:5627/
curl -v http://localhost:5627/test

# Debug
lldb ./build/flash_server

# Check for memory leaks
leaks --atExit -- ./build/flash_server

# Kill process on port
lsof -ti:5627 | xargs kill -9
```

## Core Concepts to Learn

### Socket Programming (Week 1)

- `socket()` - Create endpoint
- `bind()` - Assign address
- `listen()` - Mark as passive
- `accept()` - Accept connection
- `read()` / `write()` - Transfer data
- `close()` - Cleanup

### HTTP Protocol (Week 2)

```
GET /path HTTP/1.1
Host: localhost
Header: value

```

**Note:** Request ends with `\r\n\r\n`

### HTTP Response (Week 3)

```
HTTP/1.1 200 OK
Content-Type: text/plain
Content-Length: 13

Hello, World!
```

## Testing Flow

```bash
# 1. Start server
./build/flash_server

# 2. Test with telnet (raw TCP)
telnet localhost 5627
GET / HTTP/1.1
Host: localhost
[press Enter twice]

# 3. Test with curl (HTTP)
curl http://localhost:5627/

# 4. Test with browser
open http://localhost:5627/
```

## Success Checklist

Week 1:

- [ ] Server listens on port 3000
- [ ] Accepts connections
- [ ] Can connect with `telnet localhost 3000`

Week 2:

- [ ] Parses HTTP GET requests
- [ ] Extracts method, path, version
- [ ] Parses headers

Week 3:

- [ ] Builds HTTP responses
- [ ] Sets status codes
- [ ] Adds headers

Week 4:

- [ ] `curl http://localhost:3000/` returns response
- [ ] No memory leaks
- [ ] Graceful shutdown (Ctrl+C)

## First Steps

1. Read `PHASE1_GUIDE.md` for detailed walkthrough
2. Review the starter code I'll generate
3. Start with `server.h` - understand the interface
4. Implement `server.cpp` - socket code
5. Test as you go!

## Key C++ Patterns

```cpp
// RAII - Resource management
class Server {
    int socket_fd_;
public:
    Server() { socket_fd_ = socket(...); }
    ~Server() { close(socket_fd_); }  // Auto cleanup
};

// Smart pointers - No manual delete
std::unique_ptr<Connection> conn = std::make_unique<Connection>();

// Const correctness
int get_port() const;  // Doesn't modify object

// Error handling
std::optional<Request> parse(std::string_view data);
if (auto req = parse(data)) {
    // Use req.value()
}
```

## Resources

- **Socket Programming:** `man socket`, `man bind`, `man listen`
- **HTTP Protocol:** RFC 2616 Section 5
- **C++ Reference:** cppreference.com
- **Debugging:** `lldb`, `leaks`, `lsof`

## Common Errors & Fixes

| Error                  | Fix                                |
| ---------------------- | ---------------------------------- |
| Address already in use | `lsof -ti:3000 \| xargs kill -9`   |
| Broken pipe            | Check connection before writing    |
| Memory leaks           | Use smart pointers, RAII           |
| Compile errors         | Check C++20 flag in CMakeLists.txt |

## Ready?

Type "Let's start" and I'll generate the starter files! 🚀
