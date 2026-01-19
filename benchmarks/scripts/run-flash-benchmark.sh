#!/bin/bash

# Flash Server Benchmark Script

echo "================================"
echo "FLASH SERVER BENCHMARK"
echo "================================"
echo ""

# Start server in background
echo "[1/3] Starting Flash server..."
node benchmarks/scripts/benchmark-server.js > /tmp/flash-server.log 2>&1 &
SERVER_PID=$!

# Wait for server to be ready
echo "[2/3] Waiting for server to initialize (3 seconds)..."
sleep 3

# Verify server is running
if ! curl -s http://localhost:5627/hello > /dev/null; then
    echo "ERROR: Server failed to start!"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

echo "[3/3] Running benchmarks..."
echo ""

echo "============================================================"
echo "Test 1: /hello (simple text response)"
echo "============================================================"
/opt/homebrew/bin/wrk -t4 -c100 -d10s --latency http://localhost:5627/hello
echo ""

echo "============================================================"
echo "Test 2: /api/user (JSON response)"
echo "============================================================"
/opt/homebrew/bin/wrk -t4 -c100 -d10s --latency http://localhost:5627/api/user
echo ""

echo "============================================================"
echo "Test 3: /users/123 (path parameters)"
echo "============================================================"
/opt/homebrew/bin/wrk -t4 -c100 -d10s --latency http://localhost:5627/users/123
echo ""

# Stop server
echo "Stopping server..."
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

echo ""
echo "Benchmark complete!"
echo "================================"
