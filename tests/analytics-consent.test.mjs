import assert from 'node:assert/strict';
import test from 'node:test';
import {
  analyticsConsentKey,
  analyticsConsentMaxAge,
  parseAnalyticsChoice,
  parseAnalyticsConsent,
  readAnalyticsConsent,
  readAnalyticsChoice,
  saveAnalyticsChoice
} from '../src/lib/analytics/consent.ts';
import { videoConsentKey } from '../src/lib/video/consent.ts';

test('seuls les choix Umami explicites et en cours de validité sont reconnus', () => {
  const now = 1760000000000;
  for (const choice of ['allowed', 'refused']) {
    assert.equal(
      parseAnalyticsChoice(
        JSON.stringify({ choice, expiresAt: now + analyticsConsentMaxAge }),
        now
      ),
      choice
    );
  }

  for (const value of [
    null,
    '{',
    'null',
    JSON.stringify({ choice: 'yes', expiresAt: now + 1000 }),
    JSON.stringify({ choice: 'allowed', expiresAt: now }),
    JSON.stringify({ choice: 'allowed', expiresAt: String(now + 1000) }),
    JSON.stringify({ choice: 'allowed', expiresAt: now + analyticsConsentMaxAge + 1 })
  ]) {
    assert.equal(parseAnalyticsChoice(value, now), null);
  }
});

test('un accord YouTube ne vaut pas accord Umami et un échec d’écriture permet le retrait', () => {
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const videoChoice = JSON.stringify({ choice: 'allowed', expiresAt: Date.now() + 1000 });
  const values = new Map([[videoConsentKey, videoChoice]]);
  let writeBlocked = false;
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem(key, value) {
      if (writeBlocked) throw new Error('Écriture indisponible');
      values.set(key, value);
    },
    removeItem: (key) => values.delete(key)
  };

  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
  try {
    assert.equal(readAnalyticsChoice(), null);
    assert.equal(saveAnalyticsChoice('allowed'), true);
    assert.equal(readAnalyticsChoice(), 'allowed');
    writeBlocked = true;
    assert.equal(saveAnalyticsChoice('refused'), false);
    assert.equal(values.has(analyticsConsentKey), false);
    assert.equal(readAnalyticsChoice(), null);
    assert.equal(values.get(videoConsentKey), videoChoice);
  } finally {
    if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
    else delete globalThis.localStorage;
  }
});

test('deux accords à la même échéance reçoivent des générations distinctes', (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: 1760000000000 });
  const values = new Map();
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value)
    }
  });
  t.after(() => {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else delete globalThis.localStorage;
  });

  const legacy = JSON.stringify({
    choice: 'allowed',
    expiresAt: Date.now() + analyticsConsentMaxAge
  });
  assert.equal(parseAnalyticsConsent(legacy).choice, 'allowed');
  assert.equal(
    parseAnalyticsConsent(legacy).generation,
    'legacy:' + (Date.now() + analyticsConsentMaxAge)
  );
  assert.equal(saveAnalyticsChoice('allowed'), true);
  const first = readAnalyticsConsent();
  assert.equal(saveAnalyticsChoice('refused'), true);
  assert.equal(readAnalyticsChoice(), 'refused');
  assert.equal(saveAnalyticsChoice('allowed'), true);
  const second = readAnalyticsConsent();

  assert.equal(second.expiresAt, first.expiresAt);
  assert.notEqual(second.generation, first.generation);
  assert.notEqual(second.generation, parseAnalyticsConsent(legacy).generation);
});

test('le double échec de stockage signale que le retrait n’a pas été enregistré', (t) => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const stored = JSON.stringify({ choice: 'allowed', expiresAt: Date.now() + 1000 });
  const attempts = [];
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: () => stored,
      setItem() {
        attempts.push('écriture');
        throw new Error('Écriture indisponible');
      },
      removeItem() {
        attempts.push('suppression');
        throw new Error('Suppression indisponible');
      }
    }
  });
  t.after(() => {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else delete globalThis.localStorage;
  });

  assert.equal(saveAnalyticsChoice('refused'), false);
  assert.deepEqual(attempts, ['écriture', 'suppression']);
  assert.equal(readAnalyticsChoice(), 'allowed');
});
