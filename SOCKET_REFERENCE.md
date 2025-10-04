# Socket Programming Quick Reference

Essential reference for Phase 1 implementation.

## Core Socket Functions

### 1. socket() - Create Socket

```cpp
#include <sys/socket.h>

int socket_fd = socket(AF_INET, SOCK_STREAM, 0);
```

- **AF_INET**: IPv4 address family
- **SOCK_STREAM**: TCP (reliable, connection-oriented)
- **Returns**: File descriptor (>= 0) on success, -1 on error
- **Check**: `if (socket_fd < 0) { perror("socket"); }`

### 2. setsockopt() - Set Socket Options

```cpp
#include <sys/socket.h>

int opt = 1;
setsockopt(socket_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
```

- **SO_REUSEADDR**: Allow reuse of local addresses (important!)
- **Why**: Prevents "Address already in use" after restart
- **When**: Call immediately after socket()

### 3. bind() - Bind to Address

```cpp
#include <netinet/in.h>

struct sockaddr_in address;
address.sin_family = AF_INET;
address.sin_addr.s_addr = INADDR_ANY;  // Listen on all interfaces
address.sin_port = htons(3000);         // Port 3000 (network byte order)

int result = bind(socket_fd, (struct sockaddr*)&address, sizeof(address));
```

- **sockaddr_in**: IPv4 address structure
- **htons()**: Host to network short (converts byte order)
- **INADDR_ANY**: Accept connections on any network interface
- **Returns**: 0 on success, -1 on error

### 4. listen() - Mark Socket as Passive

```cpp
#include <sys/socket.h>

int backlog = 128;  // Max queued connections
int result = listen(socket_fd, backlog);
```

- **backlog**: How many connections can queue while waiting for accept()
- **Typical value**: 128 or 1024
- **Returns**: 0 on success, -1 on error

### 5. accept() - Accept Connection

```cpp
struct sockaddr_in client_addr;
socklen_t client_len = sizeof(client_addr);

int client_fd = accept(socket_fd,
                      (struct sockaddr*)&client_addr,
                      &client_len);
```

- **Blocks**: Until a client connects
- **Returns**: New socket FD for client connection
- **client_addr**: Filled with client's address
- **Important**: Close client_fd when done!

### 6. read() - Read Data

```cpp
#include <unistd.h>

char buffer[8192];
ssize_t bytes_read = read(client_fd, buffer, sizeof(buffer));
```

- **Returns**: Number of bytes read, 0 if connection closed, -1 on error
- **May read less**: Than buffer size (not an error)
- **EINTR**: System call interrupted, retry

### 7. write() - Write Data

```cpp
#include <unistd.h>

const char* data = "Hello, World!";
ssize_t bytes_written = write(client_fd, data, strlen(data));
```

- **Returns**: Number of bytes written, -1 on error
- **May write less**: Than requested (not an error)
- **EINTR**: System call interrupted, retry
- **EPIPE**: Connection closed by peer

### 8. close() - Close Socket

```cpp
#include <unistd.h>

close(socket_fd);
```

- **Call**: In destructor for RAII
- **When**: Done with socket, or on error
- **Important**: Always close both server and client sockets

## Helper Functions

### Get Client IP Address

```cpp
#include <arpa/inet.h>

char client_ip[INET_ADDRSTRLEN];
inet_ntop(AF_INET, &client_addr.sin_addr, client_ip, INET_ADDRSTRLEN);
std::cout << "Client: " << client_ip << std::endl;
```

### Get Client Port

```cpp
uint16_t client_port = ntohs(client_addr.sin_port);
std::cout << "Port: " << client_port << std::endl;
```

## Error Handling

### Check Return Values

```cpp
if (socket_fd < 0) {
    perror("socket");  // Print system error
    throw std::runtime_error(std::string("Socket error: ") + strerror(errno));
}
```

### Common errno Values

- **EINTR**: System call interrupted by signal → Retry
- **EAGAIN/EWOULDBLOCK**: Non-blocking operation would block → Try later
- **EPIPE**: Broken pipe (connection closed) → Close socket
- **EADDRINUSE**: Address already in use → Use SO_REUSEADDR
- **ECONNRESET**: Connection reset by peer → Close socket

### Handle EINTR (Interrupted System Call)

```cpp
ssize_t read_with_retry(int fd, char* buffer, size_t size) {
    ssize_t result;
    do {
        result = read(fd, buffer, size);
    } while (result < 0 && errno == EINTR);
    return result;
}
```

## Complete Server Flow

