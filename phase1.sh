#!/bin/bash

# Phase 1 Build & Test Script
# Quick helper for building and testing C++ code

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Main script
print_header "Flash Framework - Phase 1 Build Script"

# Check if build directory exists
if [ ! -d "build" ]; then
    print_info "Creating build directory..."
    mkdir -p build
fi

cd build

# Parse command line arguments
COMMAND=${1:-build}

case $COMMAND in
    build)
        print_header "Building C++ Code"
        cmake ../cpp -DCMAKE_BUILD_TYPE=Debug
        make -j$(sysctl -n hw.ncpu)
        print_success "Build complete!"
        
        print_info "Executables created:"
        echo "  - ./build/flash_server (standalone server)"
        echo "  - ./build/flash_tests (unit tests)"
        ;;
        
    test)
        print_header "Running Unit Tests"
        
        if [ ! -f "flash_tests" ]; then
            print_error "Tests not built. Run './phase1.sh build' first"
            exit 1
        fi
        
        ./flash_tests
        print_success "Tests complete!"
        ;;
        
    test-verbose)
        print_header "Running Unit Tests (Verbose)"
        
        if [ ! -f "flash_tests" ]; then
            print_error "Tests not built. Run './phase1.sh build' first"
            exit 1
        fi
        
        ./flash_tests --gtest_verbose=1
        ;;
        
    leaks)
        print_header "Running Tests with Leak Detection"
        
        if [ ! -f "flash_tests" ]; then
            print_error "Tests not built. Run './phase1.sh build' first"
            exit 1
        fi
        
        print_info "Running leak detection (this may take a moment)..."
        leaks --atExit -- ./flash_tests
        ;;
        
    run)
        print_header "Starting Flash Server"
        
        if [ ! -f "flash_server" ]; then
            print_error "Server not built. Run './phase1.sh build' first"
            exit 1
        fi
        
        PORT=${2:-3000}
        print_info "Starting server on port $PORT..."
        print_info "Press Ctrl+C to stop"
        print_info ""
        print_info "Test with:"
        echo "  curl http://localhost:$PORT/"
        echo "  telnet localhost $PORT"
        print_info ""
        
        ./flash_server $PORT
        ;;
        
    clean)
        print_header "Cleaning Build Directory"
        cd ..
        rm -rf build
        print_success "Build directory cleaned"
        ;;
        
    rebuild)
        print_header "Clean Rebuild"
        cd ..
        rm -rf build
        print_info "Cleaned old build"
        ./phase1.sh build
        ;;
        
    help|*)
        print_header "Usage"
        echo ""
        echo "Commands:"
        echo "  build          - Build C++ code (default)"
        echo "  test           - Run unit tests"
        echo "  test-verbose   - Run tests with verbose output"
        echo "  leaks          - Run tests with memory leak detection"
        echo "  run [port]     - Start server (default port: 3000)"
        echo "  clean          - Remove build directory"
        echo "  rebuild        - Clean and rebuild"
        echo "  help           - Show this help"
        echo ""
        echo "Examples:"
        echo "  ./phase1.sh build          # Build everything"
        echo "  ./phase1.sh test           # Run tests"
        echo "  ./phase1.sh run 3000       # Start server on port 3000"
        echo "  ./phase1.sh leaks          # Check for memory leaks"
        echo ""
        ;;
esac

echo ""
print_success "Done!"
