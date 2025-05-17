#!/bin/bash

echo "🚀 Setting up Vercel deployment for Fernando Govea Tattoo Website"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm i -g vercel
fi

# Login to Vercel
echo "Logging in to Vercel..."
vercel login

# Link or create project
echo "Linking to Vercel project..."
vercel

echo "✅ Vercel setup complete!"
echo ""
echo "Next steps:"
echo "1. Run ./push-env-to-vercel.sh to push environment variables"
echo "2. Run 'vercel --prod' to deploy to production"
echo "3. Add your custom domain in Vercel dashboard"