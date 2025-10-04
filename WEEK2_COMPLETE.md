# 🚀 Week 2 Complete: HTTP Request Parser

Congratulations! You've completed Week 1 and now have a working TCP echo server. This week, we're adding **HTTP request parsing** to understand the HTTP/1.1 protocol.

---

## 📋 What We've Built

### Files Created

1. **`cpp/include/http_request.h`** - HttpRequest data structure
2. **`cpp/src/http_request.cpp`** - Helper methods (case-insensitive header lookup)
3. **`cpp/include/http_parser.h`** - HttpParser class interface
4. **`cpp/src/http_parser.cpp`** - **COMPLETE HTTP parser implementation** ✅
5. **`cpp/tests/test_http_parser.cpp`** - Comprehensive unit tests (27 tests)
6. **Updated `server.cpp`** - Integrated parser into `handle_connection()`

### What the Parser Does

The HTTP parser converts raw socket data into structured `HttpRequest` objects:

```
Raw Input:
GET /api/users HTTP/1.1
Host: localhost:5627
Accept: application/json

↓ Parse ↓

HttpRequest {
  method: "GET"
  path: "/api/users"
  version: "HTTP/1.1"
  headers: {
    "Host": "localhost:5627",
    "Accept": "application/json"
  }
  body: ""
}
```

---

## 🧪 Testing Your Implementation

### 1. Build the Project

```bash
# Using the helper script
./phase1.sh build

# Or manually with CMake (if installed)
mkdir -p build && cd build
cmake ../cpp -DCMAKE_BUILD_TYPE=Debug
make -j$(sysctl -n hw.ncpu)
```

### 2. Run Unit Tests

```bash
# Run all tests
./phase1.sh test

# Or manually
./build/flash_tests

# Run specific test suite
./build/flash_tests --gtest_filter=HttpParserTest.*
```

**Expected Output:**

```
[==========] Running 27 tests from 1 test suite.
[----------] Global test environment set-up.
[----------] 27 tests from HttpParserTest
[ RUN      ] HttpParserTest.ParsesSimpleGetRequest
[       OK ] HttpParserTest.ParsesSimpleGetRequest (0 ms)
[ RUN      ] HttpParserTest.ParsesGetRequestWithHeaders
[       OK ] HttpParserTest.ParsesGetRequestWithHeaders (0 ms)
...
[----------] 27 tests from HttpParserTest (5 ms total)
[==========] 27 tests from 1 test suite ran. (5 ms total)
[  PASSED  ] 27 tests.
```

### 3. Test with Real HTTP Requests

Start the server:

```bash
./phase1.sh run
# Or: ./build/flash_server 5627
```

In another terminal, send HTTP requests with curl:

```bash
# Simple GET request
curl -v http://localhost:5627/

# GET with path
curl -v http://localhost:5627/api/users

# GET with query string
curl -v "http://localhost:5627/search?q=hello&limit=10"

# POST with JSON body
curl -v -X POST http://localhost:5627/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John","age":30}'

# PUT request
curl -v -X PUT http://localhost:5627/api/users/123

# DELETE request
curl -v -X DELETE http://localhost:5627/api/users/123
```

**Expected Server Output:**

