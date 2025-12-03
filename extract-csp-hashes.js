const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function extractHashesFromHTML(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const hashes = {
    scripts: new Set(),
    styles: new Set()
  };

  const scriptRegex = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(content)) !== null) {
    const scriptContent = match[1].trim();
    if (scriptContent) {
      const hash = crypto.createHash('sha256').update(scriptContent, 'utf-8').digest('base64');
      hashes.scripts.add(`'sha256-${hash}'`);
    }
  }

  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  while ((match = styleRegex.exec(content)) !== null) {
    const styleContent = match[1].trim();
    if (styleContent) {
      const hash = crypto.createHash('sha256').update(styleContent, 'utf-8').digest('base64');
      hashes.styles.add(`'sha256-${hash}'`);
    }
  }

  const inlineStyleRegex = /style=["']([^"']+)["']/gi;
  while ((match = inlineStyleRegex.exec(content)) !== null) {
    const styleContent = match[1].trim();
    if (styleContent) {
      const hash = crypto.createHash('sha256').update(styleContent, 'utf-8').digest('base64');
      hashes.styles.add(`'sha256-${hash}'`);
    }
  }

  return hashes;
}

function scanDirectory(dir, hashes) {
  if (!fs.existsSync(dir)) {
    return;
  }

  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      scanDirectory(filePath, hashes);
    } else if (file.endsWith('.html')) {
      const fileHashes = extractHashesFromHTML(filePath);
      fileHashes.scripts.forEach(hash => hashes.scripts.add(hash));
      fileHashes.styles.forEach(hash => hashes.styles.add(hash));
    }
  });
}

function main() {
  const distPath = path.join(__dirname, 'dist', 'ccapp', 'browser');

  if (!fs.existsSync(distPath)) {
    console.error('Error: Build directory not found. Please run "npm run build" first.');
    process.exit(1);
  }

  const hashes = {
    scripts: new Set(),
    styles: new Set()
  };

  scanDirectory(distPath, hashes);

  const result = {
    scriptHashes: Array.from(hashes.scripts),
    styleHashes: Array.from(hashes.styles),
    generatedAt: new Date().toISOString()
  };

  const outputPath = path.join(__dirname, 'csp-hashes.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

  console.log(`✓ CSP hashes extracted successfully!`);
  console.log(`  - Script hashes: ${result.scriptHashes.length}`);
  console.log(`  - Style hashes: ${result.styleHashes.length}`);
  console.log(`  - Output: ${outputPath}`);
}

main();
