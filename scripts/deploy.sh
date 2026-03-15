#!/usr/bin/env bash
set -e

NETWORK=${1:-testnet}
CONTRACT=${2:-analytics}

echo "Deploying $CONTRACT to $NETWORK..."

stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/bluecollar_${CONTRACT}.wasm \
  --source "$STELLAR_SECRET_KEY" \
  --network "$NETWORK"
