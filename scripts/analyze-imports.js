#!/usr/bin/env node

/**
 * Import Cost Analysis Tool
 *
 * This script analyzes the project's import statements to identify large dependencies
 * that might contribute to bundle size bloat.
 *
 * Usage:
 *   node scripts/analyze-imports.js [--threshold=20] [--types=tsx,ts,jsx,js] [--path=src]
 *
 * Options:
 *   --threshold    Size threshold in KB (default: 20)
 *   --types        File types to scan (default: tsx,ts,jsx,js)
 *   --path         Path to scan (default: src)
 *   --verbose      Show detailed information
 *   --sort         Sort by size (options: asc, desc; default: desc)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  threshold: 20, // Default threshold in KB
  types: ['tsx', 'ts', 'jsx', 'js'],
  path: path.join(process.cwd(), 'src'), // Use absolute path to src in the project root
  verbose: false,
  sort: 'desc',
};

args.forEach(arg => {
  const [key, value] = arg.split('=');
  if (key === '--threshold') options.threshold = parseInt(value);
  if (key === '--types') options.types = value.split(',');
  if (key === '--path') options.path = value;
  if (key === '--verbose') options.verbose = true;
  if (key === '--sort') options.sort = value;
});

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m',
  bold: '\x1b[1m',
};

// Function to search for import statements in a file
function findImportsInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const importPattern = /import\s+(?:{[\s\w,]*}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g;

  const imports = [];
  let match;

  while ((match = importPattern.exec(content)) !== null) {
    const importPath = match[1];
    // Filter out relative imports, focus on npm packages
    if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
      // Extract root package name (for deep imports like lodash/map)
      const packageName = importPath.split('/')[0];
      imports.push(packageName);
    }
  }

  return imports;
}

// Function to recursively walk a directory
function walkDir(dir, fileTypes) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      // Recurse into subdirectory
      results = results.concat(walkDir(filePath, fileTypes));
    } else {
      // Check file extension
      const ext = path.extname(filePath).substring(1);
      if (fileTypes.includes(ext)) {
        results.push(filePath);
      }
    }
  });

  return results;
}

// Function to get package size from package.json or node_modules
function getPackageSize(packageName) {
  try {
    // Try to find the package in node_modules
    const packageJsonPath = path.join(process.cwd(), 'node_modules', packageName, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      // Get directory size recursively (approximate bundle size)
      const packageDir = path.join(process.cwd(), 'node_modules', packageName);
      const size = getDirSize(packageDir);
      return size / 1024; // Convert to KB
    }

    return 0; // Package not found
  } catch (error) {
    console.error(`Error getting size for ${packageName}: ${error.message}`);
    return 0;
  }
}

// Function to recursively get directory size
function getDirSize(dirPath) {
  let size = 0;

  try {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Recurse into subdirectory
        size += getDirSize(filePath);
      } else {
        // Add file size
        size += stat.size;
      }
    }
  } catch (error) {
    // Ignore errors (e.g., permission denied)
  }

  return size;
}

// Function to format size with appropriate units
function formatSize(sizeInKB) {
  if (sizeInKB < 1024) {
    return `${sizeInKB.toFixed(2)} KB`;
  } else {
    return `${(sizeInKB / 1024).toFixed(2)} MB`;
  }
}

// Function to get severity color based on size
function getSeverityColor(sizeInKB) {
  if (sizeInKB < 50) return colors.green;
  if (sizeInKB < 100) return colors.yellow;
  if (sizeInKB < 500) return colors.brightYellow;
  return colors.red;
}

// Function to generate recommendation based on size
function getRecommendation(packageName, sizeInKB) {
  if (sizeInKB < 20) return 'No action needed';

  const recommendations = {
    '@react-email/render': 'Lazy load with dynamic import in server components only',
    '@react-email/components': 'Lazy load with dynamic import in server components only',
    'html-to-text': 'Use dynamic import to lazy load',
    'framer-motion': 'Consider lazy loading animations or using CSS alternatives',
    '@mui/material': 'Import individual components, not the entire library',
    '@mui/icons-material': 'Import only needed icons, not the entire library',
    '@sentry/nextjs': 'Split into client and server modules',
    recharts: 'Lazy load inside chart components',
    'react-window': 'Consider using CSS virtualization for smaller lists',
    'date-fns': 'Import individual functions, not the entire library',
    lodash: 'Import individual functions, not the entire library',
  };

  const defaultRecommendations = [
    'Consider lazy loading',
    'Import only needed components',
    'Use dynamic import to split chunks',
    'Evaluate if this dependency is necessary',
  ];

  return (
    recommendations[packageName] ||
    defaultRecommendations[Math.floor(Math.random() * defaultRecommendations.length)]
  );
}

console.log(`\n${colors.bold}${colors.brightBlue}Import Cost Analysis Tool${colors.reset}\n`);
console.log(
  `Analyzing ${colors.cyan}${options.path}${colors.reset} for large dependencies (threshold: ${colors.yellow}${options.threshold} KB${colors.reset})...\n`,
);

// Get all files to analyze
const files = walkDir(options.path, options.types);
console.log(`Found ${colors.green}${files.length}${colors.reset} files to analyze\n`);

// Track packages and their occurrences
const packageMap = new Map();

// Process each file
files.forEach(file => {
  const relativeFilePath = path.relative(process.cwd(), file);
  const imports = findImportsInFile(file);

  if (options.verbose && imports.length > 0) {
    console.log(`${colors.cyan}${relativeFilePath}${colors.reset}:`);
    imports.forEach(importName => console.log(`  - ${importName}`));
    console.log();
  }

  // Track packages and count occurrences
  imports.forEach(packageName => {
    if (packageMap.has(packageName)) {
      packageMap.set(packageName, packageMap.get(packageName) + 1);
    } else {
      packageMap.set(packageName, 1);
    }
  });
});

// Get sizes and sort by size
let packageInfo = [];

for (const [packageName, count] of packageMap.entries()) {
  const sizeInKB = getPackageSize(packageName);

  if (sizeInKB >= options.threshold) {
    packageInfo.push({
      name: packageName,
      size: sizeInKB,
      count,
      recommendation: getRecommendation(packageName, sizeInKB),
    });
  }
}

// Sort packages by size
if (options.sort === 'asc') {
  packageInfo.sort((a, b) => a.size - b.size);
} else {
  packageInfo.sort((a, b) => b.size - a.size);
}

// Print results in a table
console.log(`${colors.bold}Large Dependencies (>= ${options.threshold} KB):${colors.reset}\n`);

if (packageInfo.length === 0) {
  console.log(`${colors.green}No packages found exceeding the size threshold.${colors.reset}\n`);
} else {
  // Calculate column widths for pretty formatting
  const nameWidth = Math.max(...packageInfo.map(p => p.name.length), 'Package'.length);
  const sizeWidth = Math.max(...packageInfo.map(p => formatSize(p.size).length), 'Size'.length);
  const countWidth = Math.max(...packageInfo.map(p => String(p.count).length), 'Imports'.length);

  // Print header
  console.log(
    `${colors.bold}${'Package'.padEnd(nameWidth)} | ${'Size'.padEnd(sizeWidth)} | ${'Imports'.padEnd(countWidth)} | Recommendation${colors.reset}`,
  );
  console.log('-'.repeat(nameWidth + sizeWidth + countWidth + 45));

  // Print each package
  packageInfo.forEach(pkg => {
    const formattedSize = formatSize(pkg.size);
    const coloredSize = `${getSeverityColor(pkg.size)}${formattedSize}${colors.reset}`;

    console.log(
      `${pkg.name.padEnd(nameWidth)} | ${coloredSize.padEnd(sizeWidth + 10)} | ${String(pkg.count).padEnd(countWidth)} | ${pkg.recommendation}`,
    );
  });

  console.log('\n');
}

// Print summary
const totalSize = packageInfo.reduce((acc, pkg) => acc + pkg.size, 0);
console.log(`${colors.bold}Summary:${colors.reset}`);
console.log(`Total dependencies analyzed: ${colors.cyan}${packageMap.size}${colors.reset}`);
console.log(`Large dependencies found: ${colors.yellow}${packageInfo.length}${colors.reset}`);
console.log(
  `Combined size of large dependencies: ${getSeverityColor(totalSize)}${formatSize(totalSize)}${colors.reset}`,
);

console.log(`\n${colors.bold}${colors.brightBlue}Analysis complete${colors.reset}\n`);
