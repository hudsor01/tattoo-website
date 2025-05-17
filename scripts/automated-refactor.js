#!/usr/bin/env node

/**
 * Automated Refactoring Tool
 * 
 * This script reads the analysis results from the mcp-analyze-project.js script
 * and automatically refactors the codebase to address identified issues.
 * 
 * Usage:
 *   node scripts/automated-refactor.js [--dry-run] [--fix=all|imports|toast|browser|naming]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const projectRoot = process.cwd();
const srcDir = path.join(projectRoot, 'src');
const analysisDir = path.join(projectRoot, 'analysis-output');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  dryRun: args.includes('--dry-run'),
  fix: 'all' // Default to fixing everything
};

// Parse specific fixes
const fixArg = args.find(arg => arg.startsWith('--fix='));
if (fixArg) {
  options.fix = fixArg.split('=')[1];
}

// Confirm analysis files exist
if (!fs.existsSync(analysisDir)) {
  console.error('Analysis directory not found. Run mcp-analyze-project.js first.');
  process.exit(1);
}

// Load analysis files
let uiFrameworkAnalysis;
let duplicateIdentifiers;
let importAnalysis;
let fileOrganization;

try {
  uiFrameworkAnalysis = require(path.join(analysisDir, 'ui-framework-analysis.json'));
  duplicateIdentifiers = require(path.join(analysisDir, 'duplicate-identifiers.json'));
  importAnalysis = require(path.join(analysisDir, 'import-analysis.json'));
  fileOrganization = require(path.join(analysisDir, 'file-organization.json'));
} catch (error) {
  console.error('Error loading analysis files:', error.message);
  console.error('Make sure you\'ve run mcp-analyze-project.js first.');
  process.exit(1);
}

// REFACTOR 1: Standardize Toast Implementation
function refactorToastImplementation() {
  console.log('Refactoring toast implementations...');
  
  // Define replacement patterns
  const replacements = [
    {
      from: /import\s+[^;]*\s+from\s+['"]@\/hooks\/useToast['"]/g,
      to: "import { useToast } from '@/hooks/use-toast'",
    },
    {
      from: /import\s+[^;]*\s+from\s+['"]@\/components\/ui\/use-toast['"]/g,
      to: "import { useToast } from '@/hooks/use-toast'",
    },
    {
      from: /import\s+[^;]*\s+from\s+['"]@\/store\/useToastStore['"]/g,
      to: "import { useToast } from '@/hooks/use-toast'",
    },
    {
      from: /import\s+[^;]*\s+from\s+['"]@\/lib\/utils\/toast['"]/g,
      to: "import { toast, success, error, warning } from '@/hooks/use-toast'",
    }
  ];
  
  let updatedFiles = 0;
  
  function processFile(filePath) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Apply each replacement pattern
    for (const replacement of replacements) {
      const originalContent = content;
      content = content.replace(replacement.from, replacement.to);
      
      if (content !== originalContent) {
        hasChanges = true;
      }
    }
    
    // Write changes if needed
    if (hasChanges && !options.dryRun) {
      fs.writeFileSync(filePath, content);
      updatedFiles++;
      console.log(`  Updated: ${path.relative(projectRoot, filePath)}`);
    } else if (hasChanges && options.dryRun) {
      updatedFiles++;
      console.log(`  Would update: ${path.relative(projectRoot, filePath)}`);
    }
  }
  
  function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else {
        processFile(fullPath);
      }
    }
  }
  
  walkDir(srcDir);
  
  if (options.dryRun) {
    console.log(`Would update ${updatedFiles} files with standardized toast imports.`);
  } else {
    console.log(`Updated ${updatedFiles} files with standardized toast imports.`);
  }
}

// REFACTOR 2: Standardize Browser Utilities
function refactorBrowserUtilities() {
  console.log('Refactoring browser utilities...');
  
  // Define replacement patterns
  const replacements = [
    {
      from: /import\s+[^;]*\s+from\s+['"]@\/utils\/browser['"]/g,
      to: "import { getUserAgent, isMobileDevice, getDeviceInfo } from '@/lib/browser'",
    },
    {
      from: /import\s+[^;]*\s+from\s+['"]@\/utils\/browser-safe['"]/g,
      to: "import { isBrowser, safeWindow, safeDocument } from '@/lib/browser'",
    },
    {
      from: /import\s+[^;]*\s+from\s+['"]@\/lib\/utils\/browser['"]/g,
      to: "import { isBrowser, getUserAgent, isMobileDevice } from '@/lib/browser'",
    }
  ];
  
  let updatedFiles = 0;
  
  function processFile(filePath) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Apply each replacement pattern
    for (const replacement of replacements) {
      const originalContent = content;
      content = content.replace(replacement.from, replacement.to);
      
      if (content !== originalContent) {
        hasChanges = true;
      }
    }
    
    // Write changes if needed
    if (hasChanges && !options.dryRun) {
      fs.writeFileSync(filePath, content);
      updatedFiles++;
      console.log(`  Updated: ${path.relative(projectRoot, filePath)}`);
    } else if (hasChanges && options.dryRun) {
      updatedFiles++;
      console.log(`  Would update: ${path.relative(projectRoot, filePath)}`);
    }
  }
  
  function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else {
        processFile(fullPath);
      }
    }
  }
  
  walkDir(srcDir);
  
  if (options.dryRun) {
    console.log(`Would update ${updatedFiles} files with standardized browser utility imports.`);
  } else {
    console.log(`Updated ${updatedFiles} files with standardized browser utility imports.`);
  }
}

// REFACTOR 3: Standardize File Naming (kebab-case for hooks, util files, camelCase for routes, PascalCase for components)
function standardizeFileNaming() {
  console.log('Standardizing file naming conventions...');
  
  const renameOperations = [];
  
  // Process naming issues from the analysis
  for (const issue of fileOrganization.namingIssues) {
    const filePath = path.join(projectRoot, issue.file);
    
    if (!fs.existsSync(filePath)) continue;
    
    const dirName = path.dirname(filePath);
    const fileName = path.basename(filePath);
    const fileExt = path.extname(fileName);
    const baseName = fileName.slice(0, -fileExt.length);
    
    let newBaseName = baseName;
    
    // Determine if this is a component file (TSX or has Component in name)
    const isComponent = fileExt === '.tsx' || 
                       baseName.includes('Component') || 
                       baseName.match(/^[A-Z][a-z0-9]+(?:[A-Z][a-z0-9]*)*/);
    
    // Determine if this is a hook file
    const isHook = baseName.startsWith('use') || filePath.includes('/hooks/');
    
    // Determine if this is a util file
    const isUtil = filePath.includes('/utils/') || filePath.includes('/lib/utils/');
    
    if (isComponent) {
      // Convert to PascalCase for components
      newBaseName = baseName
        .replace(/[-_]([a-z])/g, (_, char) => char.toUpperCase())  // Convert kebab/snake case
        .replace(/^[a-z]/, firstChar => firstChar.toUpperCase());  // Capitalize first letter
    } else if (isHook || isUtil) {
      // Convert to kebab-case for hooks and utils
      newBaseName = baseName
        .replace(/([A-Z])/g, '-$1')  // Add hyphens before capital letters
        .replace(/^-/, '')           // Remove leading hyphen
        .toLowerCase();
    }
    
    // Add to rename operations if the name would change
    if (newBaseName !== baseName) {
      const newFileName = newBaseName + fileExt;
      const newFilePath = path.join(dirName, newFileName);
      
      renameOperations.push({
        oldPath: filePath,
        newPath: newFilePath,
        oldName: fileName,
        newName: newFileName,
        type: isComponent ? 'component' : isHook ? 'hook' : isUtil ? 'util' : 'other'
      });
    }
  }
  
  // Execute rename operations
  if (options.dryRun) {
    for (const op of renameOperations) {
      console.log(`  Would rename: ${op.oldName} -> ${op.newName} (${op.type})`);
    }
    console.log(`Would rename ${renameOperations.length} files.`);
  } else {
    for (const op of renameOperations) {
      try {
        // Rename the file
        fs.renameSync(op.oldPath, op.newPath);
        console.log(`  Renamed: ${op.oldName} -> ${op.newName} (${op.type})`);
        
        // Update imports in all files
        updateImportsAfterRename(op.oldPath, op.newPath);
      } catch (error) {
        console.error(`  Error renaming ${op.oldName}:`, error.message);
      }
    }
    console.log(`Renamed ${renameOperations.length} files.`);
  }
}

