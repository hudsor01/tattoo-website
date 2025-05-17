/**
 * Comprehensive Project Analysis Script
 * 
 * This script orchestrates multiple MCP servers to analyze a project for:
 * - Duplicate functionality
 * - Import patterns
 * - File organization
 * - Code quality issues
 * - Bundle size impacts
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const projectRoot = process.cwd();
const srcDir = path.join(projectRoot, 'src');
const outputDir = path.join(projectRoot, 'analysis-output');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// ANALYSIS 1: Find duplicate functionality patterns
function analyzeDuplication() {
  console.log('Analyzing code duplication patterns...');
  
  // Define patterns that suggest duplicate functionality
  const duplicatePatterns = [
    // Pattern: Multiple implementations of the same concept
    { regex: /function\s+(\w+).*?\{/g, description: 'Function definitions' },
    { regex: /const\s+(\w+)\s*=\s*\([^)]*\)\s*=>/g, description: 'Arrow function definitions' },
    { regex: /class\s+(\w+)/g, description: 'Class definitions' },
    { regex: /interface\s+(\w+)/g, description: 'Interface definitions' },
    { regex: /type\s+(\w+)\s*=/g, description: 'Type definitions' },
    { regex: /enum\s+(\w+)/g, description: 'Enum definitions' },
    { regex: /export\s+(const|let|var|function|class|interface|type|enum)\s+(\w+)/g, description: 'Exported definitions' }
  ];
  
  // Catalog all patterns found
  const catalog = new Map();
  let filesProcessed = 0;
  
  function processFile(filePath) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
    
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(projectRoot, filePath);
    filesProcessed++;
    
    for (const pattern of duplicatePatterns) {
      const matches = [...content.matchAll(pattern.regex)];
      
      for (const match of matches) {
        const identifier = match[1] || match[2]; // Get the captured group
        if (!identifier || identifier.length <= 3) continue; // Skip short names
        
        if (!catalog.has(identifier)) {
          catalog.set(identifier, { 
            identifier, 
            type: pattern.description, 
            occurrences: [] 
          });
        }
        
        catalog.get(identifier).occurrences.push({
          file: relativePath,
          line: content.substring(0, match.index).split('\n').length
        });
      }
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
  
  // Filter for potential duplicates (appearing in multiple files)
  const potentialDuplicates = Array.from(catalog.values())
    .filter(item => item.occurrences.length > 1)
    .sort((a, b) => b.occurrences.length - a.occurrences.length);
  
  fs.writeFileSync(
    path.join(outputDir, 'duplicate-identifiers.json'),
    JSON.stringify(potentialDuplicates, null, 2)
  );
  
  console.log(`Analyzed ${filesProcessed} files, found ${potentialDuplicates.length} potential duplicates.`);
  return potentialDuplicates;
}

// ANALYSIS 2: Map import patterns
function analyzeImports() {
  console.log('Mapping import patterns...');
  
  const importMap = new Map(); // Map of imports to files
  const exportMap = new Map(); // Map of exports to files
  const internalDependencies = new Map(); // File-to-file dependencies
  let filesProcessed = 0;
  
  function processFile(filePath) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
    
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(projectRoot, filePath);
    filesProcessed++;
    
    // Process imports
    const importRegex = /import\s+(?:{([^}]*)}\s+from\s+['"]([^'"]+)['"]|([^;]+?)\s+from\s+['"]([^'"]+)['"])/g;
    const importMatches = [...content.matchAll(importRegex)];
    
    for (const match of importMatches) {
      let importPath;
      let importedItems;
      
      if (match[2]) {
        // Destructured import
        importPath = match[2];
        importedItems = match[1].split(',').map(item => item.trim().split(' as ')[0].trim());
      } else {
        // Default import
        importPath = match[4];
        importedItems = [match[3].trim().split(' as ')[0].trim()];
      }
      
      // Skip node modules
      if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
        continue;
      }
      
      // Track imports
      for (const item of importedItems) {
        if (!item || item.includes('*')) continue;
        
        if (!importMap.has(item)) {
          importMap.set(item, []);
        }
        
        importMap.get(item).push({
          file: relativePath,
          importPath
        });
      }
      
      // Track file-to-file dependencies for internal imports
      if (importPath.startsWith('.') || importPath.startsWith('@/')) {
        if (!internalDependencies.has(relativePath)) {
          internalDependencies.set(relativePath, []);
        }
        
        internalDependencies.get(relativePath).push(importPath);
      }
    }
    
    // Process exports
    const exportRegex = /export\s+(?:default\s+(\w+)|(?:{([^}]*)}\s+from\s+['"]([^'"]+)['"])|(?:(const|let|var|function|class|interface|type|enum)\s+(\w+)))/g;
    const exportMatches = [...content.matchAll(exportRegex)];
    
    for (const match of exportMatches) {
      if (match[1]) {
        // Default export
        if (!exportMap.has(match[1])) {
          exportMap.set(match[1], []);
        }
        exportMap.get(match[1]).push(relativePath);
      } else if (match[2] && match[3]) {
        // Re-export
        const exportedItems = match[2].split(',').map(item => item.trim().split(' as ')[0].trim());
        for (const item of exportedItems) {
          if (!exportMap.has(item)) {
            exportMap.set(item, []);
          }
          exportMap.get(item).push({
            file: relativePath,
            reExportedFrom: match[3]
          });
        }
      } else if (match[4] && match[5]) {
        // Named export
        if (!exportMap.has(match[5])) {
          exportMap.set(match[5], []);
        }
        exportMap.get(match[5]).push(relativePath);
      }
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
  
  // Find redundant re-exports and circular dependencies
  const redundantExports = [];
  const circularDependencies = [];
  
  // Write results to file
  fs.writeFileSync(
    path.join(outputDir, 'import-analysis.json'),
    JSON.stringify({
      imports: Object.fromEntries(importMap),
      exports: Object.fromEntries(exportMap),
      redundantExports,
      circularDependencies
    }, null, 2)
  );
  
  console.log(`Analyzed imports and exports from ${filesProcessed} files.`);
}

// ANALYSIS 3: Identify file organization issues
function analyzeFileOrganization() {
  console.log('Analyzing file organization...');
  
  const directoryStructure = {};
  const namingIssues = [];
  const organizationIssues = [];
  
  function buildDirectoryTree(dir, tree) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        tree[entry.name] = {};
        buildDirectoryTree(fullPath, tree[entry.name]);
        
        // Check for organizational issues
        if (entry.name.includes('.') || entry.name.includes('_')) {
          organizationIssues.push({
            path: path.relative(projectRoot, fullPath),
            issue: 'Directory name contains dots or underscores'
          });
        }
        
        // Check for mixed case conventions in the same directory
        const hasKebabCase = entry.name.includes('-');
        const hasCamelCase = /[a-z][A-Z]/.test(entry.name);
        const hasPascalCase = /^[A-Z][a-z]/.test(entry.name);
        
        if ((hasKebabCase && hasCamelCase) || (hasKebabCase && hasPascalCase) || (hasCamelCase && hasPascalCase)) {
          organizationIssues.push({
            path: path.relative(projectRoot, fullPath),
            issue: 'Directory name mixes different case conventions'
          });
        }
      } else {
        // Check file naming conventions
        const fileExtension = path.extname(entry.name);
        const baseName = path.basename(entry.name, fileExtension);
        
        tree[entry.name] = null;
        
        // Check naming consistency issues
        if (fileExtension === '.tsx' || fileExtension === '.ts') {
          // Check for mixed naming conventions
          const hasKebabCase = baseName.includes('-');
          const hasCamelCase = /[a-z][A-Z]/.test(baseName);
          const hasPascalCase = /^[A-Z][a-z]/.test(baseName);
          
          const componentFile = fileExtension === '.tsx' || baseName.includes('Component');
          
          if (componentFile && !hasPascalCase) {
            namingIssues.push({
              file: path.relative(projectRoot, fullPath),
              issue: 'Component file does not use PascalCase'
            });
          }
          
          if ((hasKebabCase && hasCamelCase) || (hasKebabCase && hasPascalCase) || (hasCamelCase && hasPascalCase)) {
            namingIssues.push({
              file: path.relative(projectRoot, fullPath),
              issue: 'File name mixes different case conventions'
            });
          }
          
          // Check for index files that are not barrel files
          if (baseName === 'index') {
            // Check if it's a proper barrel file (mostly exports)
            const content = fs.readFileSync(fullPath, 'utf8');
            const exportLines = content.split('\n').filter(line => line.trim().startsWith('export'));
            const totalLines = content.split('\n').filter(line => line.trim() && !line.trim().startsWith('//'));
            
            if (exportLines.length < totalLines.length * 0.5) {
              // Less than 50% of lines are exports
              organizationIssues.push({
                file: path.relative(projectRoot, fullPath),
                issue: 'index.ts file is not a proper barrel file'
              });
            }
          }
        }
      }
    }
  }
  
  buildDirectoryTree(srcDir, directoryStructure);
  
  fs.writeFileSync(
    path.join(outputDir, 'file-organization.json'),
    JSON.stringify({
      directoryStructure,
      namingIssues,
      organizationIssues
    }, null, 2)
  );
  
  console.log(`Analyzed file organization. Found ${namingIssues.length} naming issues and ${organizationIssues.length} organization issues.`);
}

// ANALYSIS 4: UI Framework usage (MUI vs shadcn)
function analyzeUIFrameworks() {
  console.log('Analyzing UI framework usage...');
  
  const muiComponents = new Set();
  const shadcnComponents = new Set();
  const muiFiles = new Set();
  const shadcnFiles = new Set();
  
  function processFile(filePath) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
    
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(projectRoot, filePath);
    
    // Check for MUI imports
    const muiImportRegex = /import\s+(?:{([^}]*)}\s+from\s+['"]@mui\/[^'"]+['"]|[^;]+?\s+from\s+['"]@mui\/[^'"]+['"])/g;
    const muiMatches = [...content.matchAll(muiImportRegex)];
    
    if (muiMatches.length > 0) {
      muiFiles.add(relativePath);
      
      for (const match of muiMatches) {
        if (match[1]) {
          // Add components to set
          const components = match[1].split(',').map(c => c.trim());
          components.forEach(c => muiComponents.add(c));
        }
      }
    }
    
    // Check for shadcn imports
    const shadcnImportRegex = /import\s+(?:{([^}]*)}\s+from\s+['"]@\/components\/ui\/[^'"]+['"]|[^;]+?\s+from\s+['"]@\/components\/ui\/[^'"]+['"])/g;
    const shadcnMatches = [...content.matchAll(shadcnImportRegex)];
    
    if (shadcnMatches.length > 0) {
      shadcnFiles.add(relativePath);
      
      for (const match of shadcnMatches) {
        if (match[1]) {
          // Add components to set
          const components = match[1].split(',').map(c => c.trim());
          components.forEach(c => shadcnComponents.add(c));
        }
      }
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
  
  // Find mixed usage files (both MUI and shadcn)
  const mixedUsageFiles = [...muiFiles].filter(file => shadcnFiles.has(file));
  
  fs.writeFileSync(
    path.join(outputDir, 'ui-framework-analysis.json'),
    JSON.stringify({
      mui: {
        totalFiles: muiFiles.size,
        components: Array.from(muiComponents),
        files: Array.from(muiFiles)
      },
      shadcn: {
        totalFiles: shadcnFiles.size,
        components: Array.from(shadcnComponents),
        files: Array.from(shadcnFiles)
      },
      mixedUsage: {
        totalFiles: mixedUsageFiles.length,
        files: mixedUsageFiles
      }
    }, null, 2)
  );
  
  console.log(`Analyzed UI framework usage. MUI: ${muiFiles.size} files, shadcn: ${shadcnFiles.size} files, mixed: ${mixedUsageFiles.length} files.`);
}

// Run all analyses
function runAllAnalyses() {
  console.log('Starting comprehensive project analysis...');
  
  try {
    // Run each analysis
    analyzeDuplication();
    analyzeImports();
    analyzeFileOrganization();
    analyzeUIFrameworks();
    
    // Generate a summary report
    const summary = {
      timestamp: new Date().toISOString(),
      projectRoot,
      analyses: [
        'duplicate-identifiers.json',
        'import-analysis.json',
        'file-organization.json',
        'ui-framework-analysis.json'
      ]
    };
    
    fs.writeFileSync(
      path.join(outputDir, 'analysis-summary.json'),
      JSON.stringify(summary, null, 2)
    );
    
    console.log(`\nAnalysis complete! Results saved to: ${outputDir}`);
    console.log('Run `npx serve analysis-output` to view results in a browser.');
  } catch (error) {
    console.error('Error during analysis:', error);
  }
}

// Start the analysis
runAllAnalyses();
