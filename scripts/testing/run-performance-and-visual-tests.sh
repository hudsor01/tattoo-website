#!/bin/bash

# Run performance and visual baseline tests
# This script automates the execution of performance tests and visual baseline generation

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print header
echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN}  Performance Testing and Visual Baseline Generation${NC}"
echo -e "${GREEN}==================================================${NC}"

# Set environment variables for testing
export NODE_ENV=test
export PLAYWRIGHT_JUNIT_OUTPUT_NAME=test-results/junit.xml

# Check if running in CI
if [ -n "$CI" ]; then
  echo -e "${YELLOW}Running in CI environment${NC}"
  # CI-specific settings
  export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=0
  export PLAYWRIGHT_BROWSERS_PATH=0
fi

# Create output directories if they don't exist
mkdir -p test-results/visual/baseline
mkdir -p test-results/visual/actual
mkdir -p test-results/visual/diff
mkdir -p test-results/performance
mkdir -p test-results/screenshots

# Function to run tests with timing
run_test() {
  local test_name=$1
  local test_file=$2
  
  echo -e "${YELLOW}Running $test_name...${NC}"
  
  # Record start time
  start_time=$(date +%s)
  
  # Run the test
  npx playwright test $test_file --reporter=list,html
  local result=$?
  
  # Calculate duration
  end_time=$(date +%s)
  duration=$((end_time - start_time))
  
  # Print result
  if [ $result -eq 0 ]; then
    echo -e "${GREEN}✅ $test_name completed successfully in ${duration}s${NC}"
  else
    echo -e "${RED}❌ $test_name failed after ${duration}s${NC}"
  fi
  
  return $result
}

# Step 1: Install dependencies if needed
if [ "$1" == "--install" ] || [ "$1" == "-i" ]; then
  echo -e "${YELLOW}Installing dependencies...${NC}"
  npm ci
  npx playwright install --with-deps
fi

# Step 2: Run performance tests
echo -e "\n${GREEN}========== Running Performance Tests ==========${NC}"
run_test "Performance Tests" "tests/e2e/enhanced-performance.spec.ts"
performance_result=$?

# Step 3: Run visual baseline generation
echo -e "\n${GREEN}========== Running Visual Baseline Tests ==========${NC}"
run_test "Visual Baseline Tests" "tests/e2e/visual-baselines.spec.ts"
visual_result=$?

# Summarize results
echo -e "\n${GREEN}========== Test Summary ==========${NC}"
if [ $performance_result -eq 0 ]; then
  echo -e "${GREEN}✅ Performance Tests: PASSED${NC}"
else
  echo -e "${RED}❌ Performance Tests: FAILED${NC}"
fi

if [ $visual_result -eq 0 ]; then
  echo -e "${GREEN}✅ Visual Baseline Tests: PASSED${NC}"
else
  echo -e "${RED}❌ Visual Baseline Tests: FAILED${NC}"
fi

# Show report location
echo -e "\n${YELLOW}Test reports:${NC}"
echo -e "- HTML Report: file://$(pwd)/playwright-report/index.html"
echo -e "- Visual Baselines: $(pwd)/test-results/visual/baseline"

# Create a performance report summary
echo -e "\n${YELLOW}Generating performance summary...${NC}"
npx ts-node scripts/generate-performance-summary.ts

# Exit with appropriate code
if [ $performance_result -eq 0 ] && [ $visual_result -eq 0 ]; then
  echo -e "\n${GREEN}All tests completed successfully!${NC}"
  exit 0
else
  echo -e "\n${RED}Some tests failed. Check the reports for details.${NC}"
  exit 1
fi
