#!/bin/bash

# Phase 5 Performance Testing Tools Setup
# Installs all required tools for benchmarking, profiling, and coverage analysis

set -e

echo "🔧 Flash Framework - Phase 5 Tools Setup"
echo "========================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Detect platform
PLATFORM=$(uname)

echo -e "\n${BLUE}Platform detected: ${PLATFORM}${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" &> /dev/null
}

# Function to install tool
install_tool() {
    local tool=$1
    local install_cmd=$2
    
    if command_exists "$tool"; then
        echo -e "${GREEN}✅ $tool is already installed${NC}"
    else
        echo -e "${YELLOW}📦 Installing $tool...${NC}"
        eval "$install_cmd"
        
        if command_exists "$tool"; then
            echo -e "${GREEN}✅ $tool installed successfully${NC}"
        else
            echo -e "${RED}❌ Failed to install $tool${NC}"
            return 1
        fi
    fi
}

if [ "$PLATFORM" = "Darwin" ]; then
    # macOS Setup
    echo -e "\n${BLUE}🍎 Setting up tools for macOS...${NC}"
    
    # Check for Homebrew
    if ! command_exists brew; then
        echo -e "${YELLOW}📦 Installing Homebrew...${NC}"
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    else
        echo -e "${GREEN}✅ Homebrew is installed${NC}"
    fi
    
    # Install tools
    echo -e "\n${BLUE}Installing performance testing tools...${NC}"
    
    install_tool "wrk" "brew install wrk"
    install_tool "lcov" "brew install lcov"
    
    # Check for Xcode Command Line Tools (for Instruments)
    if xcode-select -p &> /dev/null; then
        echo -e "${GREEN}✅ Xcode Command Line Tools are installed${NC}"
    else
        echo -e "${YELLOW}📦 Installing Xcode Command Line Tools...${NC}"
        xcode-select --install
        echo -e "${YELLOW}⏳ Please complete the Xcode installation dialog${NC}"
        echo "Press Enter after installation completes..."
        read
    fi
    
    echo -e "\n${GREEN}✅ macOS tools setup complete!${NC}"
    echo -e "\n${BLUE}Available tools:${NC}"
    echo "  • wrk - HTTP benchmarking"
    echo "  • lcov - C++ coverage analysis"
    echo "  • instruments - CPU/Memory profiling (via Xcode)"
    echo "  • leaks - Memory leak detection (via Xcode)"
    
elif [ "$PLATFORM" = "Linux" ]; then
    # Linux Setup
    echo -e "\n${BLUE}🐧 Setting up tools for Linux...${NC}"
    
    # Update package list
    echo -e "${YELLOW}📦 Updating package list...${NC}"
    sudo apt-get update
    
    # Install tools
    echo -e "\n${BLUE}Installing performance testing tools...${NC}"
    
    install_tool "wrk" "sudo apt-get install -y wrk"
    install_tool "lcov" "sudo apt-get install -y lcov"
    install_tool "valgrind" "sudo apt-get install -y valgrind"
    install_tool "perf" "sudo apt-get install -y linux-tools-common linux-tools-generic"
    
    echo -e "\n${GREEN}✅ Linux tools setup complete!${NC}"
    echo -e "\n${BLUE}Available tools:${NC}"
    echo "  • wrk - HTTP benchmarking"
    echo "  • lcov - C++ coverage analysis"
    echo "  • valgrind - Memory leak detection"
    echo "  • perf - CPU profiling"
    
else
    echo -e "${RED}❌ Unsupported platform: $PLATFORM${NC}"
    echo "This script supports macOS and Linux only."
    exit 1
fi

# Verify Node.js and npm
echo -e "\n${BLUE}Checking Node.js environment...${NC}"

if command_exists node; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js ${NODE_VERSION}${NC}"
else
    echo -e "${RED}❌ Node.js not found${NC}"
    echo "Please install Node.js 20+ from https://nodejs.org"
    exit 1
fi

if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm ${NPM_VERSION}${NC}"
else
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi

# Install Node.js dependencies
echo -e "\n${BLUE}Installing Node.js dependencies...${NC}"
npm install

echo -e "\n${GREEN}✅ All dependencies installed!${NC}"

# Summary
echo -e "\n=========================================="
echo -e "${GREEN}🎉 Phase 5 Tools Setup Complete!${NC}"
echo -e "==========================================\n"

echo -e "${BLUE}Next steps:${NC}"
echo -e "  1. Build the project:"
echo -e "     ${YELLOW}npm run build${NC}"
echo -e ""
echo -e "  2. Run test coverage:"
echo -e "     ${YELLOW}npm run coverage${NC}"
echo -e ""
echo -e "  3. Run benchmarks:"
echo -e "     ${YELLOW}npm run benchmark${NC}"
echo -e ""
echo -e "  4. Check for memory leaks:"
echo -e "     ${YELLOW}npm run check:leaks${NC}"
echo -e ""
echo -e "  5. Run full performance suite:"
echo -e "     ${YELLOW}npm run perf${NC}"
echo -e ""

echo -e "${BLUE}Documentation:${NC}"
echo -e "  • Performance guide: ${YELLOW}docs/PERFORMANCE.md${NC}"
echo -e "  • Phase 5 plan: ${YELLOW}docs/PHASE5_PLAN.md${NC}"
echo -e "  • Progress tracking: ${YELLOW}docs/PHASE5_PROGRESS.md${NC}"
echo -e ""

echo -e "${GREEN}Ready to optimize! 🚀${NC}\n"
