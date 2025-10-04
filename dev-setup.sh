#!/bin/bash

# Flash Framework Development Environment Setup
# This script sets up the development environment using Docker

set -e

echo "🚀 Setting up Flash Framework development environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon is not running. Please start Docker."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed."
    exit 1
fi

echo "✅ Docker environment verified"

# Build the development image
echo "🔨 Building development Docker image..."
docker-compose build dev

echo "🎉 Development environment is ready!"
echo ""
echo "To start the development server:"
echo "  npm run docker:dev"
echo ""
echo "Or manually:"
echo "  docker-compose up dev"
echo ""
echo "The server will be available at:"
echo "  http://localhost:5627"
echo ""
echo "Debug port (for Node.js debugging):"
echo "  localhost:9229"
echo ""
echo "To stop the development environment:"
echo "  Ctrl+C (in the terminal running docker-compose)"
echo "  Or: docker-compose down"