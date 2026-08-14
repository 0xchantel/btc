#!/bin/bash

# Development server startup script
# Starts all required services for development

set -e

echo "🚀 Starting I CALL ON Development Environment"
echo "============================================="

# Start PostgreSQL (if using Docker)
if command -v docker &> /dev/null; then
  echo "🐘 Starting PostgreSQL container..."
  docker run -d \
    -e POSTGRES_DB=icall_on \
    -e POSTGRES_USER=icall \
    -e POSTGRES_PASSWORD=icall123 \
    -p 5432:5432 \
    --name icall_postgres \
    postgres:15
  sleep 2
  echo "✅ PostgreSQL started"
fi

# Start Next.js dev server
echo "🌐 Starting Next.js dev server..."
npm run dev &
DEV_PID=$!

# Start multiplayer server
echo "🔌 Starting multiplayer server..."
node server/multiplayer-server.js &
SERVER_PID=$!

echo ""
echo "✅ All services started!"
echo ""
echo "📊 Ports:"
echo "   Frontend: http://localhost:3000"
echo "   Multiplayer: ws://localhost:8080"
echo "   Database: localhost:5432"
echo ""
echo "Press Ctrl+C to stop all services..."
echo ""

# Handle cleanup
trap "kill $DEV_PID $SERVER_PID 2>/dev/null; echo 'Services stopped'" EXIT

# Wait for background jobs
wait
