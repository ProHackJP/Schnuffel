import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SECTIONS, SOURCES, EXERCISE_SUGGESTIONS, GAPS, MAP_URL } from '../../src/content/herdenschutz.js';

test('jede Quelle hat Titel, Herausgeber, https-Adresse und Abrufdatum', () => {
  assert.ok(SOURCES.length >= 2);
  for (const s of SOURCES) {
    assert.ok(s.id && s.title && s.publisher, `Quelle unvollständig: ${JSON.stringify(s)}`);
    assert.match(s.url, /^https:\/\//);
    assert.match(s.retrieved, /^\d{4}-\d{2}-\d{2}$/);
  }
  assert.equal(new Set(SOURCES.map((s) => s.id)).size, SOURCES.length);
  assert.match(MAP_URL, /^https:\/\//);
});

test('jeder Abschnitt hat Inhalt und verweist nur auf bekannte Quellen', () => {
  const ids = new Set(SOURCES.map((s) => s.id));
  assert.ok(SECTIONS.length >= 3);
  for (const section of SECTIONS) {
    assert.ok(section.title);
    assert.ok(section.items.length > 0, `${section.title} ist leer`);
    assert.ok(section.sources.length > 0, `${section.title} hat keine Quelle`);
    for (const id of section.sources) assert.ok(ids.has(id), `${section.title}: unbekannte Quelle ${id}`);
  }
});

test('Übungsvorschläge und Lücken sind vorhanden', () => {
  assert.ok(EXERCISE_SUGGESTIONS.length >= 3);
  for (const e of EXERCISE_SUGGESTIONS) assert.ok(e.name && e.why);
  assert.ok(GAPS.length >= 1);
});
