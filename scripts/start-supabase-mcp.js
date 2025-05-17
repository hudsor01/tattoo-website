#!/usr/bin/env node
/**
 * Helper script to start the Supabase MCP server with environment variables
 * loaded from the .env.mcp-server file
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.mcp-server
const envPath = path.resolve(__dirname, '../.env.mcp-server');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

// Merge with process.env
for (const key in envConfig) {
  process.env[key] = envConfig[key];
}

// Extract the access token from env variables
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

// Start the MCP server with the environment variables set
const args = [
  '-y',
  '@supabase/mcp-server-supabase@latest',
  '--access-token',
  accessToken
];

// Process any additional arguments
process.argv.slice(2).forEach(arg => {
  args.push(arg);
});

// Spawn the MCP server process
const serverProcess = spawn('npx', args, {
  stdio: 'inherit',
  env: process.env
});

// Forward signals to the child process
['SIGINT', 'SIGTERM', 'SIGHUP'].forEach(signal => {
  process.on(signal, () => {
    serverProcess.kill(signal);
  });
});

// Exit with the same code as the child process
serverProcess.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code);
  }
});