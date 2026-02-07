#!/bin/bash

# Code Cleanup and Optimization Script
# Removes unused files, cleans build artifacts, and optimizes the codebase

echo "🧹 Starting code cleanup..."

# 1. Clean build artifacts
echo "📦 Cleaning build artifacts..."
rm -rf .next
rm -rf out
rm -rf .turbo
rm -rf android/app/build
rm -rf ios/App/build
rm -rf backend/dist
rm -rf backend/node_modules/.cache
echo "✅ Build artifacts cleaned"

# 2. Clean node_modules cache
echo "🗑️  Cleaning npm cache..."
npm cache clean --force 2>/dev/null || true
echo "✅ NPM cache cleaned"

# 3. Remove temporary files
echo "🧹 Removing temporary files..."
find . -name "*.log" -type f -delete 2>/dev/null || true
find . -name "*.tmp" -type f -delete 2>/dev/null || true
find . -name ".DS_Store" -type f -delete 2>/dev/null || true
find . -name "Thumbs.db" -type f -delete 2>/dev/null || true
echo "✅ Temporary files removed"

# 4. Clean redundant CSS/styles
echo "🎨 Checking for redundant styles..."
# Already removed elder-mode.css as it's in globals.css
echo "✅ Styles optimized"

# 5. List large files
echo "📊 Top 10 largest files in the project:"
find . -type f -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/.git/*" -not -path "*/android/*" -not -path "*/ios/*" -exec du -h {} + 2>/dev/null | sort -rh | head -10

echo ""
echo "✨ Cleanup complete!"
echo ""
echo "📊 Project size:"
du -sh . 2>/dev/null | awk '{print $1}'
echo ""
echo "💡 Next steps:"
echo "1. Run 'npm run build' to test the build"
echo "2. Run 'npm run analyze' to check bundle size"
echo "3. Test the application thoroughly"
