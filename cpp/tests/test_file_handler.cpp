/**
 * @file test_file_handler.cpp
 * @brief Unit tests for FileHandler
 * @author Flash Framework Team
 * @date 2025-10-14
 */

#include <gtest/gtest.h>
#include "file_handler.h"

#include <fstream>
#include <filesystem>
#include <cstdio>

namespace fs = std::filesystem;

namespace flash {
namespace test {

class FileHandlerTest : public ::testing::Test {
protected:
    void SetUp() override {
        // Create temporary test directory
        test_dir_ = fs::temp_directory_path() / "flash_test_files";
        fs::create_directories(test_dir_);
        
        // Create test files
        create_test_file("index.html", "<html><body>Hello World</body></html>");
        create_test_file("style.css", "body { color: red; }");
        create_test_file("script.js", "console.log('test');");
        create_test_file("data.json", "{\"key\": \"value\"}");
        create_test_file("image.png", "\x89PNG\r\n\x1a\n");  // PNG magic bytes
        create_test_file("large.txt", std::string(2 * 1024 * 1024, 'x'));  // 2MB file
        
        // Create subdirectory
        fs::create_directories(test_dir_ / "subdir");
        create_test_file("subdir/nested.txt", "nested file");
        
        // Create file handler
        handler_ = std::make_unique<FileHandler>(test_dir_.string());
    }
    
    void TearDown() override {
        // Clean up test directory
        fs::remove_all(test_dir_);
    }
    
    void create_test_file(const std::string& path, const std::string& content) {
        fs::path file_path = test_dir_ / path;
        std::ofstream file(file_path, std::ios::binary);
        file << content;
    }
    
