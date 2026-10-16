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
  assert.deepEqual(parseHash('#/training/0b1c-42'), { name: 'training-edit', id: '0b1c-42' });
});

test('unbekannte Routen liefern null', () => {
  assert.equal(parseHash('#/gibtsnicht'), null);
  assert.equal(parseHash('#/hund/123'), null);
  assert.equal(parseHash('#/training/<script>'), null);
  assert.equal(parseHash('#/training/a/b'), null);
});

test('Menüpunkt zur Route', () => {
  assert.equal(tabFor(parseHash('#/')), '/');
  assert.equal(tabFor(parseHash('#/training/neu')), '/training');
  assert.equal(tabFor(parseHash('#/training/abc')), '/training');
  assert.equal(tabFor(parseHash('#/info')), '/info');
});
