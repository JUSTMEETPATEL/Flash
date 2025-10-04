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
    
    // Create socket
    int socket_fd = socket(AF_INET, SOCK_STREAM, 0);
    if(socket_fd < 0){
        throw std::runtime_error(std::string("Socket creation failed: ") + strerror(errno));
    }

    socket_fd_ = socket_fd;
    
    // Set socket options - SO_REUSEADDR allows quick restart
    int opt = 1;
    setsockopt(socket_fd_, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
    
    std::cout << "[HttpServer] Socket created successfully (fd=" << socket_fd_ << ")" << std::endl;
}

HttpServer::~HttpServer() {
    std::cout << "[HttpServer] Destroying server..." << std::endl;
    
    // Close socket if it's open
    if(socket_fd_ >= 0){
        close(socket_fd_);
        socket_fd_ = -1;
    }
    
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
    
    std::cout << "[HttpServer] Socket bound to port " << port_ << std::endl;
    
    // TODO (Week 1): Start listening for connections
    // HINT: Use listen(socket_fd_, LISTEN_BACKLOG)
    int listen_result = listen(socket_fd_, LISTEN_BACKLOG);
    // HINT: LISTEN_BACKLOG is defined as constant in header
    // HINT: Check return value and throw on error
    if(listen_result < 0){
        throw std::runtime_error(std::string("Listen failed: ") + strerror(errno));
    }

    std::cout << "[HttpServer] Listening for connections..." << std::endl;
    
    // Set running flag
    running_ = true;
    
    // TODO (Week 1): Main accept loop
    // HINT: Loop while running_ is true
    while(running_){
        struct sockaddr_in client_addr;
        socklen_t client_len = sizeof(client_addr);

        // HINT: Use accept() to get new connection
        int client_fd = accept(socket_fd_, (struct sockaddr*)&client_addr, &client_len);
        if (client_fd < 0) {
            if (errno == EINTR) continue;  // Interrupted, try again
            std::cerr << "Accept error: " << strerror(errno) << std::endl;
            break;
        }

        // HINT: accept() blocks until a client connects
        // HINT: Handle EINTR (interrupted system call) by continuing loop
        // Log client connection (optional)
        char client_ip[INET_ADDRSTRLEN];
        inet_ntop(AF_INET, &client_addr.sin_addr, client_ip, INET_ADDRSTRLEN);
        std::cout << "[HttpServer] Connection from " << client_ip << std::endl;
        // HINT: Call handle_connection() for each accepted connection
        handle_connection(client_fd);

        // HINT: Don't forget to close the client socket after handling!
        close(client_fd);
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
    
    std::cout << "[HttpServer] Server stopped" << std::endl;
}

void HttpServer::stop() {
    std::cout << "[HttpServer] Stopping server..." << std::endl;
    
    // TODO (Week 1): Set running flag to false
    // HINT: This will cause accept loop to exit
    running_ = false;
    
    // TODO (Week 1): Close listening socket to unblock accept()
    // HINT: shutdown(socket_fd_, SHUT_RDWR) or close(socket_fd_)
    if(socket_fd_ >= 0){
        shutdown(socket_fd_, SHUT_RDWR);
        close(socket_fd_);
        socket_fd_ = -1;
    }
    
    std::cout << "[HttpServer] Stop signal sent" << std::endl;
}

// ============================================================================
// Connection Handling
// ============================================================================

void HttpServer::handle_connection(int client_fd) {
    connection_count_++;
    
    std::cout << "[HttpServer] Handling connection (fd=" << client_fd 
              << ", active=" << connection_count_ << ")" << std::endl;
    
    // WEEK 2: HTTP Request Parsing
    char buffer[READ_BUFFER_SIZE];
    ssize_t bytes_read = read_from_socket(client_fd, buffer, sizeof(buffer) - 1);

    if(bytes_read > 0){
        buffer[bytes_read] = '\0';  // Null terminate
        std::cout << "[HttpServer] Received " << bytes_read << " bytes" << std::endl;
        
        // Parse HTTP request
        HttpParser parser;
        auto request = parser.parse(buffer, bytes_read);
        
        if (request.has_value()) {
            std::cout << "\n=== HTTP Request Parsed ===" << std::endl;
            request->print();
            std::cout << "============================\n" << std::endl;
            
            // For Week 2, still echo back the raw request
            // Week 3 will build proper HTTP responses
            write_to_socket(client_fd, buffer, bytes_read);
        } else {
            std::cerr << "[HttpServer] Failed to parse HTTP request" << std::endl;
            
            // Send 400 Bad Request (simple response)
            const char* bad_request = 
                "HTTP/1.1 400 Bad Request\r\n"
                "Content-Length: 15\r\n"
                "\r\n"
                "Bad Request\r\n";
            write_to_socket(client_fd, bad_request, strlen(bad_request));
        }
    }
    
    // TODO (Week 3): Build proper HTTP responses
    // HINT: Create HttpResponse object
    // HINT: Set status code, headers, body
    // HINT: Serialize to string and send
    
    connection_count_--;
    
    std::cout << "[HttpServer] Connection closed (active=" << connection_count_ << ")" << std::endl;
}

// ============================================================================
// Socket I/O Helpers
// ============================================================================

ssize_t HttpServer::read_from_socket(int fd, char* buffer, size_t size) {
    ssize_t bytes_read = read(fd, buffer, size);
    
    if (bytes_read < 0) {
        std::cerr << "[HttpServer] Read error: " << strerror(errno) << std::endl;
        return -1;
    }
    
    if (bytes_read == 0) {
        std::cout << "[HttpServer] Connection closed by peer" << std::endl;
    }
    
    return bytes_read;
}

ssize_t HttpServer::write_to_socket(int fd, const char* data, size_t size) {
    ssize_t bytes_written = write(fd, data, size);
    
    if (bytes_written < 0) {
        std::cerr << "[HttpServer] Write error: " << strerror(errno) << std::endl;
        return -1;
    }
    
    return bytes_written;
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
