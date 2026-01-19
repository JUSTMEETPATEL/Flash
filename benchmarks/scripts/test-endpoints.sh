#!/bin/bash

echo "Starting Flash server in background..."
node benchmarks/scripts/debug-test.js &
SERVER_PID=$!

echo "Waiting 3 seconds for server to start..."
sleep 3

echo ""
echo "Testing /hello endpoint..."
curl -s http://localhost:5627/hello
echo ""
echo ""

echo "Testing /api/user endpoint..."
curl -s http://localhost:5627/api/user
echo ""
echo ""

echo "Testing /users/123 endpoint..."
curl -s http://localhost:5627/users/123
echo ""
echo ""

echo "Stopping server..."
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

echo "Test complete!"
