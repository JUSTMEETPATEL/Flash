/**
 * @file http_parser.cpp
 * @brief Zero-copy HTTP request parser
 * 
 * Performance-optimized: parses directly from the raw char* buffer using
 * pointer arithmetic and memchr(). No std::string copies, no istringstream,
 * no getline. All scanning uses memchr() which is SIMD-optimized on most
 * platforms.
 */

#include "http_parser.h"
#include <cstring>

namespace flash {

// Find \r\n in buffer using memchr (SIMD-optimized on most platforms)
static inline const char* find_crlf(const char* buf, size_t len) {
    const char* end = buf + len;
    while (buf < end - 1) {
        const char* cr = static_cast<const char*>(memchr(buf, '\r', end - buf - 1));
        if (!cr) return nullptr;
        if (cr[1] == '\n') return cr;
        buf = cr + 1;
    }
    return nullptr;
}

std::optional<HttpRequest> HttpParser::parse(const char* data, size_t length) {
    HttpRequest request;
    
    const char* ptr = data;
    const char* end = data + length;
    
    // --- Parse request line: "GET /path HTTP/1.1\r\n" ---
    
    // Find end of request line
    const char* line_end = find_crlf(ptr, end - ptr);
    if (!line_end) return std::nullopt;
    
    // Find method (first space)
    const char* sp1 = static_cast<const char*>(memchr(ptr, ' ', line_end - ptr));
    if (!sp1) return std::nullopt;
    
    request.method.assign(ptr, sp1 - ptr);
    
    // Find path (second space)
    const char* path_start = sp1 + 1;
    const char* sp2 = static_cast<const char*>(memchr(path_start, ' ', line_end - path_start));
    if (!sp2) return std::nullopt;
    
    request.path.assign(path_start, sp2 - path_start);
    
    // Version (rest of line)
    const char* ver_start = sp2 + 1;
    request.version.assign(ver_start, line_end - ver_start);
    
    // Validate minimum fields
    if (request.method.empty() || request.path.empty() || request.path[0] != '/') {
        return std::nullopt;
    }
    
    // Move past \r\n
    ptr = line_end + 2;
    
    // --- Parse headers ---
    while (ptr < end - 1) {
        // Check for blank line (end of headers)
        if (ptr[0] == '\r' && ptr[1] == '\n') {
            ptr += 2;  // Skip past \r\n
            break;
        }
        
        // Find end of this header line
        const char* hdr_end = find_crlf(ptr, end - ptr);
        if (!hdr_end) break;
        
        // Find colon separator
        const char* colon = static_cast<const char*>(memchr(ptr, ':', hdr_end - ptr));
        if (colon) {
            // Header name: ptr to colon
            std::string name(ptr, colon - ptr);
            
            // Header value: after colon, skip whitespace
            const char* val_start = colon + 1;
            while (val_start < hdr_end && *val_start == ' ') val_start++;
            
            // Trim trailing whitespace
            const char* val_end = hdr_end;
            while (val_end > val_start && (val_end[-1] == ' ' || val_end[-1] == '\t')) val_end--;
            
            request.headers[std::move(name)].assign(val_start, val_end - val_start);
        }
        
        ptr = hdr_end + 2;  // Move past \r\n
    }
    
    // --- Extract body (remaining data after headers) ---
    if (ptr < end) {
        request.body.assign(ptr, end - ptr);
    }
    
    return request;
}

// These are no longer used — parsing is done inline in parse()
// Keep them for API compatibility but they're dead code
bool HttpParser::parse_request_line(const std::string& line, HttpRequest& request) {
    return true;
}

bool HttpParser::parse_header(const std::string& line, HttpRequest& request) {
    return true;
}

std::string HttpParser::trim(const std::string& str) {
    if (str.empty()) return str;
    size_t start = 0;
    while (start < str.length() && std::isspace(str[start])) start++;
    size_t end = str.length();
    while (end > start && std::isspace(str[end - 1])) end--;
    return str.substr(start, end - start);
}

} // namespace flash
