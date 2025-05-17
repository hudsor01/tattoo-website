#!/bin/bash
# setup-mcp-servers.sh - Script to configure and start MCP servers for the project

# Ensure we're in the project root directory
cd "$(dirname "$0")/.." || exit

# Copy the combined MCP configuration to the standard MCP configuration file
if [ -f mcp.combined.json ]; then
  echo "Copying combined MCP configuration..."
  cp mcp.combined.json mcp.json
  echo "MCP configuration updated."
else
  echo "Using existing mcp.json configuration."
fi

# Install necessary packages
echo "Installing required packages..."
npm install -g @mseep/bifrost-mcp

# Check if an MCP server is already running
if nc -z localhost 4333 &> /dev/null; then
  echo "An MCP server is already running on port 4333."
  echo "Using the existing server..."
  echo "To stop the existing server, run: pkill -f 'bifrost-mcp'"
else
  # Start the MCP server with authentication
  echo "Starting MCP server with Sentry authentication..."
  npx -y @mseep/bifrost-mcp --auth-token "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" &
  
  # Wait for server to start
  echo "Waiting for MCP server to start..."
  sleep 3
  
  if nc -z localhost 4333 &> /dev/null; then
    echo "MCP server started successfully!"
  else
    echo "Failed to start MCP server. Check errors above."
    echo "Trying alternative approach with VSCode task..."
    # Try to run the VSCode task directly
    code --folder-uri "file:///Users/richard/Developer/tattoo-website" -r -g "tasks.json" --execute-command "workbench.action.tasks.runTask" --args "Start VSCode DevTools MCP Server"
  fi
fi

echo ""
echo "Your MCP configuration has been updated successfully."
echo "You can now use the MCP servers in your project."
echo ""
echo "To verify all MCP servers, run:"
echo "  node scripts/verify-mcp-servers.js"

echo ""
echo "Your MCP configuration has been updated successfully."
echo "You can now use the MCP servers in your project."
echo ""
echo "To verify all MCP servers, run:"
echo "  node scripts/verify-mcp-servers.js"
