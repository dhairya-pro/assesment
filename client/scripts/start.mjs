import { access, readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distIndex = resolve(root, 'dist/index.html');

try {
  await access(distIndex);
} catch {
  console.error(
    '\n[start] dist/index.html not found — production build is missing.\n' +
      '  Local:  npm run build && npm start\n' +
      '  Render build command: npm install --include=dev && npm run build\n' +
      '  Do not use "npm run dev" as the start command on Render.\n'
  );
  process.exit(1);
}

const html = await readFile(distIndex, 'utf8');
if (html.includes('/src/')) {
  console.error(
    '\n[start] dist/index.html still points at /src/ (dev sources).\n' +
      '  Fix Render build: npm install --include=dev && npm run build\n' +
      '  Static Site publish directory must be "dist", not "client" or ".".\n'
  );
  process.exit(1);
}

const port = process.env.PORT || '4173';
const serveMain = resolve(root, 'node_modules/serve/build/main.js');

const proc = spawn(
  process.execPath,
  [serveMain, 'dist', '-s', '-l', `tcp://0.0.0.0:${port}`],
  { stdio: 'inherit', cwd: root }
);

proc.on('exit', (code) => process.exit(code ?? 1));
