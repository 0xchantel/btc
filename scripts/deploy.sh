#!/bin/bash

# I CALL ON Deployment Script
# Deploys the entire application to production

set -e

echo "🚀 I CALL ON Deployment Script"
echo "================================"

# Check environment variables
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not set"
  exit 1
fi

if [ -z "$SOROBAN_CONTRACT_ID" ]; then
  echo "❌ SOROBAN_CONTRACT_ID not set"
  exit 1
fi

echo "✅ Environment variables verified"

# Build the Next.js application
echo "📦 Building Next.js application..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Next.js build successful"
else
  echo "❌ Next.js build failed"
  exit 1
fi

# Build the smart contract
echo "📦 Building Soroban smart contract..."
cd contracts
soroban contract build --manifest-path Cargo.toml

if [ $? -eq 0 ]; then
  echo "✅ Smart contract build successful"
else
  echo "❌ Smart contract build failed"
  exit 1
fi

cd ..

# Initialize database
echo "🗄️  Initializing database..."
psql $DATABASE_URL -f database/schema.sql

if [ $? -eq 0 ]; then
  echo "✅ Database initialized"
else
  echo "❌ Database initialization failed"
  exit 1
fi

# Deploy smart contract to Soroban
echo "⛓️  Deploying smart contract to Soroban..."
soroban contract deploy \
  --wasm contracts/target/wasm32-unknown-unknown/release/icall_on.wasm \
  --network testnet \
  --source-account $SOROBAN_ACCOUNT

if [ $? -eq 0 ]; then
  echo "✅ Smart contract deployed"
else
  echo "❌ Smart contract deployment failed"
  exit 1
fi

# Generate TypeScript types from contract
echo "📝 Generating TypeScript types..."
soroban contract typescript --wasm contracts/target/wasm32-unknown-unknown/release/icall_on.wasm --output lib/soroban-types.ts

if [ $? -eq 0 ]; then
  echo "✅ TypeScript types generated"
else
  echo "❌ TypeScript type generation failed"
  exit 1
fi

# Start the application
echo "🎮 Starting I CALL ON application..."
npm start &

# Start the multiplayer server
echo "🔌 Starting multiplayer server..."
node server/multiplayer-server.js &

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "🎯 Application is running:"
echo "   Frontend: http://localhost:3000"
echo "   Multiplayer: ws://localhost:8080"
echo "   Smart Contract: $SOROBAN_CONTRACT_ID"
echo ""
