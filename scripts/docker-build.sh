#!/bin/bash

# Docker build script
# Builds Docker image for I CALL ON

set -e

echo "🐘 Building Docker image..."
echo "============================="

VERSION=${1:-latest}

echo "💻 Building version: $VERSION"

docker build \
  --build-arg NEXT_PUBLIC_STELLAR_NETWORK=testnet \
  --build-arg NEXT_PUBLIC_STELLAR_SERVER_URL=https://horizon-testnet.stellar.org \
  -t icall-on:$VERSION \
  -t icall-on:latest \
  .

if [ $? -eq 0 ]; then
  echo "✅ Docker image built successfully"
  echo ""
  echo "🚀 To run the container:"
  echo "   docker run -p 3000:3000 icall-on:$VERSION"
else
  echo "❌ Docker build failed"
  exit 1
fi
