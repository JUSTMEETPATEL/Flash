# Multi-stage build for Flash Framework
# Stage 1: C++ build environment
FROM ubuntu:22.04 AS cpp-builder

# Install C++ build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    ninja-build \
    clang \
    libc++-dev \
    libc++abi-dev \
    python3 \
    python3-pip \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy CMake configuration
COPY CMakeLists.txt ./
COPY cpp/ ./cpp/

# Create build directory and build C++ components
RUN mkdir build && cd build && \
    cmake .. -DCMAKE_BUILD_TYPE=Release -G Ninja && \
    ninja

# Stage 2: Node.js build environment
FROM node:23-bullseye AS node-builder

# Install node-gyp dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY binding.gyp ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY examples/ ./examples/
COPY benchmarks/ ./benchmarks/

# Copy built C++ library from previous stage
COPY --from=cpp-builder /app/build/ ./build/

# Build TypeScript and N-API addon
RUN npm run build

# Stage 3: Runtime environment
FROM node:23-bullseye-slim AS runtime

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libc++1 \
    && rm -rf /var/lib/apt/lists/*

# Create app user
RUN useradd --create-home --shell /bin/bash app
USER app

# Set working directory
WORKDIR /home/app

# Copy built application from node-builder stage
COPY --from=node-builder --chown=app:app /app/dist/ ./dist/
COPY --from=node-builder --chown=app:app /app/build/ ./build/
COPY --from=node-builder --chown=app:app /app/node_modules/ ./node_modules/
COPY --from=node-builder --chown=app:app /app/package*.json ./
COPY --from=node-builder --chown=app:app /app/examples/ ./examples/

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Default command
CMD ["node", "examples/hello-world/server.js"]