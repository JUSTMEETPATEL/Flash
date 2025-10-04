# Docker Setup Troubleshooting Guide

## Current Issue: Docker Daemon Not Running

### Quick Fix

**macOS:**

1. Open **Docker Desktop** application
2. Wait for Docker to start (whale icon in menu bar should be steady, not animated)
3. Verify: `docker info` (should show system information)
4. Try again: `docker-compose up dev`

**Linux:**

```bash
# Start Docker service
sudo systemctl start docker

# Enable Docker to start on boot
sudo systemctl enable docker

# Verify
docker info
```

---

## Common Docker Issues & Solutions

### 1. "Cannot connect to the Docker daemon"

**Symptoms:**

- `docker: Cannot connect to the Docker daemon at unix:///var/run/docker.sock`
- Docker commands hang or fail

**Solutions:**

**macOS:**

```bash
# Option 1: Start Docker Desktop
open -a Docker

# Wait for it to start (30-60 seconds)
# Check status
docker info
```

**Linux:**

```bash
# Start the Docker service
sudo systemctl start docker

# Check status
sudo systemctl status docker

# If needed, add your user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### 2. "Port already in use"

**Symptoms:**

- `Error starting userland proxy: listen tcp4 0.0.0.0:5627: bind: address already in use`

**Solutions:**

```bash
# Find what's using port 3000
lsof -ti:3000

# Kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port in docker-compose.yml
ports:
  - "5628:5627"  # Host:Container
```

### 3. "docker-compose command not found"

**Solutions:**

**macOS (with Docker Desktop):**

```bash
# Docker Desktop includes docker-compose
# If missing, reinstall Docker Desktop

# Or install via Homebrew
brew install docker-compose
```

**Linux:**

```bash
# Install docker-compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

### 4. "Build failed" or "Image not found"

**Solutions:**

```bash
# Clean rebuild
docker-compose down
docker-compose build --no-cache dev
docker-compose up dev

# If still failing, clean everything
docker system prune -a
docker volume prune
docker-compose build --no-cache dev
```

### 5. "Permission denied" errors

**Linux only:**

```bash
# Add your user to docker group
sudo usermod -aG docker $USER

# Log out and back in, or run:
newgrp docker

# Verify
docker run hello-world
```

### 6. Slow Docker builds

**Solutions:**

```bash
# Use BuildKit for faster builds
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Add to your ~/.zshrc or ~/.bashrc
echo 'export DOCKER_BUILDKIT=1' >> ~/.zshrc
echo 'export COMPOSE_DOCKER_CLI_BUILD=1' >> ~/.zshrc
```

---

## Development Without Docker

If Docker issues persist, you can develop locally:

### macOS Setup

```bash
# Install dependencies
brew install cmake llvm

# Build and run
npm install
npm run build
npm run dev
```

### Linux Setup

```bash
# Install dependencies
sudo apt update
sudo apt install -y build-essential cmake clang

# Build and run
npm install
npm run build
npm run dev
```

---

## Verification Steps

Run these commands to verify your setup:

```bash
# 1. Check Docker installation
docker --version
# Expected: Docker version 20.x or higher

# 2. Check Docker daemon
docker info
# Should show system info, not errors

# 3. Check Docker Compose
docker-compose --version
# Expected: Docker Compose version 2.x or higher

# 4. Test Docker
docker run hello-world
# Should download and run successfully

# 5. Check project files
ls -la Dockerfile.dev docker-compose.yml
# Both should exist

# 6. Check ports
lsof -i :5627
# Should be empty or show expected process

# 7. Try building
docker-compose build dev
# Should complete without errors
```

---

## Alternative: Use Makefile Commands

The Makefile includes helper commands:

```bash
# Check Docker status first
make docker-check  # (we'll add this)

# Build Docker image
make docker-build-dev

# Start dev environment
make docker-dev

# View logs
make logs

# Stop everything
make docker-stop
```

---

## Getting More Help

### View Docker logs

```bash
# Docker Desktop logs (macOS)
~/Library/Containers/com.docker.docker/Data/log/

# Docker Compose logs
docker-compose logs dev

# Follow logs in real-time
docker-compose logs -f dev
```

### Useful Docker Commands

```bash
# List running containers
docker ps

# List all containers
docker ps -a

# List images
docker images

# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove everything (careful!)
docker system prune -a
```

---

## Quick Resolution Checklist

- [ ] Docker Desktop is installed (macOS) or Docker service is running (Linux)
- [ ] Docker daemon is running (`docker info` works)
- [ ] No port conflicts (port 5627 is free)
- [ ] Docker Compose is available (`docker-compose --version`)
- [ ] Project files exist (Dockerfile.dev, docker-compose.yml)
- [ ] `docker run hello-world` works
- [ ] Can build image: `docker-compose build dev`

---

## Still Having Issues?

1. **Restart Docker Desktop** (macOS) or `sudo systemctl restart docker` (Linux)
2. **Restart your computer**
3. **Reinstall Docker Desktop** from https://www.docker.com/products/docker-desktop
4. **Use local development** (see above) while troubleshooting
5. **Check system requirements**:
   - macOS: 10.15 or higher
   - Linux: Kernel 3.10 or higher
   - RAM: 4GB minimum

---

**Need more help?** Create an issue with:

- Output of `docker info`
- Output of `docker-compose up dev`
- Your OS version
- Docker version
