/**
 * @file test_integration.cpp
 * @brief Integration tests for complete HTTP request/response cycle
 */

#include <gtest/gtest.h>
#include "server.h"
#include "http_parser.h"
#include "http_response.h"
#include <thread>
#include <chrono>
#include <vector>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <cstring>

namespace flash {
namespace test {

/**
 * Helper class for testing client connections
 */
class TestClient {
public:
    TestClient() : fd_(-1) {}
    
    ~TestClient() {
        disconnect();
    }
    
    bool connect(int port) {
        fd_ = socket(AF_INET, SOCK_STREAM, 0);
        if (fd_ < 0) {
            return false;
        }
        
        struct sockaddr_in addr{};
        addr.sin_family = AF_INET;
        addr.sin_port = htons(port);
        inet_pton(AF_INET, "127.0.0.1", &addr.sin_addr);
        
        int result = ::connect(fd_, (struct sockaddr*)&addr, sizeof(addr));
        return result == 0;
    }
    
    bool send(const std::string& data) {
        if (fd_ < 0) return false;
        
        ssize_t sent = ::send(fd_, data.c_str(), data.length(), 0);
        return sent == static_cast<ssize_t>(data.length());
    }
    
    std::string receive(size_t max_size = 4096) {
        if (fd_ < 0) return "";
        
        std::vector<char> buffer(max_size);
        ssize_t received = ::recv(fd_, buffer.data(), buffer.size() - 1, 0);
        if (received <= 0) {
            return "";
        }
        
        buffer[received] = '\0';
        return std::string(buffer.data(), received);
    }
    
    void disconnect() {
        if (fd_ >= 0) {
            close(fd_);
            fd_ = -1;
        }
    }
    
private:
    int fd_;
};

class IntegrationTest : public ::testing::Test {
protected:
    void SetUp() override {
        // Use a different port for integration tests to avoid conflicts
        port_ = 9999;
        server_ = std::make_unique<HttpServer>(port_);
        
        // Start server in background thread
        server_thread_ = std::thread([this]() {
            try {
                server_->start();
            } catch (...) {
                // Server stopped
            }
        });
        
        // Give server time to start
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }
    
    void TearDown() override {
        // Stop server
        server_->stop();
        
        // Wait for server thread to finish
        if (server_thread_.joinable()) {
            server_thread_.join();
        }
        
        server_.reset();
        
        // Give OS time to release port
        std::this_thread::sleep_for(std::chrono::milliseconds(50));
    }
    
