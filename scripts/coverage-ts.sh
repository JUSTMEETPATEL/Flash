#!/bin/bash

# TypeScript Test Coverage Script
# Uses Jest to generate coverage reports

set -e

echo "🔍 Flash Framework - TypeScript Coverage Analysis"
echo "================================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Ensure dependencies are installed
echo -e "\n${YELLOW}📦 Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Build TypeScript
echo -e "\n${YELLOW}🔨 Building TypeScript...${NC}"
npm run build:ts

# Run tests with coverage
echo -e "\n${YELLOW}🧪 Running tests with coverage...${NC}"
npm test -- --coverage --coverageReporters=text --coverageReporters=html --coverageReporters=json-summary

# Check if coverage was generated
if [ ! -f "coverage/coverage-summary.json" ]; then
    echo -e "\n${RED}❌ Coverage report not generated${NC}"
    exit 1
fi

# Extract coverage percentages
LINES=$(cat coverage/coverage-summary.json | grep -o '"lines":{"total":[0-9]*,"covered":[0-9]*,"skipped":[0-9]*,"pct":[0-9.]*}' | grep -o '"pct":[0-9.]*' | cut -d':' -f2)
STATEMENTS=$(cat coverage/coverage-summary.json | grep -o '"statements":{"total":[0-9]*,"covered":[0-9]*,"skipped":[0-9]*,"pct":[0-9.]*}' | grep -o '"pct":[0-9.]*' | cut -d':' -f2)
FUNCTIONS=$(cat coverage/coverage-summary.json | grep -o '"functions":{"total":[0-9]*,"covered":[0-9]*,"skipped":[0-9]*,"pct":[0-9.]*}' | grep -o '"pct":[0-9.]*' | cut -d':' -f2)
BRANCHES=$(cat coverage/coverage-summary.json | grep -o '"branches":{"total":[0-9]*,"covered":[0-9]*,"skipped":[0-9]*,"pct":[0-9.]*}' | grep -o '"pct":[0-9.]*' | cut -d':' -f2)

echo -e "\n${GREEN}✅ Coverage Report Generated${NC}"
echo "================================================"
echo -e "📊 Lines:      ${GREEN}${LINES}%${NC}"
echo -e "📊 Statements: ${GREEN}${STATEMENTS}%${NC}"
echo -e "📊 Functions:  ${GREEN}${FUNCTIONS}%${NC}"
echo -e "📊 Branches:   ${GREEN}${BRANCHES}%${NC}"
echo "📁 HTML Report: coverage/index.html"

# Open report in browser (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "\n${YELLOW}🌐 Opening report in browser...${NC}"
    open coverage/index.html
fi

# Check coverage threshold (80%)
THRESHOLD=80

check_threshold() {
    local value=$1
    local name=$2
    
    if (( $(echo "$value >= $THRESHOLD" | bc -l) )); then
        echo -e "${GREEN}✅ ${name} meets threshold (${THRESHOLD}%)${NC}"
        return 0
    else
        echo -e "${RED}❌ ${name} below threshold (${THRESHOLD}%): ${value}%${NC}"
        return 1
    fi
}

PASS=0

check_threshold $LINES "Lines" || PASS=1
check_threshold $STATEMENTS "Statements" || PASS=1
check_threshold $FUNCTIONS "Functions" || PASS=1
check_threshold $BRANCHES "Branches" || PASS=1

if [ $PASS -eq 0 ]; then
    echo -e "\n${GREEN}✅ All coverage thresholds met!${NC}"
    exit 0
else
    echo -e "\n${YELLOW}⚠️  Some coverage thresholds not met${NC}"
    exit 1
fi
