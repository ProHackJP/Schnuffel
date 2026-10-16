import { test } from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { build } from '../../scripts/build.mjs';

const dist = new URL('../../dist/', import.meta.url);

test('Build kopiert alle App-Dateien, aber keine Tests oder Tooling', async () => {
  const files = await build();
  for (const file of files) await access(new URL(file, dist));
  for (const file of ['index.html', 'sw.js', 'manifest.webmanifest', 'src/app.js', 'icons/icon-512.png', '_headers']) {
    assert.ok(files.includes(file), `${file} fehlt im Build`);
  }
  await assert.rejects(access(new URL('package.json', dist)));
  await assert.rejects(access(new URL('tests/', dist)));
  await assert.rejects(access(new URL('scripts/', dist)));
});

test('sw.js im Build wird nicht gecacht', async () => {
  await build();
  const headers = await readFile(new URL('_headers', dist), 'utf8');
  assert.match(headers, /\/sw\.js\n\s+Cache-Control: no-cache/);
});
