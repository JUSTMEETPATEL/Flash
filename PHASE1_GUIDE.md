# Phase 1: C++ HTTP Server Foundation - Implementation Guide

## 🎯 Goal

Build a working C++ HTTP server that can accept TCP connections, parse basic HTTP requests, and send HTTP responses.

## 📋 What We'll Build

By the end of Phase 1, you'll have:

- ✅ TCP server accepting connections on a port
- ✅ HTTP/1.1 request parser (GET requests)
- ✅ HTTP response builder
- ✅ Simple echo server that responds to requests
- ✅ Manual testing with `curl`

**Milestone:** Server can handle `curl http://localhost:5627/` and return a response

---

## 📚 Phase 1 Breakdown

### Week 1: TCP Server Basics

**Files to create:**

- `cpp/include/server.h` - Server class definition
- `cpp/src/server.cpp` - Server implementation
- `cpp/tests/test_server.cpp` - Unit tests

**What to learn:**

- Socket programming (socket, bind, listen, accept)
- Non-blocking I/O
- Error handling in C++

### Week 2: HTTP Parsing

**Files to create:**

- `cpp/include/http_parser.h` - Parser interface
- `cpp/src/http_parser.cpp` - Parser implementation
- `cpp/include/http_request.h` - Request data structure
- `cpp/tests/test_http_parser.cpp` - Parser tests

**What to learn:**

- HTTP/1.1 protocol structure
- String parsing in C++
- State machines for parsing

### Week 3: HTTP Response

**Files to create:**

- `cpp/include/http_response.h` - Response builder
- `cpp/src/http_response.cpp` - Response implementation
- `cpp/tests/test_http_response.cpp` - Response tests

**What to learn:**

- HTTP response format
- Status codes
- Headers

### Week 4: Integration & Testing

**Files to create:**

- `cpp/src/main.cpp` - Standalone test server
- `examples/cpp-only/` - Example usage

**What to do:**

- Connect all pieces together
- Test with curl
- Fix bugs
- Document what you learned

---

## 🚀 Getting Started - Step by Step

### Step 1: Create the Server Header (15 minutes)

**File:** `cpp/include/server.h`

**What it does:** Defines the `HttpServer` class interface

**Key concepts:**

- RAII (Resource Acquisition Is Initialization)
- Smart pointers for memory management
- Const correctness

**Action:** I'll create this file for you with detailed comments explaining each part.

### Step 2: Implement the Server (1-2 hours)

**File:** `cpp/src/server.cpp`

**What it does:**

- Creates a TCP socket
- Binds to a port
- Listens for connections
- Accepts incoming connections

**Key concepts:**

- POSIX socket API
- Error handling with errno
- Non-blocking I/O

**Action:** I'll provide a skeleton with TODOs for you to fill in.

### Step 3: Test the Server (30 minutes)

**File:** `cpp/tests/test_server.cpp`

**What it does:** Unit tests for server functionality

**Action:** I'll create basic tests you can run.

### Step 4: Build and Run (15 minutes)

**Commands:**

```bash
# Build C++ code
npm run build:cpp

# Run tests
npm run test:cpp

# Or use CMake directly
cd build && cmake .. && make
./flash_tests
```

---

## 🎓 Learning Resources

### Before You Start

**Read these first (30 minutes):**

