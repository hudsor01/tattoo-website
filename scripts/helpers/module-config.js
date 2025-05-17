/**
 * This file provides configuration for all scripts to use CommonJS
 * without conflicts with ES modules elsewhere in the project.
 */

export const moduleConfig = {
  // Configuration for scripts based on preference
  type: 'module' // 'module' for ESM or 'commonjs' for CJS
};

export function createScriptHeader(type = moduleConfig.type) {
  if (type === 'module') {
    return `// ESM version
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);`;
  } else {
    return `// CJS version
const fs = require('fs');
const path = require('path');
const util = require('util');

// For CommonJS compatibility
const __dirname = __dirname || path.dirname(process.argv[1]);`;
  }
}

export function getImports(modules, type = moduleConfig.type) {
  if (type === 'module') {
    // ESM import format
    return modules.map(mod => {
      if (typeof mod === 'string') {
        return `import ${mod} from '${mod}';`;
      } else {
        const { name, from, as } = mod;
        if (as) {
          return `import { ${name} as ${as} } from '${from}';`;
        } else {
          return `import { ${name} } from '${from}';`;
        }
      }
    }).join('\n');
  } else {
    // CommonJS require format
    return modules.map(mod => {
      if (typeof mod === 'string') {
        return `const ${mod} = require('${mod}');`;
      } else {
        const { name, from, as } = mod;
        if (as) {
          return `const { ${name}: ${as} } = require('${from}');`;
        } else {
          return `const { ${name} } = require('${from}');`;
        }
      }
    }).join('\n');
  }
}

/**
 * Creates a package.json with correct type field for scripts
 */
export function createPackageJson(directory, type = moduleConfig.type) {
  const packageJsonPath = path.join(directory, 'package.json');
  
  const packageJson = {
    "name": "scripts",
    "private": true,
    "type": type,
    "engines": {
      "node": ">=14.0.0"
    }
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
  console.log(`Created package.json with type: ${type} in ${directory}`);
}