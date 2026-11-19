import assert from 'node:assert/strict';
import test from 'node:test';
import { claimPlayback, onPlaybackAvailable, releasePlayback } from '../src/lib/video/youtube.ts';

test('la lecture automatique attend tant qu’un lecteur est actif', async () => {
  const first = () => {};
  const second = () => {};
  let notifications = 0;
  const unsubscribe = onPlaybackAvailable(() => notifications++);

  try {
    assert.equal(claimPlayback(first, false), true);
    assert.equal(claimPlayback(second, false), false);
    releasePlayback(second);
    await Promise.resolve();
    assert.equal(notifications, 0);

    releasePlayback(first);
    await Promise.resolve();
    assert.equal(notifications, 1);
    assert.equal(claimPlayback(second, false), true);
  } finally {
    unsubscribe();
    releasePlayback(first);
    releasePlayback(second);
  }
});

test('une lecture manuelle met en pause le lecteur précédent sans libérer le nouveau', async () => {
  let pauses = 0;
  const first = () => {
    pauses++;
    releasePlayback(first);
  };
  const second = () => {};

  try {
    assert.equal(claimPlayback(first, false), true);
    assert.equal(claimPlayback(second, true), true);
    await Promise.resolve();
    assert.equal(pauses, 1);
    assert.equal(claimPlayback(first, false), false);
  } finally {
    releasePlayback(first);
    releasePlayback(second);
  }
});
