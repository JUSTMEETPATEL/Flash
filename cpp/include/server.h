/**
 * @file server.h
 * @brief HTTP server core - TCP socket management and connection handling
 * @author Flash Framework Team
 * @date 2025-01-04
 * 
 * This is the heart of Phase 1. The HttpServer class manages:
 * - TCP socket creation and binding
 * - Listening for incoming connections
 * - Accepting new client connections
 * - Graceful shutdown
 * 
 * LEARNING GOALS:
 * - Understand POSIX socket API
 * - Learn RAII pattern for resource management
 * - Practice const correctness
 * - Implement proper error handling
 */

#pragma once

#include <string>
#include <memory>
#include <cstdint>

namespace flash {

/**
 * @class HttpServer
 * @brief Main HTTP server class that manages TCP connections
 * 
 * This class follows RAII principles:
 * - Constructor acquires resources (creates socket)
 * - Destructor releases resources (closes socket)
 * - No manual memory management needed
 * 
 * THREAD SAFETY: NOT thread-safe. Use from single thread only.
 * (We'll add thread pool in Phase 3)
 * 
 * EXAMPLE USAGE:
 * @code
 * try {
 *     HttpServer server(3000);
 *     server.start();  // Blocks until shutdown
 * } catch (const std::exception& e) {
 *     std::cerr << "Server error: " << e.what() << std::endl;
 * }
 * @endcode
 */
class HttpServer {
public:
    /**
     * @brief Construct HTTP server on specified port
     * 
     * Creates a TCP socket but doesn't bind or listen yet.
     * This allows for configuration before starting.
     * 
     * @param port Port number (1-65535)
     * @throws std::invalid_argument If port is out of range
     * @throws std::runtime_error If socket creation fails
     * 
     * IMPLEMENTATION HINTS:
     * - Use socket(AF_INET, SOCK_STREAM, 0)
     * - Store socket file descriptor in member variable
     * - Don't forget to set SO_REUSEADDR option!
     */
    explicit HttpServer(uint16_t port);
    
    /**
     * @brief Destructor - automatically closes socket
     * 
     * RAII in action! The destructor ensures the socket is
     * always closed, even if an exception is thrown.
     * 
     * IMPLEMENTATION HINTS:
     * - Check if socket is valid before closing
     * - Use close() system call
     * - Set socket fd to -1 after closing
     */
    ~HttpServer();
    
    // Disable copying - sockets shouldn't be copied
    HttpServer(const HttpServer&) = delete;
    HttpServer& operator=(const HttpServer&) = delete;
    
    // Allow moving - ownership can be transferred
    HttpServer(HttpServer&& other) noexcept;
    HttpServer& operator=(HttpServer&& other) noexcept;
    
    /**
     * @brief Start the server and begin accepting connections
     * 
     * This is the main event loop. It will:
     * 1. Bind socket to address
     * 2. Listen for connections
     * 3. Accept connections in a loop
     * 4. Handle each request
     * 5. Send response
     * 
     * Blocks until stop() is called or an error occurs.
     * 
     * @throws std::runtime_error If bind or listen fails
     * 
     * IMPLEMENTATION HINTS (Week 1):
     * - Use bind() to associate socket with address
     * - Use listen() with backlog of 128
     * - Loop: accept() -> read() -> write() -> close()
     * - Handle EINTR (interrupted system call)
     * 
     * IMPLEMENTATION HINTS (Week 2-3):
     * - Parse HTTP request from read data
     * - Build HTTP response
     * - Write response back to client
     */
    void start();
    
    /**
     * @brief Stop the server gracefully
     * 
     * Signals the server to stop accepting new connections
     * and shutdown cleanly.
     * 
     * IMPLEMENTATION HINTS:
     * - Set a flag that start() checks in its loop
     * - Close the listening socket
     * - Wait for current connections to finish
     */
    void stop();
    
    /**
     * @brief Check if server is currently running
     * @return true if server is running, false otherwise
     */
    bool is_running() const;
    
    /**
     * @brief Get the port number server is bound to
     * @return Port number
     */
    uint16_t get_port() const;
    
    /**
     * @brief Get number of active connections
     * @return Number of active connections
     * 
     * NOTE: For Phase 1, this will always be 0 or 1
     * (We handle one connection at a time)
     */
    size_t get_connection_count() const;

private:
    /**
     * @brief Handle a single client connection
     * 
     * Called by start() for each accepted connection.
     * 
     * @param client_fd File descriptor for client socket
     * 
     * IMPLEMENTATION (Week 1):
     * - Read data from client
     * - Echo it back
     * - Close connection
     * 
     * IMPLEMENTATION (Week 2-3):
     * - Read HTTP request
     * - Parse it
     * - Build response
     * - Send response
     * - Handle keep-alive or close
     */
    void handle_connection(int client_fd);
    
    /**
     * @brief Read data from socket until complete
     * 
     * Handles partial reads and retry on EINTR.
     * 
     * @param fd Socket file descriptor
     * @param buffer Buffer to read into
     * @param size Maximum bytes to read
     * @return Number of bytes read, or -1 on error
     */
    ssize_t read_from_socket(int fd, char* buffer, size_t size);
    
    /**
     * @brief Write data to socket until complete
     * 
     * Handles partial writes and retry on EINTR.
     * 
     * @param fd Socket file descriptor
     * @param data Data to write
     * @param size Number of bytes to write
     * @return Number of bytes written, or -1 on error
     */
    ssize_t write_to_socket(int fd, const char* data, size_t size);

private:
    // Socket file descriptor (-1 if not created)
    int socket_fd_;
    
    // Port number to bind to
    uint16_t port_;
    
    // Flag to signal server shutdown
    bool running_;
    
    // Number of active connections (for statistics)
    size_t connection_count_;
    
    // Maximum connections to queue in listen()
    static constexpr int LISTEN_BACKLOG = 128;
    
    // Buffer size for reading requests
    static constexpr size_t READ_BUFFER_SIZE = 8192;  // 8KB
};

} // namespace flash