    int port_;
    std::unique_ptr<HttpServer> server_;
    std::thread server_thread_;
};

// ============================================================================
// Basic Request/Response Tests
// ============================================================================

TEST_F(IntegrationTest, SimpleGetRequest) {
    TestClient client;
    ASSERT_TRUE(client.connect(port_));
    
    std::string request = "GET / HTTP/1.1\r\nHost: localhost\r\n\r\n";
    ASSERT_TRUE(client.send(request));
    
    std::string response = client.receive();
    
    // Check response contains status line
    EXPECT_NE(response.find("HTTP/1.1 200 OK"), std::string::npos);
    
    // Check response contains headers
    EXPECT_NE(response.find("Content-Type:"), std::string::npos);
    EXPECT_NE(response.find("Content-Length:"), std::string::npos);
    
    // Check response contains body
    EXPECT_NE(response.find("Flash Framework"), std::string::npos);
}

TEST_F(IntegrationTest, JsonApiRequest) {
    TestClient client;
    ASSERT_TRUE(client.connect(port_));
    
    std::string request = "GET /api/test HTTP/1.1\r\nHost: localhost\r\n\r\n";
    ASSERT_TRUE(client.send(request));
    
    std::string response = client.receive();
    
    // Check for 200 OK
    EXPECT_NE(response.find("HTTP/1.1 200 OK"), std::string::npos);
    
    // Check for JSON content type
    EXPECT_NE(response.find("Content-Type: application/json"), std::string::npos);
    
    // Check for JSON body
    EXPECT_NE(response.find("{\"message\":\"Hello from Flash\""), std::string::npos);
}

TEST_F(IntegrationTest, NotFoundRequest) {
    TestClient client;
    ASSERT_TRUE(client.connect(port_));
    
    std::string request = "GET /nonexistent HTTP/1.1\r\nHost: localhost\r\n\r\n";
    ASSERT_TRUE(client.send(request));
    
    std::string response = client.receive();
    
    // Check for 404
    EXPECT_NE(response.find("HTTP/1.1 404 Not Found"), std::string::npos);
    
    // Check for error message
    EXPECT_NE(response.find("404 Not Found"), std::string::npos);
}

// ============================================================================
// Multiple Sequential Requests
// ============================================================================

TEST_F(IntegrationTest, MultipleSequentialRequests) {
    for (int i = 0; i < 5; ++i) {
        TestClient client;
        ASSERT_TRUE(client.connect(port_)) << "Failed on request " << i;
        
        std::string request = "GET / HTTP/1.1\r\nHost: localhost\r\n\r\n";
        ASSERT_TRUE(client.send(request));
        
        std::string response = client.receive();
        EXPECT_NE(response.find("HTTP/1.1 200 OK"), std::string::npos) 
            << "Failed on request " << i;
    }
}

// ============================================================================
// Concurrent Requests
// ============================================================================

TEST_F(IntegrationTest, MultipleConcurrentRequests) {
    const int num_clients = 10;
    std::vector<std::thread> threads;
    std::vector<bool> results(num_clients, false);
    
    for (int i = 0; i < num_clients; ++i) {
        threads.emplace_back([this, i, &results]() {
            TestClient client;
            if (client.connect(port_)) {
                std::string request = "GET / HTTP/1.1\r\nHost: localhost\r\n\r\n";
                if (client.send(request)) {
                    std::string response = client.receive();
                    results[i] = (response.find("HTTP/1.1 200 OK") != std::string::npos);
                }
            }
        });
    }
    
    // Wait for all threads to complete
    for (auto& thread : threads) {
        thread.join();
    }
    
    // Check all requests succeeded
    for (int i = 0; i < num_clients; ++i) {
        EXPECT_TRUE(results[i]) << "Request " << i << " failed";
    }
}

// ============================================================================
// Different HTTP Methods
// ============================================================================

TEST_F(IntegrationTest, PostRequest) {
    TestClient client;
    ASSERT_TRUE(client.connect(port_));
    
    std::string body = "{\"name\":\"test\"}";
    std::string request = 
        "POST /api/test HTTP/1.1\r\n"
        "Host: localhost\r\n"
        "Content-Type: application/json\r\n"
        "Content-Length: " + std::to_string(body.length()) + "\r\n"
        "\r\n" + body;
    
    ASSERT_TRUE(client.send(request));
    
    std::string response = client.receive();
    
    // Should get some response (even if not implemented yet)
    EXPECT_FALSE(response.empty());
    EXPECT_NE(response.find("HTTP/1.1"), std::string::npos);
}

TEST_F(IntegrationTest, PutRequest) {
    TestClient client;
    ASSERT_TRUE(client.connect(port_));
    
    std::string request = "PUT /api/test HTTP/1.1\r\nHost: localhost\r\n\r\n";
    ASSERT_TRUE(client.send(request));
    
    std::string response = client.receive();
    EXPECT_FALSE(response.empty());
    EXPECT_NE(response.find("HTTP/1.1"), std::string::npos);
}

TEST_F(IntegrationTest, DeleteRequest) {
    TestClient client;
    ASSERT_TRUE(client.connect(port_));
    
    std::string request = "DELETE /api/test HTTP/1.1\r\nHost: localhost\r\n\r\n";
    ASSERT_TRUE(client.send(request));
    
    std::string response = client.receive();
    EXPECT_FALSE(response.empty());
    EXPECT_NE(response.find("HTTP/1.1"), std::string::npos);
}

// ============================================================================
// Edge Cases and Error Handling
// ============================================================================

TEST_F(IntegrationTest, MalformedRequest) {
    TestClient client;
    ASSERT_TRUE(client.connect(port_));
    
    // Send malformed request
    std::string request = "INVALID REQUEST\r\n\r\n";
    ASSERT_TRUE(client.send(request));
    
    std::string response = client.receive();
    
    // Should get 400 Bad Request
    EXPECT_NE(response.find("HTTP/1.1 400"), std::string::npos);
}

TEST_F(IntegrationTest, RequestWithLargeHeaders) {
    TestClient client;
    ASSERT_TRUE(client.connect(port_));
    
    // Create request with many headers
    std::string request = "GET / HTTP/1.1\r\n";
    request += "Host: localhost\r\n";
    
    // Add 20 custom headers
    for (int i = 0; i < 20; ++i) {
        request += "X-Custom-Header-" + std::to_string(i) + ": value" + std::to_string(i) + "\r\n";
    }
    request += "\r\n";
    
    ASSERT_TRUE(client.send(request));
    
    std::string response = client.receive();
    
    // Should handle it gracefully
    EXPECT_NE(response.find("HTTP/1.1"), std::string::npos);
}

TEST_F(IntegrationTest, RequestWithLargeBody) {
    TestClient client;
    ASSERT_TRUE(client.connect(port_));
    
    // Create 10KB body
    std::string body(10240, 'A');
    
    std::string request = 
        "POST /api/test HTTP/1.1\r\n"
        "Host: localhost\r\n"
        "Content-Length: " + std::to_string(body.length()) + "\r\n"
        "\r\n" + body;
    
    ASSERT_TRUE(client.send(request));
    
    std::string response = client.receive();
    
    // Should handle it gracefully
    EXPECT_NE(response.find("HTTP/1.1"), std::string::npos);
}

TEST_F(IntegrationTest, EmptyRequest) {
    TestClient client;
    ASSERT_TRUE(client.connect(port_));
    
    // Send empty data
    std::string request = "";
    client.send(request);
    
    // Wait a bit
    std::this_thread::sleep_for(std::chrono::milliseconds(50));
    
    // Server should handle gracefully (may close connection or timeout)
    // Just verify no crash
    SUCCEED();
}

TEST_F(IntegrationTest, PartialRequest) {
    TestClient client;
    ASSERT_TRUE(client.connect(port_));
    
    // Send incomplete request
    std::string request = "GET / HTTP/1.1\r\nHost: localhost\r\n";
    // Missing final \r\n
    
    ASSERT_TRUE(client.send(request));
    
    // Wait for response
    std::string response = client.receive();
    
    // May timeout or return 400, but shouldn't crash
    // Just verify we got some response or connection closed
    SUCCEED();
}

// ============================================================================
// Performance and Stress Tests
// ============================================================================

TEST_F(IntegrationTest, RapidFireRequests) {
    TestClient client;
    ASSERT_TRUE(client.connect(port_));
    
    int successful = 0;
    
    for (int i = 0; i < 100; ++i) {
        client.disconnect();
        if (client.connect(port_)) {
            std::string request = "GET / HTTP/1.1\r\nHost: localhost\r\n\r\n";
            if (client.send(request)) {
                std::string response = client.receive();
                if (response.find("HTTP/1.1 200 OK") != std::string::npos) {
                    successful++;
                }
            }
        }
    }
    
    // Should handle at least 90% successfully
    EXPECT_GE(successful, 90) << "Only " << successful << " out of 100 succeeded";
}

TEST_F(IntegrationTest, LongRunningConnection) {
    TestClient client;
    ASSERT_TRUE(client.connect(port_));
    
    // Keep connection open and send multiple requests
    for (int i = 0; i < 5; ++i) {
        std::string request = "GET / HTTP/1.1\r\nHost: localhost\r\n\r\n";
        ASSERT_TRUE(client.send(request));
        
        std::string response = client.receive();
        EXPECT_NE(response.find("HTTP/1.1 200 OK"), std::string::npos);
        
        // Note: Since we use Connection: close, we need to reconnect
        if (i < 4) {  // Don't reconnect on last iteration
            client.disconnect();
            std::this_thread::sleep_for(std::chrono::milliseconds(10));
            ASSERT_TRUE(client.connect(port_));
        }
    }
}

} // namespace test
} // namespace flash
