/**
 * @file test_server.cpp
 * @brief Unit tests for HTTP server
 * 
 * These tests verify the core functionality of the HttpServer class.
 * As you implement features, uncomment and run these tests.
 */

#include <gtest/gtest.h>
#include "server.h"

#include <thread>
#include <chrono>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>

namespace flash {
namespace test {

// ============================================================================
// Test Fixture
// ============================================================================

class HttpServerTest : public ::testing::Test {
protected:
    void SetUp() override {
        // Use a high port number to avoid conflicts
        test_port_ = 8888;
    }
    
    void TearDown() override {
        // Cleanup if needed
    }
    
    /**
     * Helper: Create a client socket and connect to server
     */
    int connect_to_server(uint16_t port) {
        int sock = socket(AF_INET, SOCK_STREAM, 0);
        if (sock < 0) {
            return -1;
        }
        
        struct sockaddr_in addr;
        addr.sin_family = AF_INET;
        addr.sin_port = htons(port);
        inet_pton(AF_INET, "127.0.0.1", &addr.sin_addr);
        
        if (connect(sock, (struct sockaddr*)&addr, sizeof(addr)) < 0) {
            close(sock);
            return -1;
        }
        
        return sock;
    }
    
    uint16_t test_port_;
};

// ============================================================================
// Basic Tests
// ============================================================================

TEST_F(HttpServerTest, ConstructorCreatesServer) {
    // Test that we can create a server
    EXPECT_NO_THROW({
        HttpServer server(test_port_);
    });
}

TEST_F(HttpServerTest, ConstructorRejectsInvalidPort) {
    // Port 0 should be rejected
    EXPECT_THROW({
        HttpServer server(0);
    }, std::invalid_argument);
}

TEST_F(HttpServerTest, GetPortReturnsCorrectPort) {
    HttpServer server(test_port_);
    EXPECT_EQ(server.get_port(), test_port_);
}

TEST_F(HttpServerTest, InitiallyNotRunning) {
    HttpServer server(test_port_);
    EXPECT_FALSE(server.is_running());
}

TEST_F(HttpServerTest, InitialConnectionCountIsZero) {
    HttpServer server(test_port_);
    EXPECT_EQ(server.get_connection_count(), 0);
}

// ============================================================================
// Server Lifecycle Tests
// ============================================================================

TEST_F(HttpServerTest, ServerCanStartAndStop) {
    HttpServer server(test_port_);
    
    // Start server in a separate thread
    std::thread server_thread([&server]() {
        server.start();
    });
    
    // Give server time to start
    std::this_thread::sleep_for(std::chrono::milliseconds(100));
    
    // Server should be running
    EXPECT_TRUE(server.is_running());
    
    // Stop the server
    server.stop();
    
    // Wait for server thread to finish
    server_thread.join();
    
    // Server should not be running
    EXPECT_FALSE(server.is_running());
}

TEST_F(HttpServerTest, CanConnectToServer) {
    HttpServer server(test_port_);
    
    // Start server in background
    std::thread server_thread([&server]() {
        server.start();
    });
    
    // Give server time to start
    std::this_thread::sleep_for(std::chrono::milliseconds(100));
    
    // Try to connect
    int client_sock = connect_to_server(test_port_);
    EXPECT_GE(client_sock, 0) << "Failed to connect to server";
    
    if (client_sock >= 0) {
        close(client_sock);
    }
    
    // Stop server
    server.stop();
    server_thread.join();
}

// ============================================================================
// Echo Server Tests (Week 1)
// ============================================================================

TEST_F(HttpServerTest, EchoServerEchoesData) {
    HttpServer server(test_port_);
    
    // Start server
    std::thread server_thread([&server]() {
        server.start();
    });
    
    std::this_thread::sleep_for(std::chrono::milliseconds(100));
    
    // Connect and send data
    int client_sock = connect_to_server(test_port_);
    ASSERT_GE(client_sock, 0);
    
    const char* test_data = "Hello, Server!";
    ssize_t sent = write(client_sock, test_data, strlen(test_data));
    EXPECT_EQ(sent, strlen(test_data));
    
    // Read echo response
    char buffer[1024] = {0};
    ssize_t received = read(client_sock, buffer, sizeof(buffer) - 1);
    EXPECT_GT(received, 0) << "Should receive data from echo server";
    
    close(client_sock);
    
    // Stop server
    server.stop();
    server_thread.join();
}

TEST_F(HttpServerTest, CanHandleMultipleConnections) {
    HttpServer server(test_port_);
    
    // Start server
    std::thread server_thread([&server]() {
        server.start();
    });
    
    std::this_thread::sleep_for(std::chrono::milliseconds(100));
    
    // Create multiple connections
    const int num_connections = 3;
    int sockets[num_connections];
    
    for (int i = 0; i < num_connections; i++) {
        sockets[i] = connect_to_server(test_port_);
        EXPECT_GE(sockets[i], 0) << "Connection " << i << " failed";
    }
    
    // Close all connections
    for (int i = 0; i < num_connections; i++) {
        if (sockets[i] >= 0) {
            close(sockets[i]);
        }
    }
    
    // Stop server
    server.stop();
    server_thread.join();
}

// ============================================================================
// HTTP Tests (Week 2-3)
// ============================================================================

// NOTE: Add these tests when implementing HTTP parsing and response

/*
TEST_F(HttpServerTest, RespondsToHttpGetRequest) {
    HttpServer server(test_port_);
    
    std::thread server_thread([&server]() {
        server.start();
    });
    
    std::this_thread::sleep_for(std::chrono::milliseconds(100));
    
    // Connect and send HTTP request
    int client_sock = connect_to_server(test_port_);
    ASSERT_GE(client_sock, 0);
    
    const char* http_request = 
        "GET / HTTP/1.1\r\n"
        "Host: localhost\r\n"
        "\r\n";
    
    write(client_sock, http_request, strlen(http_request));
    
    // Read HTTP response
    char buffer[4096] = {0};
    ssize_t received = read(client_sock, buffer, sizeof(buffer) - 1);
    ASSERT_GT(received, 0);
    
    // Check for HTTP response
    std::string response(buffer);
    EXPECT_TRUE(response.find("HTTP/1.1") != std::string::npos);
    EXPECT_TRUE(response.find("200") != std::string::npos);
    
    close(client_sock);
    server.stop();
    server_thread.join();
}
*/

/*
TEST_F(HttpServerTest, SetsCorrectContentLength) {
    HttpServer server(test_port_);
    
    std::thread server_thread([&server]() {
        server.start();
    });
    
    std::this_thread::sleep_for(std::chrono::milliseconds(100));
    
    int client_sock = connect_to_server(test_port_);
    ASSERT_GE(client_sock, 0);
    
    const char* http_request = "GET / HTTP/1.1\r\nHost: localhost\r\n\r\n";
    write(client_sock, http_request, strlen(http_request));
    
    char buffer[4096] = {0};
    read(client_sock, buffer, sizeof(buffer) - 1);
    
    std::string response(buffer);
    EXPECT_TRUE(response.find("Content-Length:") != std::string::npos);
    
    close(client_sock);
    server.stop();
    server_thread.join();
}
*/

// ============================================================================
// Stress Tests (Optional)
// ============================================================================

/*
TEST_F(HttpServerTest, HandlesMultipleSequentialConnections) {
    HttpServer server(test_port_);
    
    std::thread server_thread([&server]() {
        server.start();
    });
    
    std::this_thread::sleep_for(std::chrono::milliseconds(100));
    
    // Connect multiple times
    for (int i = 0; i < 10; ++i) {
        int client_sock = connect_to_server(test_port_);
        ASSERT_GE(client_sock, 0);
        
        const char* request = "GET / HTTP/1.1\r\nHost: localhost\r\n\r\n";
        write(client_sock, request, strlen(request));
        
        char buffer[4096];
        read(client_sock, buffer, sizeof(buffer));
        
        close(client_sock);
    }
    
    server.stop();
    server_thread.join();
}
*/

} // namespace test
} // namespace flash

// ============================================================================
// Main
// ============================================================================

int main(int argc, char** argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}
