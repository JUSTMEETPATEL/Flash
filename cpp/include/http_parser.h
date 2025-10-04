/**
 * @file http_parser.h
 * @brief HTTP/1.1 request parser
 * @author Flash Framework Team
 * @date 2025-10-05
 * 
 * This parser converts raw HTTP request data into an HttpRequest structure.
 * 
 * WEEK 2 IMPLEMENTATION:
 * - Parse request line (method, path, version)
 * - Parse headers (key: value pairs)
 * - Detect end of headers (\r\n\r\n)
 * - Extract body (for POST/PUT)
 * 
 * HTTP Request Format Example:
 * GET /hello HTTP/1.1\r\n
 * Host: localhost:5627\r\n
 * User-Agent: curl/7.64.1\r\n
 * Accept: * / *\r\n
 * \r\n
 */

#pragma once

#include "http_request.h"
#include <string>
#include <optional>
#include <string_view>

namespace flash {

/**
 * @class HttpParser
 * @brief Parses raw HTTP request data
 * 
 * USAGE:
 * @code
 * HttpParser parser;
 * auto request = parser.parse(buffer, bytes_read);
 * if (request) {
 *     std::cout << "Method: " << request->method << std::endl;
 * }
 * @endcode
 */
class HttpParser {
public:
    /**
     * @brief Parse HTTP request from buffer
     * 
     * @param data Raw request data (null-terminated)
     * @param length Length of data
     * @return Parsed request on success, std::nullopt on parse error
     * 
     * WEEK 2 TODO: Implement this method
     * 
     * HINTS:
     * 1. Convert data to string for easier parsing
     * 2. Find first \r\n to get request line
     * 3. Parse request line into method, path, version
     * 4. Loop through remaining lines until \r\n\r\n
     * 5. Parse each header line (split on ": ")
     * 6. Extract body if present (after \r\n\r\n)
     */
    std::optional<HttpRequest> parse(const char* data, size_t length);

private:
    /**
     * @brief Parse the request line (first line)
     * 
     * Example: "GET /hello HTTP/1.1"
     * 
     * @param line Request line string
     * @param request Request object to fill
     * @return true on success, false on parse error
     * 
     * WEEK 2 TODO: Implement this helper
     * 
     * HINTS:
     * 1. Split line by spaces
     * 2. First part = method
     * 3. Second part = path
     * 4. Third part = version
     * 5. Validate we have exactly 3 parts
     */
    bool parse_request_line(const std::string& line, HttpRequest& request);
    
    /**
     * @brief Parse a single header line
     * 
     * Example: "Host: localhost:5627"
     * 
     * @param line Header line string
     * @param request Request object to fill
     * @return true on success, false on parse error
     * 
     * WEEK 2 TODO: Implement this helper
     * 
     * HINTS:
     * 1. Find ": " separator
     * 2. Part before = header name
     * 3. Part after = header value
     * 4. Trim whitespace from both
     * 5. Add to request.headers map
     */
    bool parse_header(const std::string& line, HttpRequest& request);
    
    /**
     * @brief Trim whitespace from string
     * 
     * Helper function to remove leading/trailing spaces
     */
    std::string trim(const std::string& str);
};

} // namespace flash
