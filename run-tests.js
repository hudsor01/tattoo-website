const { execSync } = require('child_process');

console.log('🚀 Starting test suite...\n');

// Helper function to run commands
function runCommand(command, description) {
  console.log(`📋 ${description}...`);
  try {
    const output = execSync(command, { 
      encoding: 'utf8',
      stdio: 'pipe',
      env: { ...process.env, CI: 'true' }
    });
    console.log(`✅ ${description} - PASSED\n`);
    return { success: true, output };
  } catch (error) {
    console.log(`❌ ${description} - FAILED`);
    console.log(error.stdout || error.stderr || error.message);
    console.log('\n');
    return { success: false, error: error.message };
  }
}

// Start Next.js server in the background
console.log('🌐 Starting development server...');
const { spawn } = require('child_process');
const server = spawn('npm', ['run', 'dev'], {
  detached: false,
  stdio: 'pipe'
});

// Wait for server to start
setTimeout(() => {
  console.log('✅ Server started\n');
  
  // Run E2E tests
  console.log('🧪 Running E2E tests...\n');
  
  const tests = [
    { file: 'homepage.spec.ts', name: 'Homepage Tests' },
    { file: 'about.spec.ts', name: 'About Page Tests' },
    { file: 'services.spec.ts', name: 'Services Page Tests' },
    { file: 'gallery.spec.ts', name: 'Gallery Page Tests' },
    { file: 'faq.spec.ts', name: 'FAQ Page Tests' },
    { file: 'contact.spec.ts', name: 'Contact Page Tests' },
    { file: 'booking.spec.ts', name: 'Booking Page Tests' }
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = runCommand(
      `npx playwright test tests/e2e/${test.file}`,
      test.name
    );
    results.push({ ...test, ...result });
  }
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log('================');
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);
  
  // Kill server
  server.kill();
  
  process.exit(failed > 0 ? 1 : 0);
}, 5000);

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
  server.kill();
  process.exit(0);
});