#!/bin/bash

# Start server
node benchmarks/scripts/benchmark-server.js > /tmp/flash-server-output.log 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

# Wait for startup
sleep 3

# Run single benchmark
/opt/homebrew/bin/wrk -t4 -c100 -d10s --latency http://localhost:5627/hello

# Cleanup
kill $SERVER_PID
wait $SERVER_PID 2>/dev/null
