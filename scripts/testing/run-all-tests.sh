#!/bin/bash

# Run all tests with detailed reporting
# This script runs all e2e tests with proper setup and reports

echo "===== Running all E2E tests for Tattoo Website ====="
echo "Setting up test environment..."

# Apply business logic functions to database
echo "Setting up database functions..."
bash scripts/apply-test-functions.sh

# Run all the tests with playwright
echo "Running tests with detailed reporting..."
npx playwright test --reporter=html,list

# Open the report if tests failed
if [ $? -ne 0 ]; then
  echo "Some tests failed. Opening report..."
  npx playwright show-report
else
  echo "All tests passed!"
fi

echo "===== Test run complete ====="