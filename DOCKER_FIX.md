# 🚨 Docker Setup Issue - Quick Fix Guide

## Your Issue: Docker Daemon Not Running

The error you're experiencing is because **Docker Desktop is not running** on your system.

---

## ✅ Quick Fix (macOS)

### Step 1: Start Docker Desktop

1. Open **Spotlight** (Cmd + Space)
2. Type "Docker" and press Enter
3. Wait 30-60 seconds for Docker to start
4. Look for the **whale icon** in your menu bar
5. When the whale is steady (not animated), Docker is ready

### Step 2: Verify Docker is Running

```bash
docker info
```

You should see system information, not an error.

### Step 3: Start Your Development Environment

```bash
# Option 1: Use the helper script (recommended)
./start-docker.sh

# Option 2: Use Make
make docker-dev

# Option 3: Use docker-compose directly
docker-compose up dev
```

---

## 🔍 Troubleshooting

### If Docker Desktop Won't Start

1. **Restart Docker Desktop**: Quit and reopen
2. **Restart your Mac**: Sometimes needed after first install
3. **Check system requirements**: macOS 10.15+, 4GB RAM minimum
4. **Reinstall Docker Desktop**: Download from https://www.docker.com/products/docker-desktop

### If Port 5627 is Already in Use

```bash
# Find what's using port 5627
lsof -i :5627

# Kill it
lsof -ti:5627 | xargs kill -9

# Or use our helper script
./start-docker.sh  # It will offer to kill the process
```

### If Docker Compose Fails

```bash
# Clean rebuild
docker-compose down
docker-compose build --no-cache dev
docker-compose up dev
```

---

## 🎯 Alternative: Develop Without Docker

If you continue having Docker issues, you can develop locally:

```bash
# Install and build
npm install
npm run build

# Start development server
npm run dev
```

The server will run on http://localhost:5627

---

## 📚 Detailed Help

- **Full troubleshooting guide**: See `DOCKER_TROUBLESHOOTING.md`
- **Development guide**: See `DEVELOPMENT.md`
- **Quick reference**: See `QUICK_REFERENCE.md`

---

## 🆘 Still Stuck?

Run our diagnostic script:

```bash
./start-docker.sh
```

It will:

- ✅ Check if Docker is installed
- ✅ Check if Docker daemon is running
- ✅ Check if port 3000 is available
- ✅ Offer to fix common issues
- ✅ Guide you through starting the environment

---

## ✨ After Docker is Running

Once Docker Desktop is running, you can:

```bash
# Check Docker status
make docker-check

# Build the image (first time only)
docker-compose build dev

# Start development
make docker-dev

# View logs
make docker-logs

# Stop containers
make docker-stop
```

---

**Current Status**: Docker daemon is not running  
**Next Step**: Open Docker Desktop and wait for it to start  
**Then Run**: `./start-docker.sh` or `make docker-dev`
