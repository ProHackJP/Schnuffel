import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore, migrate, normalizeDog, normalizeSession, sortSessions, DATA_KEY, SCHEMA_VERSION } from '../../src/store.js';
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

test('Speichern mit ID ändert den Hund und behält die ID', async () => {
  const store = createStore(memoryBackend());
  const first = await store.saveDog({ name: 'Arko' });
  const second = await store.saveDog({ id: first.id, name: 'Arko II', breed: 'Kleiner Münsterländer' });
  assert.equal(second.id, first.id);
  assert.equal(second.breed, 'Kleiner Münsterländer');
  assert.equal((await store.load()).dogs.length, 1);
  await assert.rejects(store.saveDog({ id: 'gibts-nicht', name: 'X' }), /existiert nicht/);
});

test('Speichern ohne ID legt einen weiteren Hund an und macht ihn zum aktiven Hund', async () => {
  const store = createStore(memoryBackend());
  const first = await store.saveDog({ name: 'Arko' });
  const second = await store.saveDog({ name: 'Bella' });
  assert.notEqual(second.id, first.id);
  assert.deepEqual((await store.listDogs()).map((d) => d.name), ['Arko', 'Bella']);
  assert.equal((await store.getDog()).id, second.id);
});

test('aktiven Hund wechseln, unbekannter Hund wird abgelehnt', async () => {
  const store = createStore(memoryBackend());
  const first = await store.saveDog({ name: 'Arko' });
  await store.saveDog({ name: 'Bella' });
  assert.equal((await store.setActiveDog(first.id)).name, 'Arko');
  assert.equal((await store.getDog()).name, 'Arko');
  await assert.rejects(store.setActiveDog('gibts-nicht'), /existiert nicht/);
  assert.equal((await store.getDog()).name, 'Arko');
});

test('Einheiten gehören zum jeweiligen Hund', async () => {
  const store = createStore(memoryBackend());
  const arko = await store.saveDog({ name: 'Arko' });
  const bella = await store.saveDog({ name: 'Bella' });
  const forBella = await store.saveSession({ date: '2026-10-01', exercises: [exercise] });
  await store.setActiveDog(arko.id);
  const forArko = await store.saveSession({ date: '2026-10-02', exercises: [exercise] });
  const explicit = await store.saveSession({ date: '2026-10-03', exercises: [exercise], dogId: bella.id });
  assert.equal(forBella.dogId, bella.id);
  assert.equal(forArko.dogId, arko.id);
  assert.equal(explicit.dogId, bella.id);
  assert.deepEqual((await store.listSessions(arko.id)).map((s) => s.id), [forArko.id]);
  assert.equal((await store.listSessions(bella.id)).length, 2);
  assert.equal((await store.listSessions()).length, 3);
  // Beim Bearbeiten bleibt der Hund der Einheit.
  const edited = await store.saveSession({ id: forBella.id, date: '2026-10-05', exercises: [exercise] });
  assert.equal(edited.dogId, bella.id);
});

test('Hund löschen entfernt Einheiten und Planfortschritt, der andere Hund bleibt', async () => {
  const store = createStore(memoryBackend());
  const arko = await store.saveDog({ name: 'Arko' });
  const bella = await store.saveDog({ name: 'Bella' });
  await store.saveSession({ date: '2026-10-01', exercises: [exercise] });
  await store.setStepStatus({ dogId: bella.id, planId: 'plan', stepId: 'schritt', status: 'done' });
  await store.setStepStatus({ dogId: arko.id, planId: 'plan', stepId: 'schritt', status: 'doing' });
  assert.deepEqual(await store.deleteDog(bella.id), { removedSessions: 1 });
  assert.equal(await store.deleteDog(bella.id), null);
  assert.deepEqual((await store.listDogs()).map((d) => d.name), ['Arko']);
  assert.equal((await store.getDog()).id, arko.id);
  assert.deepEqual(await store.listSessions(), []);
  assert.deepEqual(await store.getProgress(bella.id), {});
  assert.equal((await store.getProgress(arko.id)).plan.schritt.status, 'doing');
});

test('Planfortschritt: setzen, ändern, auf offen zurücksetzen, je Hund getrennt', async () => {
  const store = createStore(memoryBackend());
  const arko = await store.saveDog({ name: 'Arko' });
  const bella = await store.saveDog({ name: 'Bella' });
  assert.deepEqual(await store.getProgress(arko.id), {});
  await store.setStepStatus({ dogId: arko.id, planId: 'plan-a', stepId: 'eins', status: 'doing' });
  await store.setStepStatus({ dogId: arko.id, planId: 'plan-a', stepId: 'eins', status: 'done' });
  await store.setStepStatus({ dogId: arko.id, planId: 'plan-a', stepId: 'zwei', status: 'doing' });
  const progress = await store.getProgress(arko.id);
  assert.equal(progress['plan-a'].eins.status, 'done');
  assert.ok(progress['plan-a'].eins.updatedAt);
  assert.equal(progress['plan-a'].zwei.status, 'doing');
  assert.equal((await store.load()).planProgress.length, 2);
  assert.deepEqual(await store.getProgress(bella.id), {});
  await store.setStepStatus({ dogId: arko.id, planId: 'plan-a', stepId: 'zwei', status: 'open' });
  assert.equal((await store.getProgress(arko.id))['plan-a'].zwei, undefined);
});

