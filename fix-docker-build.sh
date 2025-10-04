#!/bin/bash

# Flash Framework - Docker Build Fix Script
# This script rebuilds the Docker image with the fix

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Flash Framework - Docker Build Fix                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon is not running"
    echo "   Please start Docker Desktop and try again"
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Remove old containers and images
echo "🧹 Cleaning up old containers and images..."
docker-compose down 2>/dev/null || true
docker rmi flash-dev 2>/dev/null || true

echo ""
echo "🔨 Building Docker development image..."
echo "   This will take a few minutes..."
echo ""

# Build with no cache to ensure fresh build
docker-compose build --no-cache dev

if [ $? -eq 0 ]; then
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║  ✅ Docker Image Built Successfully!                       ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "You can now start development with:"
    echo "  • docker-compose up dev"
    echo "  • make docker-dev"
    echo "  • npm run docker:dev"
    echo ""
    
    read -p "Start development server now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "Starting development server..."
        docker-compose up dev
    fi
else
    echo ""
    echo "❌ Build failed. See error above."
    echo ""
    echo "Common fixes:"
    echo "  1. Ensure all files exist: cpp/, src/, package.json"
    echo "  2. Check docker-compose.yml and Dockerfile.dev syntax"
    echo "  3. Try: docker system prune -a (removes all Docker data)"
    exit 1
fi
