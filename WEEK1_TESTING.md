# 🧪 Week 1 Testing & Build Guide

Complete guide to building and testing your Week 1 TCP server implementation.

---

## 📋 What Week 1 Includes

Your Week 1 TCP server implementation includes:

- ✅ Socket creation and configuration
- ✅ Binding to address and port (5627)
- ✅ Listening for connections
- ✅ Accept loop with EINTR handling
- ✅ Echo server functionality
- ✅ Socket I/O operations (read/write)
- ✅ Graceful shutdown
- ✅ Resource cleanup (RAII)

---

## 🔨 Building the Project

### Option 1: Using the Helper Script (Recommended)

```bash
./phase1.sh build
```

This script:

- Creates `build/` directory
- Runs CMake configuration
- Compiles all C++ code
- Links Google Test
- Shows compilation status

### Option 2: Manual CMake Build

```bash
# Create build directory
mkdir -p build
cd build

# Configure with CMake
cmake ../cpp -DCMAKE_BUILD_TYPE=Debug

# Build with all CPU cores
make -j$(sysctl -n hw.ncpu)

# Go back to project root
cd ..
```

### Option 3: Using Docker

```bash
# Start Docker container
docker compose up -d

# Enter container
docker compose exec dev bash

# Inside container, build
mkdir -p build && cd build
cmake ../cpp -DCMAKE_BUILD_TYPE=Debug
make -j$(nproc)
```

### Expected Build Output

```
[  6%] Building CXX object CMakeFiles/flash_core.dir/cpp/src/server.cpp.o
[ 12%] Building CXX object CMakeFiles/flash_core.dir/cpp/src/http_parser.cpp.o
[ 18%] Building CXX object CMakeFiles/flash_core.dir/cpp/src/http_request.cpp.o
[ 25%] Linking CXX static library libflash_core.a
[ 25%] Built target flash_core
[ 31%] Building CXX object CMakeFiles/flash_server.dir/cpp/src/main.cpp.o
[ 37%] Linking CXX executable flash_server
[ 37%] Built target flash_server
[ 43%] Building CXX object CMakeFiles/flash_tests.dir/cpp/tests/test_server.cpp.o
[ 50%] Building CXX object CMakeFiles/flash_tests.dir/cpp/tests/test_http_parser.cpp.o
[ 93%] Linking CXX executable flash_tests
[100%] Built target flash_tests
```

### Troubleshooting Build Issues

**Problem: "command not found: cmake"**

```bash
# Install CMake via Homebrew
brew install cmake

# Verify installation
cmake --version  # Should show 3.20+
```

**Problem: Compilation errors**

```bash
# Clean build
rm -rf build
./phase1.sh build

# Check for C++20 support
clang++ --version  # Should be 14.0+
```

**Problem: "Cannot find Google Test"**

```bash
# CMake will download it automatically
# If it fails, check internet connection
# Or specify build type:
cmake ../cpp -DCMAKE_BUILD_TYPE=Debug -DBUILD_TESTING=ON
```

---

## 🧪 Running Unit Tests

### Option 1: Using Helper Script

```bash
./phase1.sh test
```

### Option 2: Direct Execution

```bash
./build/flash_tests
```

### Option 3: Run Specific Test Suite

```bash
# Run only server tests (Week 1)
./build/flash_tests --gtest_filter=HttpServerTest.*

# Run only parser tests (Week 2)
./build/flash_tests --gtest_filter=HttpParserTest.*

# Run specific test
./build/flash_tests --gtest_filter=HttpServerTest.ConstructorCreatesServer
```

### Expected Test Output

```
[==========] Running tests from 2 test suites.
[----------] Global test environment set-up.
[----------] 8 tests from HttpServerTest
[ RUN      ] HttpServerTest.ConstructorCreatesServer
[       OK ] HttpServerTest.ConstructorCreatesServer (0 ms)
[ RUN      ] HttpServerTest.ConstructorRejectsInvalidPort
[       OK ] HttpServerTest.ConstructorRejectsInvalidPort (0 ms)
[ RUN      ] HttpServerTest.GetPortReturnsCorrectPort
[       OK ] HttpServerTest.GetPortReturnsCorrectPort (0 ms)
[ RUN      ] HttpServerTest.InitiallyNotRunning
[       OK ] HttpServerTest.InitiallyNotRunning (0 ms)
[ RUN      ] HttpServerTest.InitialConnectionCountIsZero
[       OK ] HttpServerTest.InitialConnectionCountIsZero (0 ms)
[ RUN      ] HttpServerTest.ServerCanStartAndStop
[       OK ] HttpServerTest.ServerCanStartAndStop (102 ms)
[ RUN      ] HttpServerTest.CanConnectToServer
[       OK ] HttpServerTest.CanConnectToServer (103 ms)
[ RUN      ] HttpServerTest.EchoServerEchoesData
[       OK ] HttpServerTest.EchoServerEchoesData (104 ms)
[----------] 8 tests from HttpServerTest (412 ms total)

[----------] 27 tests from HttpParserTest
...
[----------] 27 tests from HttpParserTest (15 ms total)

[==========] 35 tests from 2 test suites ran. (427 ms total)
[  PASSED  ] 35 tests.
```

