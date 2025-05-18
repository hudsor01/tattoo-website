#!/usr/bin/env node

/**
 * Quick check of Cal.com integration status
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Cal.com Integration Status\n');

// Check environment variables
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasCalUsername = envContent.includes('NEXT_PUBLIC_CAL_USERNAME=');
    const hasWebhookSecret = envContent.includes('CAL_WEBHOOK_SECRET=');
    const hasResendKey = envContent.includes('RESEND_API_KEY=');
    
    console.log('✅ Environment Variables:');
    console.log(`  ${hasCalUsername ? '✓' : '✗'} Cal.com username configured`);
    console.log(`  ${hasWebhookSecret ? '✓' : '✗'} Webhook secret configured`);
    console.log(`  ${hasResendKey ? '✓' : '✗'} Resend API key configured`);
} else {
    console.log('❌ No .env file found');
}

// Check key files exist
const filesToCheck = [
    'src/app/booking/page.tsx',
    'src/app/api/cal/webhook/route.ts',
    'src/lib/cal/config.ts',
    'src/lib/cal/email-integration.ts',
    'src/types/cal-types.ts',
    'src/app/admin-dashboard/cal-bookings/page.tsx'
];

console.log('\n✅ Integration Files:');
filesToCheck.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    const exists = fs.existsSync(filePath);
    console.log(`  ${exists ? '✓' : '✗'} ${file}`);
});

// Check if Cal.com package is installed
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const hasCalPackage = packageJson.dependencies && packageJson.dependencies['@calcom/embed-react'];
    console.log(`\n✅ Dependencies:`);
    console.log(`  ${hasCalPackage ? '✓' : '✗'} @calcom/embed-react installed`);
}

console.log('\n📝 Next Steps:');
console.log('1. Ensure all environment variables are properly set');
console.log('2. Visit http://localhost:3000/booking to test the embed');
console.log('3. Configure webhooks in Cal.com dashboard');
console.log('4. Test booking flow with node scripts/test-booking.js');
console.log('5. Check email notifications in Resend dashboard\n');