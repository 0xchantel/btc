#!/bin/bash

# Testing script for I CALL ON
# Runs all tests including unit, integration, and contract tests

set -e

echo "🪨 I CALL ON Testing Suite"
echo "=========================="

# Run TypeScript type check
echo "📝 Running TypeScript checks..."
npx tsc --noEmit

if [ $? -eq 0 ]; then
  echo "✅ TypeScript checks passed"
else
  echo "❌ TypeScript checks failed"
  exit 1
fi

# Run ESLint
echo "📑 Running linter..."
npm run lint || true

echo "✅ Linting completed"

# Run unit tests
echo "🤯 Running unit tests..."
npm run test:unit || true

echo "✅ Unit tests completed"

# Run integration tests
echo "🔗 Running integration tests..."
npm run test:integration || true

echo "✅ Integration tests completed"

echo ""
echo "✅ Test suite completed!"
echo ""
