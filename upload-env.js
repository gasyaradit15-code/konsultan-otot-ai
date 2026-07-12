const { execSync } = require('child_process');
const fs = require('fs');

const envLocal = fs.readFileSync('.env.local', 'utf8');
const lines = envLocal.split('\n');

for (const line of lines) {
  if (!line.trim() || line.startsWith('#')) continue;
  const eqIdx = line.indexOf('=');
  if (eqIdx === -1) continue;
  
  const key = line.substring(0, eqIdx).trim();
  let value = line.substring(eqIdx + 1).trim();
  
  // Remove quotes if present
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.substring(1, value.length - 1);
  }

  // Set NEXTAUTH_URL to production URL if it's localhost
  if (key === 'NEXTAUTH_URL' && value.includes('localhost')) {
    value = 'https://konsultan-otot-zxax5r9tc-gasyaradit15-7722s-projects.vercel.app';
  }
  
  console.log(`Adding ${key} to production...`);
  try {
    execSync(`npx vercel env add ${key} production`, { input: value, stdio: ['pipe', 'pipe', 'pipe'] });
    console.log(`Added ${key} to production.`);
  } catch (err) {
    console.error(`Failed to add ${key}: ${err.message}`);
  }
}
