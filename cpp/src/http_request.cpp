/**
 * @file http_request.cpp
 * @brief Implementation of HttpRequest helper methods
 */

#include "http_request.h"
#include <iostream>
#include <algorithm>
#include <cctype>

namespace flash {

// Helper function to convert string to lowercase
static std::string to_lower(const std::string& str) {
    std::string lower = str;
    std::transform(lower.begin(), lower.end(), lower.begin(),
                   [](unsigned char c) { return std::tolower(c); });
    return lower;
}

std::optional<std::string> HttpRequest::get_header(const std::string& name) const {
    std::string lower_name = to_lower(name);
    
    for (const auto& [key, value] : headers) {
        if (to_lower(key) == lower_name) {
            return value;
        }
    }
    
    return std::nullopt;
}

bool HttpRequest::has_header(const std::string& name) const {
    return get_header(name).has_value();
}

void HttpRequest::print() const {
    std::cout << "=== HTTP Request ===" << std::endl;
    std::cout << "Method: " << method << std::endl;
    std::cout << "Path: " << path << std::endl;
    std::cout << "Version: " << version << std::endl;
    std::cout << "Headers:" << std::endl;
    
    for (const auto& [key, value] : headers) {
        std::cout << "  " << key << ": " << value << std::endl;
    }
    
    if (!body.empty()) {
        std::cout << "Body (" << body.length() << " bytes):" << std::endl;
        std::cout << body << std::endl;
    }
    
    std::cout << "===================" << std::endl;
}

} // namespace flash