// Helper function to update imports after file rename
function updateImportsAfterRename(oldPath, newPath) {
  const oldRelativePath = path.relative(projectRoot, oldPath);
  const newRelativePath = path.relative(projectRoot, newPath);
  
  // Skip if paths are the same
  if (oldRelativePath === newRelativePath) return;
  
  const oldBaseName = path.basename(oldPath, path.extname(oldPath));
  const newBaseName = path.basename(newPath, path.extname(newPath));
  
  function processFile(filePath) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Look for imports of the renamed file
    // This is a simplified approach that might need refinement for complex import patterns
    let newContent = content.replace(
      new RegExp(`from\\s+['"]([^\'"]*/${oldBaseName})['"]`, 'g'),
      `from "$1"`
    );
    
    // Write changes if needed
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent);
    }
  }
  
  function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else {
        processFile(fullPath);
      }
    }
  }
  
  walkDir(srcDir);
}

// REFACTOR 4: Choose UI Framework
function standardizeUIFramework() {
  console.log('Analyzing UI framework usage for standardization...');
  
  const { mui, shadcn, mixedUsage } = uiFrameworkAnalysis;
  
  // Determine which framework is more heavily used
  const predominantFramework = mui.totalFiles > shadcn.totalFiles ? 'mui' : 'shadcn';
  const lessUsedFramework = predominantFramework === 'mui' ? 'shadcn' : 'mui';
  
  console.log(`Predominant UI framework: ${predominantFramework} (${predominantFramework === 'mui' ? mui.totalFiles : shadcn.totalFiles} files)`);
  console.log(`Less-used framework: ${lessUsedFramework} (${lessUsedFramework === 'mui' ? mui.totalFiles : shadcn.totalFiles} files)`);
  console.log(`Mixed usage files: ${mixedUsage.totalFiles}`);
  
  if (options.dryRun) {
    console.log(`Would create a migration plan for standardizing on ${predominantFramework}.`);
    console.log('Files that would need refactoring:');
    const filesToRefactor = lessUsedFramework === 'mui' ? mui.files : shadcn.files;
    
    for (const file of filesToRefactor) {
      console.log(`  ${file}`);
    }
  } else {
    // Create a migration plan
    const migrationPlan = {
      target: predominantFramework,
      filesNeedingMigration: lessUsedFramework === 'mui' ? mui.files : shadcn.files,
      componentsToReplace: lessUsedFramework === 'mui' ? mui.components : shadcn.components,
      mixedUsageFiles: mixedUsage.files
    };
    
    fs.writeFileSync(
      path.join(projectRoot, 'ui-framework-migration-plan.json'),
      JSON.stringify(migrationPlan, null, 2)
    );
    
    console.log(`Created UI framework migration plan at: ${path.join(projectRoot, 'ui-framework-migration-plan.json')}`);
  }
}

