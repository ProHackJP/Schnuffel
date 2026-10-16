import { test } from 'node:test';
import assert from 'node:assert/strict';
import { backupDue, createStore, migrate, parseBackup, EXPORT_FORMAT, SCHEMA_VERSION } from '../../src/store.js';
import { memoryBackend } from '../../src/storage.js';

const exercise = { name: 'Schleppe', game: 'Kaninchen', rating: '4', notes: '' };

async function filledStore() {
  const store = createStore(memoryBackend());
  await store.saveDog({ name: 'Arko', breed: 'Deutsch Drahthaar' });
  await store.saveSession({ date: '2026-10-01', durationMin: '30', exercises: [exercise] });
  await store.saveSession({ date: '2026-10-03', exercises: [{ name: 'Apport' }] });
  return store;
}

test('Export enthält Format, Version, Hund und Einheiten und merkt sich den Zeitpunkt', async () => {
  const store = await filledStore();
  const now = new Date('2026-10-16T10:00:00Z');
  const backup = await store.exportBackup(now);
  assert.equal(backup.format, EXPORT_FORMAT);
  assert.equal(backup.version, SCHEMA_VERSION);
  assert.equal(backup.exportedAt, now.toISOString());
  assert.equal(backup.dogs[0].name, 'Arko');
  assert.equal(backup.sessions.length, 2);
  assert.equal((await store.load()).meta.lastExportAt, now.toISOString());
});

test('Import stellt einen Export vollständig wieder her', async () => {
  const source = await filledStore();
  const backup = await source.exportBackup();
  const sourceSessions = await source.listSessions();

  const target = createStore(memoryBackend());
  await target.saveDog({ name: 'Anderer' });
  const result = await target.importBackup(JSON.stringify(backup));
  assert.deepEqual(result, { dogs: 1, sessions: 2 });
  assert.equal((await target.getDog()).name, 'Arko');
  assert.deepEqual(await target.listSessions(), sourceSessions);
  assert.equal((await target.load()).meta.lastExportAt, backup.exportedAt);
});

test('Import nach Export: keine Erinnerung an Sicherung', async () => {
  const store = await filledStore();
  assert.equal(await store.backupDue(), true);
  await store.exportBackup();
  assert.equal(await store.backupDue(), false);
});

test('Erinnerung an Sicherung nur mit Einheiten und wenn die letzte Sicherung alt ist', () => {
  const now = new Date('2026-10-16T10:00:00Z');
  const base = migrate({ dogs: [{ id: 'a', name: 'Arko' }], sessions: [{ id: 's', date: '2026-10-01' }] });
  assert.equal(backupDue({ ...base, sessions: [] }, now), false);
  assert.equal(backupDue(base, now), true);
  assert.equal(backupDue({ ...base, meta: { lastExportAt: '2026-10-01T00:00:00Z' } }, now), false);
  assert.equal(backupDue({ ...base, meta: { lastExportAt: '2026-08-01T00:00:00Z' } }, now), true);
  assert.equal(backupDue({ ...base, meta: { lastExportAt: 'kein datum' } }, now), true);
});

test('unbrauchbare Dateien werden mit verständlicher Meldung abgelehnt', () => {
  assert.throws(() => parseBackup('{kein json'), /keine gültige Schnuffel-Sicherung/);
  assert.throws(() => parseBackup('{"dogs": []}'), /keine gültige Schnuffel-Sicherung/);
  assert.throws(() => parseBackup({ format: EXPORT_FORMAT, version: SCHEMA_VERSION + 1, dogs: [] }), /neueren Version/);
  assert.throws(() => parseBackup({ format: EXPORT_FORMAT, version: SCHEMA_VERSION, dogs: [{ name: '' }] }), /Hund 1 .*Namen/);
  assert.throws(
    () => parseBackup({ format: EXPORT_FORMAT, version: SCHEMA_VERSION, dogs: [{ name: 'Arko' }], sessions: [{ date: 'x' }] }),
    /Einheit 1 .*Datum/,
  );
});

test('Import bereinigt fremde Felder und ergänzt fehlende IDs', () => {
  const data = parseBackup({
    format: EXPORT_FORMAT,
    version: 2,
    dogs: [{ name: 'Arko', bösesFeld: '<script>' }],
    sessions: [{ date: '2026-10-01', dogId: 'unbekannt', exercises: [{ name: 'Suche', rating: 3 }] }],
  });
  assert.equal(data.version, SCHEMA_VERSION);
  assert.ok(data.dogs[0].id);
  assert.equal('bösesFeld' in data.dogs[0], false);
  assert.equal(data.sessions[0].dogId, data.dogs[0].id);
  assert.ok(data.sessions[0].id);
  assert.equal(data.sessions[0].exercises[0].rating, 3);
});

test('Import einer leeren Sicherung leert die Daten', async () => {
  const store = await filledStore();
  await store.importBackup({ format: EXPORT_FORMAT, version: SCHEMA_VERSION, dogs: [], sessions: [] });
  assert.equal(await store.getDog(), null);
  assert.deepEqual(await store.listSessions(), []);
});