```
[HttpServer] Server listening on 0.0.0.0:5627
[HttpServer] Received connection from 127.0.0.1:54321 (fd=4)
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

---

## 🔍 Understanding the HTTP Parser

### HTTP/1.1 Request Format

```
Request-Line:    GET /path HTTP/1.1\r\n
Headers:         Host: localhost:5627\r\n
                 Accept: */*\r\n
                 \r\n
Body:            [optional body data]
```

**Key Points:**

- Lines end with `\r\n` (carriage return + line feed)
- Headers end with blank line (`\r\n\r\n`)
- First line is request line: `METHOD PATH VERSION`
- Headers are `Name: Value` pairs
- Body starts after `\r\n\r\n`

### Parser Implementation Logic

The parser in `http_parser.cpp` follows this flow:

1. **Find Header End**: Search for `\r\n\r\n` to separate headers from body
2. **Extract Sections**: Split into headers section and body
3. **Parse Request Line**: Split first line by spaces → method, path, version
4. **Parse Headers**: For each line, split on `:` → name, value
5. **Trim Whitespace**: Clean up header values
6. **Validate**: Check that method, path, version are present

**Example Code Flow:**

```cpp
// 1. Find end of headers
size_t header_end = request_str.find("\r\n\r\n");

// 2. Extract sections
std::string headers_section = request_str.substr(0, header_end);
std::string body = request_str.substr(header_end + 4);

// 3. Split headers into lines
std::istringstream stream(headers_section);
std::string line;
while (std::getline(stream, line)) {
    // Parse each line...
}
```

### Case-Insensitive Header Lookup

HTTP headers are case-insensitive per RFC 7230. The `get_header()` method handles this:

```cpp
std::optional<std::string> HttpRequest::get_header(const std::string& name) const {
    // Convert search name to lowercase
    std::string lower_name = to_lower(name);

    // Search all headers
    for (const auto& [key, value] : headers) {
        if (to_lower(key) == lower_name) {
            return value;
        }
    }

    return std::nullopt;
}
```

This means all these work:

```cpp
request.get_header("Content-Type")
request.get_header("content-type")
request.get_header("CONTENT-TYPE")
```

---

## ✅ Week 2 Checklist

- [x] **HttpRequest Struct**: Defined with method, path, version, headers, body
- [x] **HttpParser Class**: parse(), parse_request_line(), parse_header(), trim()
- [x] **Parser Implementation**: Complete with error handling
- [x] **Unit Tests**: 27 comprehensive tests covering:
  - Basic GET/POST/PUT/DELETE requests
  - Headers parsing (single, multiple, case-insensitive)
  - Request body handling
  - Query strings
  - Error cases (invalid requests, missing parts)
  - Edge cases (empty body, large body, HTTP/1.0)
- [x] **Server Integration**: Parser integrated into `handle_connection()`
- [x] **Testing**: Can parse real curl requests
- [x] **Error Handling**: Returns 400 Bad Request for invalid requests

---

## 🎯 What's Next: Week 3

Now that we can **parse HTTP requests**, Week 3 will focus on **building HTTP responses**:

### Week 3 Goals

1. **HttpResponse Class**

   - Status code (200, 404, 500, etc.)
   - Status message ("OK", "Not Found", etc.)
   - Headers (Content-Type, Content-Length)
   - Body content
   - Serialize to string

2. **Response Builder**

   ```cpp
   HttpResponse response;
   response.set_status(200, "OK");
   response.set_header("Content-Type", "application/json");
   response.set_body("{\"message\":\"Hello World\"}");
   std::string raw = response.serialize();
   ```

3. **Update Server**

   - Replace echo with proper HTTP responses
   - Return 200 OK for valid requests
   - Return 404 for unknown paths
   - Return 400 for parse errors

4. **HTTP Status Codes**
   - 200 OK
   - 404 Not Found
   - 400 Bad Request
   - 500 Internal Server Error

### Week 3 Testing

```bash
curl http://localhost:5627/
# Should return proper HTTP response:
# HTTP/1.1 200 OK
# Content-Type: text/plain
# Content-Length: 13
#
# Hello, World!
```

---

## 📚 Learning Resources

### HTTP/1.1 Protocol

- [RFC 7230 - HTTP/1.1 Message Syntax](https://tools.ietf.org/html/rfc7230)
- [MDN: HTTP Messages](https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages)
- [HTTP Made Really Easy](https://www.jmarshall.com/easy/http/)

### String Parsing in C++

- [std::string methods](https://en.cppreference.com/w/cpp/string/basic_string)
- [std::istringstream](https://en.cppreference.com/w/cpp/io/basic_istringstream)
- [std::getline](https://en.cppreference.com/w/cpp/string/basic_string/getline)
- [std::string::find](https://en.cppreference.com/w/cpp/string/basic_string/find)
- [std::string::substr](https://en.cppreference.com/w/cpp/string/basic_string/substr)

### Testing with Google Test

- [Google Test Primer](https://google.github.io/googletest/primer.html)
- [Assertions Reference](https://google.github.io/googletest/reference/assertions.html)

---

## 🐛 Debugging Tips

### Parser Not Working?

1. **Print raw request data**:

   ```cpp
   std::cout << "Raw data (" << bytes_read << " bytes):" << std::endl;
   std::cout << std::string(buffer, bytes_read) << std::endl;
   std::cout << "Hex dump:" << std::endl;
   for (size_t i = 0; i < bytes_read; i++) {
       printf("%02x ", (unsigned char)buffer[i]);
   }
   printf("\n");
   ```

2. **Check for \r\n**:

   ```cpp
   size_t pos = request_str.find("\r\n");
   std::cout << "First \\r\\n at position: " << pos << std::endl;
   ```

3. **Validate request line parsing**:
   ```cpp
   std::istringstream iss(line);
   std::string method, path, version;
   iss >> method >> path >> version;
   std::cout << "Parsed: [" << method << "] [" << path << "] [" << version << "]" << std::endl;
   ```

### Tests Failing?

1. **Run specific test**:

   ```bash
   ./build/flash_tests --gtest_filter=HttpParserTest.ParsesSimpleGetRequest
   ```

2. **Enable verbose output**:

   ```bash
   ./build/flash_tests --gtest_filter=HttpParserTest.* --gtest_print_time=1
   ```

3. **Check test expectations**:
   - ASSERT_TRUE fails → Optional has no value (parse failed)
   - EXPECT_EQ fails → Wrong value parsed
   - Look at the error message for which field mismatched

### Connection Issues?

```bash
# Check if server is listening
lsof -i :5627

# Test with telnet
telnet localhost 5627
GET / HTTP/1.1
Host: localhost

[press Enter twice]

# Test with netcat
echo -e "GET / HTTP/1.1\r\nHost: localhost\r\n\r\n" | nc localhost 5627
```

---

## 🎉 Congratulations!

You've successfully implemented an HTTP/1.1 request parser! This is a critical piece of any web server. You now understand:

- ✅ HTTP/1.1 message format
- ✅ String parsing techniques in C++
- ✅ std::optional for error handling
- ✅ Case-insensitive comparisons
- ✅ Unit testing with Google Test
- ✅ Integration testing with curl

**Ready for Week 3?** You'll build the response side of HTTP and have a complete HTTP server!

---

## 📝 Summary

| Component                 | Status          | Lines of Code |
| ------------------------- | --------------- | ------------- |
| HttpRequest struct        | ✅ Complete     | ~50           |
| HttpParser implementation | ✅ Complete     | ~150          |
| Unit tests                | ✅ Complete     | ~290          |
| Server integration        | ✅ Complete     | ~30           |
| **Total Week 2**          | **✅ Complete** | **~520**      |

**Week 1 Total**: ~300 LOC  
**Week 2 Total**: ~520 LOC  
**Phase 1 Progress**: 2/4 weeks complete (50%) 🎯
