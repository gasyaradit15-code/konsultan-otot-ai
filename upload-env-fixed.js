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
    value = 'https://konsultan-otot-ai.vercel.app';
  }
  
  console.log(`Setting ${key}...`);
  fs.writeFileSync('temp_env_val.txt', value, 'utf8');
  
  try {
    console.log(`Removing old ${key} (if exists)...`);
    execSync(`npx vercel env rm ${key} production -y`, { stdio: 'ignore' });
  } catch (e) {
    // Ignore if doesn't exist
  }

  try {
    execSync(`cmd /c "npx vercel env add ${key} production < temp_env_val.txt"`, { stdio: 'inherit' });
    console.log(`Successfully added ${key} to production.`);
  } catch (err) {
    console.error(`Failed to add ${key}: ${err.message}`);
  }
}
try { fs.unlinkSync('temp_env_val.txt'); } catch(e){}
