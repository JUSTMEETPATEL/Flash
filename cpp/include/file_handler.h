/**
 * @file file_handler.h
 * @brief Static file handler for serving files efficiently
 * @author Flash Framework Team
 * @date 2025-10-14
 *
 * This module provides high-performance static file serving with:
 * - Directory traversal protection
 * - MIME type detection
 * - Efficient file reading (mmap for large files)
 * - ETag generation for caching
 * - Range request support
 */

#pragma once

#include <string>
#include <optional>
#include <unordered_map>
#include <vector>

namespace flash {

/**
 * @brief Response structure for file serving
 */
struct FileResponse {
    std::string content;                    // File content
    std::string mime_type;                  // Content-Type
    size_t size;                            // File size in bytes
    std::string etag;                       // ETag for caching
    long last_modified;                     // Last modification time (Unix timestamp)
    
    FileResponse()
        : size(0)
        , last_modified(0)
    {}
};

/**
 * @brief High-performance static file handler
 *
 * Features:
 * - Serves files from a root directory
 * - Prevents directory traversal attacks
 * - Auto-detects MIME types
 * - Efficient I/O (mmap for large files)
 * - Generates ETags for caching
 * - Thread-safe
 *
 * @example
 * ```cpp
 * FileHandler handler("/var/www/public");
 * 
 * auto response = handler.serve("/index.html");
 * if (response) {
 *     std::cout << "Content-Type: " << response->mime_type << std::endl;
 *     std::cout << "Size: " << response->size << " bytes" << std::endl;
 * }
 * ```
 */
class FileHandler {
public:
    /**
     * @brief Construct a file handler with root directory
     * 
     * @param root_dir Root directory for serving files
     * @throws std::runtime_error if root_dir doesn't exist or isn't accessible
     */
    explicit FileHandler(const std::string& root_dir);
    
    /**
     * @brief Destructor
     */
    ~FileHandler() = default;
    
    // Delete copy constructor and assignment (use move semantics)
    FileHandler(const FileHandler&) = delete;
    FileHandler& operator=(const FileHandler&) = delete;
    
    // Allow move semantics
    FileHandler(FileHandler&&) noexcept = default;
    FileHandler& operator=(FileHandler&&) noexcept = default;
    
    /**
     * @brief Serve a file from the root directory
     * 
     * @param path Requested path (e.g., "/index.html")
     * @return FileResponse if file exists and is readable, std::nullopt otherwise
     * 
     * @note This method is thread-safe
     * 
     * @example
     * auto response = handler.serve("/images/logo.png");
     * if (response) {
     *     send_response(response->content, response->mime_type);
     * }
     */
    std::optional<FileResponse> serve(const std::string& path);
    
    /**
     * @brief Check if a file exists and is readable
     * 
     * @param path File path relative to root directory
     * @return true if file exists and is readable, false otherwise
     */
    bool exists(const std::string& path) const;
    
    /**
     * @brief Get MIME type for a file based on extension
     * 
     * @param path File path
     * @return MIME type string (e.g., "text/html", "image/png")
     *         Returns "application/octet-stream" for unknown types
     */
    std::string get_mime_type(const std::string& path) const;
    
    /**
     * @brief Get file size in bytes
     * 
     * @param path File path relative to root directory
     * @return File size, or 0 if file doesn't exist
     */
    size_t get_file_size(const std::string& path) const;
    
    /**
     * @brief Get absolute path for a relative path
     * 
     * @param path Relative path
     * @return Absolute path, or empty string if path is unsafe
     */
    std::string get_absolute_path(const std::string& path) const;

private:
    std::string root_dir_;                                  // Root directory (normalized)
    std::unordered_map<std::string, std::string> mime_types_; // Extension -> MIME type map
    
    /**
     * @brief Initialize MIME type mappings
     */
    void init_mime_types();
    
    /**
     * @brief Check if path is safe (no directory traversal)
     * 
     * Prevents attacks like: ../../etc/passwd
     * 
     * @param path Path to check
     * @return true if path is safe, false otherwise
     */
    bool is_safe_path(const std::string& path) const;
    
    /**
     * @brief Normalize a path (resolve .., ., //)
     * 
     * @param path Path to normalize
     * @return Normalized path
     */
    std::string normalize_path(const std::string& path) const;
    
    /**
     * @brief Read file content efficiently
     * 
     * Uses mmap() for large files (>1MB), regular read() for small files
     * 
     * @param filepath Absolute file path
     * @return File content, or empty string on error
     */
    std::string read_file(const std::string& filepath);
    
    /**
     * @brief Generate ETag for file content
     * 
     * @param content File content
     * @param last_modified Last modification time
     * @return ETag string
     */
    std::string generate_etag(const std::string& content, long last_modified) const;
    
    /**
     * @brief Get file extension from path
     * 
     * @param path File path
     * @return File extension (lowercase, without dot)
     */
    std::string get_extension(const std::string& path) const;
    
    /**
     * @brief Get last modification time of file
     * 
     * @param filepath Absolute file path
     * @return Unix timestamp, or 0 on error
     */
    long get_last_modified(const std::string& filepath) const;
};

} // namespace flash
