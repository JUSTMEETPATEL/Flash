#!/bin/bash

# Week 2 Testing Script
# Tests HTTP parser with various requests

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PORT=5627

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Week 2 HTTP Parser Testing${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Check if server is running
echo -e "${BLUE}→ Checking if server is running on port $PORT...${NC}"
if ! lsof -i :$PORT > /dev/null 2>&1; then
    echo -e "${RED}✗ Server not running on port $PORT${NC}"
    echo -e "${BLUE}  Start server with: ./phase1.sh run${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Server is running${NC}"
echo ""

# Test 1: Simple GET request
echo -e "${BLUE}→ Test 1: Simple GET request${NC}"
curl -s http://localhost:$PORT/ > /dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Simple GET successful${NC}"
else
    echo -e "${RED}✗ Simple GET failed${NC}"
fi
echo ""

# Test 2: GET with path
echo -e "${BLUE}→ Test 2: GET with path${NC}"
curl -s http://localhost:$PORT/api/users > /dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ GET with path successful${NC}"
else
    echo -e "${RED}✗ GET with path failed${NC}"
fi
echo ""

# Test 3: GET with query string
echo -e "${BLUE}→ Test 3: GET with query string${NC}"
curl -s "http://localhost:$PORT/search?q=hello&limit=10" > /dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ GET with query string successful${NC}"
else
    echo -e "${RED}✗ GET with query string failed${NC}"
fi
echo ""

# Test 4: POST with JSON body
echo -e "${BLUE}→ Test 4: POST with JSON body${NC}"
curl -s -X POST http://localhost:$PORT/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John","age":30}' > /dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ POST with JSON successful${NC}"
else
    echo -e "${RED}✗ POST with JSON failed${NC}"
fi
echo ""

# Test 5: PUT request
echo -e "${BLUE}→ Test 5: PUT request${NC}"
curl -s -X PUT http://localhost:$PORT/api/users/123 > /dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ PUT request successful${NC}"
else
    echo -e "${RED}✗ PUT request failed${NC}"
fi
echo ""

# Test 6: DELETE request
echo -e "${BLUE}→ Test 6: DELETE request${NC}"
curl -s -X DELETE http://localhost:$PORT/api/users/123 > /dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ DELETE request successful${NC}"
else
    echo -e "${RED}✗ DELETE request failed${NC}"
fi
echo ""

# Test 7: Multiple headers
echo -e "${BLUE}→ Test 7: Multiple custom headers${NC}"
curl -s http://localhost:$PORT/ \
  -H "X-Custom-Header: value1" \
  -H "X-Another-Header: value2" \
  -H "Accept: application/json" > /dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Multiple headers successful${NC}"
else
    echo -e "${RED}✗ Multiple headers failed${NC}"
fi
echo ""

# Test 8: Large request body
echo -e "${BLUE}→ Test 8: Large request body${NC}"
LARGE_BODY=$(printf 'A%.0s' {1..1000})
curl -s -X POST http://localhost:$PORT/data \
  -d "$LARGE_BODY" > /dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Large body successful${NC}"
else
    echo -e "${RED}✗ Large body failed${NC}"
fi
echo ""

echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}All tests completed!${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo -e "${BLUE}Check server logs for parsed requests${NC}"
echo -e "${BLUE}You should see output like:${NC}"
echo ""
echo -e "${GREEN}=== HTTP Request Parsed ===${NC}"
echo -e "${GREEN}Method: GET${NC}"
echo -e "${GREEN}Path: /api/users${NC}"
echo -e "${GREEN}Version: HTTP/1.1${NC}"
echo -e "${GREEN}Headers:${NC}"
echo -e "${GREEN}  Host: localhost:5627${NC}"
echo -e "${GREEN}  User-Agent: curl/7.88.1${NC}"
echo -e "${GREEN}============================${NC}"