### Week 1 Tests Explained

| Test Name                       | What It Tests                  |
| ------------------------------- | ------------------------------ |
| `ConstructorCreatesServer`      | Server object creation         |
| `ConstructorRejectsInvalidPort` | Port validation (0, >65535)    |
| `GetPortReturnsCorrectPort`     | Port getter method             |
| `InitiallyNotRunning`           | Initial state check            |
| `InitialConnectionCountIsZero`  | Connection counter starts at 0 |
| `ServerCanStartAndStop`         | Start/stop lifecycle           |
| `CanConnectToServer`            | TCP connection acceptance      |
| `EchoServerEchoesData`          | Echo functionality             |
| `CanHandleMultipleConnections`  | Concurrent connections         |

---

## 🚀 Running the Server

### Start the Server

```bash
./phase1.sh run

# Or specify different port
./build/flash_server 8080
```

### Expected Server Output

```
[HttpServer] Initializing server...
[HttpServer] Socket created successfully (fd=3)
[HttpServer] SO_REUSEADDR set successfully
[HttpServer] Starting server on port 5627...
[HttpServer] Socket bound to 0.0.0.0:5627
[HttpServer] Server listening with backlog 128
[HttpServer] Server listening on 0.0.0.0:5627
[HttpServer] Press Ctrl+C to stop
```

---

## 🧪 Manual Testing Week 1

### Test 1: Basic Connection with Telnet

```bash
# In terminal 1: Start server
./build/flash_server 5627

# In terminal 2: Connect with telnet
telnet localhost 5627
```

Type some text and press Enter. You should see it echoed back!

**Expected Server Log:**

```
[HttpServer] Received connection from 127.0.0.1:52341 (fd=4)
[HttpServer] Handling connection (fd=4, active=1)
[HttpServer] Received 14 bytes
[HttpParser] Invalid request: no header end found
[HttpServer] Failed to parse HTTP request
```

_(Note: Telnet input doesn't send HTTP format, so parser fails - that's expected!)_

### Test 2: Send Raw TCP Data with Netcat

```bash
# Send simple text
echo "Hello Server" | nc localhost 5627

# Send multiple lines
(echo "Line 1"; echo "Line 2"; sleep 1) | nc localhost 5627
```

**Expected Server Log:**

```
[HttpServer] Received connection from 127.0.0.1:52342 (fd=4)
[HttpServer] Handling connection (fd=4, active=1)
[HttpServer] Received 13 bytes
```

### Test 3: HTTP Request with curl (Tests Week 1 & 2)

```bash
# Simple GET request
curl -v http://localhost:5627/

# GET with path
curl -v http://localhost:5627/api/test

# POST with body
curl -v -X POST http://localhost:5627/data -d "test data"
```

**Expected Server Log:**

```
[HttpServer] Received connection from 127.0.0.1:52343 (fd=4)
[HttpServer] Handling connection (fd=4, active=1)
[HttpServer] Received 78 bytes
[HttpParser] Parsed: GET / HTTP/1.1
[HttpParser] Header: Host = localhost:5627
[HttpParser] Header: User-Agent = curl/7.88.1
[HttpParser] Header: Accept = */*

=== HTTP Request Parsed ===
Method: GET
Path: /
Version: HTTP/1.1
Headers:
  Host: localhost:5627
  User-Agent: curl/7.88.1
  Accept: */*
Body:
============================
```

### Test 4: Multiple Concurrent Connections

```bash
# Open multiple terminals and connect simultaneously
# Terminal 1:
telnet localhost 5627

# Terminal 2:
telnet localhost 5627

# Terminal 3:
telnet localhost 5627
```

Check server logs - you should see `active=1`, `active=2`, `active=3`.

### Test 5: Connection Handling

```bash
# Check what's listening on port
lsof -i :5627

# Should show:
# COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
# flash_ser 1234 user   3u  IPv4  0x...      0t0  TCP *:5627 (LISTEN)
```

---

## 🔍 Debugging Week 1 Issues

### Issue: Server Won't Start

**Symptom**: `Address already in use`

