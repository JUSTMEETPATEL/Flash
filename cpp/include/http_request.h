/**
 * @file http_request.h
 * @brief HTTP request data structure
 * @author Flash Framework Team
 * @date 2025-10-05
 * 
 * This file defines the HttpRequest struct that holds parsed HTTP request data.
 * 
 * WEEK 2 GOAL: Parse HTTP requests into this structure
 * 
 * HTTP Request Format:
 * GET /path HTTP/1.1\r\n
 * Host: localhost:5627\r\n
 * User-Agent: curl/7.64.1\r\n
 * Accept: * / *\r\n
 * \r\n
 * [optional body]
 */

#pragma once

#include <string>
#include <unordered_map>
#include <optional>

namespace flash {

/**
 * @struct HttpRequest
 * @brief Represents a parsed HTTP request
 * 
 * Contains all the components of an HTTP/1.1 request:
 * - Request line (method, path, version)
 * - Headers (key-value pairs)
 * - Body (for POST/PUT requests)
 */
struct HttpRequest {
    /**
     * HTTP method (GET, POST, PUT, DELETE, etc.)
     * Example: "GET"
     */
    std::string method;
    
    /**
     * Request path/URI
     * Example: "/api/users/123"
     */
    std::string path;
    
    /**
     * HTTP version
     * Example: "HTTP/1.1"
     */
    std::string version;
    
    /**
     * HTTP headers as key-value pairs
     * Example: {"Host": "localhost:5627", "User-Agent": "curl/7.64.1"}
     * 
     * Note: Header names are case-insensitive in HTTP, but we store them as-is
     */
    std::unordered_map<std::string, std::string> headers;
    
    /**
     * Request body (empty for GET requests)
     * Contains the data for POST/PUT requests
     */
    std::string body;
    
    /**
     * @brief Get a header value (case-insensitive lookup)
     * 
     * @param name Header name (e.g., "Content-Type" or "content-type")
     * @return Optional header value, empty if not found
     */
    std::optional<std::string> get_header(const std::string& name) const;
    
    /**
     * @brief Check if request has a specific header
     * 
     * @param name Header name
     * @return true if header exists, false otherwise
     */
    bool has_header(const std::string& name) const;
    
    /**
     * @brief Print request details for debugging
     */
    void print() const;
};

} // namespace flash