test('Planfortschritt: ungültige Angaben werden abgelehnt', async () => {
  const store = createStore(memoryBackend());
  const arko = await store.saveDog({ name: 'Arko' });
  const ok = { dogId: arko.id, planId: 'plan', stepId: 'schritt', status: 'done' };
  await assert.rejects(store.setStepStatus({ ...ok, status: 'fertig' }), /Status/);
  await assert.rejects(store.setStepStatus({ ...ok, planId: '../x' }), /Kennung/);
  await assert.rejects(store.setStepStatus({ ...ok, stepId: '', status: 'open' }), /Kennung/);
  await assert.rejects(store.setStepStatus({ ...ok, dogId: 'gibts-nicht' }), /existiert nicht/);
  assert.equal((await store.load()).planProgress.length, 0);
});

test('Abgehakte Übungen: setzen, zurücknehmen, je Hund und je Schritt getrennt, ohne Doppelte', async () => {
  const store = createStore(memoryBackend());
  const arko = await store.saveDog({ name: 'Arko' });
  const bella = await store.saveDog({ name: 'Bella' });
  assert.deepEqual(await store.getChecks(arko.id), {});
  const check = (input) => store.setExerciseChecked({ dogId: arko.id, planId: 'plan-a', stepId: 'eins', exercise: 'Ablegen', checked: true, ...input });
  assert.equal(await check(), true);
  await check();
  await check({ exercise: 'Appell' });
  await check({ stepId: 'zwei' });
  assert.deepEqual(await store.getChecks(arko.id), { 'plan-a': { eins: ['Ablegen', 'Appell'], zwei: ['Ablegen'] } });
  assert.equal((await store.load()).planChecks.length, 3);
  assert.deepEqual(await store.getChecks(bella.id), {});

  assert.equal(await check({ checked: false }), false);
  assert.deepEqual((await store.getChecks(arko.id))['plan-a'].eins, ['Appell']);
  await check({ exercise: 'Appell', checked: false });
  assert.equal((await store.getChecks(arko.id))['plan-a'].eins, undefined);
  // Ein Haken, der nie gesetzt war, kann ohne Fehler zurückgenommen werden.
  await check({ exercise: 'Nie gesetzt', checked: false });
  assert.equal((await store.load()).planChecks.length, 1);
});

test('Schnell hintereinander gesetzte Haken gehen nicht verloren', async () => {
  const store = createStore(memoryBackend());
  const arko = await store.saveDog({ name: 'Arko' });
  const tick = (exercise) => store.setExerciseChecked({ dogId: arko.id, planId: 'p', stepId: 's', exercise, checked: true });
  await Promise.all([tick('Leinenführigkeit'), tick('Ablegen'), tick('Schussruhe'), store.setStepStatus({ dogId: arko.id, planId: 'p', stepId: 's', status: 'done' })]);
  assert.deepEqual((await store.getChecks(arko.id)).p.s, ['Leinenführigkeit', 'Ablegen', 'Schussruhe']);
  assert.equal((await store.getProgress(arko.id)).p.s.status, 'done');
  // Ein Fehler in einer Änderung blockiert die folgenden nicht.
  await Promise.allSettled([store.setExerciseChecked({ dogId: arko.id, planId: 'p', stepId: 's', exercise: '', checked: true }), tick('Appell')]);
  assert.equal((await store.getChecks(arko.id)).p.s.length, 4);
});

test('Abgehakte Übungen: ungültige Angaben werden abgelehnt', async () => {
  const store = createStore(memoryBackend());
  const arko = await store.saveDog({ name: 'Arko' });
  const ok = { dogId: arko.id, planId: 'plan', stepId: 'schritt', exercise: 'Ablegen', checked: true };
  await assert.rejects(store.setExerciseChecked({ ...ok, exercise: '  ' }), /Übung/);
  await assert.rejects(store.setExerciseChecked({ ...ok, exercise: 'x'.repeat(121) }), /Übung/);
  await assert.rejects(store.setExerciseChecked({ ...ok, planId: '../x' }), /Kennung/);
  await assert.rejects(store.setExerciseChecked({ ...ok, dogId: 'gibts-nicht' }), /existiert nicht/);
  assert.equal((await store.load()).planChecks.length, 0);
});

test('Hund löschen entfernt auch seine abgehakten Übungen', async () => {
  const store = createStore(memoryBackend());
  const arko = await store.saveDog({ name: 'Arko' });
  const bella = await store.saveDog({ name: 'Bella' });
  await store.setExerciseChecked({ dogId: arko.id, planId: 'p', stepId: 's', exercise: 'Ablegen', checked: true });
  await store.setExerciseChecked({ dogId: bella.id, planId: 'p', stepId: 's', exercise: 'Ablegen', checked: true });
  await store.deleteDog(bella.id);
  assert.deepEqual(await store.getChecks(bella.id), {});
  assert.deepEqual((await store.getChecks(arko.id)).p.s, ['Ablegen']);
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
  assert.equal(data.version, SCHEMA_VERSION);
  assert.deepEqual(data.sessions, []);
  assert.deepEqual(data.planProgress, []);
  assert.deepEqual(data.planChecks, []);
  assert.deepEqual(data.meta, {});
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
