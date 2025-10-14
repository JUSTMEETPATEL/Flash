#!/bin/bash

# Memory Leak Detection Script
# Uses Instruments (macOS) or Valgrind (Linux) to detect memory leaks

set -e

echo "🔍 Flash Framework - Memory Leak Detection"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Detect platform
PLATFORM=$(uname)

# Build debug version
echo -e "\n${YELLOW}🔨 Building debug version...${NC}"
rm -rf build-debug
mkdir -p build-debug
cd build-debug
cmake .. -DCMAKE_BUILD_TYPE=Debug
make -j$(sysctl -n hw.ncpu 2>/dev/null || nproc)

if [ "$PLATFORM" = "Darwin" ]; then
    # macOS: Use Instruments
    echo -e "\n${YELLOW}🍎 Running Instruments (Leaks)...${NC}"
    
    if ! command -v instruments &> /dev/null; then
        echo -e "${RED}❌ Instruments not found. Ensure Xcode Command Line Tools are installed.${NC}"
        exit 1
    fi
    
    # Run tests with Instruments
    echo "Running flash_tests with leak detection..."
    instruments -t Leaks -D leaks.trace ./flash_tests
    
    # Parse results
    if instruments -s devices 2>&1 | grep -q "Simulator"; then
        echo -e "\n${GREEN}✅ Leak detection complete${NC}"
        echo "📁 Results: build-debug/leaks.trace"
        echo "View with: open build-debug/leaks.trace"
        
        # Check for leaks in the trace
        if grep -q "Leak:" leaks.trace 2>/dev/null; then
            echo -e "${RED}❌ Memory leaks detected!${NC}"
            exit 1
        else
            echo -e "${GREEN}✅ No memory leaks detected${NC}"
        fi
    fi
    
elif [ "$PLATFORM" = "Linux" ]; then
    # Linux: Use Valgrind
    echo -e "\n${YELLOW}🐧 Running Valgrind...${NC}"
    
    if ! command -v valgrind &> /dev/null; then
        echo -e "${RED}❌ Valgrind not found. Install with: sudo apt-get install valgrind${NC}"
        exit 1
    fi
    
    # Run tests with Valgrind
    echo "Running flash_tests with Valgrind..."
    valgrind \
        --leak-check=full \
        --show-leak-kinds=all \
        --track-origins=yes \
        --verbose \
        --log-file=valgrind-output.txt \
        ./flash_tests
    
    echo -e "\n${GREEN}✅ Valgrind analysis complete${NC}"
    echo "📁 Results: build-debug/valgrind-output.txt"
    
    # Check for leaks
    if grep -q "definitely lost: 0 bytes in 0 blocks" valgrind-output.txt && \
       grep -q "indirectly lost: 0 bytes in 0 blocks" valgrind-output.txt; then
        echo -e "${GREEN}✅ No memory leaks detected${NC}"
        exit 0
    else
        echo -e "${RED}❌ Memory leaks detected!${NC}"
        echo "Check valgrind-output.txt for details"
        exit 1
    fi
else
    echo -e "${RED}❌ Unsupported platform: $PLATFORM${NC}"
    exit 1
fi

echo -e "\n${GREEN}✅ Memory leak detection complete${NC}"
