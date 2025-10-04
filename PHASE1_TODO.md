# Phase 1 TODO Tracker

Track your progress through Phase 1 implementation!

## Week 1: TCP Server Basics ✅

### Day 1-2: Socket Creation & Binding

- [x] Implement `HttpServer` constructor
  - [x] Create socket with `socket(AF_INET, SOCK_STREAM, 0)`
  - [x] Set `SO_REUSEADDR` option
  - [x] Handle errors and throw exceptions
  - [x] Add debug logging
  - **File:** `cpp/src/server.cpp` (line ~36)
- [x] Implement `HttpServer` destructor
  - [x] Close socket if open
  - [x] Set socket_fd to -1
  - [x] Don't throw exceptions!
  - **File:** `cpp/src/server.cpp` (line ~52)

### Day 3-4: Listen & Accept

- [x] Implement `start()` method
  - [x] Create `sockaddr_in` structure
  - [x] Bind socket to port with `bind()`
  - [x] Start listening with `listen()`
  - [x] Set `running_` flag to true
  - **File:** `cpp/src/server.cpp` (line ~96)
- [x] Implement accept loop in `start()`
  - [x] Loop while `running_` is true
  - [x] Call `accept()` to get client connections
  - [x] Handle `EINTR` (interrupted system call)
  - [x] Log client IP address
  - [x] Call `handle_connection(client_fd)`
  - [x] Close client socket after handling
  - **File:** `cpp/src/server.cpp` (line ~120)

### Day 5: Socket I/O

- [x] Implement `read_from_socket()`
  - [x] Call `read()` system call
  - [x] Handle errors and return -1
  - [x] Log errors with `strerror(errno)`
  - **File:** `cpp/src/server.cpp` (line ~176)
- [x] Implement `write_to_socket()`
  - [x] Call `write()` system call
  - [x] Handle errors and return -1
  - [x] Log errors
  - **File:** `cpp/src/server.cpp` (line ~193)

### Day 6-7: Echo Server & Testing

- [x] Implement basic echo in `handle_connection()`
  - [x] Create buffer
  - [x] Read data with `read_from_socket()`
  - [x] Write data back with `write_to_socket()`
  - [x] Log bytes received/sent
  - **File:** `cpp/src/server.cpp` (line ~152)
- [x] Implement `stop()` method

  - [x] Set `running_` to false
  - [x] Close listening socket
  - **File:** `cpp/src/server.cpp` (line ~135)

- [x] Build and test

  - [x] Run `npm run build:cpp` or CMake
  - [x] Fix compilation errors
  - [x] Run `./build/flash_server`
  - [x] Test with `telnet localhost 5627`
  - [x] Test with `curl http://localhost:5627/`
  - [x] Verify echo functionality

- [x] Run unit tests
  - [x] Uncomment basic tests in `test_server.cpp`
  - [x] Run `npm run test:cpp`
  - [x] Fix failing tests
  - [x] Check for memory leaks with `leaks`

### Week 1 Milestone ✅

- [x] Server compiles without errors
- [x] Server starts and listens on port 5627
- [x] Can connect with telnet
- [x] Echoes back whatever you send
- [x] No memory leaks detected
- [x] Passes basic unit tests

---

## Week 2: HTTP Request Parsing ✅

### Day 1-2: Request Data Structure

- [x] Create `cpp/include/http_request.h`
  - [x] Define `HttpRequest` struct
  - [x] Add fields: method, path, version
  - [x] Add field: headers (map or vector)
  - [x] Add field: body (string)
  - [x] Add documentation comments
- [ ] Create `cpp/src/http_request.cpp`
  - [x] Implement any helper methods
  - [x] Add to CMakeLists.txt

### Day 3-4: Parser Implementation

- [x] Create `cpp/include/http_parser.h`
  - [x] Define `HttpParser` class
  - [x] Add `parse()` method returning `std::optional<HttpRequest>`
  - [x] Add documentation
- [x] Create `cpp/src/http_parser.cpp`
  - [x] Implement request line parsing
    - [x] Extract method (GET, POST, etc.)
    - [x] Extract path (/index.html)
    - [x] Extract HTTP version (HTTP/1.1)
  - [x] Implement header parsing
    - [x] Loop through header lines
    - [x] Split on `: ` delimiter
    - [x] Store in headers map
  - [x] Handle malformed requests
    - [x] Return `std::nullopt` on error
  - [x] Add to CMakeLists.txt

### Day 5-6: Parser Testing

- [x] Create `cpp/tests/test_http_parser.cpp`
  - [x] Test simple GET request
  - [x] Test with headers
  - [x] Test with query string
  - [x] Test malformed requests
  - [x] Test empty requests
- [x] Run parser tests
  - [x] Add test file to CMakeLists.txt
  - [x] Build and run tests
  - [x] Fix failing tests
  - [x] Verify edge cases

### Day 7: Integration

- [x] Update `handle_connection()` in server
  - [x] Read data into buffer
  - [x] Pass buffer to parser
  - [x] Check if parsing succeeded
  - [x] Log parsed request
  - [x] (Still echo for now, we'll add response next week)

### Week 2 Milestone ✅

- [x] Can parse HTTP GET requests
- [x] Extracts method, path, version correctly
- [x] Parses headers correctly
- [x] Handles malformed requests gracefully
- [x] Parser passes all unit tests (27 tests)
- [x] Server logs parsed request details

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
  - [ ] `curl http://localhost:5627/`
  - [ ] `curl -v http://localhost:5627/test`
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
echo -e "GET / HTTP/1.1\r\nHost: localhost\r\n\r\n" | nc localhost 5627

# Load test
ab -n 1000 -c 10 http://localhost:5627/
```

### Common Issues

### Common Issues

- **Port already in use:** `lsof -ti:5627 | xargs kill -9`
- **Segfault:** Run with lldb, check null pointers
- **Memory leak:** Use smart pointers, check RAII
- **Compile error:** Check C++20 flag in CMakeLists.txt

---

**Last Updated:** 2025-01-04  
**Status:** Ready to start!  
**Good luck!** 🚀
