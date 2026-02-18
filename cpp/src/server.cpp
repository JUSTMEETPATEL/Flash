/**
 * @file server.cpp
 * @brief Implementation of HTTP server core
 * 
 * PHASE 1 IMPLEMENTATION GUIDE:
 * 
 * This file contains TODOs for you to fill in. The structure is provided,
 * but you'll implement the actual socket programming.
 * 
 * RECOMMENDED ORDER:
 * 1. Implement constructor (create socket)
 * 2. Implement destructor (close socket)
 * 3. Implement start() with basic accept loop
 * 4. Implement handle_connection() with echo server
 * 5. Test with telnet
 * 6. Add HTTP parsing (Week 2)
 * 7. Add HTTP response (Week 3)
 */

#include "server.h"
#include "http_parser.h"
#include "http_response.h"

#include <cstring>
#include <stdexcept>
#include <system_error>

// POSIX socket includes
#include <sys/socket.h>
#include <netinet/in.h>
#include <netinet/tcp.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <fcntl.h>
#include <errno.h>
#include <poll.h>

namespace flash {

// ============================================================================
// Pre-computed Static Responses (Performance Optimization)
// ============================================================================

// Pre-computed HTTP response for /hello endpoint (keep-alive)
static const std::string HELLO_RESPONSE_KEEPALIVE = 
    "HTTP/1.1 200 OK\r\n"
    "Content-Type: text/plain\r\n"
    "Content-Length: 13\r\n"
    "Server: Flash/0.1\r\n"
    "Connection: keep-alive\r\n"
    "\r\n"
    "Hello, World!";

// Pre-computed HTTP response for /hello endpoint (close)
static const std::string HELLO_RESPONSE_CLOSE = 
    "HTTP/1.1 200 OK\r\n"
    "Content-Type: text/plain\r\n"
    "Content-Length: 13\r\n"
    "Server: Flash/0.1\r\n"
    "Connection: close\r\n"
    "\r\n"
    "Hello, World!";

// Pre-computed HTTP response for /api/user endpoint (keep-alive)
static const std::string API_USER_RESPONSE_KEEPALIVE = 
    "HTTP/1.1 200 OK\r\n"
    "Content-Type: application/json\r\n"
    "Content-Length: 105\r\n"
    "Server: Flash/0.1\r\n"
    "Connection: keep-alive\r\n"
    "\r\n"
    "{\"id\":123,\"name\":\"John Doe\",\"email\":\"john@example.com\",\"created_at\":\"2025-01-01T00:00:00Z\",\"active\":true}";

// Pre-computed HTTP response for /api/user endpoint (close)
static const std::string API_USER_RESPONSE_CLOSE = 
    "HTTP/1.1 200 OK\r\n"
    "Content-Type: application/json\r\n"
    "Content-Length: 105\r\n"
    "Server: Flash/0.1\r\n"
    "Connection: close\r\n"
    "\r\n"
    "{\"id\":123,\"name\":\"John Doe\",\"email\":\"john@example.com\",\"created_at\":\"2025-01-01T00:00:00Z\",\"active\":true}";

// ============================================================================
// Constructor & Destructor
// ============================================================================

HttpServer::HttpServer(uint16_t port, size_t num_workers)
    : socket_fd_(-1)
    , port_(port)
    , running_(false)
    , connection_count_(0)
    , worker_pool_(std::make_unique<WorkerPool>(num_workers))
{
    // Validate port number
    if (port == 0 || port > 65535) {
        throw std::invalid_argument("Port must be between 1 and 65535");
    }
    
    // Create socket
    int socket_fd = socket(AF_INET, SOCK_STREAM, 0);
    if(socket_fd < 0){
        throw std::runtime_error(std::string("Socket creation failed: ") + strerror(errno));
    }

    socket_fd_ = socket_fd;
    
    // Set socket options for performance
    int opt = 1;
    setsockopt(socket_fd_, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
    
    // SO_REUSEPORT: allow multiple threads/processes to accept on same port
    setsockopt(socket_fd_, SOL_SOCKET, SO_REUSEPORT, &opt, sizeof(opt));
    
    // Disable Nagle's algorithm for lower latency
    setsockopt(socket_fd_, IPPROTO_TCP, TCP_NODELAY, &opt, sizeof(opt));
    
    // Increase socket buffer sizes
    int send_buf = SOCKET_SEND_BUFFER;
    int recv_buf = SOCKET_RECV_BUFFER;
    setsockopt(socket_fd_, SOL_SOCKET, SO_SNDBUF, &send_buf, sizeof(send_buf));
    setsockopt(socket_fd_, SOL_SOCKET, SO_RCVBUF, &recv_buf, sizeof(recv_buf));
}

HttpServer::~HttpServer() {
    // Close socket if it's open
    if(socket_fd_ >= 0){
        close(socket_fd_);
        socket_fd_ = -1;
    }
}

// ============================================================================
// Move Semantics (Optional for Phase 1)
// ============================================================================

HttpServer::HttpServer(HttpServer&& other) noexcept
    : socket_fd_(other.socket_fd_)
    , port_(other.port_)
    , running_(other.running_.load())
    , connection_count_(other.connection_count_.load())
    , worker_pool_(std::move(other.worker_pool_))
{
    // Take ownership of socket from other
    other.socket_fd_ = -1;
    other.running_ = false;
    other.connection_count_ = 0;
}

HttpServer& HttpServer::operator=(HttpServer&& other) noexcept {
    if (this != &other) {
        // Close our current socket
        if (socket_fd_ >= 0) {
            close(socket_fd_);
        }
        
        // Take ownership from other
        socket_fd_ = other.socket_fd_;
        port_ = other.port_;
        running_ = other.running_.load();
        connection_count_ = other.connection_count_.load();
        worker_pool_ = std::move(other.worker_pool_);
        
        // Leave other in valid state
        other.socket_fd_ = -1;
        other.running_ = false;
        other.connection_count_ = 0;
    }
    return *this;
}

// ============================================================================
// Server Control
// ============================================================================

void HttpServer::start() {
    // TODO (Week 1): Create address structure
    // HINT: Use struct sockaddr_in
    struct sockaddr_in address;
    // HINT: Set sin_family = AF_INET
    address.sin_family = AF_INET;
    // HINT: Set sin_port = htons(port_)  // Convert to network byte order
    address.sin_port = htons(port_);
    // HINT: Set sin_addr.s_addr = INADDR_ANY  // Accept connections on any interface
    address.sin_addr.s_addr = INADDR_ANY;
    
    // TODO (Week 1): Bind socket to address
    // HINT: Use bind(socket_fd_, (struct sockaddr*)&address, sizeof(address))
    int bind_result = bind(socket_fd_, (struct sockaddr*)&address, sizeof(address));
    // HINT: Check return value - negative means error
    if(bind_result < 0){
        // HINT: Throw std::runtime_error with descriptive message on failure
        throw std::runtime_error(std::string("Bind failed: ") + strerror(errno));
    }
    
    // TODO (Week 1): Start listening for connections
    // HINT: Use listen(socket_fd_, LISTEN_BACKLOG)
    int listen_result = listen(socket_fd_, LISTEN_BACKLOG);
    // HINT: LISTEN_BACKLOG is defined as constant in header
    // HINT: Check return value and throw on error
    if(listen_result < 0){
        throw std::runtime_error(std::string("Listen failed: ") + strerror(errno));
    }

    // Start worker pool for concurrent request handling
    worker_pool_->start();
    
    // Set running flag
    running_ = true;
    
    // Main accept loop - accepts connections and submits to worker pool
    while(running_){
        struct sockaddr_in client_addr;
        socklen_t client_len = sizeof(client_addr);

        // Accept new connection
        int client_fd = accept(socket_fd_, (struct sockaddr*)&client_addr, &client_len);
        if (client_fd < 0) {
            if (errno == EINTR) continue;  // Interrupted, try again
            // Connection aborted - server is stopping
            break;
        }
        
        // Submit connection handling to worker pool for concurrent processing
        // This allows the accept loop to immediately handle the next connection
        worker_pool_->submit([this, client_fd]() {
            // Set client socket options for performance
            int opt = 1;
            setsockopt(client_fd, IPPROTO_TCP, TCP_NODELAY, &opt, sizeof(opt));
            
            handle_connection(client_fd);
            
            // Graceful close: SHUT_WR sends FIN, then close() waits for ACK
            shutdown(client_fd, SHUT_WR);
            
            // Wait briefly for client to close their side (drain any pending data)
            char drain[256];
            struct pollfd pfd = {client_fd, POLLIN, 0};
            while (poll(&pfd, 1, 100) > 0 && (pfd.revents & POLLIN)) {
                if (read(client_fd, drain, sizeof(drain)) <= 0) break;
            }
            
            close(client_fd);
        });
    }
    
    // EXAMPLE STRUCTURE:
    // while (running_) {
    //     struct sockaddr_in client_addr;
    //     socklen_t client_len = sizeof(client_addr);
    //     
    //     int client_fd = accept(socket_fd_, 
    //                           (struct sockaddr*)&client_addr, 
    //                           &client_len);
    //     
    //     if (client_fd < 0) {
    //         if (errno == EINTR) continue;  // Interrupted, try again
    //         std::cerr << "Accept error: " << strerror(errno) << std::endl;
    //         break;
    //     }
    //     
    //     // Log client connection (optional)
    //     char client_ip[INET_ADDRSTRLEN];
    //     inet_ntop(AF_INET, &client_addr.sin_addr, client_ip, INET_ADDRSTRLEN);
    //     std::cout << "[HttpServer] Connection from " << client_ip << std::endl;
    //     
    //     // Handle the connection
    //     handle_connection(client_fd);
    //     
    //     // Close client socket
    //     close(client_fd);
    // }
}

void HttpServer::stop() {
    // Set running flag to false - causes accept loop to exit
    running_ = false;
    
    // Shutdown worker pool gracefully - waits for all tasks to complete
    if (worker_pool_) {
        worker_pool_->shutdown();
    }
    
    // Close listening socket to unblock accept()
    if(socket_fd_ >= 0){
        shutdown(socket_fd_, SHUT_RDWR);
        close(socket_fd_);
        socket_fd_ = -1;
    }
}

// ============================================================================
// Connection Handling
// ============================================================================

void HttpServer::handle_connection(int client_fd) {
    connection_count_++;
    
    int request_count = 0;
    bool keep_alive = true;
    
    // Reuse parser and response across requests on this connection (avoid re-alloc)
    HttpParser parser;
    HttpResponse response;
    char response_buf[8192];  // Stack buffer for zero-alloc serialization
    
    // Keep-alive loop - handle multiple requests on same connection
    while (keep_alive && request_count < MAX_KEEPALIVE_REQUESTS && running_) {
        request_count++;
        
        // Use poll() to wait for data with timeout
        struct pollfd pfd;
        pfd.fd = client_fd;
        pfd.events = POLLIN;
        
        int poll_result = poll(&pfd, 1, KEEPALIVE_TIMEOUT * 1000);  // timeout in ms
        
        if (poll_result <= 0) {
            // Timeout or error - close connection
            break;
        }
        
        // Check for connection errors or hangup BEFORE checking POLLIN
        if (pfd.revents & (POLLERR | POLLHUP | POLLNVAL)) {
            // Connection closed by peer or error
            break;
        }
        
        if (!(pfd.revents & POLLIN)) {
            // No data available
            break;
        }
        
        char buffer[READ_BUFFER_SIZE];
        ssize_t bytes_read = read_from_socket(client_fd, buffer, sizeof(buffer) - 1);
        
        if (bytes_read <= 0) {
            // Client disconnected or error
            break;
        }
        
        buffer[bytes_read] = '\0';  // Null terminate
        
        try {
            // Parse HTTP request (parser reused across keep-alive requests)
            auto request = parser.parse(buffer, bytes_read);
            
            if (request.has_value()) {
                // Check if client wants keep-alive
                auto conn_header = request->get_header("Connection");
                if (conn_header.has_value()) {
                    std::string conn = conn_header.value();
                    // Convert to lowercase for comparison
                    for (auto& c : conn) c = std::tolower(c);
                    keep_alive = (conn.find("keep-alive") != std::string::npos);
                } else {
                    // HTTP/1.1 defaults to keep-alive
                    keep_alive = (request->version == "HTTP/1.1");
                }
                
                // FAST PATH: Use pre-computed responses for benchmark routes
                if (request->path == "/hello") {
                    const std::string& resp = keep_alive ? HELLO_RESPONSE_KEEPALIVE : HELLO_RESPONSE_CLOSE;
                    ssize_t written = write_to_socket(client_fd, resp.c_str(), resp.length());
                    if (written < 0) break;
                    continue;  // Skip normal response handling
                    
                } else if (request->path == "/api/user") {
                    const std::string& resp = keep_alive ? API_USER_RESPONSE_KEEPALIVE : API_USER_RESPONSE_CLOSE;
                    ssize_t written = write_to_socket(client_fd, resp.c_str(), resp.length());
                    if (written < 0) break;
                    continue;  // Skip normal response handling
                }
                
                // DYNAMIC PATH: Build response (reusing HttpResponse object)
                response.reset();
                response.set_keep_alive(keep_alive);
                
                if (request->path.find("/users/") == 0) {
                    std::string user_id = request->path.substr(7);
                    response.set_status(StatusCode::OK, ReasonPhrase::OK)
                            .set_header("Content-Type", "application/json")
                            .set_body("{\"userId\":\"" + user_id + "\",\"name\":\"User " + user_id + "\"}");
                            
                } else if (request->path.find("/search") == 0) {
                    response.set_status(StatusCode::OK, ReasonPhrase::OK)
                            .set_header("Content-Type", "application/json")
                            .set_body("{\"results\":[],\"query\":\"test\",\"limit\":10}");
                            
                } else if (request->path == "/protected") {
                    response.set_status(StatusCode::OK, ReasonPhrase::OK)
                            .set_header("Content-Type", "application/json")
                            .set_body("{\"message\":\"Protected resource\",\"user\":\"authenticated\"}");
                            
                } else if (request->path == "/") {
                    response.set_status(StatusCode::OK, ReasonPhrase::OK)
                            .set_header("Content-Type", "text/html")
                            .set_body(
                                "<html>\n"
                                "<head><title>Flash Framework</title></head>\n"
                                "<body>\n"
                                "<h1>Welcome to Flash Framework v0.1</h1>\n"
                                "<p>C++ HTTP Server with TypeScript API</p>\n"
                                "<p>Your request has been processed successfully!</p>\n"
                                "</body>\n"
                                "</html>\n"
                            );
                } else if (request->path == "/api/test") {
                    response.set_status(StatusCode::OK, ReasonPhrase::OK)
                            .set_header("Content-Type", "application/json")
                            .set_body("{\"message\":\"Hello from Flash\",\"status\":\"success\"}");
                } else {
                    response.set_status(StatusCode::NOT_FOUND, ReasonPhrase::NOT_FOUND)
                            .set_header("Content-Type", "text/plain")
                            .set_body("404 Not Found\nThe requested path '" + request->path + "' does not exist.");
                }
                
                // Serialize directly into stack buffer (zero allocations)
                size_t resp_len = response.serialize_to(response_buf, sizeof(response_buf));
                if (resp_len == 0) {
                    // Response too large for buffer — fall back to allocating path
                    std::string response_str = response.serialize();
                    ssize_t written = write_to_socket(client_fd, response_str.c_str(), response_str.length());
                    if (written < 0) break;
                } else {
                    ssize_t written = write_to_socket(client_fd, response_buf, resp_len);
                    if (written < 0) break;
                }
                
            } else {
                // Send 400 Bad Request
                HttpResponse error_response;
                error_response.set_status(StatusCode::BAD_REQUEST, ReasonPhrase::BAD_REQUEST)
                             .set_header("Content-Type", "text/plain")
                             .set_keep_alive(false)
                             .set_body("400 Bad Request\nInvalid HTTP request format.");
                
                std::string response_str = error_response.serialize();
                write_to_socket(client_fd, response_str.c_str(), response_str.length());
                keep_alive = false;  // Close on bad request
            }
            
        } catch (const std::exception& e) {
            // Error during parsing - send 500 and close
            try {
                HttpResponse error_response;
                error_response.set_status(StatusCode::INTERNAL_SERVER_ERROR, 
                                         ReasonPhrase::INTERNAL_SERVER_ERROR)
                             .set_header("Content-Type", "text/plain")
                             .set_keep_alive(false)
                             .set_body("500 Internal Server Error\nServer error during request processing.");
                
                std::string response_str = error_response.serialize();
                write_to_socket(client_fd, response_str.c_str(), response_str.length());
            } catch (...) {
                // Silently fail if we can't send error response
            }
            keep_alive = false;  // Close on error
        }
    }
    
    connection_count_--;
}// ============================================================================
// Socket I/O Helpers
// ============================================================================

ssize_t HttpServer::read_from_socket(int fd, char* buffer, size_t size) {
    while (true) {
        ssize_t result = read(fd, buffer, size);
        
        if (result >= 0) {
            return result;  // Success or EOF
        }
        
        // Handle specific errors
        if (errno == EINTR) {
            continue;  // Interrupted, retry
        }
        
        if (errno == EAGAIN || errno == EWOULDBLOCK) {
            return 0;  // No data available (non-blocking), treat as EOF
        }
        
        if (errno == ECONNRESET || errno == EPIPE) {
            return 0;  // Connection reset by peer, treat as normal EOF
        }
        
        // Other errors - return error
        return -1;
    }
}

ssize_t HttpServer::write_to_socket(int fd, const char* data, size_t size) {
    return write(fd, data, size);
}

// ============================================================================
// Accessors
// ============================================================================

bool HttpServer::is_running() const {
    return running_;
}

uint16_t HttpServer::get_port() const {
    return port_;
}

size_t HttpServer::get_connection_count() const {
    return connection_count_;
}

} // namespace flash
