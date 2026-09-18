/**
 * Script to automatically fix localStorage usage across the codebase
 * Run with: node scripts/fix-localstorage.js
 */

const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

const filesToFix = getAllFiles('app');

function fixFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  // Check if file already imports getAccessToken
  const hasImport = content.includes("from '@/app/utils/auth'") || 
                     content.includes('from "@/app/utils/auth"');

  // Pattern 1: Direct localStorage.getItem('access_token')
  const pattern1 = /localStorage\.getItem\(['"]access_token['"]\)/g;
  if (pattern1.test(content)) {
    if (!hasImport) {
      // Add import at the top
      const importStatement = "import { getAccessToken } from '@/app/utils/auth';\n";
      
      // Find the right place to add import (after other imports)
      const importRegex = /^import .+ from .+;$/gm;
      const imports = content.match(importRegex);
      
      if (imports && imports.length > 0) {
        const lastImport = imports[imports.length - 1];
        const lastImportIndex = content.lastIndexOf(lastImport);
        const insertPosition = lastImportIndex + lastImport.length + 1;
        content = content.slice(0, insertPosition) + importStatement + content.slice(insertPosition);
      } else {
        // No imports found, add at the beginning after 'use client' if exists
        if (content.includes("'use client'") || content.includes('"use client"')) {
          content = content.replace(/(['"])use client\1\n/, "$&" + importStatement);
        } else {
          content = importStatement + content;
        }
      }
    }

    // Replace localStorage.getItem('access_token') with getAccessToken()
    content = content.replace(pattern1, 'getAccessToken()');
    modified = true;
  }

  // Pattern 2: const token = localStorage.getItem('access_token') as string
  const pattern2 = /const\s+(\w+)\s*=\s*localStorage\.getItem\(['"]access_token['"]\)\s*as\s+string/g;
  if (pattern2.test(content)) {
    content = content.replace(pattern2, 'const $1 = getAccessToken()');
    modified = true;
  }

  // Pattern 3: localStorage.getItem('access_token') || ''
  const pattern3 = /localStorage\.getItem\(['"]access_token['"]\)\s*\|\|\s*['"]['"]?/g;
  if (pattern3.test(content)) {
    content = content.replace(pattern3, 'getAccessToken() || \'\'');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
  } else {
    console.log(`ℹNo changes needed: ${filePath}`);
  }
}

console.log('🔧 Starting localStorage fix script...\n');

let fixedCount = 0;
let skippedCount = 0;

filesToFix.forEach(file => {
  try {
    fixFile(file);
    fixedCount++;
  } catch (error) {
    console.error(`Error fixing ${file}:`, error.message);
    skippedCount++;
  }
});

console.log(`\n Done! Fixed ${fixedCount} files, skipped ${skippedCount} files.`);
console.log('\n Note: Please review the changes and test thoroughly!');
