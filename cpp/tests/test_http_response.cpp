/**
 * @file test_http_response.cpp
 * @brief Unit tests for HTTP response builder (Week 3)
 */

#include <gtest/gtest.h>
#include "http_response.h"
#include <string>

namespace flash {
namespace test {

class HttpResponseTest : public ::testing::Test {
protected:
    void SetUp() override {
        response_ = std::make_unique<HttpResponse>();
    }

    std::unique_ptr<HttpResponse> response_;
};

// ============================================================================
// Basic Response Tests
// ============================================================================

TEST_F(HttpResponseTest, DefaultResponseIs200OK) {
    EXPECT_EQ(response_->get_status_code(), 200);
    EXPECT_EQ(response_->get_reason_phrase(), "OK");
}

TEST_F(HttpResponseTest, SerializeSimple200Response) {
    response_->set_body("Hello, World!");
    
    std::string result = response_->serialize();
    
    // Check status line
    EXPECT_NE(result.find("HTTP/1.1 200 OK"), std::string::npos);
    
    // Check body
    EXPECT_NE(result.find("Hello, World!"), std::string::npos);
    
    // Check Content-Length is added automatically
    EXPECT_NE(result.find("Content-Length: 13"), std::string::npos);
    
    // Check Server header is added
    EXPECT_NE(result.find("Server: Flash/0.1"), std::string::npos);
    
    // Check blank line before body
    EXPECT_NE(result.find("\r\n\r\n"), std::string::npos);
}

TEST_F(HttpResponseTest, MethodChainingWorks) {
    response_->set_status(201, "Created")
             .set_header("Location", "/users/123")
             .set_body("User created");
    
    EXPECT_EQ(response_->get_status_code(), 201);
    EXPECT_EQ(response_->get_header("Location"), "/users/123");
    EXPECT_EQ(response_->get_body(), "User created");
}

// ============================================================================
// Status Code Tests
// ============================================================================

TEST_F(HttpResponseTest, Set200OKStatus) {
    response_->set_status(StatusCode::OK, ReasonPhrase::OK);
    
    std::string result = response_->serialize();
    EXPECT_NE(result.find("HTTP/1.1 200 OK"), std::string::npos);
}

TEST_F(HttpResponseTest, Set404NotFoundStatus) {
    response_->set_status(StatusCode::NOT_FOUND, ReasonPhrase::NOT_FOUND);
    
    std::string result = response_->serialize();
    EXPECT_NE(result.find("HTTP/1.1 404 Not Found"), std::string::npos);
}

TEST_F(HttpResponseTest, Set500InternalServerErrorStatus) {
    response_->set_status(StatusCode::INTERNAL_SERVER_ERROR, 
                         ReasonPhrase::INTERNAL_SERVER_ERROR);
    
    std::string result = response_->serialize();
    EXPECT_NE(result.find("HTTP/1.1 500 Internal Server Error"), std::string::npos);
}

TEST_F(HttpResponseTest, Set400BadRequestStatus) {
    response_->set_status(StatusCode::BAD_REQUEST, ReasonPhrase::BAD_REQUEST);
    
    std::string result = response_->serialize();
    EXPECT_NE(result.find("HTTP/1.1 400 Bad Request"), std::string::npos);
}

// ============================================================================
// Header Tests
// ============================================================================

TEST_F(HttpResponseTest, SetSingleHeader) {
    response_->set_header("Content-Type", "text/html");
    
    std::string result = response_->serialize();
    EXPECT_NE(result.find("Content-Type: text/html"), std::string::npos);
}

TEST_F(HttpResponseTest, SetMultipleHeaders) {
    response_->set_header("Content-Type", "application/json")
             .set_header("Cache-Control", "no-cache")
             .set_header("X-Custom-Header", "custom-value");
    
    std::string result = response_->serialize();
    EXPECT_NE(result.find("Content-Type: application/json"), std::string::npos);
    EXPECT_NE(result.find("Cache-Control: no-cache"), std::string::npos);
    EXPECT_NE(result.find("X-Custom-Header: custom-value"), std::string::npos);
}

TEST_F(HttpResponseTest, HasHeaderWorks) {
    response_->set_header("Content-Type", "text/plain");
    
    EXPECT_TRUE(response_->has_header("Content-Type"));
    EXPECT_FALSE(response_->has_header("Accept"));
}

TEST_F(HttpResponseTest, GetHeaderWorks) {
    response_->set_header("Content-Type", "application/json");
    
    EXPECT_EQ(response_->get_header("Content-Type"), "application/json");
    EXPECT_EQ(response_->get_header("NonExistent"), "");
}

// ============================================================================
// Body Tests
// ============================================================================

TEST_F(HttpResponseTest, SetEmptyBody) {
    response_->set_body("");
    
    std::string result = response_->serialize();
    EXPECT_EQ(response_->get_body(), "");
    
    // Should not have Content-Length for empty body
    EXPECT_EQ(result.find("Content-Length: 0"), std::string::npos);
}

TEST_F(HttpResponseTest, SetTextBody) {
    std::string body = "This is a text response";
    response_->set_body(body);
    
    std::string result = response_->serialize();
    EXPECT_NE(result.find(body), std::string::npos);
    EXPECT_NE(result.find("Content-Length: 23"), std::string::npos);
}

TEST_F(HttpResponseTest, SetJSONBody) {
    std::string json = "{\"message\":\"Hello\",\"status\":\"success\"}";
    response_->set_header("Content-Type", "application/json")
             .set_body(json);
    
    std::string result = response_->serialize();
    EXPECT_NE(result.find(json), std::string::npos);
    EXPECT_NE(result.find("Content-Type: application/json"), std::string::npos);
}

TEST_F(HttpResponseTest, SetHTMLBody) {
    std::string html = "<html><body><h1>Hello World</h1></body></html>";
    response_->set_header("Content-Type", "text/html")
             .set_body(html);
    
    std::string result = response_->serialize();
    EXPECT_NE(result.find(html), std::string::npos);
    EXPECT_NE(result.find("Content-Type: text/html"), std::string::npos);
}

TEST_F(HttpResponseTest, SetLargeBody) {
    std::string large_body(10000, 'A');  // 10KB of 'A'
    response_->set_body(large_body);
    
    std::string result = response_->serialize();
    EXPECT_NE(result.find("Content-Length: 10000"), std::string::npos);
    EXPECT_EQ(response_->get_body().length(), 10000);
}

// ============================================================================
// Content-Length Tests
// ============================================================================

TEST_F(HttpResponseTest, ContentLengthAutoAdded) {
    response_->set_body("Test body");
    
    std::string result = response_->serialize();
    EXPECT_NE(result.find("Content-Length: 9"), std::string::npos);
}

TEST_F(HttpResponseTest, ContentLengthNotDuplicated) {
    response_->set_header("Content-Length", "100")
             .set_body("Short");
    
    std::string result = response_->serialize();
    
    // Should keep the manually set Content-Length
    EXPECT_NE(result.find("Content-Length: 100"), std::string::npos);
    
    // Should not add another Content-Length
    size_t first = result.find("Content-Length:");
    size_t second = result.find("Content-Length:", first + 1);
    EXPECT_EQ(second, std::string::npos);
}

// ============================================================================
// Complete Response Tests
// ============================================================================

TEST_F(HttpResponseTest, Complete200JSONResponse) {
    response_->set_status(200, "OK")
             .set_header("Content-Type", "application/json")
             .set_body("{\"id\":123,\"name\":\"John\"}");
    
    std::string result = response_->serialize();
    
    // Verify format
    EXPECT_NE(result.find("HTTP/1.1 200 OK\r\n"), std::string::npos);
    EXPECT_NE(result.find("Content-Type: application/json\r\n"), std::string::npos);
    EXPECT_NE(result.find("Content-Length: 24\r\n"), std::string::npos);
    EXPECT_NE(result.find("\r\n\r\n"), std::string::npos);
    EXPECT_NE(result.find("{\"id\":123,\"name\":\"John\"}"), std::string::npos);
}

TEST_F(HttpResponseTest, Complete404Response) {
    response_->set_status(404, "Not Found")
             .set_header("Content-Type", "text/plain")
             .set_body("Resource not found");
    
    std::string result = response_->serialize();
    
    EXPECT_NE(result.find("HTTP/1.1 404 Not Found"), std::string::npos);
    EXPECT_NE(result.find("Resource not found"), std::string::npos);
}

TEST_F(HttpResponseTest, Complete500Response) {
    response_->set_status(500, "Internal Server Error")
             .set_header("Content-Type", "text/html")
             .set_body("<h1>Server Error</h1>");
    
    std::string result = response_->serialize();
    
    EXPECT_NE(result.find("HTTP/1.1 500 Internal Server Error"), std::string::npos);
    EXPECT_NE(result.find("<h1>Server Error</h1>"), std::string::npos);
}

// ============================================================================
// Default Headers Tests
// ============================================================================

TEST_F(HttpResponseTest, ServerHeaderAutoAdded) {
    std::string result = response_->serialize();
    EXPECT_NE(result.find("Server: Flash/0.1"), std::string::npos);
}

TEST_F(HttpResponseTest, ConnectionKeepAliveAutoAdded) {
    std::string result = response_->serialize();
    EXPECT_NE(result.find("Connection: keep-alive"), std::string::npos);
}

TEST_F(HttpResponseTest, CanOverrideDefaultHeaders) {
    response_->set_header("Server", "CustomServer/1.0")
             .set_header("Connection", "keep-alive");
    
    std::string result = response_->serialize();
    
    EXPECT_NE(result.find("Server: CustomServer/1.0"), std::string::npos);
    EXPECT_NE(result.find("Connection: keep-alive"), std::string::npos);
    
    // Should not have the default values
    EXPECT_EQ(result.find("Server: Flash/0.1"), std::string::npos);
    EXPECT_EQ(result.find("Connection: close"), std::string::npos);
}

// ============================================================================
// Helper Constants Tests
// ============================================================================

TEST_F(HttpResponseTest, StatusCodeConstantsWork) {
    EXPECT_EQ(StatusCode::OK, 200);
    EXPECT_EQ(StatusCode::CREATED, 201);
    EXPECT_EQ(StatusCode::NO_CONTENT, 204);
    EXPECT_EQ(StatusCode::BAD_REQUEST, 400);
    EXPECT_EQ(StatusCode::NOT_FOUND, 404);
    EXPECT_EQ(StatusCode::METHOD_NOT_ALLOWED, 405);
    EXPECT_EQ(StatusCode::INTERNAL_SERVER_ERROR, 500);
    EXPECT_EQ(StatusCode::NOT_IMPLEMENTED, 501);
}

} // namespace test
} // namespace flash