```cpp
// 1. Create socket
int server_fd = socket(AF_INET, SOCK_STREAM, 0);
if (server_fd < 0) {
    throw std::runtime_error("Socket creation failed");
}

// 2. Set socket options
int opt = 1;
setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

// 3. Prepare address
struct sockaddr_in address;
address.sin_family = AF_INET;
address.sin_addr.s_addr = INADDR_ANY;
address.sin_port = htons(3000);

// 4. Bind to address
if (bind(server_fd, (struct sockaddr*)&address, sizeof(address)) < 0) {
    close(server_fd);
    throw std::runtime_error("Bind failed");
}

// 5. Start listening
if (listen(server_fd, 128) < 0) {
    close(server_fd);
    throw std::runtime_error("Listen failed");
}

// 6. Accept loop
while (running) {
    struct sockaddr_in client_addr;
    socklen_t client_len = sizeof(client_addr);

    int client_fd = accept(server_fd,
                          (struct sockaddr*)&client_addr,
                          &client_len);

    if (client_fd < 0) {
        if (errno == EINTR) continue;
        perror("accept");
        break;
    }

    // 7. Handle connection
    char buffer[8192];
    ssize_t bytes_read = read(client_fd, buffer, sizeof(buffer) - 1);

    if (bytes_read > 0) {
        buffer[bytes_read] = '\0';  // Null terminate
        write(client_fd, buffer, bytes_read);  // Echo
    }

    // 8. Close client socket
    close(client_fd);
}

// 9. Close server socket
close(server_fd);
```

## HTTP Protocol Basics

### HTTP Request Format

```
GET /index.html HTTP/1.1\r\n
Host: localhost:3000\r\n
User-Agent: curl/7.64.1\r\n
Accept: */*\r\n
\r\n
```

**Structure:**

1. Request line: `METHOD PATH VERSION\r\n`
2. Headers: `Name: Value\r\n` (one per line)
3. Blank line: `\r\n` (marks end of headers)
4. Body: (optional, for POST/PUT)

**Important:**

- Each line ends with `\r\n` (CRLF)
- Headers end with blank line `\r\n\r\n`
- Request ends with `\r\n\r\n`

### HTTP Response Format

```
HTTP/1.1 200 OK\r\n
Content-Type: text/plain\r\n
Content-Length: 13\r\n
\r\n
Hello, World!
```

**Structure:**

1. Status line: `VERSION STATUS_CODE STATUS_TEXT\r\n`
2. Headers: `Name: Value\r\n`
3. Blank line: `\r\n`
4. Body: Actual content

### Common Status Codes

- **200 OK**: Success
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

## Testing Commands

### Test with telnet (Raw TCP)

```bash
telnet localhost 3000
GET / HTTP/1.1
Host: localhost
[press Enter twice]
```

### Test with curl (HTTP)

```bash
# Simple GET
curl http://localhost:3000/

# Verbose (show headers)
curl -v http://localhost:3000/

# Custom header
curl -H "X-Custom: value" http://localhost:3000/
```

### Test with netcat

```bash
echo -e "GET / HTTP/1.1\r\nHost: localhost\r\n\r\n" | nc localhost 3000
```

### Check port usage

```bash
# List processes on port 3000
lsof -i :3000

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

## Debugging

### Print buffer contents

```cpp
std::cout << "Received " << bytes_read << " bytes:" << std::endl;
std::cout << std::string(buffer, bytes_read) << std::endl;
```

### Print as hex

```cpp
for (size_t i = 0; i < bytes_read; ++i) {
    printf("%02x ", (unsigned char)buffer[i]);
}
printf("\n");
```

### Check for \r\n

```cpp
if (strstr(buffer, "\r\n\r\n") != nullptr) {
    std::cout << "Found end of HTTP headers" << std::endl;
}
```

## Common Pitfalls

1. **Forgetting SO_REUSEADDR**: Get "Address already in use"
2. **Not handling EINTR**: Server exits unexpectedly
3. **Not closing client_fd**: File descriptor leak
4. **Not null-terminating buffer**: Garbage in strings
5. **Partial reads/writes**: Assume complete in one call
6. **Wrong byte order**: Forget htons()/ntohs()
7. **Buffer overflow**: Not checking buffer size

## Best Practices

1. **Always check return values**: Every syscall can fail
2. **Use RAII**: Close in destructor
3. **Log everything**: Debug with logs
4. **Handle EINTR**: Retry on interrupt
5. **Set SO_REUSEADDR**: Allow quick restart
6. **Close sockets**: In destructor and on error
7. **Validate input**: Check buffer sizes, null terminate

## Next Steps

After basic socket programming works:

1. Parse HTTP requests
2. Build HTTP responses
3. Handle multiple requests
4. Add error handling
5. Optimize performance

---

**Reference Documentation:**

- `man socket` - Socket programming
- `man 7 ip` - IP protocol
- `man 7 tcp` - TCP protocol
- RFC 2616 - HTTP/1.1 specification

**Good luck!** 🚀
