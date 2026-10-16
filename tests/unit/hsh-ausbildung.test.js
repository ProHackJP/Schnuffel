import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SOURCES, OFFICIAL_PATH, PHASES, EXAM, EXERCISES, GAPS, CONTACT_URL } from '../../src/content/hsh-ausbildung.js';

const sourceIds = new Set(SOURCES.map((s) => s.id));

test('jede Quelle hat Titel, Herausgeber, https-Adresse und Abrufdatum', () => {
  assert.ok(SOURCES.length >= 5);
  for (const s of SOURCES) {
    assert.ok(s.id && s.title && s.publisher, `Quelle unvollständig: ${JSON.stringify(s)}`);
    assert.match(s.url, /^https:\/\//);
    assert.match(s.retrieved, /^\d{4}-\d{2}-\d{2}$/);
  }
  assert.equal(sourceIds.size, SOURCES.length);
  assert.match(CONTACT_URL, /^https:\/\//);
});

test('offizieller Weg, Phasen und Prüfung verweisen nur auf bekannte Quellen', () => {
  const blocks = [OFFICIAL_PATH, ...PHASES, EXAM];
  for (const block of blocks) {
    assert.ok(block.sources.length > 0, `${block.title ?? 'Block'} hat keine Quelle`);
    for (const id of block.sources) assert.ok(sourceIds.has(id), `unbekannte Quelle ${id}`);
  }
  assert.ok(OFFICIAL_PATH.items.length >= 3);
  assert.ok(PHASES.length >= 4);
  for (const phase of PHASES) {
    assert.ok(phase.id && phase.title && phase.age, `Phase unvollständig: ${phase.title}`);
    assert.ok(phase.items.length > 0, `${phase.title} ist leer`);
  }
  assert.equal(new Set(PHASES.map((p) => p.id)).size, PHASES.length);
  assert.ok(EXAM.parts.length >= 2);
  assert.ok(EXAM.criteria.length >= 4);
  for (const c of EXAM.criteria) assert.ok(c.name && c.text);
});

test('jede Übung gehört zu einer Phase und zu einem Prüfungskriterium', () => {
  const phaseIds = new Set(PHASES.map((p) => p.id));
  const criteria = new Set(EXAM.criteria.map((c) => c.name));
  assert.ok(EXERCISES.length >= 5);
  for (const e of EXERCISES) {
    assert.ok(e.name && e.why, `Übung unvollständig: ${JSON.stringify(e)}`);
    assert.ok(e.name.length <= 120, `${e.name} ist zu lang für das Tagebuch`);
    assert.ok(phaseIds.has(e.phase), `${e.name}: unbekannte Phase ${e.phase}`);
    assert.ok(criteria.has(e.criterion), `${e.name}: unbekanntes Kriterium ${e.criterion}`);
  }
  assert.equal(new Set(EXERCISES.map((e) => e.name)).size, EXERCISES.length);
  assert.ok(GAPS.length >= 1);
});
