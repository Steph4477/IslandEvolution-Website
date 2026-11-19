import assert from 'node:assert/strict';
import test from 'node:test';
import { readVideoConsent, videoConsentMaxAge } from '../src/lib/video/consent.ts';

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
