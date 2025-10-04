#!/bin/bash

# Flash Framework - Quick Setup Script
# This script guides you through setting up your development environment

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Flash Framework - Development Environment Setup          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

# Check prerequisites
echo "Checking prerequisites..."
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    success "Node.js installed: $NODE_VERSION"
    
    # Check version
    REQUIRED_VERSION="20.0.0"
    CURRENT_VERSION=$(node --version | sed 's/v//')
    if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$CURRENT_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
        success "Node.js version is sufficient (>= 20.0.0)"
    else
        warning "Node.js version $CURRENT_VERSION is below recommended 20.0.0"
        echo "  Consider upgrading: https://nodejs.org/"
    fi
else
    error "Node.js is not installed"
    echo "  Install from: https://nodejs.org/"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    success "npm installed: $NPM_VERSION"
else
    error "npm is not installed"
    exit 1
fi

# Check Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | cut -d ' ' -f3 | tr -d ',')
    success "Docker installed: $DOCKER_VERSION"
    
    # Check if Docker is running
    if docker info &> /dev/null; then
        success "Docker daemon is running"
    else
        warning "Docker daemon is not running"
        echo "  Please start Docker Desktop or Docker service"
    fi
else
    warning "Docker is not installed (optional but recommended)"
    echo "  Install from: https://docs.docker.com/get-docker/"
fi

# Check Docker Compose
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version | cut -d ' ' -f4 | tr -d ',')
    success "docker-compose installed: $COMPOSE_VERSION"
else
    warning "docker-compose is not installed (optional but recommended)"
fi

# Check CMake (optional)
if command -v cmake &> /dev/null; then
    CMAKE_VERSION=$(cmake --version | head -n1 | cut -d ' ' -f3)
    success "CMake installed: $CMAKE_VERSION"
else
    info "CMake is not installed (only needed for local C++ development)"
fi

# Check clang/gcc (optional)
if command -v clang++ &> /dev/null; then
    CLANG_VERSION=$(clang++ --version | head -n1)
    success "Clang installed: $CLANG_VERSION"
elif command -v g++ &> /dev/null; then
    GCC_VERSION=$(g++ --version | head -n1)
    success "GCC installed: $GCC_VERSION"
else
    info "C++ compiler not found (only needed for local C++ development)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Ask user preference
echo "Choose your development setup:"
echo ""
echo "  1) Docker (Recommended) - All dependencies in containers"
echo "  2) Local - Install dependencies on your machine"
echo "  3) Both - Setup for both Docker and local development"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        info "Setting up Docker development environment..."
        
        if ! command -v docker &> /dev/null; then
            error "Docker is required for this option"
            exit 1
        fi
        
        # Install npm dependencies (needed for package.json)
        info "Installing npm dependencies..."
        npm install
        success "Dependencies installed"
        
        # Build Docker image
        info "Building Docker development image (this may take a few minutes)..."
        docker-compose build dev
        success "Docker image built"
        
        echo ""
        success "Docker setup complete!"
        echo ""
        echo "Next steps:"
        echo "  1. Start development: make docker-dev"
        echo "  2. Or run: docker-compose up dev"
        echo ""
        echo "Your code will be live-reloaded as you edit!"
        ;;
    
    2)
        echo ""
        info "Setting up local development environment..."
        
        # Install dependencies
        info "Installing npm dependencies..."
        npm install
        success "Dependencies installed"
        
        # Build project
        info "Building project..."
        npm run build
        success "Project built"
        
        echo ""
        success "Local setup complete!"
        echo ""
        echo "Next steps:"
        echo "  1. Start development: make dev"
        echo "  2. Or run: npm run dev"
        ;;
    
    3)
        echo ""
        info "Setting up both Docker and local development..."
        
        # Install dependencies
        info "Installing npm dependencies..."
        npm install
        success "Dependencies installed"
        
        # Build project locally
        info "Building project locally..."
        npm run build
        success "Project built"
        
        # Build Docker image
        if command -v docker &> /dev/null && docker info &> /dev/null; then
            info "Building Docker development image..."
            docker-compose build dev
            success "Docker image built"
        else
            warning "Skipping Docker build (Docker not available)"
        fi
        
        echo ""
        success "Setup complete!"
        echo ""
        echo "Next steps:"
        echo "  • Local: make dev (or npm run dev)"
        echo "  • Docker: make docker-dev (or docker-compose up dev)"
        ;;
    
    *)
        error "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Resources:"
echo "  • Development Guide: DEVELOPMENT.md"
echo "  • PRD: docs/PRD.md"
echo "  • Getting Started: docs/getting-started.md"
echo ""
echo "💡 Useful Commands:"
echo "  • make help        Show all available commands"
echo "  • make test        Run tests"
echo "  • make lint        Check code quality"
echo ""
echo "🎉 Happy coding!"
