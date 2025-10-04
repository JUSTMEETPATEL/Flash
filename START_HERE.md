# 🚀 Phase 1 - Ready to Start!

Everything is set up for you to begin implementing the C++ HTTP server!

## 📁 What We Created

### Documentation (Read First!)

1. **PHASE1_GUIDE.md** - Comprehensive guide with detailed explanations
2. **PHASE1_QUICK_START.md** - TL;DR version for quick reference
3. **PHASE1_TODO.md** - Week-by-week checklist to track progress
4. **SOCKET_REFERENCE.md** - Socket programming cheat sheet

### C++ Code Files (Your Work Starts Here!)

5. **cpp/include/server.h** - Server class definition with detailed comments
6. **cpp/src/server.cpp** - Implementation file with TODOs for you to fill in
7. **cpp/tests/test_server.cpp** - Unit tests (uncomment as you implement)
8. **cpp/src/main.cpp** - Standalone test server
9. **cpp/CMakeLists.txt** - Build configuration

### Build Script

10. **phase1.sh** - One-command build/test/run script

---

## 🎯 Your Mission: Phase 1

Build a working C++ HTTP server in 4 weeks:

### Week 1: TCP Server

- Create socket
- Bind to port
- Listen for connections
- Echo server

### Week 2: HTTP Parser

- Parse HTTP requests
- Extract method, path, headers
- Handle malformed requests

### Week 3: HTTP Response

- Build HTTP responses
- Set status codes
- Add headers

### Week 4: Polish

- Integration testing
- Bug fixes
- Documentation

### Success = This Works:

```bash
./build/flash_server 3000
curl http://localhost:3000/
# → Gets HTTP response!
```

---

## 🏁 Getting Started (3 Easy Steps)

### Step 1: Read the Guide (10 minutes)

```bash
# Quick version
cat PHASE1_QUICK_START.md

# Or detailed version
cat PHASE1_GUIDE.md
```

### Step 2: Review the Code (20 minutes)

Open these files and read the comments:

1. `cpp/include/server.h` - Understand the interface
2. `cpp/src/server.cpp` - See what you need to implement
3. `SOCKET_REFERENCE.md` - Learn socket programming basics

### Step 3: Implement Constructor (30 minutes)

Edit `cpp/src/server.cpp`:

1. Find the `HttpServer` constructor (line ~36)
2. Read the TODO comments
3. Implement socket creation:

```cpp
socket_fd_ = socket(AF_INET, SOCK_STREAM, 0);
if (socket_fd_ < 0) {
    throw std::runtime_error(std::string("Socket error: ") + strerror(errno));
}

int opt = 1;
setsockopt(socket_fd_, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
```

---

## 🛠️ Build Commands

### Using the Helper Script (Recommended)

```bash
# Build everything
./phase1.sh build

# Run unit tests
./phase1.sh test

# Start server
./phase1.sh run 3000

# Check for memory leaks
./phase1.sh leaks

# Clean rebuild
./phase1.sh rebuild
```

### Using CMake Directly

```bash
# Build
mkdir -p build && cd build
cmake ../cpp -DCMAKE_BUILD_TYPE=Debug
make -j$(sysctl -n hw.ncpu)

# Run tests
./flash_tests

# Run server
./flash_server 3000
```

### Using npm Scripts

```bash
# Build C++
npm run build:cpp

# Run tests
npm run test:cpp
```

---

## 📖 Learning Resources

### Before You Code

