/**
 * @file http_response.cpp
 * @brief Implementation of HTTP response builder
 */

#include "http_response.h"
#include <iostream>
#include <sstream>

namespace flash {

HttpResponse::HttpResponse() 
    : status_code_(200)
    , reason_phrase_("OK")
    , version_("HTTP/1.1") {
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

std::string HttpResponse::serialize() const {
    std::ostringstream oss;
    
    // Status line: HTTP/1.1 200 OK
    oss << version_ << " " << status_code_ << " " << reason_phrase_ << "\r\n";
    
    // Headers
    for (const auto& [name, value] : headers_) {
        oss << name << ": " << value << "\r\n";
    }
    
    // Add Content-Length if not already set and we have a body
    if (headers_.find("Content-Length") == headers_.end() && !body_.empty()) {
        oss << "Content-Length: " << body_.length() << "\r\n";
    }
    
    // Add Server header if not set
    if (headers_.find("Server") == headers_.end()) {
        oss << "Server: Flash/0.1\r\n";
    }
    
    // Add Connection header if not set
    if (headers_.find("Connection") == headers_.end()) {
        oss << "Connection: close\r\n";
    }
    
    // Blank line to separate headers from body
    oss << "\r\n";
    
    // Body
    if (!body_.empty()) {
        oss << body_;
    }
    
    return oss.str();
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
