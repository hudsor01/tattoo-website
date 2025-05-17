// @ts-check
/**
 * This script verifies that all Model Context Protocol (MCP) servers
 * configured in mcp.json are working correctly.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Load the MCP configuration
const mcpConfigPath = path.join(process.cwd(), 'mcp.json');
let mcpConfig;

try {
  const configFile = fs.readFileSync(mcpConfigPath, 'utf8');
  mcpConfig = JSON.parse(configFile);
} catch (error) {
  console.error(`Error loading MCP configuration: ${error.message}`);
  process.exit(1);
}

if (!mcpConfig.mcpServers) {
  console.error('Invalid MCP configuration: mcpServers not found');
  process.exit(1);
}

/**
 * Verifies a single MCP server by spawning a process with the specified command and args
 * @param {string} serverName - The name of the server
 * @param {object} serverConfig - The server configuration
 * @returns {Promise<boolean>} - Whether the server verification succeeded
 */
async function verifyServer(serverName, serverConfig) {
  return new Promise(resolve => {
    console.log(`\nVerifying MCP server: ${serverName}`);

    // Skip servers with 'runtime' property since they're handled differently
    if (serverConfig.runtime) {
      console.log(`  Skipping ${serverName} (runtime: ${serverConfig.runtime})`);
      return resolve(true);
    }

    if (!serverConfig.command || !serverConfig.args) {
      console.error(`  Error: Invalid configuration for ${serverName}`);
      return resolve(false);
    }

    const command = serverConfig.command;
    const args = serverConfig.args;

    console.log(`  Command: ${command} ${args.join(' ')}`);

    const env = { ...process.env };
    if (serverConfig.env) {
      Object.entries(serverConfig.env).forEach(([key, value]) => {
        // Handle variable substitution for environment variables
        if (typeof value === 'string' && value.startsWith('${env:')) {
          const envVar = value.match(/\$\{env:([^}]+)\}/)?.[1];
          if (envVar && process.env[envVar]) {
            env[key] = process.env[envVar];
          } else {
            console.warn(`  Warning: Environment variable ${envVar} not set for ${serverName}`);
          }
        } else {
          env[key] = value;
        }
      });
    }

    const serverProcess = spawn(command, args, { env });

    // Add a timeout to kill the process after a few seconds
    const timeout = setTimeout(() => {
      console.log(`  Success: Server ${serverName} started successfully`);
      serverProcess.kill();
      resolve(true);
    }, 5000);

    serverProcess.on('error', error => {
      clearTimeout(timeout);
      console.error(`  Error starting ${serverName}: ${error.message}`);
      resolve(false);
    });

    serverProcess.on('exit', code => {
      clearTimeout(timeout);
      if (code !== 0 && code !== null) {
        console.error(`  Error: Server ${serverName} exited with code ${code}`);
        resolve(false);
      }
    });

    serverProcess.stdout.on('data', data => {
      const output = data.toString().trim();
      if (output.includes('error') || output.includes('Error')) {
        console.error(`  Server output: ${output}`);
      }
    });

    serverProcess.stderr.on('data', data => {
      console.error(`  Server error: ${data.toString().trim()}`);
    });
  });
}

/**
 * Main function to verify all MCP servers
 */
async function main() {
  console.log('Verifying MCP servers...');

  const serverNames = Object.keys(mcpConfig.mcpServers);
  if (serverNames.length === 0) {
    console.log('No MCP servers configured.');
    return;
  }

  console.log(`Found ${serverNames.length} MCP servers to verify.`);

  let allSuccess = true;

  for (const serverName of serverNames) {
    const serverConfig = mcpConfig.mcpServers[serverName];
    const success = await verifyServer(serverName, serverConfig);
    allSuccess = allSuccess && success;
  }

  console.log('\n===== Verification Summary =====');
  if (allSuccess) {
    console.log('All MCP servers verified successfully!');
  } else {
    console.error('Some MCP servers failed verification.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});
