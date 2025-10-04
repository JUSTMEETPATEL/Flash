#!/bin/bash

# Flash Framework - Docker Startup Helper
# This script helps diagnose and start Docker development environment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Flash Framework - Docker Environment Checker            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed${NC}"
    echo ""
    echo "Please install Docker:"
    echo "  • macOS: https://docs.docker.com/desktop/install/mac-install/"
    echo "  • Linux: https://docs.docker.com/engine/install/"
    echo "  • Windows: https://docs.docker.com/desktop/install/windows-install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed${NC}"
docker --version

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo -e "${RED}✗ Docker daemon is not running${NC}"
    echo ""
    echo "How to fix:"
    echo ""
    echo "  macOS:"
    echo "    1. Open Docker Desktop application"
    echo "    2. Wait for it to start (whale icon in menu bar)"
    echo "    3. Run this script again"
    echo ""
    echo "  Linux:"
    echo "    sudo systemctl start docker"
    echo "    sudo systemctl enable docker  # Start on boot"
    echo ""
    echo "For more help, see: DOCKER_TROUBLESHOOTING.md"
    exit 1
fi

echo -e "${GREEN}✓ Docker daemon is running${NC}"

# Check Docker Compose
if command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✓ docker-compose is available${NC}"
    docker-compose --version
elif docker compose version &> /dev/null; then
    echo -e "${GREEN}✓ docker compose (plugin) is available${NC}"
    docker compose version
else
    echo -e "${YELLOW}⚠ docker-compose not found${NC}"
    echo "Install it: https://docs.docker.com/compose/install/"
fi

# Check if port 3000 is available
if lsof -i :3000 &> /dev/null; then
    echo -e "${YELLOW}⚠ Port 3000 is already in use${NC}"
    echo ""
    echo "Process using port 3000:"
    lsof -i :3000
    echo ""
    read -p "Kill the process? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        lsof -ti:3000 | xargs kill -9
        echo -e "${GREEN}✓ Port 3000 is now free${NC}"
    else
        echo -e "${YELLOW}You can change the port in docker-compose.yml${NC}"
    fi
else
    echo -e "${GREEN}✓ Port 3000 is available${NC}"
fi

# Check if Dockerfile.dev exists
if [ -f "Dockerfile.dev" ]; then
    echo -e "${GREEN}✓ Dockerfile.dev found${NC}"
else
    echo -e "${RED}✗ Dockerfile.dev not found${NC}"
    exit 1
fi

# Check if docker-compose.yml exists
if [ -f "docker-compose.yml" ]; then
    echo -e "${GREEN}✓ docker-compose.yml found${NC}"
else
    echo -e "${RED}✗ docker-compose.yml not found${NC}"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✅ All checks passed!${NC}"
echo ""
echo "What would you like to do?"
echo ""
echo "  1) Build Docker image (first time or after changes)"
echo "  2) Start development server"
echo "  3) Start development server (rebuild image first)"
echo "  4) View logs"
echo "  5) Stop all containers"
echo "  6) Exit"
echo ""
read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        echo ""
        echo "Building Docker image..."
        docker-compose build dev
        echo ""
        echo -e "${GREEN}✓ Image built successfully!${NC}"
        echo "Now run: make docker-dev"
        ;;
    2)
        echo ""
        echo "Starting development server..."
        docker-compose up dev
        ;;
    3)
        echo ""
        echo "Rebuilding and starting development server..."
        docker-compose down
        docker-compose build --no-cache dev
        docker-compose up dev
        ;;
    4)
        echo ""
        echo "Viewing logs (Ctrl+C to exit)..."
        docker-compose logs -f dev
        ;;
    5)
        echo ""
        echo "Stopping all containers..."
        docker-compose down
        echo -e "${GREEN}✓ All containers stopped${NC}"
        ;;
    6)
        echo "Goodbye!"
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac
