#!/bin/bash

# Kill any processes using port 5173
echo "🔄 Clearing port 5173..."
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# Wait for port to clear
echo "⏳ Waiting for port to clear (10 seconds)..."
sleep 10

# Start the dev server
echo "🚀 Starting dev server..."
cd "$(dirname "$0")"
npm run dev