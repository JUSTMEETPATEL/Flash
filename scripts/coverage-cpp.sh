#!/bin/bash

# C++ Test Coverage Script
# Uses lcov/gcov to generate coverage reports

set -e

echo "🔍 Flash Framework - C++ Coverage Analysis"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if lcov is installed
if ! command -v lcov &> /dev/null; then
    echo -e "${RED}❌ lcov is not installed${NC}"
    echo "Install with:"
    echo "  macOS: brew install lcov"
    echo "  Linux: sudo apt-get install lcov"
    exit 1
fi

# Create coverage build directory
echo -e "\n${YELLOW}📁 Creating coverage build directory...${NC}"
rm -rf build-coverage
mkdir -p build-coverage
cd build-coverage

# Configure with coverage flags
echo -e "\n${YELLOW}⚙️  Configuring CMake with coverage...${NC}"
cmake .. -DCMAKE_BUILD_TYPE=Coverage

# Build
echo -e "\n${YELLOW}🔨 Building with coverage instrumentation...${NC}"
make -j$(sysctl -n hw.ncpu 2>/dev/null || nproc)

# Run tests
echo -e "\n${YELLOW}🧪 Running tests...${NC}"
./flash_tests

# Generate coverage data
echo -e "\n${YELLOW}📊 Generating coverage data...${NC}"

# Initialize coverage data
lcov --capture --initial --directory . --output-file coverage_base.info

# Capture coverage data after test execution
lcov --capture --directory . --output-file coverage_test.info

# Combine baseline and test coverage
lcov --add-tracefile coverage_base.info --add-tracefile coverage_test.info --output-file coverage_total.info

# Filter out system headers and test files
lcov --remove coverage_total.info '/usr/*' '/Library/*' '*/googletest/*' '*/tests/*' --output-file coverage_filtered.info

# Generate HTML report
echo -e "\n${YELLOW}📄 Generating HTML report...${NC}"
genhtml coverage_filtered.info --output-directory coverage-html

# Generate summary
echo -e "\n${GREEN}✅ Coverage Report Generated${NC}"
echo "=========================================="

# Extract coverage percentage
COVERAGE=$(lcov --summary coverage_filtered.info 2>&1 | grep "lines" | awk '{print $2}')

echo -e "📊 Coverage: ${GREEN}${COVERAGE}${NC}"
echo "📁 HTML Report: build-coverage/coverage-html/index.html"

# Open report in browser (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "\n${YELLOW}🌐 Opening report in browser...${NC}"
    open coverage-html/index.html
fi

# Check coverage threshold (80%)
COVERAGE_NUM=$(echo $COVERAGE | sed 's/%//')
THRESHOLD=80

if (( $(echo "$COVERAGE_NUM >= $THRESHOLD" | bc -l) )); then
    echo -e "\n${GREEN}✅ Coverage meets threshold (${THRESHOLD}%)${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Coverage below threshold (${THRESHOLD}%)${NC}"
    exit 1
fi
