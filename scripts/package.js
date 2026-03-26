import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const projectName = 'sivam-crackers-chit-fund';
const version = '0.1.0';
const outputZip = `${projectName}-v${version}.zip`;

console.log('📦 Packaging Sivam Crackers Chit Fund Software...');

try {
  // Ensure we are in the right directory
  const rootDir = process.cwd();
  const distDir = path.join(rootDir, 'dist');

  if (!fs.existsSync(distDir)) {
    console.error('❌ Error: "dist" folder not found. Did you run "npm run build" first?');
    process.exit(1);
  }

  console.log('🤐 Compacting distribution files...');

  // Use PowerShell's Compress-Archive on Windows
  if (process.platform === 'win32') {
    execSync(`powershell -Command "Compress-Archive -Path '${distDir}\\*' -DestinationPath '${outputZip}' -Force"`);
  } else {
    // Fallback for unix-like (if applicable, though user is on Windows)
    execSync(`zip -r ${outputZip} dist/*`);
  }

  console.log(`✅ Success! Downloadable version created: ${outputZip}`);
  console.log(`📍 Location: ${path.join(rootDir, outputZip)}`);

} catch (error) {
  console.error('❌ Packaging failed:', error.message);
  process.exit(1);
}
