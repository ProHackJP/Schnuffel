// Kopiert die App-Dateien nach dist/, damit beim Hosting nur die App und nicht Tests oder Tooling veröffentlicht werden.
// Die Dateiliste ist dieselbe wie im Service Worker (APP_SHELL in sw.js), plus sw.js selbst und _headers.
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const out = join(root, 'dist');

export async function appShellFiles() {
  const sw = await readFile(join(root, 'sw.js'), 'utf8');
  // './' steht im Service Worker für die Startseite und ist keine Datei.
  return [...sw.matchAll(/'\.\/([^']*)'/g)].map((m) => m[1]).filter(Boolean);
}

export async function build() {
  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });
  const files = [...(await appShellFiles()), 'sw.js', '_headers'];
  for (const file of files) {
    await mkdir(join(out, file, '..'), { recursive: true });
    await cp(join(root, file), join(out, file));
  }
  await writeFile(join(out, '.build-info.json'), JSON.stringify({ builtAt: new Date().toISOString(), files }, null, 2));
  return files;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const files = await build();
  console.log(`${files.length} Dateien nach dist/ kopiert.`);
}
