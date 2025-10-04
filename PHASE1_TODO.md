# Phase 1 TODO Tracker

Track your progress through Phase 1 implementation!

## Week 1: TCP Server Basics ⏳

### Day 1-2: Socket Creation & Binding

- [ ] Implement `HttpServer` constructor
  - [ ] Create socket with `socket(AF_INET, SOCK_STREAM, 0)`
  - [ ] Set `SO_REUSEADDR` option
  - [ ] Handle errors and throw exceptions
  - [ ] Add debug logging
  - **File:** `cpp/src/server.cpp` (line ~36)
- [ ] Implement `HttpServer` destructor
  - [ ] Close socket if open
  - [ ] Set socket_fd to -1
  - [ ] Don't throw exceptions!
  - **File:** `cpp/src/server.cpp` (line ~52)

### Day 3-4: Listen & Accept

- [ ] Implement `start()` method
  - [ ] Create `sockaddr_in` structure
  - [ ] Bind socket to port with `bind()`
  - [ ] Start listening with `listen()`
  - [ ] Set `running_` flag to true
  - **File:** `cpp/src/server.cpp` (line ~96)
- [ ] Implement accept loop in `start()`
  - [ ] Loop while `running_` is true
  - [ ] Call `accept()` to get client connections
  - [ ] Handle `EINTR` (interrupted system call)
  - [ ] Log client IP address
  - [ ] Call `handle_connection(client_fd)`
  - [ ] Close client socket after handling
  - **File:** `cpp/src/server.cpp` (line ~120)

### Day 5: Socket I/O

- [ ] Implement `read_from_socket()`
  - [ ] Call `read()` system call
  - [ ] Handle errors and return -1
  - [ ] Log errors with `strerror(errno)`
  - **File:** `cpp/src/server.cpp` (line ~176)
- [ ] Implement `write_to_socket()`
  - [ ] Call `write()` system call
  - [ ] Handle errors and return -1
  - [ ] Log errors
  - **File:** `cpp/src/server.cpp` (line ~193)

### Day 6-7: Echo Server & Testing

- [ ] Implement basic echo in `handle_connection()`
  - [ ] Create buffer
  - [ ] Read data with `read_from_socket()`
  - [ ] Write data back with `write_to_socket()`
  - [ ] Log bytes received/sent
  - **File:** `cpp/src/server.cpp` (line ~152)
- [ ] Implement `stop()` method

  - [ ] Set `running_` to false
  - [ ] Close listening socket
  - **File:** `cpp/src/server.cpp` (line ~135)

- [ ] Build and test

  - [ ] Run `npm run build:cpp` or CMake
  - [ ] Fix compilation errors
  - [ ] Run `./build/flash_server`
  - [ ] Test with `telnet localhost 3000`
  - [ ] Test with `curl http://localhost:3000/`
  - [ ] Verify echo functionality

- [ ] Run unit tests
  - [ ] Uncomment basic tests in `test_server.cpp`
  - [ ] Run `npm run test:cpp`
  - [ ] Fix failing tests
  - [ ] Check for memory leaks with `leaks`

### Week 1 Milestone ✅

- [ ] Server compiles without errors
- [ ] Server starts and listens on port 3000
- [ ] Can connect with telnet
- [ ] Echoes back whatever you send
- [ ] No memory leaks detected
- [ ] Passes basic unit tests

---

## Week 2: HTTP Request Parsing ⏳

### Day 1-2: Request Data Structure

- [ ] Create `cpp/include/http_request.h`
  - [ ] Define `HttpRequest` struct
  - [ ] Add fields: method, path, version
  - [ ] Add field: headers (map or vector)
  - [ ] Add field: body (string)
  - [ ] Add documentation comments
- [ ] Create `cpp/src/http_request.cpp`
  - [ ] Implement any helper methods
  - [ ] Add to CMakeLists.txt

### Day 3-4: Parser Implementation