```bash
# Check if port is in use
lsof -i :5627

# Kill existing process
kill -9 <PID>

# Or use different port
./build/flash_server 8080
```

**Symptom**: `Permission denied` (port < 1024)

```bash
# Don't use privileged ports (< 1024)
# Use 5627 or higher
./build/flash_server 5627
```

### Issue: Can't Connect to Server

```bash
# 1. Verify server is running
ps aux | grep flash_server

# 2. Check if listening
lsof -i :5627

# 3. Test with telnet
telnet localhost 5627

# 4. Check firewall
# macOS: System Preferences > Security > Firewall
```

### Issue: Server Crashes on Connection

```bash
# Run with debugger
lldb ./build/flash_server

(lldb) run 5627
# ... reproduce crash ...
(lldb) bt  # Show backtrace
(lldb) frame info  # Current frame
```

### Issue: Memory Leaks

```bash
# Run with leak detection (macOS)
leaks --atExit -- ./build/flash_server 5627

# Or use the helper
./phase1.sh leaks
```

**Expected Output (no leaks):**

```
Process:         flash_server [12345]
Path:            /Users/.../build/flash_server

leaks Report Version: 4.0
Process 12345: 0 leaks for 0 total leaked bytes.
```

---

## 📊 Week 1 Test Coverage

### What's Tested

✅ **Socket Operations**

- Socket creation
- SO_REUSEADDR setting
- Bind to address
- Listen with backlog
- Accept connections

✅ **Connection Handling**

- Single connection
- Multiple connections
- Connection cleanup

✅ **I/O Operations**

- Reading from socket
- Writing to socket
- Echo functionality

✅ **Lifecycle Management**

- Constructor
- Destructor
- Start/stop methods
- Graceful shutdown

✅ **Error Handling**

- Invalid ports
- EINTR handling
- Connection errors

### What's NOT Tested (Yet)

⏳ **Week 2+ Features**

- HTTP parsing (tested in HttpParserTest)
- HTTP responses (Week 3)
- Routing (Week 4)

---

## 🎯 Success Criteria for Week 1

Run this checklist:

```bash
# 1. Build succeeds
./phase1.sh build
# ✅ Should complete without errors

# 2. All tests pass
./phase1.sh test
# ✅ Should see "PASSED: 35 tests"

# 3. Server starts
./phase1.sh run
# ✅ Should see "Server listening on 0.0.0.0:5627"

# 4. Can connect with telnet (in another terminal)
telnet localhost 5627
# ✅ Connection should succeed

# 5. Can send/receive data
# Type "hello" in telnet
# ✅ Should see response

# 6. No memory leaks
./phase1.sh leaks
# ✅ Should report "0 leaks"
```

---

## 📈 Performance Testing (Optional)

### Test Connection Throughput

```bash
# Install Apache Bench if needed
brew install httpd

# Simple benchmark (100 requests, 10 concurrent)
ab -n 100 -c 10 http://localhost:5627/
```

### Monitor Resource Usage

```bash
# Terminal 1: Start server
./build/flash_server 5627

# Terminal 2: Monitor with top
top -pid $(pgrep flash_server)

# Check CPU and memory usage
```

---

## 📝 Next Steps

Once Week 1 tests pass:

1. ✅ **Week 1 Complete** - TCP server working
2. ✅ **Week 2 Complete** - HTTP parser working
3. ⏳ **Week 3** - Build HTTP responses
4. ⏳ **Week 4** - Polish and integration

---

## 🐛 Common Test Failures

### Test: `ServerCanStartAndStop` Times Out

**Cause**: Server not setting `running_` flag correctly

**Fix**: Check `start()` method sets `running_ = true`

### Test: `CanConnectToServer` Fails

**Cause**: Server not calling `listen()` or `accept()`

**Fix**: Verify `start()` calls both `listen()` and has accept loop

### Test: `EchoServerEchoesData` Receives Nothing

**Cause**: `handle_connection()` not implementing echo

**Fix**: Ensure `handle_connection()` reads then writes data back

---

## 💡 Tips

1. **Run tests frequently** - Catch bugs early
2. **Check return values** - All socket calls can fail
3. **Log everything** - Use std::cout for debugging
4. **Test with real tools** - Use telnet, curl, netcat
5. **Check for leaks** - Run leak detection regularly

---

## 📚 References

- [Google Test Documentation](https://google.github.io/googletest/)
- [CMake Tutorial](https://cmake.org/cmake/help/latest/guide/tutorial/)
- [POSIX Socket Programming](https://beej.us/guide/bgnet/)

---

**Week 1 Testing Status: ✅ Ready to Test**

Run `./phase1.sh build && ./phase1.sh test` to verify your implementation!
