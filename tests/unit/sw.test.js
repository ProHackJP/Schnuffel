import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

// Fehlt eine Datei in der Offline-Liste des Service Workers, startet die App ohne Internet nicht.
test('alle App-Dateien sind im Offline-Speicher des Service Workers', async () => {
  const sw = await readFile(new URL('../../sw.js', import.meta.url), 'utf8');
  const shell = [...sw.matchAll(/'\.\/([^']*)'/g)].map((m) => m[1]);
  const files = [
    ...(await readdir(new URL('../../src/', import.meta.url))).map((f) => `src/${f}`),
    ...(await readdir(new URL('../../icons/', import.meta.url))).map((f) => `icons/${f}`),
    'index.html',
    'manifest.webmanifest',
  ];
  for (const file of files) assert.ok(shell.includes(file), `${file} fehlt in APP_SHELL von sw.js`);
});
