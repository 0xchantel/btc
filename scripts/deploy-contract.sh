#!/bin/bash

# Soroban smart contract deployment script
# Deploys the I CALL ON contract to Stellar network

set -e

echo "⛓️  Soroban Smart Contract Deployment"
echo "===================================="

NETWORK=${1:-testnet}
echo "🌐 Deploying to: $NETWORK"

# Check if contract ID is set
if [ -z "$SOROBAN_ACCOUNT" ]; then
  echo "❌ SOROBAN_ACCOUNT environment variable not set"
  exit 1
fi

echo "✅ Deployment account: $SOROBAN_ACCOUNT"

# Build the contract
echo "📦 Building smart contract..."
cd contracts
soroban contract build --manifest-path Cargo.toml

if [ $? -ne 0 ]; then
  echo "❌ Contract build failed"
  exit 1
fi

echo "✅ Contract built successfully"

# Deploy to network
echo "⛓️  Deploying to $NETWORK..."
CONTRACT_ID=$(soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/icall_on.wasm \
  --network $NETWORK \
  --source-account $SOROBAN_ACCOUNT)

if [ $? -eq 0 ]; then
  echo "✅ Contract deployed successfully"
  echo "📄 Contract ID: $CONTRACT_ID"
  echo ""
  echo "Update your .env.local with:"
  echo "NEXT_PUBLIC_SOROBAN_CONTRACT_ID=$CONTRACT_ID"
else
  echo "❌ Contract deployment failed"
  exit 1
fi

cd ..
