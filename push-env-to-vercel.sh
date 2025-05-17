#!/bin/bash

echo "🔐 Pushing environment variables to Vercel..."

# Check if .env.backup exists
if [ ! -f .env.backup ]; then
    echo "❌ .env.backup not found! Creating backup..."
    cp .env .env.backup
fi

# Sensitive environment variables
SENSITIVE_VARS=(
    "DATABASE_URL"
    "DIRECT_URL" 
    "SUPABASE_SERVICE_ROLE_KEY"
    "SUPABASE_JWT_SECRET"
    "RESEND_API_KEY"
    "JWT_SECRET"
    "ADMIN_PASSWORD"
    "SUPABASE_DB_PASSWORD"
    "SUPABASE_ACCESS_TOKEN"
)

# Read .env.backup and push each variable
while IFS='=' read -r key value
do
    # Skip comments and empty lines
    if [[ ! "$key" =~ ^#.*$ ]] && [[ -n "$key" ]]; then
        # Clean the value
        value="${value%\"}"
        value="${value#\"}"
        
        # Check if it's a sensitive variable
        IS_SENSITIVE=""
        for sensitive_var in "${SENSITIVE_VARS[@]}"; do
            if [[ "$key" == "$sensitive_var" ]]; then
                IS_SENSITIVE="--sensitive"
                break
            fi
        done
        
        echo "Adding $key..."
        echo "$value" | vercel env add "$key" production --yes $IS_SENSITIVE
        echo "$value" | vercel env add "$key" preview --yes $IS_SENSITIVE
    fi
done < .env.backup

# Update production-specific values
echo "Updating production-specific values..."
echo "https://fernandogoveatatoo.com" | vercel env add NEXT_PUBLIC_BASE_URL production --yes
echo "https://fernandogoveatatoo.com" | vercel env add NEXT_PUBLIC_APP_URL production --yes

echo "✅ Environment variables pushed to Vercel!"