    fs::path test_dir_;
    std::unique_ptr<FileHandler> handler_;
};

// ============================================================================
// Basic Functionality Tests
// ============================================================================

TEST_F(FileHandlerTest, ConstructorWithValidDirectory) {
    EXPECT_NO_THROW(FileHandler handler(test_dir_.string()));
}

TEST_F(FileHandlerTest, ConstructorWithInvalidDirectory) {
    EXPECT_THROW(FileHandler handler("/nonexistent/directory"), std::runtime_error);
}

TEST_F(FileHandlerTest, ServeExistingFile) {
    auto response = handler_->serve("/index.html");
    
    ASSERT_TRUE(response.has_value());
    EXPECT_EQ(response->content, "<html><body>Hello World</body></html>");
    EXPECT_EQ(response->mime_type, "text/html; charset=utf-8");
    EXPECT_EQ(response->size, response->content.size());  // Use actual content size
    EXPECT_FALSE(response->etag.empty());
    EXPECT_GT(response->last_modified, 0);
}

TEST_F(FileHandlerTest, ServeNonExistentFile) {
    auto response = handler_->serve("/nonexistent.txt");
    
    EXPECT_FALSE(response.has_value());
}

TEST_F(FileHandlerTest, ServeWithoutLeadingSlash) {
    auto response = handler_->serve("index.html");
    
    ASSERT_TRUE(response.has_value());
    EXPECT_EQ(response->content, "<html><body>Hello World</body></html>");
}

// ============================================================================
// MIME Type Tests
// ============================================================================

TEST_F(FileHandlerTest, MimeTypeHTML) {
    EXPECT_EQ(handler_->get_mime_type("/index.html"), "text/html; charset=utf-8");
    EXPECT_EQ(handler_->get_mime_type("/test.htm"), "text/html; charset=utf-8");
}

TEST_F(FileHandlerTest, MimeTypeCSS) {
    EXPECT_EQ(handler_->get_mime_type("/style.css"), "text/css; charset=utf-8");
}

TEST_F(FileHandlerTest, MimeTypeJavaScript) {
    EXPECT_EQ(handler_->get_mime_type("/script.js"), "application/javascript; charset=utf-8");
    EXPECT_EQ(handler_->get_mime_type("/module.mjs"), "application/javascript; charset=utf-8");
}

TEST_F(FileHandlerTest, MimeTypeJSON) {
    EXPECT_EQ(handler_->get_mime_type("/data.json"), "application/json; charset=utf-8");
}

TEST_F(FileHandlerTest, MimeTypeImages) {
    EXPECT_EQ(handler_->get_mime_type("/image.png"), "image/png");
    EXPECT_EQ(handler_->get_mime_type("/photo.jpg"), "image/jpeg");
    EXPECT_EQ(handler_->get_mime_type("/photo.jpeg"), "image/jpeg");
    EXPECT_EQ(handler_->get_mime_type("/icon.gif"), "image/gif");
    EXPECT_EQ(handler_->get_mime_type("/logo.svg"), "image/svg+xml");
}

TEST_F(FileHandlerTest, MimeTypeFonts) {
    EXPECT_EQ(handler_->get_mime_type("/font.woff"), "font/woff");
    EXPECT_EQ(handler_->get_mime_type("/font.woff2"), "font/woff2");
    EXPECT_EQ(handler_->get_mime_type("/font.ttf"), "font/ttf");
}

TEST_F(FileHandlerTest, MimeTypeUnknown) {
    EXPECT_EQ(handler_->get_mime_type("/file.xyz"), "application/octet-stream");
    EXPECT_EQ(handler_->get_mime_type("/noext"), "application/octet-stream");
}

TEST_F(FileHandlerTest, MimeTypeCaseInsensitive) {
    EXPECT_EQ(handler_->get_mime_type("/FILE.HTML"), "text/html; charset=utf-8");
    EXPECT_EQ(handler_->get_mime_type("/IMAGE.PNG"), "image/png");
}

// ============================================================================
// Security Tests (Directory Traversal)
// ============================================================================

TEST_F(FileHandlerTest, BlockDirectoryTraversalRelative) {
    auto response = handler_->serve("/../../../etc/passwd");
    
    EXPECT_FALSE(response.has_value());
}

TEST_F(FileHandlerTest, BlockDirectoryTraversalAbsolute) {
    auto response = handler_->serve("/subdir/../../../../../../etc/passwd");
    
    EXPECT_FALSE(response.has_value());
}

TEST_F(FileHandlerTest, BlockDirectoryTraversalEncoded) {
    auto response = handler_->serve("/%2e%2e/%2e%2e/etc/passwd");
    
    EXPECT_FALSE(response.has_value());
}

TEST_F(FileHandlerTest, AllowLegitimateSubdirectory) {
    auto response = handler_->serve("/subdir/nested.txt");
    
    ASSERT_TRUE(response.has_value());
    EXPECT_EQ(response->content, "nested file");
}

// ============================================================================
// File Size Tests
// ============================================================================

TEST_F(FileHandlerTest, GetFileSize) {
    size_t expected_html_size = strlen("<html><body>Hello World</body></html>");
    size_t expected_css_size = strlen("body { color: red; }");
    
    EXPECT_EQ(handler_->get_file_size("/index.html"), expected_html_size);
    EXPECT_EQ(handler_->get_file_size("/style.css"), expected_css_size);
}

TEST_F(FileHandlerTest, GetFileSizeNonExistent) {
    EXPECT_EQ(handler_->get_file_size("/nonexistent.txt"), 0);
}

TEST_F(FileHandlerTest, GetFileSizeLargeFile) {
    EXPECT_EQ(handler_->get_file_size("/large.txt"), 2 * 1024 * 1024);
}

// ============================================================================
// File Existence Tests
// ============================================================================

TEST_F(FileHandlerTest, ExistsReturnsTrueForExisting) {
    EXPECT_TRUE(handler_->exists("/index.html"));
    EXPECT_TRUE(handler_->exists("/subdir/nested.txt"));
}

TEST_F(FileHandlerTest, ExistsReturnsFalseForNonExisting) {
    EXPECT_FALSE(handler_->exists("/nonexistent.txt"));
    EXPECT_FALSE(handler_->exists("/subdir/missing.txt"));
}

TEST_F(FileHandlerTest, ExistsReturnsFalseForDirectory) {
    EXPECT_FALSE(handler_->exists("/subdir"));
}

// ============================================================================
// Large File Tests (mmap)
// ============================================================================

TEST_F(FileHandlerTest, ServeLargeFile) {
    auto response = handler_->serve("/large.txt");
    
    ASSERT_TRUE(response.has_value());
    EXPECT_EQ(response->size, 2 * 1024 * 1024);
    EXPECT_EQ(response->content.length(), 2 * 1024 * 1024);
    EXPECT_EQ(response->content[0], 'x');
    EXPECT_EQ(response->content[response->content.length() - 1], 'x');
}

// ============================================================================
// ETag Tests
// ============================================================================

TEST_F(FileHandlerTest, GeneratesETag) {
    auto response = handler_->serve("/index.html");
    
    ASSERT_TRUE(response.has_value());
    EXPECT_FALSE(response->etag.empty());
    EXPECT_EQ(response->etag.front(), '"');
    EXPECT_EQ(response->etag.back(), '"');
}

TEST_F(FileHandlerTest, SameFileGeneratesSameETag) {
    auto response1 = handler_->serve("/index.html");
    auto response2 = handler_->serve("/index.html");
    
    ASSERT_TRUE(response1.has_value());
    ASSERT_TRUE(response2.has_value());
    EXPECT_EQ(response1->etag, response2->etag);
}

TEST_F(FileHandlerTest, DifferentFilesGenerateDifferentETags) {
    auto response1 = handler_->serve("/index.html");
    auto response2 = handler_->serve("/style.css");
    
    ASSERT_TRUE(response1.has_value());
    ASSERT_TRUE(response2.has_value());
    EXPECT_NE(response1->etag, response2->etag);
}

// ============================================================================
// Binary File Tests
// ============================================================================

TEST_F(FileHandlerTest, ServeBinaryFile) {
    auto response = handler_->serve("/image.png");
    
    ASSERT_TRUE(response.has_value());
    EXPECT_EQ(response->mime_type, "image/png");
    EXPECT_EQ(response->content.substr(0, 4), "\x89PNG");
}

// ============================================================================
// Path Normalization Tests
// ============================================================================

TEST_F(FileHandlerTest, NormalizePathWithDots) {
    auto response1 = handler_->serve("/./index.html");
    auto response2 = handler_->serve("/subdir/../index.html");
    
    // Single dot should work
    ASSERT_TRUE(response1.has_value());
    EXPECT_EQ(response1->content, "<html><body>Hello World</body></html>");
    
    // Path with .. that resolves within root should work
    // /subdir/../index.html => /index.html (valid)
    ASSERT_TRUE(response2.has_value());
    EXPECT_EQ(response2->content, "<html><body>Hello World</body></html>");
}

TEST_F(FileHandlerTest, NormalizePathWithDoubleSlash) {
    auto response = handler_->serve("//index.html");
    
    ASSERT_TRUE(response.has_value());
    EXPECT_EQ(response->content, "<html><body>Hello World</body></html>");
}

// ============================================================================
// Edge Cases
// ============================================================================

TEST_F(FileHandlerTest, EmptyPath) {
    auto response = handler_->serve("");
    
    EXPECT_FALSE(response.has_value());
}

TEST_F(FileHandlerTest, RootPath) {
    auto response = handler_->serve("/");
    
    EXPECT_FALSE(response.has_value());  // No index.html in root
}

TEST_F(FileHandlerTest, PathWithSpaces) {
    create_test_file("file with spaces.txt", "content");
    
    auto response = handler_->serve("/file with spaces.txt");
    
    ASSERT_TRUE(response.has_value());
    EXPECT_EQ(response->content, "content");
}

TEST_F(FileHandlerTest, PathWithSpecialCharacters) {
    create_test_file("file-name_123.txt", "special");
    
    auto response = handler_->serve("/file-name_123.txt");
    
    ASSERT_TRUE(response.has_value());
    EXPECT_EQ(response->content, "special");
}

// ============================================================================
// Performance Tests
// ============================================================================

TEST_F(FileHandlerTest, ServeMultipleFilesQuickly) {
    auto start = std::chrono::high_resolution_clock::now();
    
    for (int i = 0; i < 100; ++i) {
        auto response = handler_->serve("/index.html");
        ASSERT_TRUE(response.has_value());
    }
    
    auto end = std::chrono::high_resolution_clock::now();
    auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    
    // Should serve 100 small files in less than 100ms (1ms per file)
    EXPECT_LT(duration.count(), 100);
}

} // namespace test
} // namespace flash
