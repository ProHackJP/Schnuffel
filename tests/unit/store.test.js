import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore, migrate, normalizeDog, normalizeSession, sortSessions, DATA_KEY } from '../../src/store.js';
import { memoryBackend } from '../../src/storage.js';

const exercise = { name: 'Schleppe', game: 'Kaninchen', rating: '4', notes: '' };

async function storeWithDog() {
  const store = createStore(memoryBackend());
  await store.saveDog({ name: 'Arko' });
  return store;
}

test('leerer Speicher liefert keinen Hund und keine Einheiten', async () => {
  const store = createStore(memoryBackend());
  assert.equal(await store.getDog(), null);
  assert.deepEqual(await store.listSessions(), []);
});

test('Hund speichern und wieder laden', async () => {
  const backend = memoryBackend();
  const saved = await createStore(backend).saveDog({ name: '  Arko ', breed: 'Deutsch Drahthaar', birthDate: '2024-03-01' });
  assert.equal(saved.name, 'Arko');
  assert.ok(saved.id);
  const loaded = await createStore(backend).getDog();
  assert.deepEqual([loaded.name, loaded.breed, loaded.birthDate], ['Arko', 'Deutsch Drahthaar', '2024-03-01']);
});

test('erneutes Speichern des Hundes behält die ID', async () => {
  const store = createStore(memoryBackend());
  const first = await store.saveDog({ name: 'Arko' });
  const second = await store.saveDog({ name: 'Arko II' });
  assert.equal(second.id, first.id);
  assert.equal((await store.load()).dogs.length, 1);
});

test('kaputte Daten im Speicher führen nicht zum Absturz', async () => {
  const backend = memoryBackend();
  await backend.set(DATA_KEY, { dogs: 'falsch' });
  assert.equal(await createStore(backend).getDog(), null);
  const failing = { get: async () => { throw new Error('kaputt'); }, set: async () => {}, remove: async () => {} };
  assert.equal(await createStore(failing).getDog(), null);
});

test('Daten aus Etappe 1 (ohne Einheiten) werden übernommen', () => {
  const old = { version: 1, dogs: [{ id: 'a', name: 'Arko' }] };
  const data = migrate(old);
  assert.equal(data.version, 2);
  assert.deepEqual(data.sessions, []);
  assert.equal(data.dogs[0].name, 'Arko');
});

test('Validierung Hund', () => {
  assert.throws(() => normalizeDog({ name: '   ' }), /Namen/);
  assert.throws(() => normalizeDog({ name: 'x'.repeat(61) }), /60/);
  assert.throws(() => normalizeDog({ name: 'Arko', birthDate: '1.3.2024' }), /Geburtsdatum/);
  assert.deepEqual(normalizeDog({ name: 'Arko' }), { name: 'Arko', breed: '', birthDate: '' });
});

test('Einheit ohne Hund wird abgelehnt', async () => {
  const store = createStore(memoryBackend());
  await assert.rejects(store.saveSession({ date: '2026-10-01', exercises: [exercise] }), /Hund/);
});

test('Einheit mit mehreren Übungen anlegen', async () => {
  const store = await storeWithDog();
  const dog = await store.getDog();
  const saved = await store.saveSession({
    date: '2026-10-01',
    durationMin: '45',
    location: ' Waldrand ',
    notes: 'Gute Laune',
    exercises: [exercise, { name: 'Apport', rating: '' }, { name: '', game: '', rating: '', notes: '' }],
  });
  assert.ok(saved.id);
  assert.equal(saved.dogId, dog.id);
  assert.equal(saved.durationMin, 45);
  assert.equal(saved.location, 'Waldrand');
  assert.deepEqual(saved.exercises, [
    { name: 'Schleppe', game: 'Kaninchen', rating: 4, notes: '' },
    { name: 'Apport', game: '', rating: null, notes: '' },
  ]);
  assert.equal((await store.getSession(saved.id)).notes, 'Gute Laune');
});

test('Einheit bearbeiten behält ID und Erstelldatum', async () => {
  const store = await storeWithDog();
  const saved = await store.saveSession({ date: '2026-10-01', exercises: [exercise] });
  const edited = await store.saveSession({ ...saved, id: saved.id, date: '2026-10-02', exercises: [{ name: 'Suche', rating: '2' }] });
  assert.equal(edited.id, saved.id);
  assert.equal(edited.createdAt, saved.createdAt);
  assert.equal(edited.date, '2026-10-02');
  assert.equal((await store.listSessions()).length, 1);
  assert.equal((await store.getSession(saved.id)).exercises[0].rating, 2);
});

test('Einheit löschen', async () => {
  const store = await storeWithDog();
  const saved = await store.saveSession({ date: '2026-10-01', exercises: [exercise] });
  assert.equal(await store.deleteSession(saved.id), true);
  assert.equal(await store.deleteSession(saved.id), false);
  assert.deepEqual(await store.listSessions(), []);
});

test('Liste ist nach Datum sortiert, neueste zuerst', async () => {
  const store = await storeWithDog();
  for (const date of ['2026-09-01', '2026-10-05', '2026-09-20']) {
    await store.saveSession({ date, exercises: [exercise] });
  }
  assert.deepEqual((await store.listSessions()).map((s) => s.date), ['2026-10-05', '2026-09-20', '2026-09-01']);
  const sameDay = sortSessions([
    { date: '2026-10-01', createdAt: '2026-10-01T08:00:00Z' },
    { date: '2026-10-01', createdAt: '2026-10-01T18:00:00Z' },
  ]);
  assert.equal(sameDay[0].createdAt, '2026-10-01T18:00:00Z');
});

test('Validierung Einheit', () => {
  const ok = { date: '2026-10-01', exercises: [exercise] };
  assert.throws(() => normalizeSession({ ...ok, date: '' }), /Datum/);
  assert.throws(() => normalizeSession({ ...ok, date: '2026-02-30' }), /Datum/);
  assert.throws(() => normalizeSession({ ...ok, durationMin: '0' }), /Dauer/);
  assert.throws(() => normalizeSession({ ...ok, durationMin: '12.5' }), /Dauer/);
  assert.throws(() => normalizeSession({ ...ok, exercises: [] }), /mindestens eine Übung/);
  assert.throws(() => normalizeSession({ ...ok, exercises: [{ name: '' }] }), /mindestens eine Übung/);
  assert.throws(() => normalizeSession({ ...ok, exercises: [{ name: 'X', rating: '6' }] }), /Bewertung/);
  assert.throws(() => normalizeSession({ ...ok, exercises: [{ name: '', rating: '3' }] }), /Bezeichnung/);
  assert.equal(normalizeSession(ok).durationMin, null);
});

test('clear löscht alle Daten', async () => {
  const store = await storeWithDog();
  await store.clear();
  assert.equal(await store.getDog(), null);
});
