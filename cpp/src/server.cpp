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

#include <iostream>
#include <cstring>
#include <stdexcept>
#include <system_error>

// POSIX socket includes
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <fcntl.h>
#include <errno.h>

namespace flash {

// ============================================================================
// Constructor & Destructor
// ============================================================================

HttpServer::HttpServer(uint16_t port)
    : socket_fd_(-1)
    , port_(port)
    , running_(false)
    , connection_count_(0)
{
    // Validate port number
    if (port == 0 || port > 65535) {
        throw std::invalid_argument("Port must be between 1 and 65535");
    }
    
    std::cout << "[HttpServer] Creating server on port " << port_ << std::endl;
    
    // TODO (Week 1): Create socket
    // HINT: Use socket(AF_INET, SOCK_STREAM, 0)
    // HINT: Check return value - negative means error
    // HINT: Throw std::runtime_error if socket creation fails
    // HINT: Use strerror(errno) for error message
    
    // TODO (Week 1): Set socket options
    // HINT: Use setsockopt to set SO_REUSEADDR
    // HINT: This allows quick restart of server without "Address already in use" error
    // EXAMPLE:
    //   int opt = 1;
    //   setsockopt(socket_fd_, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
    
    std::cout << "[HttpServer] Socket created successfully (fd=" << socket_fd_ << ")" << std::endl;
}

HttpServer::~HttpServer() {
    std::cout << "[HttpServer] Destroying server..." << std::endl;
    
    // TODO (Week 1): Close socket if it's open
    // HINT: Check if socket_fd_ >= 0
    // HINT: Use close(socket_fd_)
    // HINT: Set socket_fd_ = -1 after closing
    // HINT: Don't throw exceptions from destructor!
    
    std::cout << "[HttpServer] Server destroyed" << std::endl;
}

// ============================================================================
// Move Semantics (Optional for Phase 1)
// ============================================================================

HttpServer::HttpServer(HttpServer&& other) noexcept
    : socket_fd_(other.socket_fd_)
    , port_(other.port_)
    , running_(other.running_)
    , connection_count_(other.connection_count_)
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
        running_ = other.running_;
        connection_count_ = other.connection_count_;
        
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
    std::cout << "[HttpServer] Starting server on port " << port_ << "..." << std::endl;
    
    // TODO (Week 1): Create address structure
    // HINT: Use struct sockaddr_in
    // HINT: Set sin_family = AF_INET
    // HINT: Set sin_port = htons(port_)  // Convert to network byte order
    // HINT: Set sin_addr.s_addr = INADDR_ANY  // Accept connections on any interface
    
    // TODO (Week 1): Bind socket to address
    // HINT: Use bind(socket_fd_, (struct sockaddr*)&address, sizeof(address))
    // HINT: Check return value - negative means error
    // HINT: Throw std::runtime_error with descriptive message on failure
    
    std::cout << "[HttpServer] Socket bound to port " << port_ << std::endl;
    
    // TODO (Week 1): Start listening for connections
    // HINT: Use listen(socket_fd_, LISTEN_BACKLOG)
    // HINT: LISTEN_BACKLOG is defined as constant in header
    // HINT: Check return value and throw on error
    
    std::cout << "[HttpServer] Listening for connections..." << std::endl;
    
    // Set running flag
    running_ = true;
    
    // TODO (Week 1): Main accept loop
    // HINT: Loop while running_ is true
    // HINT: Use accept() to get new connection
    // HINT: accept() blocks until a client connects
    // HINT: Handle EINTR (interrupted system call) by continuing loop
    // HINT: Call handle_connection() for each accepted connection
    // HINT: Don't forget to close the client socket after handling!
    
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
    
    std::cout << "[HttpServer] Server stopped" << std::endl;
}

void HttpServer::stop() {
    std::cout << "[HttpServer] Stopping server..." << std::endl;
    
    // TODO (Week 1): Set running flag to false
    // HINT: This will cause accept loop to exit
    
    // TODO (Week 1): Close listening socket to unblock accept()
    // HINT: shutdown(socket_fd_, SHUT_RDWR) or close(socket_fd_)
    
    std::cout << "[HttpServer] Stop signal sent" << std::endl;
}

// ============================================================================
// Connection Handling
// ============================================================================

void HttpServer::handle_connection(int client_fd) {
    connection_count_++;
    
    std::cout << "[HttpServer] Handling connection (fd=" << client_fd 
              << ", active=" << connection_count_ << ")" << std::endl;
    
    // TODO (Week 1): Simple echo server
    // HINT: Create buffer: char buffer[READ_BUFFER_SIZE]
    // HINT: Read from client: read_from_socket(client_fd, buffer, sizeof(buffer))
    // HINT: Write back to client: write_to_socket(client_fd, buffer, bytes_read)
    // HINT: This will echo whatever the client sends
    
    // WEEK 1 EXAMPLE (Echo server):
    // char buffer[READ_BUFFER_SIZE];
    // ssize_t bytes_read = read_from_socket(client_fd, buffer, sizeof(buffer) - 1);
    // 
    // if (bytes_read > 0) {
    //     buffer[bytes_read] = '\0';  // Null terminate
    //     std::cout << "[HttpServer] Received " << bytes_read << " bytes" << std::endl;
    //     std::cout << "[HttpServer] Data: " << buffer << std::endl;
    //     
    //     // Echo back
    //     write_to_socket(client_fd, buffer, bytes_read);
    // }
    
    // TODO (Week 2-3): HTTP request/response
    // HINT: Parse buffer as HTTP request using HttpParser
    // HINT: Build HTTP response using HttpResponse
    // HINT: Write response back to client
    // HINT: We'll implement this after echo server works
    
    connection_count_--;
    
    std::cout << "[HttpServer] Connection closed (active=" << connection_count_ << ")" << std::endl;
}

// ============================================================================
// Socket I/O Helpers
// ============================================================================

ssize_t HttpServer::read_from_socket(int fd, char* buffer, size_t size) {
    // TODO (Week 1): Read data from socket
    // HINT: Use read(fd, buffer, size)
    // HINT: Return value is number of bytes read, or -1 on error
    // HINT: Return value of 0 means connection closed
    // HINT: Handle EINTR by retrying
    // HINT: Handle EAGAIN/EWOULDBLOCK for non-blocking sockets
    
    // SIMPLE IMPLEMENTATION:
    // ssize_t result = read(fd, buffer, size);
    // if (result < 0) {
    //     std::cerr << "[HttpServer] Read error: " << strerror(errno) << std::endl;
    // }
    // return result;
    
    // ROBUST IMPLEMENTATION (for later):
    // Handle partial reads, EINTR, etc.
    
    return -1;  // TODO: Replace with actual implementation
}

ssize_t HttpServer::write_to_socket(int fd, const char* data, size_t size) {
    // TODO (Week 1): Write data to socket
    // HINT: Use write(fd, data, size)
    // HINT: Return value is number of bytes written, or -1 on error
    // HINT: Handle EINTR by retrying
    // HINT: Handle partial writes (write may not write all data at once)
    
    // SIMPLE IMPLEMENTATION:
    // ssize_t result = write(fd, data, size);
    // if (result < 0) {
    //     std::cerr << "[HttpServer] Write error: " << strerror(errno) << std::endl;
    // }
    // return result;
    
    // ROBUST IMPLEMENTATION (for later):
    // Loop until all data is written
    
    return -1;  // TODO: Replace with actual implementation
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