- Read: **PHASE1_GUIDE.md** (30 min)
- Read: **SOCKET_REFERENCE.md** (20 min)
- Skim: [Beej's Guide to Network Programming](https://beej.us/guide/bgnet/) Ch 5-6

### While Coding

- Reference: **SOCKET_REFERENCE.md** (socket functions)
- Check: **PHASE1_TODO.md** (track progress)
- Man pages: `man socket`, `man bind`, `man listen`

### Testing

- Use: `telnet localhost 3000` (test raw TCP)
- Use: `curl http://localhost:3000/` (test HTTP)
- Debug: `lldb ./build/flash_server` (debug crashes)

---

## 🎓 Week-by-Week Plan

### Week 1 Checklist

- [ ] Read documentation
- [ ] Implement constructor (create socket)
- [ ] Implement destructor (close socket)
- [ ] Implement start() (bind, listen, accept loop)
- [ ] Implement handle_connection() (echo server)
- [ ] Implement read_from_socket()
- [ ] Implement write_to_socket()
- [ ] Test with telnet
- [ ] **Milestone:** Echo server works!

### Week 2 Checklist

- [ ] Create http_request.h (data structure)
- [ ] Create http_parser.h (parser interface)
- [ ] Implement request line parsing
- [ ] Implement header parsing
- [ ] Write parser unit tests
- [ ] Test with curl
- [ ] **Milestone:** Can parse HTTP requests!

### Week 3 Checklist

- [ ] Create http_response.h (response builder)
- [ ] Implement status line building
- [ ] Implement header building
- [ ] Implement body handling
- [ ] Write response unit tests
- [ ] Integrate parser + response in server
- [ ] **Milestone:** Server responds to curl!

### Week 4 Checklist

- [ ] Run full test suite
- [ ] Fix all bugs
- [ ] Check for memory leaks
- [ ] Add logging
- [ ] Document code
- [ ] Create demo
- [ ] **Milestone:** Phase 1 complete! 🎉

---

## 🐛 Common Issues & Solutions

### "Address already in use"

```bash
lsof -ti:3000 | xargs kill -9
```

**Fix:** Add `SO_REUSEADDR` in constructor

### Compilation errors

```bash
./phase1.sh rebuild
```

**Check:** C++20 flag in CMakeLists.txt

### Segmentation fault

```bash
lldb ./build/flash_server
(lldb) run
(lldb) bt  # backtrace
```

**Check:** Null pointers, buffer overflows

### Memory leaks

```bash
./phase1.sh leaks
```

**Fix:** Use smart pointers, check destructors

### Test failures

```bash
./phase1.sh test-verbose
```

**Check:** Test expectations vs implementation

---

## 💡 Pro Tips

1. **Start Simple:** Get echo server working before HTTP
2. **Test Early:** Test each function as you write it
3. **Use Telnet:** Test raw TCP before HTTP
4. **Log Everything:** Add debug logs liberally
5. **Read Man Pages:** `man socket`, `man bind`, etc.
6. **Check Return Values:** Every syscall can fail
7. **RAII Everything:** Use constructors/destructors
8. **Ask Questions:** Refer back to guides when stuck

---

## 🎯 Today's Goal

**Implement the constructor and destructor:**

1. Open `cpp/src/server.cpp`
2. Implement `HttpServer::HttpServer()` (line ~36)
3. Implement `HttpServer::~HttpServer()` (line ~52)
4. Build: `./phase1.sh build`
5. Verify no compilation errors

**Time estimate:** 30-45 minutes

**Next:** Implement `start()` method (bind, listen, accept)

---

## 📚 File Quick Reference

| File                      | Purpose              | Your Action            |
| ------------------------- | -------------------- | ---------------------- |
| PHASE1_GUIDE.md           | Detailed guide       | Read first             |
| PHASE1_TODO.md            | Progress tracker     | Check off tasks        |
| SOCKET_REFERENCE.md       | Socket cheat sheet   | Reference while coding |
| cpp/include/server.h      | Interface definition | Understand API         |
| cpp/src/server.cpp        | Implementation       | Fill in TODOs          |
| cpp/tests/test_server.cpp | Unit tests           | Uncomment and run      |
| phase1.sh                 | Build script         | Use to build/test      |

---

## 🚀 Let's Go!

You have everything you need to start Phase 1!

**First command to run:**

```bash
cat PHASE1_GUIDE.md
```

**Then:**

```bash
code cpp/src/server.cpp
# Find line 36
# Implement constructor
# Fill in TODOs
```

**Build and test:**

```bash
./phase1.sh build
./phase1.sh test
```

---

## 🎉 Motivation

By the end of Phase 1, you will:

- ✅ Understand TCP socket programming
- ✅ Understand HTTP protocol internals
- ✅ Have built a real HTTP server from scratch
- ✅ Know C++ systems programming
- ✅ Be ready for Phase 2 (N-API integration)

**You got this!** 💪

---

**Need Help?**

- Check: PHASE1_GUIDE.md for explanations
- Check: SOCKET_REFERENCE.md for socket functions
- Check: PHASE1_TODO.md for what to do next
- Debug: Use lldb and logs
- Test: Start with telnet, then curl

**Good luck!** 🚀

---

**Created:** 2025-01-04  
**Status:** ✅ Ready to code!  
**Next:** Implement constructor in server.cpp
