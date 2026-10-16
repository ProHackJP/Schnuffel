import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHash } from '../../src/router.js';

test('bekannte Routen werden erkannt', () => {
  assert.equal(parseHash(''), '/');
  assert.equal(parseHash('#/'), '/');
  assert.equal(parseHash('#/hund'), '/hund');
  assert.equal(parseHash('#/training/'), '/training');
  assert.equal(parseHash('#info'), '/info');
  assert.equal(parseHash('#/info?x=1'), '/info');
});

test('unbekannte Routen liefern null', () => {
  assert.equal(parseHash('#/gibtsnicht'), null);
  assert.equal(parseHash('#/hund/123'), null);
});
