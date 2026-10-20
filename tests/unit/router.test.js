import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHash, tabFor } from '../../src/router.js';

test('bekannte Routen werden erkannt', () => {
  assert.deepEqual(parseHash(''), { name: 'start', id: null });
  assert.deepEqual(parseHash('#/'), { name: 'start', id: null });
  assert.deepEqual(parseHash('#/hund'), { name: 'hund', id: null });
  assert.deepEqual(parseHash('#/training/'), { name: 'training', id: null });
  assert.deepEqual(parseHash('#info'), { name: 'info', id: null });
  assert.deepEqual(parseHash('#/info?x=1'), { name: 'info', id: null });
  assert.deepEqual(parseHash('#/training/neu'), { name: 'training-neu', id: null });
  assert.deepEqual(parseHash('#/herdenschutz/ausbildung'), { name: 'herdenschutz-ausbildung', id: null });
  assert.deepEqual(parseHash('#/training/neu?uebung=Herrufen'), { name: 'training-neu', id: null });
  assert.deepEqual(parseHash('#/training/0b1c-42'), { name: 'training-edit', id: '0b1c-42' });
  assert.deepEqual(parseHash('#/hund/neu'), { name: 'hund-neu', id: null });
  assert.deepEqual(parseHash('#/hund/0b1c-42'), { name: 'hund-edit', id: '0b1c-42' });
  assert.deepEqual(parseHash('#/plaene'), { name: 'plaene', id: null });
  assert.deepEqual(parseHash('#/plaene/offen'), { name: 'plaene-offen', id: null });
  assert.deepEqual(parseHash('#/plaene/herdenschutzhund'), { name: 'plaene-plan', id: 'herdenschutzhund' });
});

test('unbekannte Routen liefern null', () => {
  assert.equal(parseHash('#/gibtsnicht'), null);
  assert.equal(parseHash('#/hund/a/b'), null);
  assert.equal(parseHash('#/hund/<script>'), null);
  assert.equal(parseHash('#/plaene/Gross'), null);
  assert.equal(parseHash('#/plaene/a/b'), null);
  assert.equal(parseHash('#/training/<script>'), null);
  assert.equal(parseHash('#/training/a/b'), null);
});

test('Menüpunkt zur Route', () => {
  assert.equal(tabFor(parseHash('#/')), '/');
  assert.equal(tabFor(parseHash('#/training/neu')), '/training');
  assert.equal(tabFor(parseHash('#/training/abc')), '/training');
  assert.equal(tabFor(parseHash('#/info')), '/info');
  assert.equal(tabFor(parseHash('#/herdenschutz/ausbildung')), '/herdenschutz');
  assert.equal(tabFor(parseHash('#/hund/neu')), '/hund');
  assert.equal(tabFor(parseHash('#/hund/abc')), '/hund');
  assert.equal(tabFor(parseHash('#/plaene/herdenschutzhund')), '/plaene');
  assert.equal(tabFor(parseHash('#/plaene/offen')), '/plaene');
});
