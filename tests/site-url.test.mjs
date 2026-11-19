import assert from 'node:assert/strict';
import test from 'node:test';
import { parsePublicSiteUrl } from '../src/lib/site-url.ts';

test('le mode local accepte une URL publique absente', () => {
  for (const value of [undefined, '', '  ']) {
    assert.equal(parsePublicSiteUrl(value), undefined);
  }
});

test('le chemin de projet Pages est conservé avec une barre oblique finale', () => {
  const url = parsePublicSiteUrl(' https://example.org/IslandEvolution-Website ');
  assert.equal(url.href, 'https://example.org/IslandEvolution-Website/');
  assert.equal(new URL('sitemap.xml', url).pathname, '/IslandEvolution-Website/sitemap.xml');
});

test('une URL publique incompatible avec le build statique est rejetée', () => {
  for (const value of [
    'http://example.org/site/',
    'https://login@example.org/site/',
    'https://example.org/site/?lang=en',
    'https://example.org/site/#jeu',
    'https://example.org/mon%20site/'
  ]) {
    assert.throws(() => parsePublicSiteUrl(value), /VITE_SITE_URL/);
  }
});
