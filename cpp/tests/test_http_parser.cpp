/**
 * @file test_http_parser.cpp
 * @brief Unit tests for HTTP request parser (Week 2)
 */

#include <gtest/gtest.h>
#include "http_parser.h"
#include <string>

namespace flash {
namespace test {

class HttpParserTest : public ::testing::Test {
protected:
    void SetUp() override {
        parser_ = std::make_unique<HttpParser>();
    }

    std::unique_ptr<HttpParser> parser_;
};

// ============================================================================
// Basic Request Line Tests
// ============================================================================

TEST_F(HttpParserTest, ParsesSimpleGetRequest) {
    std::string request = "GET /index.html HTTP/1.1\r\n\r\n";
    
    auto result = parser_->parse(request.c_str(), request.length());
    
    ASSERT_TRUE(result.has_value());
    EXPECT_EQ(result->method, "GET");
    EXPECT_EQ(result->path, "/index.html");
    EXPECT_EQ(result->version, "HTTP/1.1");
    EXPECT_TRUE(result->body.empty());
}

TEST_F(HttpParserTest, ParsesGetRequestWithHeaders) {
    std::string request = 
        "GET /api/users HTTP/1.1\r\n"
        "Host: localhost:5627\r\n"
        "User-Agent: TestClient/1.0\r\n"
        "Accept: */*\r\n"
        "\r\n";
    
    auto result = parser_->parse(request.c_str(), request.length());
    
    ASSERT_TRUE(result.has_value());
    EXPECT_EQ(result->method, "GET");
    EXPECT_EQ(result->path, "/api/users");
    EXPECT_EQ(result->version, "HTTP/1.1");
    
    // Check headers
    EXPECT_TRUE(result->has_header("Host"));
    EXPECT_EQ(result->get_header("Host").value_or(""), "localhost:5627");
    
    EXPECT_TRUE(result->has_header("User-Agent"));
    EXPECT_EQ(result->get_header("User-Agent").value_or(""), "TestClient/1.0");
}

TEST_F(HttpParserTest, ParsesPostRequestWithBody) {
    std::string request = 
        "POST /api/users HTTP/1.1\r\n"
        "Host: localhost:5627\r\n"
        "Content-Type: application/json\r\n"
        "Content-Length: 27\r\n"
        "\r\n"
        "{\"name\":\"John\",\"age\":30}";
    
    auto result = parser_->parse(request.c_str(), request.length());
    
    ASSERT_TRUE(result.has_value());
    EXPECT_EQ(result->method, "POST");
    EXPECT_EQ(result->path, "/api/users");
    EXPECT_EQ(result->version, "HTTP/1.1");
    EXPECT_EQ(result->body, "{\"name\":\"John\",\"age\":30}");
    
    // Check Content-Type header
    EXPECT_TRUE(result->has_header("Content-Type"));
    EXPECT_EQ(result->get_header("Content-Type").value_or(""), "application/json");
}

// ============================================================================
// Different HTTP Methods
// ============================================================================

TEST_F(HttpParserTest, ParsesPutRequest) {
    std::string request = "PUT /api/users/123 HTTP/1.1\r\n\r\n";
    
    auto result = parser_->parse(request.c_str(), request.length());
    
    ASSERT_TRUE(result.has_value());
    EXPECT_EQ(result->method, "PUT");
    EXPECT_EQ(result->path, "/api/users/123");
}

TEST_F(HttpParserTest, ParsesDeleteRequest) {
    std::string request = "DELETE /api/users/123 HTTP/1.1\r\n\r\n";
    
    auto result = parser_->parse(request.c_str(), request.length());
    
    ASSERT_TRUE(result.has_value());
    EXPECT_EQ(result->method, "DELETE");
    EXPECT_EQ(result->path, "/api/users/123");
}

TEST_F(HttpParserTest, ParsesHeadRequest) {
    std::string request = "HEAD /api/status HTTP/1.1\r\n\r\n";
    
    auto result = parser_->parse(request.c_str(), request.length());
    
    ASSERT_TRUE(result.has_value());
    EXPECT_EQ(result->method, "HEAD");
    EXPECT_EQ(result->path, "/api/status");
}

// ============================================================================
// Path and Query String Tests
// ============================================================================

TEST_F(HttpParserTest, ParsesPathWithQueryString) {
    std::string request = "GET /search?q=hello&limit=10 HTTP/1.1\r\n\r\n";
    
    auto result = parser_->parse(request.c_str(), request.length());
    
    ASSERT_TRUE(result.has_value());
    EXPECT_EQ(result->method, "GET");
    EXPECT_EQ(result->path, "/search?q=hello&limit=10");
}

TEST_F(HttpParserTest, ParsesRootPath) {
    std::string request = "GET / HTTP/1.1\r\n\r\n";
    
    auto result = parser_->parse(request.c_str(), request.length());
    
    ASSERT_TRUE(result.has_value());
    EXPECT_EQ(result->path, "/");
}

TEST_F(HttpParserTest, ParsesLongPath) {
    std::string request = "GET /api/v1/users/123/posts/456/comments HTTP/1.1\r\n\r\n";
    
    auto result = parser_->parse(request.c_str(), request.length());
    
    ASSERT_TRUE(result.has_value());
    EXPECT_EQ(result->path, "/api/v1/users/123/posts/456/comments");
}

// ============================================================================
// Header Tests
// ============================================================================

TEST_F(HttpParserTest, HeadersAreCaseInsensitive) {
    std::string request = 
        "GET / HTTP/1.1\r\n"
        "Content-Type: text/html\r\n"
        "\r\n";
    
    auto result = parser_->parse(request.c_str(), request.length());
    
    ASSERT_TRUE(result.has_value());
    
    // Should find header regardless of case
    EXPECT_TRUE(result->has_header("content-type"));
    EXPECT_TRUE(result->has_header("Content-Type"));
    EXPECT_TRUE(result->has_header("CONTENT-TYPE"));
}

TEST_F(HttpParserTest, ParsesHeaderWithSpaces) {
    std::string request = 
        "GET / HTTP/1.1\r\n"
        "Accept:    text/html   \r\n"
        "\r\n";
    
    auto result = parser_->parse(request.c_str(), request.length());
    
    ASSERT_TRUE(result.has_value());
    EXPECT_EQ(result->get_header("Accept").value_or(""), "text/html");
}

TEST_F(HttpParserTest, ParsesMultipleHeaders) {
    std::string request = 
        "GET / HTTP/1.1\r\n"
        "Host: localhost:5627\r\n"
        "Accept: */*\r\n"
        "Accept-Encoding: gzip, deflate\r\n"
        "Connection: keep-alive\r\n"
        "User-Agent: curl/7.88.1\r\n"
        "\r\n";
    
    auto result = parser_->parse(request.c_str(), request.length());
    
    ASSERT_TRUE(result.has_value());
    EXPECT_EQ(result->headers.size(), 5);
    
    EXPECT_TRUE(result->has_header("Host"));
    EXPECT_TRUE(result->has_header("Accept"));
    EXPECT_TRUE(result->has_header("Accept-Encoding"));
    EXPECT_TRUE(result->has_header("Connection"));
    EXPECT_TRUE(result->has_header("User-Agent"));
}

// ============================================================================
// Error Cases
// ============================================================================

TEST_F(HttpParserTest, RejectsInvalidRequestNoHeaderEnd) {
    std::string request = "GET /index.html HTTP/1.1\r\n";  // Missing \r\n\r\n
    
    auto result = parser_->parse(request.c_str(), request.length());
    
    EXPECT_FALSE(result.has_value());
}

TEST_F(HttpParserTest, RejectsEmptyRequest) {
    std::string request = "";
    
    auto result = parser_->parse(request.c_str(), request.length());
    
    EXPECT_FALSE(result.has_value());
}

TEST_F(HttpParserTest, RejectsInvalidRequestLine) {
    std::string request = "INVALID\r\n\r\n";
    
    auto result = parser_->parse(request.c_str(), request.length());
    
    EXPECT_FALSE(result.has_value());
}

TEST_F(HttpParserTest, RejectsRequestWithoutPath) {
    std::string request = "GET HTTP/1.1\r\n\r\n";
    
    auto result = parser_->parse(request.c_str(), request.length());
    
    EXPECT_FALSE(result.has_value());
}

TEST_F(HttpParserTest, RejectsPathWithoutLeadingSlash) {
    std::string request = "GET index.html HTTP/1.1\r\n\r\n";
    
    auto result = parser_->parse(request.c_str(), request.length());
    
    EXPECT_FALSE(result.has_value());
}

// ============================================================================
// Edge Cases
// ============================================================================

TEST_F(HttpParserTest, HandlesHTTP10Version) {
    std::string request = "GET /index.html HTTP/1.0\r\n\r\n";
    
    auto result = parser_->parse(request.c_str(), request.length());
    
    ASSERT_TRUE(result.has_value());
    EXPECT_EQ(result->version, "HTTP/1.0");
}

TEST_F(HttpParserTest, ParsesRequestWithEmptyBody) {
    std::string request = 
        "POST / HTTP/1.1\r\n"
        "Content-Length: 0\r\n"
        "\r\n";
    
    auto result = parser_->parse(request.c_str(), request.length());
    
    ASSERT_TRUE(result.has_value());
    EXPECT_TRUE(result->body.empty());
}

TEST_F(HttpParserTest, ParsesRequestWithLargeBody) {
    std::string body(1024, 'A');  // 1KB of 'A' characters
    std::string request = 
        "POST /data HTTP/1.1\r\n"
        "Content-Length: 1024\r\n"
        "\r\n" + body;
    
    auto result = parser_->parse(request.c_str(), request.length());
    
    ASSERT_TRUE(result.has_value());
    EXPECT_EQ(result->body.length(), 1024);
    EXPECT_EQ(result->body, body);
}

} // namespace test
} // namespace flash
