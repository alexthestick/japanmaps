#!/bin/bash

# Japan Maps Image System - Setup Script
# This script sets up the complete image management system

echo "🎨 Japan Maps Image System - Setup"
echo "===================================="
echo ""

# Check Node.js version
NODE_VERSION=$(node -v 2>/dev/null)
if [ -z "$NODE_VERSION" ]; then
  echo "❌ Node.js is not installed"
  echo "Please install Node.js >= 18.0.0"
  exit 1
fi

echo "✅ Node.js version: $NODE_VERSION"
echo ""

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p public/images/cities/original
mkdir -p public/images/cities/square
mkdir -p public/images/cities/preview
mkdir -p public/images/neighborhoods/original
mkdir -p public/images/neighborhoods/square
mkdir -p public/images/neighborhoods/preview
mkdir -p public/images/fallbacks
mkdir -p src/data

echo "✅ Directories created"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
echo "This may take a few minutes..."
npm install

echo ""
echo "✅ Dependencies installed"
echo ""

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
  echo "📝 Creating .env.local file..."
  echo "# Unsplash API Key (optional - for fetching fallback images)" > .env.local
  echo "# Get your key at: https://unsplash.com/developers" >> .env.local
  echo "VITE_UNSPLASH_ACCESS_KEY=YOUR_KEY_HERE" >> .env.local
  echo "✅ .env.local created"
  echo "   Edit it to add your Unsplash API key (optional)"
else
  echo "✅ .env.local already exists"
fi

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "Next Steps:"
echo "==========="
echo ""
echo "1. Add images:"
echo "   - Drop your photos into: public/images/cities/original/"
echo "   - Or fetch from Unsplash: npm run images:fetch"
echo ""
echo "2. Generate optimized images:"
echo "   npm run images:generate"
echo ""
echo "3. Start development:"
echo "   Terminal 1: npm run dev"
echo "   Terminal 2: npm run images:watch"
echo ""
echo "4. Read the documentation:"
echo "   - IMAGE_SYSTEM.md - Full system documentation"
echo "   - IMPLEMENTATION_GUIDE.md - Integration steps"
echo "   - IMAGE_SYSTEM_COMPLETE_PLAN.md - Executive overview"
echo ""
echo "Happy mapping! 🗾✨"

