#!/bin/bash

# Local Development Setup Script
# Sets up the development environment for I CALL ON

set -e

echo "🛠️  I CALL ON Development Setup"
echo "================================"

# Check Node.js version
echo "📋 Checking Node.js..."
node_version=$(node -v)
echo "✅ Node.js $node_version detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  echo "❌ npm is not installed"
  exit 1
fi

echo "✅ npm $(npm -v) detected"

# Check if PostgreSQL is running
echo "📋 Checking PostgreSQL..."
if ! command -v psql &> /dev/null; then
  echo "⚠️  PostgreSQL client not found. Please install PostgreSQL."
else
  echo "✅ PostgreSQL client detected"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
  echo "✅ Dependencies installed"
else
  echo "❌ Failed to install dependencies"
  exit 1
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "📝 Creating .env.local..."
  cat > .env.local << EOF
# Stellar Network
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_SERVER_URL=https://horizon-testnet.stellar.org

# Soroban Contract
NEXT_PUBLIC_SOROBAN_CONTRACT_ID=CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/icall_on

# Multiplayer Server
NEXT_PUBLIC_MULTIPLAYER_URL=ws://localhost:8080

# API Keys
NEXT_PUBLIC_API_KEY=your_api_key_here
EOF
  echo "✅ .env.local created (update with your values)"
else
  echo "✅ .env.local already exists"
fi

# Create database
echo "🗄️  Setting up database..."
if command -v psql &> /dev/null; then
  createdb icall_on 2>/dev/null || echo "ℹ️  Database already exists"
  psql icall_on -f database/schema.sql
  echo "✅ Database setup completed"
else
  echo "⚠️  Skipping database setup (PostgreSQL not found)"
fi

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ TypeScript build successful"
else
  echo "❌ TypeScript build failed"
  exit 1
fi

echo ""
echo "✅ Development setup completed!"
echo ""
echo "🚀 To start developing:"
echo "   npm run dev     # Start development server"
echo "   npm run build   # Build for production"
echo "   npm start       # Start production server"
echo ""
echo "📚 Documentation:"
echo "   - Frontend: http://localhost:3000"
echo "   - API: http://localhost:3000/api"
echo "   - Database: PostgreSQL on localhost:5432"
echo ""