- [ ] Create `cpp/include/http_parser.h`
  - [ ] Define `HttpParser` class
  - [ ] Add `parse()` method returning `std::optional<HttpRequest>`
  - [ ] Add documentation
- [ ] Create `cpp/src/http_parser.cpp`
  - [ ] Implement request line parsing
    - [ ] Extract method (GET, POST, etc.)
    - [ ] Extract path (/index.html)
    - [ ] Extract HTTP version (HTTP/1.1)
  - [ ] Implement header parsing
    - [ ] Loop through header lines
    - [ ] Split on `: ` delimiter
    - [ ] Store in headers map
  - [ ] Handle malformed requests
    - [ ] Return `std::nullopt` on error
  - [ ] Add to CMakeLists.txt

### Day 5-6: Parser Testing

- [ ] Create `cpp/tests/test_http_parser.cpp`
  - [ ] Test simple GET request
  - [ ] Test with headers
  - [ ] Test with query string
  - [ ] Test malformed requests
  - [ ] Test empty requests
- [ ] Run parser tests
  - [ ] Add test file to CMakeLists.txt
  - [ ] Build and run tests
  - [ ] Fix failing tests
  - [ ] Verify edge cases

### Day 7: Integration

- [ ] Update `handle_connection()` in server
  - [ ] Read data into buffer
  - [ ] Pass buffer to parser
  - [ ] Check if parsing succeeded
  - [ ] Log parsed request
  - [ ] (Still echo for now, we'll add response next week)

### Week 2 Milestone ✅

- [ ] Can parse HTTP GET requests
- [ ] Extracts method, path, version correctly
- [ ] Parses headers correctly
- [ ] Handles malformed requests gracefully
- [ ] Parser passes all unit tests
- [ ] Server logs parsed request details

---

## Week 3: HTTP Response Building ⏳

### Day 1-2: Response Data Structure

- [ ] Create `cpp/include/http_response.h`
  - [ ] Define `HttpResponse` class
  - [ ] Add status code field
  - [ ] Add headers map
  - [ ] Add body string
  - [ ] Add builder methods
  - [ ] Add documentation
- [ ] Create `cpp/src/http_response.cpp`
  - [ ] Implement `set_status()` method
  - [ ] Implement `add_header()` method
  - [ ] Implement `set_body()` method
  - [ ] Add to CMakeLists.txt

### Day 3-4: Response Formatting

- [ ] Implement `to_string()` in HttpResponse
  - [ ] Build status line (HTTP/1.1 200 OK)
  - [ ] Build headers (Content-Type: text/plain)
  - [ ] Add Content-Length header automatically
  - [ ] Add blank line separator
  - [ ] Append body
  - [ ] Return formatted string
- [ ] Add common status codes
  - [ ] 200 OK
  - [ ] 404 Not Found
  - [ ] 500 Internal Server Error
  - [ ] Define as constants or enum

### Day 5: Response Testing

- [ ] Create `cpp/tests/test_http_response.cpp`
  - [ ] Test basic 200 response
  - [ ] Test with headers
  - [ ] Test with body
  - [ ] Test Content-Length calculation
  - [ ] Test different status codes
- [ ] Run response tests
  - [ ] Build and run
  - [ ] Fix failing tests

### Day 6-7: End-to-End Integration

- [ ] Update `handle_connection()` for HTTP
  - [ ] Read request
  - [ ] Parse request with HttpParser
  - [ ] Build response with HttpResponse
  - [ ] Send response back to client
  - [ ] Handle errors gracefully
- [ ] Test with curl
  - [ ] `curl http://localhost:3000/`
  - [ ] `curl -v http://localhost:3000/test`
  - [ ] Verify status code 200
  - [ ] Verify headers present
  - [ ] Verify body content

### Week 3 Milestone ✅

- [ ] Can build HTTP responses
- [ ] Sets status codes correctly
- [ ] Adds headers correctly
- [ ] Calculates Content-Length automatically
- [ ] Response builder passes all tests
- [ ] curl gets proper HTTP response

---

## Week 4: Polish & Testing 🎯

### Day 1-2: Code Cleanup

- [ ] Add comprehensive logging
  - [ ] Request received
  - [ ] Response sent
  - [ ] Errors encountered
- [ ] Improve error handling
  - [ ] Catch all exceptions
  - [ ] Return 500 on errors
  - [ ] Don't crash server
- [ ] Code review
  - [ ] Check for memory leaks
  - [ ] Verify RAII usage
  - [ ] Ensure const correctness
  - [ ] Add missing comments

### Day 3-4: Advanced Testing

- [ ] Uncomment all unit tests
- [ ] Run full test suite
- [ ] Fix any failing tests
- [ ] Add integration tests
  - [ ] Multiple sequential requests
  - [ ] Large request bodies
  - [ ] Invalid requests
- [ ] Test with different tools
  - [ ] telnet
  - [ ] curl
  - [ ] browser
  - [ ] ab (Apache Bench)

### Day 5: Documentation

- [ ] Document all public APIs
- [ ] Update code comments
- [ ] Write usage examples
- [ ] Document any known issues
- [ ] Update README with Phase 1 progress

### Day 6-7: Validation & Celebration

- [ ] Run final tests
  - [ ] All unit tests pass
  - [ ] No memory leaks
  - [ ] No segfaults
  - [ ] Graceful shutdown works
- [ ] Performance baseline
  - [ ] Test with `wrk` or `ab`
  - [ ] Record requests/second
  - [ ] Note for Phase 5 comparison
- [ ] Create demo
  - [ ] Simple echo server demo
  - [ ] HTTP response demo
  - [ ] Document how to run

### Week 4 Milestone ✅

- [ ] Complete HTTP server works
- [ ] All tests pass
- [ ] No memory leaks
- [ ] Well documented
- [ ] Demo ready

---

## Final Phase 1 Checklist ✅

### Core Functionality

- [ ] TCP server accepts connections
- [ ] HTTP request parser works
- [ ] HTTP response builder works
- [ ] End-to-end request/response cycle
- [ ] Graceful shutdown (Ctrl+C)

### Code Quality

- [ ] No memory leaks
- [ ] No compiler warnings
- [ ] RAII used throughout
- [ ] Proper error handling
- [ ] Const correctness

### Testing

- [ ] Unit tests for server
- [ ] Unit tests for parser
- [ ] Unit tests for response
- [ ] Integration tests
- [ ] Manual testing with curl

### Documentation

- [ ] All public APIs documented
- [ ] Code comments present
- [ ] Usage examples provided
- [ ] Known issues documented

### Success Criteria

- [ ] `curl http://localhost:3000/` returns HTTP response
- [ ] Response has correct status line
- [ ] Response has correct headers
- [ ] Response has body content
- [ ] No crashes or segfaults
- [ ] Clean shutdown

---

## Next Steps (Phase 2)

After completing Phase 1:

1. Review what you learned
2. Document challenges faced
3. Note improvements for Phase 2
4. Begin N-API integration planning

**Congratulations!** 🎉

You'll have built a working HTTP server in C++ from scratch!

---

## Tips & Tricks

### Debugging

```bash
# Run with debugger
lldb ./build/flash_server

# Set breakpoint
(lldb) b HttpServer::handle_connection

# Check memory
leaks --atExit -- ./build/flash_server
```

### Testing

```bash
# Simple request
echo -e "GET / HTTP/1.1\r\nHost: localhost\r\n\r\n" | nc localhost 3000

# Load test
ab -n 1000 -c 10 http://localhost:3000/
```

### Common Issues

- **Port already in use:** `lsof -ti:3000 | xargs kill -9`
- **Segfault:** Run with lldb, check null pointers
- **Memory leak:** Use smart pointers, check RAII
- **Compile error:** Check C++20 flag in CMakeLists.txt

---

**Last Updated:** 2025-01-04  
**Status:** Ready to start!  
**Good luck!** 🚀
