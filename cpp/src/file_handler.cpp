/**
 * @file file_handler.cpp
 * @brief Implementation of static file handler
 * @author Flash Framework Team
 * @date 2025-10-14
 */

#include "file_handler.h"

#include <iostream>
#include <fstream>
#include <sstream>
#include <algorithm>
#include <stdexcept>
#include <sys/stat.h>
#include <sys/mman.h>
#include <fcntl.h>
#include <unistd.h>
#include <cstring>
#include <iomanip>

namespace flash {

// Threshold for using mmap vs regular read (1MB)
constexpr size_t MMAP_THRESHOLD = 1024 * 1024;

// ============================================================================
// Constructor
// ============================================================================

FileHandler::FileHandler(const std::string& root_dir)
    : root_dir_(normalize_path(root_dir))
{
    // Validate root directory exists
    struct stat st;
    if (stat(root_dir_.c_str(), &st) != 0 || !S_ISDIR(st.st_mode)) {
        throw std::runtime_error("Root directory does not exist or is not accessible: " + root_dir_);
    }
    
    // Initialize MIME type mappings
    init_mime_types();
}

// ============================================================================
// Public Methods
// ============================================================================

std::optional<FileResponse> FileHandler::serve(const std::string& path) {
    // Get absolute path and check safety
    std::string abs_path = get_absolute_path(path);
    if (abs_path.empty()) {
        std::cerr << "[FileHandler] Unsafe path rejected: " << path << std::endl;
        return std::nullopt;
    }
    
    // Check if file exists
    struct stat st;
    if (stat(abs_path.c_str(), &st) != 0) {
        std::cerr << "[FileHandler] File not found: " << abs_path << std::endl;
        return std::nullopt;
    }
    
    // Check if it's a regular file
    if (!S_ISREG(st.st_mode)) {
        std::cerr << "[FileHandler] Not a regular file: " << abs_path << std::endl;
        return std::nullopt;
    }
    
    // Read file content
    std::string content = read_file(abs_path);
    if (content.empty() && st.st_size > 0) {
        std::cerr << "[FileHandler] Failed to read file: " << abs_path << std::endl;
        return std::nullopt;
    }
    
    // Create response
    FileResponse response;
    response.content = std::move(content);
    response.mime_type = get_mime_type(path);
    response.size = st.st_size;
    response.last_modified = st.st_mtime;
    response.etag = generate_etag(response.content, response.last_modified);
    
    return response;
}

bool FileHandler::exists(const std::string& path) const {
    std::string abs_path = get_absolute_path(path);
    if (abs_path.empty()) {
        return false;
    }
    
    struct stat st;
    return (stat(abs_path.c_str(), &st) == 0) && S_ISREG(st.st_mode);
}

std::string FileHandler::get_mime_type(const std::string& path) const {
    std::string ext = get_extension(path);
    
    auto it = mime_types_.find(ext);
    if (it != mime_types_.end()) {
        return it->second;
    }
    
    // Default to binary
    return "application/octet-stream";
}

size_t FileHandler::get_file_size(const std::string& path) const {
    std::string abs_path = get_absolute_path(path);
    if (abs_path.empty()) {
        return 0;
    }
    
    struct stat st;
    if (stat(abs_path.c_str(), &st) != 0) {
        return 0;
    }
    
    return st.st_size;
}

std::string FileHandler::get_absolute_path(const std::string& path) const {
    // Normalize the requested path
    std::string normalized = normalize_path(path);
    
    // Build absolute path
    std::string abs_path = root_dir_;
    if (!normalized.empty() && normalized[0] != '/') {
        abs_path += "/";
    }
    abs_path += normalized;
    
    // Final normalization
    abs_path = normalize_path(abs_path);
    
    // Security check: ensure path is within root directory
    if (abs_path.find(root_dir_) != 0) {
        return "";  // Path escapes root directory
    }
    
    return abs_path;
}

// ============================================================================
// Private Methods
// ============================================================================

void FileHandler::init_mime_types() {
    // Text types
    mime_types_["html"] = "text/html; charset=utf-8";
    mime_types_["htm"] = "text/html; charset=utf-8";
    mime_types_["css"] = "text/css; charset=utf-8";
    mime_types_["js"] = "application/javascript; charset=utf-8";
    mime_types_["mjs"] = "application/javascript; charset=utf-8";
    mime_types_["json"] = "application/json; charset=utf-8";
    mime_types_["xml"] = "application/xml; charset=utf-8";
    mime_types_["txt"] = "text/plain; charset=utf-8";
    mime_types_["md"] = "text/markdown; charset=utf-8";
    
    // Images
    mime_types_["png"] = "image/png";
    mime_types_["jpg"] = "image/jpeg";
    mime_types_["jpeg"] = "image/jpeg";
    mime_types_["gif"] = "image/gif";
    mime_types_["svg"] = "image/svg+xml";
    mime_types_["ico"] = "image/x-icon";
    mime_types_["webp"] = "image/webp";
    
    // Fonts
    mime_types_["woff"] = "font/woff";
    mime_types_["woff2"] = "font/woff2";
    mime_types_["ttf"] = "font/ttf";
    mime_types_["otf"] = "font/otf";
    mime_types_["eot"] = "application/vnd.ms-fontobject";
    
    // Documents
    mime_types_["pdf"] = "application/pdf";
    mime_types_["zip"] = "application/zip";
    mime_types_["tar"] = "application/x-tar";
    mime_types_["gz"] = "application/gzip";
    
    // Audio/Video
    mime_types_["mp3"] = "audio/mpeg";
    mime_types_["ogg"] = "audio/ogg";
    mime_types_["wav"] = "audio/wav";
    mime_types_["mp4"] = "video/mp4";
    mime_types_["webm"] = "video/webm";
    
    // Web assembly
    mime_types_["wasm"] = "application/wasm";
}

bool FileHandler::is_safe_path(const std::string& path) const {
    // Check for null bytes
    if (path.find('\0') != std::string::npos) {
        return false;
    }
    
    // Check for suspicious patterns
    if (path.find("..") != std::string::npos) {
        return false;  // Directory traversal attempt
    }
    
    return true;
}

std::string FileHandler::normalize_path(const std::string& path) const {
    if (path.empty()) {
        return path;
    }
    
    // Split path into components
    std::vector<std::string> components;
    std::stringstream ss(path);
    std::string component;
    
    while (std::getline(ss, component, '/')) {
        if (component.empty() || component == ".") {
            // Skip empty and current directory
            continue;
        } else if (component == "..") {
            // Go up one level
            if (!components.empty()) {
                components.pop_back();
            }
        } else {
            components.push_back(component);
        }
    }
    
    // Rebuild path
    std::string result;
    if (!path.empty() && path[0] == '/') {
        result = "/";
    }
    
    for (size_t i = 0; i < components.size(); ++i) {
        if (i > 0) {
            result += "/";
        }
        result += components[i];
    }
    
    return result;
}

std::string FileHandler::read_file(const std::string& filepath) {
    // Get file size
    struct stat st;
    if (stat(filepath.c_str(), &st) != 0) {
        return "";
    }
    
    size_t file_size = st.st_size;
    
    // Use mmap for large files
    if (file_size >= MMAP_THRESHOLD) {
        int fd = open(filepath.c_str(), O_RDONLY);
        if (fd < 0) {
            return "";
        }
        
        void* mapped = mmap(nullptr, file_size, PROT_READ, MAP_PRIVATE, fd, 0);
        close(fd);
        
        if (mapped == MAP_FAILED) {
            return "";
        }
        
        std::string content(static_cast<const char*>(mapped), file_size);
        munmap(mapped, file_size);
        
        return content;
    }
    
    // Use regular read for small files
    std::ifstream file(filepath, std::ios::binary);
    if (!file) {
        return "";
    }
    
    std::string content;
    content.reserve(file_size);
    
    content.assign(
        std::istreambuf_iterator<char>(file),
        std::istreambuf_iterator<char>()
    );
    
    return content;
}

std::string FileHandler::generate_etag(const std::string& content, long last_modified) const {
    // Simple ETag: hash of size + mtime
    size_t hash = content.size();
    hash ^= static_cast<size_t>(last_modified) + 0x9e3779b9 + (hash << 6) + (hash >> 2);
    
    std::stringstream ss;
    ss << "\"" << std::hex << hash << "\"";
    return ss.str();
}

std::string FileHandler::get_extension(const std::string& path) const {
    size_t pos = path.find_last_of('.');
    if (pos == std::string::npos || pos == path.length() - 1) {
        return "";
    }
    
    std::string ext = path.substr(pos + 1);
    
    // Convert to lowercase
    std::transform(ext.begin(), ext.end(), ext.begin(),
                   [](unsigned char c) { return std::tolower(c); });
    
    return ext;
}

long FileHandler::get_last_modified(const std::string& filepath) const {
    struct stat st;
    if (stat(filepath.c_str(), &st) != 0) {
        return 0;
    }
    
    return st.st_mtime;
}

} // namespace flash
