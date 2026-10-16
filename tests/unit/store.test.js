import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore, normalizeDog } from '../../src/store.js';

function memoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  };
}

test('leerer Speicher liefert keinen Hund', () => {
  const store = createStore(memoryStorage());
  assert.equal(store.getDog(), null);
  assert.deepEqual(store.load().dogs, []);
});

test('Hund speichern und wieder laden', () => {
  const storage = memoryStorage();
  const saved = createStore(storage).saveDog({ name: '  Arko ', breed: 'Deutsch Drahthaar', birthDate: '2024-03-01' });
  assert.equal(saved.name, 'Arko');
  assert.ok(saved.id);
  const loaded = createStore(storage).getDog();
  assert.equal(loaded.name, 'Arko');
  assert.equal(loaded.breed, 'Deutsch Drahthaar');
  assert.equal(loaded.birthDate, '2024-03-01');
});

test('erneutes Speichern behält die ID', () => {
  const store = createStore(memoryStorage());
  const first = store.saveDog({ name: 'Arko' });
  const second = store.saveDog({ name: 'Arko II' });
  assert.equal(second.id, first.id);
  assert.equal(store.load().dogs.length, 1);
});

test('kaputte Daten im Speicher führen nicht zum Absturz', () => {
  const storage = memoryStorage();
  storage.setItem('schnuffel:v1', '{kein json');
  assert.equal(createStore(storage).getDog(), null);
  storage.setItem('schnuffel:v1', '{"dogs": "falsch"}');
  assert.equal(createStore(storage).getDog(), null);
});

test('Validierung der Eingaben', () => {
  assert.throws(() => normalizeDog({ name: '   ' }), /Namen/);
  assert.throws(() => normalizeDog({ name: 'x'.repeat(61) }), /60/);
  assert.throws(() => normalizeDog({ name: 'Arko', birthDate: '1.3.2024' }), /Geburtsdatum/);
  assert.deepEqual(normalizeDog({ name: 'Arko' }), { name: 'Arko', breed: '', birthDate: '' });
});

test('clear löscht alle Daten', () => {
  const store = createStore(memoryStorage());
  store.saveDog({ name: 'Arko' });
  store.clear();
  assert.equal(store.getDog(), null);
});
