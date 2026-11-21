import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveDraft } from '../src/lib/preference-choice.ts';

const allowed = { choice: 'allowed', expiresAt: 100, generation: 'a' };
const refused = { choice: 'refused', expiresAt: 120 };

test('un retrait, une expiration ou une nouvelle génération invalide un brouillon ancien', () => {
  for (const current of [refused, null, { ...allowed, generation: 'b' }]) {
    assert.equal(resolveDraft(allowed, current, true), null);
  }
});

test('un changement de service ne modifie pas le choix indépendant', () => {
  assert.equal(resolveDraft(allowed, refused, true), null);
  assert.equal(resolveDraft(refused, { ...refused }, true), 'allowed');
});

test('un choix manquant reste décoché par défaut et peut être explicitement accepté', () => {
  assert.equal(resolveDraft(null, null, false), 'refused');
  assert.equal(resolveDraft(null, null, true), 'allowed');
});
