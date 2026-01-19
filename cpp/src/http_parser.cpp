/**
 * @file http_parser.cpp
 * @brief Implementation of HTTP request parser
 * 
 * WEEK 2 IMPLEMENTATION GUIDE:
 * This file contains the parser logic with TODOs for you to complete.
 */

#include "http_parser.h"
#include <iostream>
#include <sstream>
#include <algorithm>

namespace flash {

std::optional<HttpRequest> HttpParser::parse(const char* data, size_t length) {
    // TODO (Week 2): Implement HTTP request parsing
    // HINT: Convert data to string for easier manipulation
    std::string request_str(data, length);
    
    // HINT: Create HttpRequest object to fill
    HttpRequest request;
    
    // HINT: Find end of headers (\r\n\r\n)
    size_t header_end = request_str.find("\r\n\r\n");
    if (header_end == std::string::npos) {
        std::cerr << "[HttpParser] Invalid request: no header end found" << std::endl;
        return std::nullopt;
    }
    
    // HINT: Extract headers section (everything before \r\n\r\n)
    std::string headers_section = request_str.substr(0, header_end);
    
    // HINT: Extract body (everything after \r\n\r\n)
    if (header_end + 4 < length) {
        request.body = request_str.substr(header_end + 4);
    }
    
    // HINT: Split headers by \r\n to get individual lines
    std::istringstream stream(headers_section);
    std::string line;
    bool first_line = true;
    
    while (std::getline(stream, line)) {
        // Remove \r if present
        if (!line.empty() && line.back() == '\r') {
            line.pop_back();
        }
        
        if (line.empty()) {
            continue;
        }
        
        // HINT: First line is request line (GET /path HTTP/1.1)
        if (first_line) {
            if (!parse_request_line(line, request)) {
                return std::nullopt;
            }
            first_line = false;
        } else {
            // HINT: Remaining lines are headers
            if (!parse_header(line, request)) {
                std::cerr << "[HttpParser] Failed to parse header: " << line << std::endl;
                // Continue parsing other headers even if one fails
            }
        }
    }
    
    // HINT: Validate that we got the required fields
    if (request.method.empty() || request.path.empty() || request.version.empty()) {
        std::cerr << "[HttpParser] Incomplete request line" << std::endl;
        return std::nullopt;
    }
    
    return request;
}

bool HttpParser::parse_request_line(const std::string& line, HttpRequest& request) {
    // TODO (Week 2): Parse request line
    // Example: "GET /hello HTTP/1.1"
    
    // HINT: Use stringstream to split by spaces
    std::istringstream iss(line);
    std::string method, path, version;
    
    // HINT: Extract three parts
    if (!(iss >> method >> path >> version)) {
        std::cerr << "[HttpParser] Invalid request line: " << line << std::endl;
        return false;
    }
    
    // HINT: Validate method (common methods)
    // For Week 2, accept any non-empty method
    if (method.empty()) {
        std::cerr << "[HttpParser] Empty method" << std::endl;
        return false;
    }
    
    // HINT: Validate path (must start with /)
    if (path.empty() || path[0] != '/') {
        std::cerr << "[HttpParser] Invalid path: " << path << std::endl;
        return false;
    }
    
    // HINT: Validate version
    if (version != "HTTP/1.1" && version != "HTTP/1.0") {
        std::cerr << "[HttpParser] Unsupported HTTP version: " << version << std::endl;
        // Don't fail - just warn
    }
    
    // HINT: Store parsed values
    request.method = method;
    request.path = path;
    request.version = version;
    
    return true;
}

bool HttpParser::parse_header(const std::string& line, HttpRequest& request) {
    // TODO (Week 2): Parse header line
    // Example: "Host: localhost:5627"
    
    // HINT: Find the ": " separator
    size_t colon_pos = line.find(':');
    
    if (colon_pos == std::string::npos) {
        std::cerr << "[HttpParser] Invalid header (no colon): " << line << std::endl;
        return false;
    }
    
    // HINT: Extract header name (before colon)
    std::string name = line.substr(0, colon_pos);
    name = trim(name);
    
    // HINT: Extract header value (after colon)
    std::string value;
    if (colon_pos + 1 < line.length()) {
        value = line.substr(colon_pos + 1);
        value = trim(value);
    }
    
    // HINT: Store in headers map
    if (!name.empty()) {
        request.headers[name] = value;
    }
    
    return true;
}

std::string HttpParser::trim(const std::string& str) {
    // TODO (Week 2): Trim whitespace from both ends
    
    if (str.empty()) {
        return str;
    }
    
    // HINT: Find first non-whitespace character
    size_t start = 0;
    while (start < str.length() && std::isspace(str[start])) {
        start++;
    }
    
    // HINT: Find last non-whitespace character
    size_t end = str.length();
    while (end > start && std::isspace(str[end - 1])) {
        end--;
    }
    
    // HINT: Return substring without leading/trailing whitespace
    return str.substr(start, end - start);
}

} // namespace flash
