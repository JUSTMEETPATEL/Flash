cmake_minimum_required(VERSION 3.20)
project(FlashFramework VERSION 0.1.0 LANGUAGES CXX)

# C++20 standard
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Set build type
if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Release)
endif()

# Compiler flags
if(CMAKE_CXX_COMPILER_ID MATCHES "Clang|GNU")
    add_compile_options(-Wall -Wextra -Wpedantic)
    
    if(CMAKE_BUILD_TYPE STREQUAL "Debug")
        add_compile_options(-g -O0)
    elseif(CMAKE_BUILD_TYPE STREQUAL "Release")
        add_compile_options(-O3)
        add_definitions(-DNDEBUG)
    endif()
endif()

# Source files
file(GLOB_RECURSE SOURCES "cpp/src/*.cpp")
file(GLOB_RECURSE HEADERS "cpp/include/*.h")

# Library target
add_library(flash_core STATIC ${SOURCES} ${HEADERS})
target_include_directories(flash_core PUBLIC cpp/include)

# Google Test
include(FetchContent)
FetchContent_Declare(
    googletest
    GIT_REPOSITORY https://github.com/google/googletest.git
    GIT_TAG release-1.12.1
)
FetchContent_MakeAvailable(googletest)

# Test target
file(GLOB_RECURSE TEST_SOURCES "cpp/tests/*.cpp")
# Exclude manual tests (they have their own main())
list(FILTER TEST_SOURCES EXCLUDE REGEX "manual/")
add_executable(flash_tests ${TEST_SOURCES})
target_link_libraries(flash_tests flash_core gtest_main)

enable_testing()
add_test(NAME flash_tests COMMAND flash_tests)