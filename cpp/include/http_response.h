/**
 * @file http_response.h
 * @brief HTTP response builder for Week 3
 * 
 * This class provides a fluent API for building HTTP responses.
 * It handles status codes, headers, body, and serialization.
 */

#pragma once

#include <string>
#include <unordered_map>
#include <sstream>

namespace flash {

/**
 * @class HttpResponse
 * @brief Builder for HTTP responses
 * 
 * Example usage:
 * @code
 * HttpResponse response;
 * response.set_status(200, "OK")
 *         .set_header("Content-Type", "application/json")
 *         .set_body("{\"message\":\"Hello World\"}");
 * 
 * std::string raw = response.serialize();
 *  HTTP/1.1 200 OK
 *  Content-Type: application/json
 *  Content-Length: 28
 * 
 *  {"message":"Hello World"}
 * @endcode
 */
class HttpResponse {
public:
    /**
     * @brief Default constructor - creates 200 OK response
     */
    HttpResponse();
    
    /**
     * @brief Set HTTP status code and reason phrase
     * @param code Status code (200, 404, 500, etc.)
     * @param reason Reason phrase ("OK", "Not Found", etc.)
     * @return Reference to this for method chaining
     */
    HttpResponse& set_status(int code, const std::string& reason);
    
    /**
     * @brief Set a response header
     * @param name Header name (e.g., "Content-Type")
     * @param value Header value (e.g., "text/html")
     * @return Reference to this for method chaining
     */
    HttpResponse& set_header(const std::string& name, const std::string& value);
    
    /**
     * @brief Set the response body
     * @param body Body content
     * @return Reference to this for method chaining
     */
    HttpResponse& set_body(const std::string& body);
    
    /**
     * @brief Set keep-alive connection mode
     * @param keep_alive true to keep connection open, false to close
     * @return Reference to this for method chaining
     */
    HttpResponse& set_keep_alive(bool keep_alive);
    
    /**
     * @brief Serialize response to HTTP format
     * 
     * Automatically adds:
     * - Content-Length header based on body size
     * - Server header
     * - Connection: close header
     * 
     * @return Complete HTTP response as string
     */
    std::string serialize() const;
    
    /**
     * @brief Get status code
     */
    int get_status_code() const { return status_code_; }
    
    /**
     * @brief Get reason phrase
     */
    std::string get_reason_phrase() const { return reason_phrase_; }
    
    /**
     * @brief Get body
     */
    std::string get_body() const { return body_; }
    
    /**
     * @brief Check if header exists
     */
    bool has_header(const std::string& name) const;
    
    /**
     * @brief Get header value
     */
    std::string get_header(const std::string& name) const;
    
    /**
     * @brief Print response for debugging
     */
    void print() const;

private:
    int status_code_;
    std::string reason_phrase_;
    std::unordered_map<std::string, std::string> headers_;
    std::string body_;
    std::string version_;  // HTTP version (default: HTTP/1.1)
    bool keep_alive_;      // Keep connection open (default: true)
};

// ============================================================================
// Common Status Codes (Helper Constants)
// ============================================================================

namespace StatusCode {
    constexpr int OK = 200;
    constexpr int CREATED = 201;
    constexpr int NO_CONTENT = 204;
    constexpr int BAD_REQUEST = 400;
    constexpr int NOT_FOUND = 404;
    constexpr int METHOD_NOT_ALLOWED = 405;
    constexpr int INTERNAL_SERVER_ERROR = 500;
    constexpr int NOT_IMPLEMENTED = 501;
}

namespace ReasonPhrase {
    constexpr const char* OK = "OK";
    constexpr const char* CREATED = "Created";
    constexpr const char* NO_CONTENT = "No Content";
    constexpr const char* BAD_REQUEST = "Bad Request";
    constexpr const char* NOT_FOUND = "Not Found";
    constexpr const char* METHOD_NOT_ALLOWED = "Method Not Allowed";
    constexpr const char* INTERNAL_SERVER_ERROR = "Internal Server Error";
    constexpr const char* NOT_IMPLEMENTED = "Not Implemented";
}

} // namespace flash
