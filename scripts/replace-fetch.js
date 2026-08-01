const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      // We don't want to replace fetch in api routes or utils
      if (file !== 'api' && file !== 'utils') {
         arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

const allFiles = [];
// Get all files inside app/ except app/api
const files = fs.readdirSync('app');
files.forEach(file => {
  if (fs.statSync('app/' + file).isDirectory()) {
    if (file !== 'api' && file !== 'utils' && file !== 'lib') {
      getAllFiles('app/' + file, allFiles);
    }
  } else {
    if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      allFiles.push('app/' + file);
    }
  }
});

let fixedCount = 0;

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let newContent = content;

  // Find all instances of fetch(...)
  if (/\bfetch\s*\(/.test(newContent)) {
    // We only replace fetch calls that go to our internal API or use dynamic URLs that we assume are internal
    // e.g. fetch(`/api/...`) or fetch("/api/...") or fetch(url)
    
    // Replace fetch( with apiFetch( ONLY if it contains /api/ or backticks that might contain /api/
    // Since some files might use fetch for external URLs, let's strictly replace fetch calls that start with '/api' or `\`/api`
    
    // Actually, a simpler regex to catch internal fetches:
    const regex = /\bfetch\s*\(\s*(['"`]\/api\/)/g;
    
    if (regex.test(newContent)) {
      newContent = newContent.replace(regex, 'apiFetch($1');
      
      // We also need to catch things like: fetch(url
      // Let's check manually if there's any `fetch(url` and we can fix those manually.
      
      // Inject import if changed
      if (!newContent.includes("import { apiFetch } from '@/app/utils/apiFetch'")) {
        const lastImportIndex = newContent.lastIndexOf('import ');
        if (lastImportIndex !== -1) {
          const endOfLine = newContent.indexOf('\n', lastImportIndex);
          newContent = newContent.slice(0, endOfLine + 1) + "import { apiFetch } from '@/app/utils/apiFetch';\n" + newContent.slice(endOfLine + 1);
        } else {
          newContent = "import { apiFetch } from '@/app/utils/apiFetch';\n" + newContent;
        }
      }

      fs.writeFileSync(file, newContent, 'utf8');
      console.log(`Fixed: ${file}`);
      fixedCount++;
    }
  }
});

console.log(`\n Done! Replaced fetch with apiFetch in ${fixedCount} files.`);
