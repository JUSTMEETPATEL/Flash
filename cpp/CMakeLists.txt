cmake_minimum_required(VERSION 3.20)
project(FlashFramework VERSION 0.1.0 LANGUAGES CXX)

# ============================================================================
# Compiler Configuration
# ============================================================================

# C++20 standard - required for modern features
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Export compile commands for IDE support
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# ============================================================================
# Compiler Flags
# ============================================================================

if(CMAKE_CXX_COMPILER_ID MATCHES "Clang|GNU")
    # Common flags for Clang and GCC
    add_compile_options(
        -Wall          # Enable all warnings
        -Wextra        # Enable extra warnings
        -Wpedantic     # Warn about non-standard C++
        -Werror        # Treat warnings as errors
    )
    
    # Debug configuration
    set(CMAKE_CXX_FLAGS_DEBUG "-g -O0")
    if(ENABLE_SANITIZERS)
        set(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} -fsanitize=address,undefined")
        set(CMAKE_EXE_LINKER_FLAGS_DEBUG "${CMAKE_EXE_LINKER_FLAGS_DEBUG} -fsanitize=address,undefined")
    endif()
    
    # Release configuration
    set(CMAKE_CXX_FLAGS_RELEASE "-O3 -DNDEBUG")
endif()

# ============================================================================
# Source Files
# ============================================================================

# Server core source files
set(FLASH_CORE_SOURCES
    src/server.cpp
    src/http_parser.cpp
    src/http_request.cpp
    # TODO: Add more source files as you create them
    # src/http_response.cpp
    # src/connection.cpp
)

# Server core header files (for IDE support)
set(FLASH_CORE_HEADERS
    include/server.h
    include/http_parser.h
    include/http_request.h
    # TODO: Add more header files as you create them
    # include/http_response.h
    # include/connection.h
)

# ============================================================================
# Library Target - Flash Core
# ============================================================================

add_library(flash_core STATIC ${FLASH_CORE_SOURCES} ${FLASH_CORE_HEADERS})

target_include_directories(flash_core PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}/include
)

# ============================================================================
# Executable Target - Standalone Server
# ============================================================================

add_executable(flash_server src/main.cpp)

target_link_libraries(flash_server PRIVATE flash_core)

# ============================================================================
# Testing with Google Test
# ============================================================================

# Fetch Google Test
include(FetchContent)
FetchContent_Declare(
    googletest
    GIT_REPOSITORY https://github.com/google/googletest.git
    GIT_TAG        release-1.12.1
)

# For Windows: Prevent overriding the parent project's compiler/linker settings
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)

FetchContent_MakeAvailable(googletest)

# Enable testing
enable_testing()

# Test source files
set(FLASH_TEST_SOURCES
    tests/test_server.cpp
    tests/test_http_parser.cpp
    # TODO: Add more test files as you create them
    # tests/test_http_response.cpp
)

# Test executable
add_executable(flash_tests ${FLASH_TEST_SOURCES})

target_link_libraries(flash_tests PRIVATE
    flash_core
    gtest_main
)

# Register tests with CTest
include(GoogleTest)
gtest_discover_tests(flash_tests)

# ============================================================================
# Installation (Optional)
# ============================================================================

install(TARGETS flash_core flash_server
    LIBRARY DESTINATION lib
    ARCHIVE DESTINATION lib
    RUNTIME DESTINATION bin
)

install(DIRECTORY cpp/include/
    DESTINATION include/flash
    FILES_MATCHING PATTERN "*.h"
)

# ============================================================================
# Custom Targets
# ============================================================================

# Run tests with verbose output
add_custom_target(test-verbose
    COMMAND ${CMAKE_CTEST_COMMAND} --verbose
    DEPENDS flash_tests
)

# Check for memory leaks (macOS)
if(APPLE)
    add_custom_target(test-leaks
        COMMAND leaks --atExit -- $<TARGET_FILE:flash_tests>
        DEPENDS flash_tests
        COMMENT "Running tests with leak detection..."
    )
endif()

# ============================================================================
# Status Messages
# ============================================================================

message(STATUS "=== Flash Framework Build Configuration ===")
message(STATUS "CMake version: ${CMAKE_VERSION}")
message(STATUS "C++ compiler: ${CMAKE_CXX_COMPILER_ID} ${CMAKE_CXX_COMPILER_VERSION}")
message(STATUS "C++ standard: C++${CMAKE_CXX_STANDARD}")
message(STATUS "Build type: ${CMAKE_BUILD_TYPE}")
message(STATUS "Source directory: ${CMAKE_CURRENT_SOURCE_DIR}")
message(STATUS "Build directory: ${CMAKE_BINARY_DIR}")
message(STATUS "==========================================")
