#!/bin/bash

# Determine shell profile file
if [ -f ~/.zshrc ]; then
  PROFILE_FILE=~/.zshrc
elif [ -f ~/.bash_profile ]; then
  PROFILE_FILE=~/.bash_profile
else
  PROFILE_FILE=~/.profile
fi

echo "Adding Supabase environment variables to $PROFILE_FILE..."

# Get variables from .env file
SUPABASE_URL=$(grep SUPABASE_URL= .env | cut -d '"' -f 2)
SUPABASE_SERVICE_ROLE_KEY=$(grep SUPABASE_SERVICE_ROLE_KEY= .env | cut -d '=' -f 2)
SUPABASE_ACCESS_TOKEN=$(grep SUPABASE_ACCESS_TOKEN= .env | cut -d '"' -f 2)

# Add or update variables in profile file
if grep -q "export SUPABASE_URL" "$PROFILE_FILE"; then
  # Update existing entries
  sed -i '' "s|export SUPABASE_URL=.*|export SUPABASE_URL=\"$SUPABASE_URL\"|" "$PROFILE_FILE"
  sed -i '' "s|export SUPABASE_SERVICE_ROLE_KEY=.*|export SUPABASE_SERVICE_ROLE_KEY=\"$SUPABASE_SERVICE_ROLE_KEY\"|" "$PROFILE_FILE"
  sed -i '' "s|export SUPABASE_ACCESS_TOKEN=.*|export SUPABASE_ACCESS_TOKEN=\"$SUPABASE_ACCESS_TOKEN\"|" "$PROFILE_FILE"
else
  # Add new entries
  echo "" >> "$PROFILE_FILE"
  echo "# Supabase MCP environment variables" >> "$PROFILE_FILE"
  echo "export SUPABASE_URL=\"$SUPABASE_URL\"" >> "$PROFILE_FILE"
  echo "export SUPABASE_SERVICE_ROLE_KEY=\"$SUPABASE_SERVICE_ROLE_KEY\"" >> "$PROFILE_FILE"
  echo "export SUPABASE_ACCESS_TOKEN=\"$SUPABASE_ACCESS_TOKEN\"" >> "$PROFILE_FILE"
fi

echo "Environment variables have been added to $PROFILE_FILE"
echo "Run 'source $PROFILE_FILE' to apply changes to your current session"

# Also set them for the current session
export SUPABASE_URL="$SUPABASE_URL"
export SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"
export SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN"

echo "Variables also exported to current session"