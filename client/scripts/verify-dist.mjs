import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distIndex = resolve(root, 'dist/index.html');

let html;
try {
  html = await readFile(distIndex, 'utf8');
} catch {
  console.error('[verify-dist] dist/index.html not found — run "npm run build" first.');
  process.exit(1);
}

if (html.includes('/src/')) {
  console.error(
    '[verify-dist] dist/index.html still loads /src/ files (dev mode).\n' +
      '  This causes "_jsxDEV is not a function" in the browser.\n' +
      '  Ensure "vite build" completed successfully.'
  );
  process.exit(1);
}

if (!html.includes('/assets/')) {
  console.error('[verify-dist] dist/index.html has no bundled /assets/ scripts.');
  process.exit(1);
}

console.log('[verify-dist] Production build OK');
