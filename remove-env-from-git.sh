#!/bin/bash

# Script to remove .env.production from Git tracking

echo "🔧 Removing .env.production from Git tracking..."

# Navigate to project directory
cd /Users/richard/Developer/tattoo-website

# Remove from Git tracking but keep the local file
git rm --cached .env.production

echo "✅ .env.production removed from Git tracking"
echo "📋 Current Git status:"
git status --short

echo ""
echo "🚨 NEXT STEPS:"
echo "1. Commit this change: git commit -m 'Remove sensitive env file from tracking'"
echo "2. Push to remove from remote: git push"
echo "3. The file will stay on your local machine but won't be tracked by Git anymore"
