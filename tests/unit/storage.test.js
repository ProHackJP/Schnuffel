import { test } from 'node:test';
import assert from 'node:assert/strict';
import { localStorageBackend, memoryBackend, migrateFrom } from '../../src/storage.js';

function fakeLocalStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  };
}

test('memoryBackend gibt Kopien zurück', async () => {
  const backend = memoryBackend();
  const value = { a: [1] };
  await backend.set('k', value);
  value.a.push(2);
  assert.deepEqual(await backend.get('k'), { a: [1] });
  await backend.remove('k');
  assert.equal(await backend.get('k'), undefined);
});

test('Daten aus localStorage werden einmalig übernommen', async () => {
  const legacy = localStorageBackend(fakeLocalStorage());
  const target = memoryBackend();
  await legacy.set('key', { dogs: [{ name: 'Arko' }] });

  assert.equal(await migrateFrom(legacy, target, 'key'), true);
  assert.deepEqual(await target.get('key'), { dogs: [{ name: 'Arko' }] });
  assert.equal(await legacy.get('key'), undefined);
  assert.equal(await migrateFrom(legacy, target, 'key'), false);
});

test('Übernahme überschreibt keine neueren Daten', async () => {
  const legacy = localStorageBackend(fakeLocalStorage());
  const target = memoryBackend();
  await legacy.set('key', { dogs: [{ name: 'Alt' }] });
  await target.set('key', { dogs: [{ name: 'Neu' }] });
  await migrateFrom(legacy, target, 'key');
  assert.equal((await target.get('key')).dogs[0].name, 'Neu');
});

test('kaputtes JSON im alten Speicher verhindert den Start nicht', async () => {
  const raw = fakeLocalStorage();
  raw.setItem('key', '{kein json');
  const target = memoryBackend();
  assert.equal(await migrateFrom(localStorageBackend(raw), target, 'key'), false);
});
