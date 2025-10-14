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
            std::cerr << "Accept error: " << strerror(errno) << std::endl;
            break;
        }

        // Log client connection
        char client_ip[INET_ADDRSTRLEN];
        inet_ntop(AF_INET, &client_addr.sin_addr, client_ip, INET_ADDRSTRLEN);
        std::cout << "[HttpServer] Connection from " << client_ip << std::endl;
        
        // Submit connection handling to worker pool for concurrent processing
        // This allows the accept loop to immediately handle the next connection
        worker_pool_->submit([this, client_fd]() {
            handle_connection(client_fd);
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
    
    std::cout << "[HttpServer] Server stopped" << std::endl;
}

void HttpServer::stop() {
    std::cout << "[HttpServer] Stopping server..." << std::endl;
    
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
    
    std::cout << "[HttpServer] Stop signal sent" << std::endl;
}

// ============================================================================
// Connection Handling
// ============================================================================

void HttpServer::handle_connection(int client_fd) {
    connection_count_++;
    
    std::cout << "[HttpServer] Handling connection (fd=" << client_fd 
              << ", active=" << connection_count_ << ")" << std::endl;
    
    try {
        // WEEK 2: HTTP Request Parsing
        char buffer[READ_BUFFER_SIZE];
        ssize_t bytes_read = read_from_socket(client_fd, buffer, sizeof(buffer) - 1);

        if(bytes_read > 0){
            buffer[bytes_read] = '\0';  // Null terminate
            std::cout << "[HttpServer] Received " << bytes_read << " bytes" << std::endl;
            
            try {
                // Parse HTTP request
                HttpParser parser;
                auto request = parser.parse(buffer, bytes_read);
                
                if (request.has_value()) {
                    std::cout << "\n=== HTTP Request Parsed ===" << std::endl;
                    request->print();
                    std::cout << "============================\n" << std::endl;
                    
                    // WEEK 3: Build and send proper HTTP response
                    HttpResponse response;
                    
                    try {
                        // Set response based on request path
                        if (request->path == "/") {
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
                            // JSON response for API endpoint
                            response.set_status(StatusCode::OK, ReasonPhrase::OK)
                                    .set_header("Content-Type", "application/json")
                                    .set_body("{\"message\":\"Hello from Flash\",\"status\":\"success\"}");
                        } else {
                            // 404 for unknown paths
                            response.set_status(StatusCode::NOT_FOUND, ReasonPhrase::NOT_FOUND)
                                    .set_header("Content-Type", "text/plain")
                                    .set_body("404 Not Found\nThe requested path '" + request->path + "' does not exist.");
                        }
                        
                        // Serialize and send response
                        std::string response_str = response.serialize();
                        std::cout << "[HttpServer] Sending " << response_str.length() << " byte response" << std::endl;
                        write_to_socket(client_fd, response_str.c_str(), response_str.length());
                        
                    } catch (const std::exception& e) {
                        // Error during response building/sending
                        std::cerr << "[HttpServer] Error building response: " << e.what() << std::endl;
                        
                        // Send 500 Internal Server Error
                        HttpResponse error_response;
                        error_response.set_status(StatusCode::INTERNAL_SERVER_ERROR, 
                                                 ReasonPhrase::INTERNAL_SERVER_ERROR)
                                     .set_header("Content-Type", "text/plain")
                                     .set_body("500 Internal Server Error\nServer encountered an error processing your request.");
                        
                        std::string response_str = error_response.serialize();
                        write_to_socket(client_fd, response_str.c_str(), response_str.length());
                    }
                    
                } else {
                    std::cerr << "[HttpServer] Failed to parse HTTP request" << std::endl;
                    
                    // Send 400 Bad Request using HttpResponse
                    HttpResponse error_response;
                    error_response.set_status(StatusCode::BAD_REQUEST, ReasonPhrase::BAD_REQUEST)
                                 .set_header("Content-Type", "text/plain")
                                 .set_body("400 Bad Request\nInvalid HTTP request format.");
                    
                    std::string response_str = error_response.serialize();
                    write_to_socket(client_fd, response_str.c_str(), response_str.length());
                }
                
            } catch (const std::exception& e) {
                // Error during parsing
                std::cerr << "[HttpServer] Exception during request parsing: " << e.what() << std::endl;
                
                // Send 500 Internal Server Error
                try {
                    HttpResponse error_response;
                    error_response.set_status(StatusCode::INTERNAL_SERVER_ERROR, 
                                             ReasonPhrase::INTERNAL_SERVER_ERROR)
                                 .set_header("Content-Type", "text/plain")
                                 .set_body("500 Internal Server Error\nServer error during request processing.");
                    
                    std::string response_str = error_response.serialize();
                    write_to_socket(client_fd, response_str.c_str(), response_str.length());
                } catch (...) {
                    // If we can't even send error response, just log it
                    std::cerr << "[HttpServer] Failed to send error response" << std::endl;
                }
            }
        } else if (bytes_read == 0) {
            std::cout << "[HttpServer] Connection closed by peer" << std::endl;
        } else {
            std::cerr << "[HttpServer] Error reading from socket: " << strerror(errno) << std::endl;
        }
        
    } catch (const std::exception& e) {
        // Catch-all for any unexpected errors
        std::cerr << "[HttpServer] Unexpected error in handle_connection: " << e.what() << std::endl;
    } catch (...) {
        // Catch absolutely everything to prevent server crash
        std::cerr << "[HttpServer] Unknown error in handle_connection" << std::endl;
    }
    
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
