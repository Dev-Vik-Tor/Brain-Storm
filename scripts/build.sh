#!/usr/bin/env bash
set -e

echo "Building BlueCollar smart contracts..."
cargo build --release --target wasm32-unknown-unknown

echo "Build complete. WASM files:"
find target/wasm32-unknown-unknown/release -name "*.wasm" | grep -v deps
