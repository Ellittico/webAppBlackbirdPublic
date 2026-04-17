#!/usr/bin/env bash
set -euo pipefail

cd /home/bbird/blackbirdSentinel

echo "[deploy] pulling latest..."
git fetch origin main
git reset --hard origin/main

echo "[deploy] rebuilding and restarting..."
docker compose up -d --build

echo "[deploy] done."