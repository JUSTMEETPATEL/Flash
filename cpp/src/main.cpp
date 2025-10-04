/**
 * @file main.cpp
 * @brief Standalone HTTP server for testing
 * 
 * This is a simple executable to test the server independently
 * of Node.js and N-API. Useful for debugging the C++ core.
 * 
 * USAGE:
 *   ./build/flash_server [port]
 * 
 * EXAMPLE:
 *   ./build/flash_server 5627
 *   curl http://localhost:5627/
 */

#include "server.h"

#include <iostream>
#include <csignal>
#include <cstdlib>
#include <memory>

// Global pointer to server for signal handler
static std::unique_ptr<flash::HttpServer> g_server;

/**
 * Signal handler for graceful shutdown
 * 
 * Handles Ctrl+C (SIGINT) and kill (SIGTERM)
 */
void signal_handler(int signal) {
    std::cout << "\n[Main] Received signal " << signal << ", shutting down..." << std::endl;
    
    if (g_server) {
        g_server->stop();
    }
}

/**
 * Main entry point
 */
int main(int argc, char* argv[]) {
    // Parse command line arguments
    uint16_t port = 5627;  // Default port
    
    if (argc > 1) {
        port = static_cast<uint16_t>(std::atoi(argv[1]));
        if (port == 0) {
            std::cerr << "Invalid port number: " << argv[1] << std::endl;
            std::cerr << "Usage: " << argv[0] << " [port]" << std::endl;
            return 1;
        }
    }
    
    // Register signal handlers
    std::signal(SIGINT, signal_handler);   // Ctrl+C
    std::signal(SIGTERM, signal_handler);  // kill command
    
    std::cout << "==================================================" << std::endl;
    std::cout << "  Flash Framework - Standalone HTTP Server" << std::endl;
    std::cout << "  Phase 1: C++ Foundation" << std::endl;
    std::cout << "==================================================" << std::endl;
    std::cout << std::endl;
    
    try {
        // Create server
        std::cout << "[Main] Creating HTTP server on port " << port << "..." << std::endl;
        g_server = std::make_unique<flash::HttpServer>(port);
        
        std::cout << "[Main] Server created successfully" << std::endl;
        std::cout << "[Main] Press Ctrl+C to stop" << std::endl;
        std::cout << std::endl;
        std::cout << "Test the server with:" << std::endl;
        std::cout << "  curl http://localhost:" << port << "/" << std::endl;
        std::cout << "  telnet localhost " << port << std::endl;
        std::cout << std::endl;
        
        // Start server (blocks until stopped)
        g_server->start();
        
        std::cout << "[Main] Server stopped gracefully" << std::endl;
        
    } catch (const std::exception& e) {
        std::cerr << "[Main] Fatal error: " << e.what() << std::endl;
        return 1;
    } catch (...) {
        std::cerr << "[Main] Unknown fatal error" << std::endl;
        return 1;
    }
    
    std::cout << "[Main] Exiting..." << std::endl;
    return 0;
}
