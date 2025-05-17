/**
 * Refactoring Script for Toast and Browser Utilities
 * 
 * This script updates import paths throughout the codebase to use the standardized
 * implementations for toast notifications and browser utilities.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define the search and replace rules
const importReplacements = [
  // Toast imports
  {
    from: /import [^;]+ from ['"]@\/hooks\/useToast['"]/g,
    to: "import { useToast } from '@/hooks/use-toast'",
    description: 'Replace camelCase toast imports with kebab-case'
  },
  {
    from: /import [^;]+ from ['"]@\/components\/ui\/use-toast['"]/g,
    to: "import { useToast } from '@/hooks/use-toast'",
    description: 'Replace shadcn/ui toast imports with standardized implementation'
  },
  {
    from: /import [^;]+ from ['"]@\/store\/useToastStore['"]/g,
    to: "import { useToast } from '@/hooks/use-toast'",
    description: 'Replace toast store imports with standardized implementation'
  },
  
  // Browser utilities
  {
    from: /import [^;]+ from ['"]@\/utils\/browser['"]/g,
    to: "import { getUserAgent, isMobileDevice, getDeviceInfo } from '@/lib/browser'",
    description: 'Replace browser utils with standardized implementation'
  },
  {
    from: /import [^;]+ from ['"]@\/utils\/browser-safe['"]/g,
    to: "import { isBrowser, safeWindow, safeDocument, safeNavigator } from '@/lib/browser'",
    description: 'Replace browser-safe utils with standardized implementation'
  },
  {
    from: /import [^;]+ from ['"]@\/lib\/utils\/browser['"]/g,
    to: "import { isBrowser, getUserAgent, isMobileDevice } from '@/lib/browser'",
    description: 'Replace lib/utils/browser with standardized implementation'
  },
];

// Find all TypeScript and TSX files in the src directory
function findTsFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively search subdirectories
      results = results.concat(findTsFiles(filePath));
    } else if (/\.(ts|tsx)$/.test(file)) {
      // Include TypeScript and TSX files
      results.push(filePath);
    }
  }
  
  return results;
}

// Process each file and apply the replacements
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  for (const rule of importReplacements) {
    const originalContent = content;
    content = content.replace(rule.from, rule.to);
    
    if (content !== originalContent) {
      modified = true;
      console.log(`- Applied rule: ${rule.description} in ${filePath}`);
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${filePath}`);
    return true;
  }
  
  return false;
}

// Main execution
try {
  console.log('Starting refactoring of toast and browser utilities...');
  
  const srcDir = path.join(process.cwd(), 'src');
  const files = findTsFiles(srcDir);
  
  console.log(`Found ${files.length} TypeScript files to process.`);
  
  let updatedCount = 0;
  
  for (const file of files) {
    if (processFile(file)) {
      updatedCount++;
    }
  }
  
  console.log(`Refactoring complete. Updated ${updatedCount} files.`);
  
  // Create a git commit with the changes
  if (updatedCount > 0) {
    try {
      execSync('git add src/');
      execSync('git commit -m "refactor: Standardize toast and browser utility imports"');
      console.log('Created git commit with changes.');
    } catch (error) {
      console.warn('Could not create git commit:', error.message);
    }
  }
  
} catch (error) {
  console.error('Error during refactoring:', error);
  process.exit(1);
}
