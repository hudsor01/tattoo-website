#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Check if the server is running
function checkServerRunning() {
  return new Promise((resolve) => {
    const http = require('http');
    const req = http.get('http://localhost:3000', (res) => {
      resolve(true);
      req.destroy();
    });
    
    req.on('error', () => {
      resolve(false);
      req.destroy();
    });
    
    req.setTimeout(2000, () => {
      resolve(false);
      req.destroy();
    });
  });
}

async function main() {
  console.log('🚀 Tattoo Website Test Runner');
  console.log('----------------------------');
  
  // Check if the server is running
  const isServerRunning = await checkServerRunning();
  if (!isServerRunning) {
    console.log('⚠️ Warning: Local server does not appear to be running.');
    console.log('Please start the development server with:');
    console.log('  npm run dev');
    console.log('');
    console.log('Continue anyway? (tests will likely fail) [y/N]');
    
    process.stdin.setEncoding('utf8');
    process.stdin.once('data', (data) => {
      const input = data.toString().trim().toLowerCase();
      if (input === 'y' || input === 'yes') {
        runTests();
      } else {
        console.log('Tests aborted.');
        process.exit(0);
      }
    });
  } else {
    console.log('✅ Local server detected at http://localhost:3000');
    runTests();
  }
}

function runTests() {
  console.log('📋 Running automated tests...');
  
  const testProcess = spawn('node', [path.join(__dirname, 'basic-site-test.js')], {
    stdio: 'inherit',
    shell: true
  });
  
  testProcess.on('close', (code) => {
    if (code === 0) {
      console.log('🎉 All tests completed successfully!');
    } else {
      console.log(`❌ Tests failed with exit code: ${code}`);
    }
  });
}

main();