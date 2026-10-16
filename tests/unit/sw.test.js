import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

async function filesUnder(dir, prefix) {
  const entries = await readdir(new URL(dir, import.meta.url), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory()) files.push(...(await filesUnder(`${dir}${entry.name}/`, `${prefix}${entry.name}/`)));
    else files.push(`${prefix}${entry.name}`);
  }
  return files;
}

// Fehlt eine Datei in der Offline-Liste des Service Workers, startet die App ohne Internet nicht.
test('alle App-Dateien sind im Offline-Speicher des Service Workers', async () => {
  const sw = await readFile(new URL('../../sw.js', import.meta.url), 'utf8');
  const shell = [...sw.matchAll(/'\.\/([^']*)'/g)].map((m) => m[1]);
  const files = [...(await filesUnder('../../src/', 'src/')), ...(await filesUnder('../../icons/', 'icons/')), 'index.html', 'manifest.webmanifest'];
  for (const file of files) assert.ok(shell.includes(file), `${file} fehlt in APP_SHELL von sw.js`);
});
