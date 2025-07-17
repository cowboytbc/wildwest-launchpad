#!/bin/bash

# 🚀 Wild West Launchpad - Deployment Script
# Repository: wildwest-launchpad (already created with secrets)

echo "🎯 Wild West Launchpad - Ready for Deployment!"
echo ""
echo "✅ Repository: wildwest-launchpad (created)"
echo "✅ Secrets: Already configured"
echo "✅ Storage: wildwest-banner-storage (existing)"
echo ""

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: Please run this script from the WILDWEST LP directory"
    exit 1
fi

echo "📦 Preparing deployment..."

# Initialize git if not already done
if [ ! -d ".git" ]; then
    echo "🔧 Initializing git repository..."
    git init
fi

# Add all files
echo "📁 Adding all files..."
git add .

# Commit
echo "💾 Committing changes..."
git commit -m "Deploy Wild West Launchpad - Complete Platform

Features:
- Banner advertising system ($200/day top, $100/day bottom)
- Multi-chain token launchpad (Base + Solana)
- Token locking/staking protocols
- 20+ wallet integrations
- GitHub Secrets integration
- Professional UI/UX

Ready for production deployment!"

# Set main branch
echo "🌿 Setting main branch..."
git branch -M main

# Add remote if not exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 Adding remote origin..."
    git remote add origin https://github.com/cowboytbc/wildwest-launchpad.git
fi

# Push to repository
echo "🚀 Deploying to GitHub..."
git push -u origin main

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo ""
echo "🌐 Your platform will be live at:"
echo "   https://cowboytbc.github.io/wildwest-launchpad/"
echo ""
echo "📊 Platform Features:"
echo "   ✅ Banner Ads: $200/day (top) + $100/day (bottom)"
echo "   ✅ Multi-chain Launchpad: Base + Solana"
echo "   ✅ Token Locking/Staking"
echo "   ✅ 20+ Wallet Support"
echo "   ✅ GitHub Secrets Security"
echo ""
echo "⚙️ Next Steps:"
echo "   1. Check GitHub Actions for deployment status"
echo "   2. Enable GitHub Pages (Settings → Pages → main branch)"
echo "   3. Test banner upload functionality"
echo "   4. Check api-status.html for integration verification"
echo ""
echo "🔥 Your crypto launchpad is ready for business!"
