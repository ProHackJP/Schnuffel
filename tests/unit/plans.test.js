import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PLANS, getPlan, planExerciseNames, summarize } from '../../src/content/plans.js';
import { EXERCISES, PHASES } from '../../src/content/hsh-ausbildung.js';

const ID = /^[a-z0-9-]{1,64}$/;

test('Pläne haben eindeutige Kennungen, Titel, Geltungsbereich, Hinweis und Lücken', () => {
  assert.ok(PLANS.length >= 2);
  assert.equal(new Set(PLANS.map((p) => p.id)).size, PLANS.length);
  for (const plan of PLANS) {
    assert.match(plan.id, ID);
    assert.ok(plan.title && plan.summary && plan.scope && plan.notice, `${plan.id}: Text fehlt`);
    assert.ok(plan.steps.length >= 4, `${plan.id}: zu wenige Schritte`);
    assert.ok(plan.gaps.length >= 1, `${plan.id}: «Was nicht belegt ist» fehlt`);
    assert.equal(getPlan(plan.id), plan);
  }
  assert.equal(getPlan('gibts-nicht'), null);
});

test('jede Quelle hat Titel, Herausgeber, https-Adresse und Abrufdatum und wird verwendet', () => {
  for (const plan of PLANS) {
    const ids = plan.sources.map((s) => s.id);
    assert.equal(new Set(ids).size, ids.length, `${plan.id}: doppelte Quelle`);
    for (const s of plan.sources) {
      assert.ok(s.title && s.publisher, `${plan.id}/${s.id}: unvollständig`);
      assert.ok(s.short === undefined || (typeof s.short === 'string' && s.short.length <= 40), `${plan.id}/${s.id}: Kurzbezeichnung ungültig`);
      assert.match(s.url, /^https:\/\//);
      assert.match(s.retrieved, /^\d{4}-\d{2}-\d{2}$/);
    }
    const used = new Set(plan.steps.flatMap((st) => [...st.sources, ...(st.doneWhen.sources ?? []), ...st.exercises.flatMap((e) => e.sources ?? [])]));
    for (const id of ids) assert.ok(used.has(id), `${plan.id}: Quelle ${id} wird nirgends verwendet`);
  }
});

test('jeder Schritt stützt sich auf bekannte Quellen oder ist als Vorschlag gekennzeichnet', () => {
  for (const plan of PLANS) {
    const known = new Set(plan.sources.map((s) => s.id));
    const stepIds = plan.steps.map((s) => s.id);
    assert.equal(new Set(stepIds).size, stepIds.length, `${plan.id}: doppelte Schritt-Kennung`);
    const exerciseNames = [];
    for (const step of plan.steps) {
      const where = `${plan.id}/${step.id}`;
      assert.match(step.id, ID, where);
      assert.ok(step.title && step.timing, `${where}: Titel oder Zeitangabe fehlt`);
      assert.ok(step.facts.length >= 1 && step.facts.every((f) => typeof f === 'string' && f.length > 10), `${where}: Aussagen fehlen`);
      assert.ok(step.sources.length >= 1, `${where}: keine Quelle`);
      for (const id of step.sources) assert.ok(known.has(id), `${where}: unbekannte Quelle ${id}`);

      assert.ok(step.doneWhen.text, `${where}: Kriterium fehlt`);
      assert.equal(typeof step.doneWhen.own, 'boolean', `${where}: doneWhen.own fehlt`);
      if (!step.doneWhen.own) {
        assert.ok(step.doneWhen.sources?.length >= 1, `${where}: belegtes Kriterium ohne Quelle`);
        for (const id of step.doneWhen.sources) assert.ok(known.has(id), `${where}: unbekannte Quelle ${id}`);
      }

      for (const e of step.exercises) {
        assert.ok(e.name && e.why, `${where}: Übung unvollständig`);
        assert.ok(e.name.length <= 120, `${e.name} ist zu lang für das Tagebuch`);
        assert.ok(e.own === true || e.sources?.length >= 1, `${where}/${e.name}: weder Quelle noch Vorschlag`);
        for (const id of e.sources ?? []) assert.ok(known.has(id), `${where}/${e.name}: unbekannte Quelle ${id}`);
        exerciseNames.push(e.name);
      }
    }
    assert.equal(new Set(exerciseNames).size, exerciseNames.length, `${plan.id}: doppelte Übungsnamen`);
  }
});

test('Herdenschutzhund-Plan übernimmt alle Phasen und Übungen aus Etappe 6', () => {
  const plan = getPlan('herdenschutzhund');
  assert.deepEqual(plan.steps.map((s) => s.id), PHASES.map((p) => p.id));
  const names = plan.steps.flatMap((s) => s.exercises.map((e) => e.name));
  assert.deepEqual(names.sort(), EXERCISES.map((e) => e.name).sort());
  // Nur die Prüfung durch den Bund ist belegt, die übrigen Abschlusskriterien sind Vorschläge.
  assert.deepEqual(plan.steps.filter((s) => !s.doneWhen.own).map((s) => s.id), ['pruefung']);
});

test('Jagdhund-Plan Bern: Voraussetzungen stehen in der richtigen Reihenfolge', () => {
  const plan = getPlan('jagdhund-bern');
  const order = plan.steps.map((s) => s.id);
  assert.ok(order.indexOf('gehorsamspruefung') < order.indexOf('schweiss-500'));
  assert.ok(order.indexOf('schweiss-500') < order.indexOf('schweiss-1000'));
  assert.ok(order.indexOf('gehorsamspruefung') < order.indexOf('schleppe-apport'));
  assert.equal(plan.steps.find((s) => s.id === 'gehorsamspruefung').doneWhen.own, false);
  // Die Lücke zur nicht lesbaren Prüfungsordnung bleibt sichtbar.
  assert.ok(plan.gaps.some((g) => g.includes('Prüfungsordnung des BEJV')));
});

test('Übungsnamen aller Pläne stehen als Tipphilfe zur Verfügung', () => {
  const names = planExerciseNames();
  assert.ok(names.includes('Leinenführigkeit'));
  assert.ok(names.includes('Bei der Herde bleiben'));
});

test('Zusammenfassung zählt geschaffte und laufende Schritte', () => {
  const plan = getPlan('jagdhund-bern');
  assert.deepEqual(summarize(plan), { done: 0, doing: 0, total: plan.steps.length });
  const progress = { rahmen: { status: 'done' }, grundgehorsam: { status: 'doing' }, unbekannt: { status: 'done' } };
  assert.deepEqual(summarize(plan, progress), { done: 1, doing: 1, total: plan.steps.length });
});
