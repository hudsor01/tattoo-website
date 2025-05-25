#!/bin/bash

# Test runner script for the tattoo website
# This script runs both unit tests and E2E tests

set -e

echo "🧪 Starting test suite for Tattoo Website Admin Dashboard"
echo "=================================================="

# Check if dependencies are installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm ci

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npm run prisma:generate

# Run linting first
echo "🔍 Running linting..."
npm run lint

# Run type checking
echo "🔧 Running type checking..."
npm run type-check

# Run unit tests
echo "🧪 Running unit tests..."
npm run test:unit

# Install Playwright browsers if needed
echo "🌐 Installing Playwright browsers..."
npx playwright install --with-deps

# Start development server in background for E2E tests
echo "🚀 Starting development server..."
npm run dev &
DEV_SERVER_PID=$!

# Wait for server to be ready
echo "⏳ Waiting for server to be ready..."
sleep 10

# Check if server is running
if ! curl -f http://localhost:3001 >/dev/null 2>&1; then
    echo "❌ Development server failed to start"
    kill $DEV_SERVER_PID 2>/dev/null || true
    exit 1
fi

# Run E2E tests
echo "🎭 Running E2E tests..."
npm run test:e2e || {
    echo "❌ E2E tests failed"
    kill $DEV_SERVER_PID 2>/dev/null || true
    exit 1
}

# Clean up
echo "🧹 Cleaning up..."
kill $DEV_SERVER_PID 2>/dev/null || true

echo "✅ All tests completed successfully!"
echo "=================================================="
echo "📊 Test Results Summary:"
echo "  • Unit tests: ✅ Passed"
echo "  • E2E tests: ✅ Passed"
echo "  • Linting: ✅ Passed"
echo "  • Type checking: ✅ Passed"
echo ""
echo "🎉 Your admin dashboard is working correctly!"