// Main execution
async function main() {
  console.log(`Starting automated refactoring${options.dryRun ? ' (DRY RUN)' : ''}...`);
  
  // Ensure we have a backup
  if (!options.dryRun) {
    try {
      console.log('Creating git commit for backup...');
      execSync('git add .', { stdio: 'ignore' });
      execSync('git commit -m "backup: Before automated refactoring"', { stdio: 'ignore' });
      console.log('Backup commit created.');
    } catch (error) {
      console.warn('Warning: Could not create backup commit. Make sure you have git initialized and configured.');
      console.warn('Proceeding without backup.');
    }
  }
  
  // Run requested refactorings
  if (options.fix === 'all' || options.fix === 'toast') {
    refactorToastImplementation();
  }
  
  if (options.fix === 'all' || options.fix === 'browser') {
    refactorBrowserUtilities();
  }
  
  if (options.fix === 'all' || options.fix === 'naming') {
    standardizeFileNaming();
  }
  
  if (options.fix === 'all' || options.fix === 'ui') {
    standardizeUIFramework();
  }
  
  console.log(`\nRefactoring ${options.dryRun ? 'analysis' : 'process'} complete!`);
  
  if (options.dryRun) {
    console.log('To apply these changes, run without the --dry-run flag.');
  } else {
    console.log('All changes have been applied.');
  }
}

main().catch(error => {
  console.error('Error during refactoring:', error);
  process.exit(1);
});
