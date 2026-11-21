import assert from 'node:assert/strict';
import test from 'node:test';
import {
  readVideoConsent,
  saveVideoChoice,
  videoConsentKey,
  videoConsentMaxAge
} from '../src/lib/video/consent.ts';

const now = 1760000000000;

test('a valid, unexpired preference preserves either explicit video choice', () => {
  for (const choice of ['allowed', 'refused']) {
    const stored = JSON.stringify({ choice, expiresAt: now + videoConsentMaxAge });
    assert.equal(readVideoConsent(stored, now), choice);
  }
});

test('unknown, malformed and expired choices never grant consent', () => {
  for (const value of [
    null,
    '',
    'allowed',
    'null',
    '{}',
    JSON.stringify({ choice: 'yes', expiresAt: now + 1000 }),
    JSON.stringify({ choice: 'allowed', expiresAt: now }),
    JSON.stringify({ choice: 'allowed', expiresAt: now + videoConsentMaxAge + 1 })
  ])
    assert.equal(readVideoConsent(value, now), null);
});

test('un refus vidéo retire l’ancien accord si l’écriture échoue', (context) => {
  const values = new Map([[videoConsentKey, 'ancien accord']]);
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      setItem() {
        throw new Error('stockage indisponible');
      },
      removeItem(key) {
        values.delete(key);
      }
    }
  });
  context.after(() => {
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else delete globalThis.localStorage;
  });
  assert.equal(saveVideoChoice('refused'), false);
  assert.equal(values.has(videoConsentKey), false);
});
