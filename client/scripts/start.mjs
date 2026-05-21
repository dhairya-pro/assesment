import { access, readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distIndex = resolve(root, 'dist/index.html');

async function isValidProductionDist() {
  try {
    const html = await readFile(distIndex, 'utf8');
    return !html.includes('/src/') && html.includes('/assets/');
  } catch {
    return false;
  }
}

function runBuild() {
  return new Promise((resolve, reject) => {
    console.log('[start] Running production build (vite build)...');
    const proc = spawn('npm', ['run', 'build'], {
      cwd: root,
      stdio: 'inherit',
      shell: true,
    });
    proc.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error('npm run build failed — check Render build logs'));
    });
  });
}

if (!(await isValidProductionDist())) {
  try {
    await runBuild();
  } catch (err) {
    console.error(`\n[start] ${err.message}\n`);
    console.error(
      'Render fix:\n' +
        '  Build command: npm install --include=dev && npm run build\n' +
        '  Start command: npm start\n' +
        '  Do NOT use: npm run dev\n' +
        '  Static Site publish directory: dist\n'
    );
    process.exit(1);
  }
  if (!(await isValidProductionDist())) {
    console.error('[start] Build finished but dist/index.html is still invalid.');
    process.exit(1);
  }
}

const port = process.env.PORT || '4173';
const serveMain = resolve(root, 'node_modules/serve/build/main.js');

console.log(`[start] Serving production dist on 0.0.0.0:${port}`);

const proc = spawn(
  process.execPath,
  [serveMain, 'dist', '-s', '-l', `tcp://0.0.0.0:${port}`],
  { stdio: 'inherit', cwd: root }
);

proc.on('exit', (code) => process.exit(code ?? 1));