1. [Beej's Guide to Network Programming](https://beej.us/guide/bgnet/) - Chapters 5-6
2. [HTTP/1.1 RFC](https://www.rfc-editor.org/rfc/rfc2616.html) - Section 5 (Request)
3. [Modern C++ Primer](https://learnmoderncpp.com/) - Smart pointers chapter

### As You Build

**Socket Programming:**

- `man socket` - Create a socket
- `man bind` - Bind socket to address
- `man listen` - Listen for connections
- `man accept` - Accept a connection

**C++ References:**

- [cppreference.com](https://en.cppreference.com/) - C++ standard library
- [C++ Core Guidelines](https://isocpp.github.io/CppCoreGuidelines/) - Best practices

---

## 🛠️ Tools You'll Use

### Debugging

```bash
# Run with LLDB debugger (macOS)
lldb ./build/flash_tests

# Check for memory leaks
leaks --atExit -- ./build/flash_tests

# Valgrind (Linux)
valgrind --leak-check=full ./build/flash_tests
```

### Testing Your Server

```bash
# Simple GET request
curl http://localhost:5627/

# Verbose output
curl -v http://localhost:5627/

# Custom headers
curl -H "Content-Type: application/json" http://localhost:5627/

# Load testing
ab -n 1000 -c 10 http://localhost:5627/
```

### Monitoring

```bash
# Watch active connections
lsof -i :3000

# Monitor network traffic
tcpdump -i lo0 -A port 3000

# Check which process is using the port
lsof -ti:3000
```

---

## 📝 Implementation Checklist

### Milestone 1: TCP Server (Week 1)

- [ ] Create `server.h` with class definition
- [ ] Implement socket creation in `server.cpp`
- [ ] Implement bind and listen
- [ ] Implement accept loop
- [ ] Handle SIGINT (Ctrl+C) gracefully
- [ ] Write basic tests
- [ ] Test with `telnet localhost 3000`

### Milestone 2: HTTP Parser (Week 2)

- [ ] Create `http_request.h` struct
- [ ] Create `http_parser.h` interface
- [ ] Parse request line (method, path, version)
- [ ] Parse headers
- [ ] Handle malformed requests
- [ ] Write parser tests with sample requests
- [ ] Test with actual HTTP requests from curl

### Milestone 3: HTTP Response (Week 3)

- [ ] Create `http_response.h` class
- [ ] Build status line
- [ ] Build headers
- [ ] Build body
- [ ] Format complete response
- [ ] Write response tests
- [ ] Test end-to-end: request → parse → respond

### Milestone 4: Integration (Week 4)

- [ ] Connect parser to server
- [ ] Send responses back to clients
- [ ] Handle keep-alive connections
- [ ] Add logging for debugging
- [ ] Test with curl
- [ ] Test with browser
- [ ] Write integration tests
- [ ] Document your code

---

## 🎯 Success Criteria

### Minimum Viable Product (Must Have)

✅ Server starts and listens on port 3000  
✅ Accepts TCP connections  
✅ Parses GET requests  
✅ Returns HTTP responses with status 200  
✅ Can handle: `curl http://localhost:3000/`  
✅ No memory leaks  
✅ Graceful shutdown on Ctrl+C

### Nice to Have

⭐ Handles multiple connections  
⭐ Parses POST requests  
⭐ Handles request headers  
⭐ Connection keep-alive  
⭐ Proper error responses (404, 500)

---

## 🐛 Common Pitfalls & Solutions

### Issue: "Address already in use"

```bash
# Find process using port
lsof -ti:3000 | xargs kill -9

# Or use SO_REUSEADDR in code
setsockopt(fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
```

### Issue: "Broken pipe" errors

**Cause:** Writing to a closed connection  
**Fix:** Check connection state before writing

### Issue: Memory leaks

**Check:**

```bash
# macOS
leaks --atExit -- ./your_program

# Linux
valgrind --leak-check=full ./your_program
```

### Issue: Blocking on accept()

**Solution:** Use non-blocking sockets or `select()`/`poll()`

---

## 💡 Pro Tips

1. **Start Simple:** Get a basic echo server working first, then add HTTP parsing
2. **Test Early:** Don't write all code before testing - test each component
3. **Use Telnet:** Test raw TCP before HTTP: `telnet localhost 3000`
4. **Log Everything:** Add debug logs to understand flow
5. **Read RFCs:** HTTP RFC is your friend for protocol details
6. **Use Smart Pointers:** Avoid manual memory management
7. **RAII Pattern:** Use constructors/destructors for resource management

---

## 📊 Example Test Session

```bash
# Terminal 1: Start your server
./build/flash_server
> Server listening on port 3000...

# Terminal 2: Test with telnet
telnet localhost 3000
> GET / HTTP/1.1
> Host: localhost
>
> HTTP/1.1 200 OK
> Content-Length: 13
>
> Hello, World!

# Terminal 3: Test with curl
curl http://localhost:3000/
> Hello, World!

curl -v http://localhost:3000/test
> HTTP/1.1 200 OK
> Content-Length: 13
>
> Hello, World!
```

---

## 🎓 Learning Outcomes

After completing Phase 1, you'll understand:

- ✅ How TCP sockets work
- ✅ HTTP protocol structure
- ✅ Event loop patterns
- ✅ C++ memory management
- ✅ Error handling strategies
- ✅ Unit testing in C++
- ✅ Build systems (CMake)

---

## 📁 Final Directory Structure

```
cpp/
├── include/
│   ├── server.h           ← Main server class
│   ├── http_request.h     ← Request data structure
│   ├── http_response.h    ← Response builder
│   ├── http_parser.h      ← Request parser
│   └── connection.h       ← Connection management
├── src/
│   ├── server.cpp         ← Server implementation
│   ├── http_request.cpp   ← Request methods
│   ├── http_response.cpp  ← Response building
│   ├── http_parser.cpp    ← Parsing logic
│   ├── connection.cpp     ← Connection handling
│   └── main.cpp           ← Test entry point
└── tests/
    ├── test_server.cpp
    ├── test_parser.cpp
    └── test_response.cpp
```

---

## 🚦 Next Steps

**Ready to start?** Let's begin with Step 1:

1. I'll create the initial server header file with detailed comments
2. You'll review and understand the structure
3. We'll implement the server class together
4. Test each piece as we go

**Let's go!** 🚀

Type "Let's start" and I'll create the first file (`server.h`) with full explanations!
