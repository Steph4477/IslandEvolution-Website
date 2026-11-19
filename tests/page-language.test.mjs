import assert from 'node:assert/strict';
import test from 'node:test';
import { readPageLanguage } from '../src/lib/page-language.ts';

test('une langue explicite dans l’URL prévaut sur la préférence enregistrée', () => {
  assert.equal(
    readPageLanguage('en', () => 'fr'),
    'en'
  );
  assert.equal(
    readPageLanguage('fr', () => 'en'),
    'fr'
  );
  assert.equal(
    readPageLanguage('de', () => 'en'),
    'fr'
  );
});

test('sans paramètre, la langue enregistrée est utilisée si elle est reconnue', () => {
  assert.equal(
    readPageLanguage(null, () => 'en'),
    'en'
  );
  for (const stored of [null, 'fr', 'de']) {
    assert.equal(
      readPageLanguage(null, () => stored),
      'fr'
    );
  }
});

test('le français reste disponible quand le stockage est bloqué', () => {
  const blocked = () => {
    throw new Error('Stockage indisponible');
  };
  assert.equal(readPageLanguage(null, blocked), 'fr');
  assert.equal(readPageLanguage('en', blocked), 'en');
});
