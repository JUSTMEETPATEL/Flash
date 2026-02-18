/**
 * @file http_response.cpp
 * @brief Implementation of HTTP response builder
 * 
 * Performance-optimized: serialize_to() writes directly into a pre-allocated
 * buffer using memcpy, eliminating all heap allocations in the hot path.
 */

#include "http_response.h"
#include <iostream>
#include <cstring>
#include <cstdio>
#include <vector>

namespace flash {

HttpResponse::HttpResponse() 
    : status_code_(200)
    , reason_phrase_("OK")
    , version_("HTTP/1.1")
    , keep_alive_(true) {
}

void HttpResponse::reset() {
    status_code_ = 200;
    reason_phrase_ = "OK";
    headers_.clear();
    body_.clear();
    keep_alive_ = true;
}

HttpResponse& HttpResponse::set_status(int code, const std::string& reason) {
    status_code_ = code;
    reason_phrase_ = reason;
    return *this;
}

HttpResponse& HttpResponse::set_header(const std::string& name, const std::string& value) {
    headers_[name] = value;
    return *this;
}

HttpResponse& HttpResponse::set_body(const std::string& body) {
    body_ = body;
    return *this;
}

HttpResponse& HttpResponse::set_keep_alive(bool keep_alive) {
    keep_alive_ = keep_alive;
    return *this;
}

// ============================================================================
// Zero-allocation serialization — writes directly into caller's buffer
// ============================================================================

size_t HttpResponse::serialize_to(char* buf, size_t capacity) const {
    size_t off = 0;
    
    // Status line: "HTTP/1.1 200 OK\r\n"
    int n = snprintf(buf, capacity, "%s %d %s\r\n",
                     version_.c_str(), status_code_, reason_phrase_.c_str());
    if (n < 0 || static_cast<size_t>(n) >= capacity) return 0;
    off = static_cast<size_t>(n);
    
    // User-set headers: "Name: Value\r\n"
    for (const auto& [name, value] : headers_) {
        size_t needed = name.size() + 2 + value.size() + 2;
        if (off + needed > capacity) return 0;
        memcpy(buf + off, name.c_str(), name.size()); off += name.size();
        buf[off++] = ':'; buf[off++] = ' ';
        memcpy(buf + off, value.c_str(), value.size()); off += value.size();
        buf[off++] = '\r'; buf[off++] = '\n';
    }
    
    // Content-Length (auto-add if not set and body exists)
    if (headers_.find("Content-Length") == headers_.end() && !body_.empty()) {
        int cl = snprintf(buf + off, capacity - off, "Content-Length: %zu\r\n", body_.size());
        if (cl < 0 || off + static_cast<size_t>(cl) >= capacity) return 0;
        off += static_cast<size_t>(cl);
    }
    
    // Server header (compile-time constant, 19 bytes)
    if (headers_.find("Server") == headers_.end()) {
        if (off + SERVER_HEADER_LEN > capacity) return 0;
        memcpy(buf + off, SERVER_HEADER, SERVER_HEADER_LEN);
        off += SERVER_HEADER_LEN;
    }
    
    // Connection header (compile-time constant)
    if (headers_.find("Connection") == headers_.end()) {
        if (keep_alive_) {
            if (off + CONN_KEEPALIVE_LEN > capacity) return 0;
            memcpy(buf + off, CONN_KEEPALIVE, CONN_KEEPALIVE_LEN);
            off += CONN_KEEPALIVE_LEN;
        } else {
            if (off + CONN_CLOSE_LEN > capacity) return 0;
            memcpy(buf + off, CONN_CLOSE, CONN_CLOSE_LEN);
            off += CONN_CLOSE_LEN;
        }
    }
    
    // Blank line separating headers from body
    if (off + 2 > capacity) return 0;
    buf[off++] = '\r'; buf[off++] = '\n';
    
    // Body
    if (!body_.empty()) {
        if (off + body_.size() > capacity) return 0;
        memcpy(buf + off, body_.c_str(), body_.size());
        off += body_.size();
    }
    
    return off;
}

std::string HttpResponse::serialize() const {
    // Use serialize_to with a stack buffer — avoids ostringstream
    char buf[8192];
    size_t len = serialize_to(buf, sizeof(buf));
    if (len > 0) {
        return std::string(buf, len);
    }
    
    // Response too large for stack buffer — fall back to heap
    std::vector<char> large_buf(65536);
    len = serialize_to(large_buf.data(), large_buf.size());
    return std::string(large_buf.data(), len);
}

bool HttpResponse::has_header(const std::string& name) const {
    return headers_.find(name) != headers_.end();
}

std::string HttpResponse::get_header(const std::string& name) const {
    auto it = headers_.find(name);
    if (it != headers_.end()) {
        return it->second;
    }
    return "";
}

void HttpResponse::print() const {
    std::cout << "=== HTTP Response ===" << std::endl;
    std::cout << "Status: " << status_code_ << " " << reason_phrase_ << std::endl;
    std::cout << "Headers:" << std::endl;
    for (const auto& [name, value] : headers_) {
        std::cout << "  " << name << ": " << value << std::endl;
    }
    std::cout << "Body Length: " << body_.length() << std::endl;
    if (!body_.empty() && body_.length() < 200) {
        std::cout << "Body: " << body_ << std::endl;
    }
    std::cout << "=====================" << std::endl;
}

} // namespace flash
