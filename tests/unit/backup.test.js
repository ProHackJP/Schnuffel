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
  assert.deepEqual(result, { dogs: 1, sessions: 2, planProgress: 0, planChecks: 0, lastExportAt: backup.exportedAt });
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
  // Auch Planfortschritt allein ist sicherungswürdig.
  assert.equal(backupDue({ ...base, sessions: [], planProgress: [{ dogId: 'a', planId: 'p', stepId: 's', status: 'done' }] }, now), true);
  assert.equal(backupDue({ ...base, sessions: [], planChecks: [{ dogId: 'a', planId: 'p', stepId: 's', exercise: 'Ablegen' }] }, now), true);
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

test('Export und Import mit mehreren Hunden, Planfortschritt und aktivem Hund', async () => {
  const source = await filledStore();
  const arko = await source.getDog();
  const bella = await source.saveDog({ name: 'Bella' });
  await source.saveSession({ date: '2026-10-05', exercises: [{ name: 'Ablegen' }] });
  await source.setStepStatus({ dogId: arko.id, planId: 'plan', stepId: 'eins', status: 'done' });
  await source.setStepStatus({ dogId: bella.id, planId: 'plan', stepId: 'eins', status: 'doing' });
  await source.setExerciseChecked({ dogId: arko.id, planId: 'plan', stepId: 'eins', exercise: 'Ablegen', checked: true });
  await source.setExerciseChecked({ dogId: bella.id, planId: 'plan', stepId: 'eins', exercise: 'Appell', checked: true });
  await source.setActiveDog(arko.id);
  const backup = JSON.parse(JSON.stringify(await source.exportBackup()));
  assert.equal(backup.planProgress.length, 2);
  assert.equal(backup.planChecks.length, 2);

  const target = createStore(memoryBackend());
  const result = await target.importBackup(backup);
  assert.deepEqual([result.dogs, result.sessions, result.planProgress, result.planChecks], [2, 3, 2, 2]);
  assert.equal((await target.getDog()).id, arko.id);
  assert.deepEqual((await target.getChecks(arko.id)).plan.eins, ['Ablegen']);
  assert.deepEqual((await target.getChecks(bella.id)).plan.eins, ['Appell']);
  assert.equal((await target.listSessions(bella.id)).length, 1);
  assert.equal((await target.getProgress(arko.id)).plan.eins.status, 'done');
  assert.equal((await target.getProgress(bella.id)).plan.eins.status, 'doing');
});

test('Sicherung aus Version 4 (ohne abgehakte Übungen) lässt sich importieren', async () => {
  const target = createStore(memoryBackend());
  const result = await target.importBackup({
    format: EXPORT_FORMAT,
    version: 4,
    dogs: [{ id: 'hund-1', name: 'Arko' }],
    sessions: [],
    planProgress: [{ dogId: 'hund-1', planId: 'plan', stepId: 'eins', status: 'doing' }],
    meta: {},
  });
  assert.deepEqual([result.dogs, result.planProgress, result.planChecks], [1, 1, 0]);
  assert.equal((await target.getProgress('hund-1')).plan.eins.status, 'doing');
});

test('Sicherung aus Version 3 (ohne Planfortschritt) lässt sich importieren', async () => {
  const target = createStore(memoryBackend());
  const result = await target.importBackup({
    format: EXPORT_FORMAT,
    version: 3,
    dogs: [{ id: 'hund-1', name: 'Arko' }],
    sessions: [{ id: 'e1', dogId: 'hund-1', date: '2026-10-01', exercises: [{ name: 'Apport' }] }],
    meta: {},
  });
  assert.deepEqual([result.dogs, result.sessions, result.planProgress], [1, 1, 0]);
  assert.equal((await target.getDog()).name, 'Arko');
});

test('Import prüft Planfortschritt: fehlerhafte Einträge werden abgelehnt, unbekannte Hunde und Doppelte bereinigt', () => {
  const base = { format: EXPORT_FORMAT, version: SCHEMA_VERSION, dogs: [{ id: 'a', name: 'Arko' }], sessions: [] };
  assert.throws(() => parseBackup({ ...base, planProgress: [{ dogId: 'a', planId: 'p', stepId: 's', status: 'fertig' }] }), /Planfortschritt 1 .*Status/);
  assert.throws(() => parseBackup({ ...base, planProgress: [{ dogId: 'a', planId: '../p', stepId: 's', status: 'done' }] }), /Planfortschritt 1 .*Kennung/);
  const data = parseBackup({
    ...base,
    planProgress: [
      { dogId: 'a', planId: 'p', stepId: 's', status: 'doing' },
      { dogId: 'a', planId: 'p', stepId: 's', status: 'done' },
      { dogId: 'unbekannt', planId: 'p', stepId: 's', status: 'done' },
    ],
    meta: { activeDogId: 'unbekannt' },
  });
  assert.equal(data.planProgress.length, 1);
  assert.equal(data.planProgress[0].status, 'done');
  assert.equal('activeDogId' in data.meta, false);
});

test('Import prüft abgehakte Übungen: Fehler werden abgelehnt, unbekannte Hunde und Doppelte bereinigt', () => {
  const base = { format: EXPORT_FORMAT, version: SCHEMA_VERSION, dogs: [{ id: 'a', name: 'Arko' }], sessions: [] };
  assert.throws(() => parseBackup({ ...base, planChecks: [{ dogId: 'a', planId: 'p', stepId: 's', exercise: '' }] }), /Abgehakte Übung 1 .*Übung/);
  assert.throws(() => parseBackup({ ...base, planChecks: [{ dogId: 'a', planId: '../p', stepId: 's', exercise: 'Ablegen' }] }), /Abgehakte Übung 1 .*Kennung/);
  assert.throws(() => parseBackup({ ...base, planChecks: [{ dogId: 'a', planId: 'p', stepId: 's', exercise: 'x'.repeat(121) }] }), /Abgehakte Übung 1/);
  const data = parseBackup({
    ...base,
    planChecks: [
      { dogId: 'a', planId: 'p', stepId: 's', exercise: ' Ablegen ' },
      { dogId: 'a', planId: 'p', stepId: 's', exercise: 'Ablegen' },
      { dogId: 'a', planId: 'p', stepId: 's', exercise: 'Appell' },
      { dogId: 'unbekannt', planId: 'p', stepId: 's', exercise: 'Ablegen' },
    ],
  });
  assert.deepEqual(data.planChecks.map((c) => c.exercise), ['Ablegen', 'Appell']);
});
