#!/usr/bin/env node

/**
 * Script to help identify files that need Prisma type refactoring
 * Run with: node scripts/find-inline-types.js
 */

const fs = require('fs');
const path = require('path');

// Prisma model names to look for
const PRISMA_MODELS = [
  'User', 'Session', 'Account', 'Verification', 'RateLimit',
  'Customer', 'Appointment', 'Note', 'Contact', 'Payment',
  'CalBooking', 'CalEventType', 'CalMetricsSnapshot',
  'CalIntegrationHealth', 'CalSyncState', 'CalAnalyticsEvent',
  'CalServiceAnalytics', 'CalUserAnalytics', 'CalPerformanceMetrics',
  'CalBookingFunnel', 'CalErrorLog', 'CalGDPRRequest',
  'CalDataRetention', 'CalCacheEntry', 'Setting',
  'SettingsHistory', 'SettingsBackup', 'Booking',
  'BookingAttendee', 'TattooDesign', 'Artist',
  'CalWebhookEvent', 'CalRealtimeMetrics', 'Permission'
];

// Directories to skip
const SKIP_DIRS = ['node_modules', '.git', '.next', 'dist', 'build'];

// File patterns to check
const FILE_PATTERNS = ['.ts', '.tsx'];

// Results storage
const results = {
  needsRefactoring: [],
  alreadyUsingPrisma: [],
  skipped: []
};

function shouldSkipFile(filePath) {
  // Skip type definition files
  if (filePath.endsWith('.d.ts')) return true;
  
  // Skip files in types directory
  if (filePath.includes('/types/')) return true;
  
  // Skip prisma-types.ts
  if (filePath.includes('prisma-types.ts')) return true;
  
  return false;
}

function checkFile(filePath) {
  if (shouldSkipFile(filePath)) {
    results.skipped.push(filePath);
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Check if file imports from @prisma/client
    const hasPrismaImport = content.includes('@prisma/client');
    
    // Check for inline types/interfaces matching Prisma models
    let hasInlineTypes = false;
    const foundModels = [];
    
    for (const model of PRISMA_MODELS) {
      // Look for interface ModelName or type ModelName =
      const interfaceRegex = new RegExp(`(?:export\\s+)?interface\\s+${model}\\s*{`, 'g');
      const typeRegex = new RegExp(`(?:export\\s+)?type\\s+${model}\\s*=\\s*{`, 'g');
      
      if (interfaceRegex.test(content) || typeRegex.test(content)) {
        hasInlineTypes = true;
        foundModels.push(model);
      }
    }
    
    if (hasInlineTypes) {
      results.needsRefactoring.push({
        file: relativePath,
        models: foundModels,
        hasPrismaImport
      });
    } else if (hasPrismaImport) {
      // Check if using Prisma.GetPayload pattern
      if (content.includes('Prisma.') && content.includes('GetPayload')) {
        results.alreadyUsingPrisma.push(relativePath);
      }
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
  }
}

function scanDirectory(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!SKIP_DIRS.includes(item)) {
          scanDirectory(fullPath);
        }
      } else if (stat.isFile()) {
        if (FILE_PATTERNS.some(ext => fullPath.endsWith(ext))) {
          checkFile(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error.message);
  }
}

// Start scanning from src directory
console.log('🔍 Scanning for inline types that should use Prisma types...\n');
scanDirectory(path.join(process.cwd(), 'src'));

// Display results
console.log('\n📊 RESULTS:\n');

if (results.needsRefactoring.length > 0) {
  console.log('❌ Files that need refactoring:');
  results.needsRefactoring.forEach(({ file, models, hasPrismaImport }) => {
    console.log(`\n  ${file}`);
    console.log(`    Models: ${models.join(', ')}`);
    console.log(`    Has Prisma import: ${hasPrismaImport ? 'Yes' : 'No'}`);
    
    if (!hasPrismaImport) {
      console.log('    Action: Add import type { Prisma } from \'@prisma/client\';');
    }
    console.log('    Action: Replace inline types with Prisma.ModelGetPayload<{}>');
  });
}

if (results.alreadyUsingPrisma.length > 0) {
  console.log('\n✅ Files already using Prisma types correctly:');
  results.alreadyUsingPrisma.forEach(file => {
    console.log(`  ${file}`);
  });
}

console.log('\n📈 Summary:');
console.log(`  Files needing refactoring: ${results.needsRefactoring.length}`);
console.log(`  Files already using Prisma: ${results.alreadyUsingPrisma.length}`);
console.log(`  Files skipped: ${results.skipped.length}`);

// Generate refactoring commands
if (results.needsRefactoring.length > 0) {
  console.log('\n🛠️  Suggested refactoring steps:\n');
  results.needsRefactoring.forEach(({ file, models }) => {
    console.log(`# ${file}`);
    models.forEach(model => {
      console.log(`# Replace: interface ${model} { ... }`);
      console.log(`# With: type ${model} = Prisma.${model}GetPayload<{ /* add includes/selects */ }>;`);
    });
    console.log('');
  });
}
