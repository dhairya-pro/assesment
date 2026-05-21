const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const serverRoot = path.join(__dirname, '..');
const clientRoot = path.join(serverRoot, '..', 'client');
const clientDist = path.join(clientRoot, 'dist');
const publicDir = path.join(serverRoot, 'public');

if (!fs.existsSync(path.join(clientRoot, 'package.json'))) {
  console.error('[sync-client] client/ folder not found');
  process.exit(1);
}

console.log('[sync-client] Installing client dependencies...');
execSync('npm install', { cwd: clientRoot, stdio: 'inherit' });

console.log('[sync-client] Building client...');
const buildEnv = {
  ...process.env,
  VITE_API_URL: process.env.VITE_API_URL || '/api',
};
execSync('npm run build', { cwd: clientRoot, stdio: 'inherit', env: buildEnv });

const distIndex = path.join(clientDist, 'index.html');
if (!fs.existsSync(distIndex)) {
  console.error('[sync-client] client/dist/index.html missing after build');
  process.exit(1);
}

const html = fs.readFileSync(distIndex, 'utf8');
if (html.includes('/src/')) {
  console.error('[sync-client] Build output still references /src/ — invalid production build');
  process.exit(1);
}

fs.rmSync(publicDir, { recursive: true, force: true });
fs.cpSync(clientDist, publicDir, { recursive: true });

console.log('[sync-client] Copied client/dist → server/public');
