import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';

const images = new URL('../static/images/', import.meta.url);
const expected = {
  environment: ['ground.webp', 'jungle.webp', 'liana.png', 'tree.webp'],
  gameplay: ['jungle-exploration.webp', 'temple-sunset.webp'],
  moko: ['clac.png', 'climb-liana-cycle.png', 'climb-liana.png', 'idle.png',
    'jump-down.png', 'jump-up.png', 'kick.png', 'walk.png']
};

test('public image paths have the expected spelling and case', () => {
  assert.deepEqual(readdirSync(images).sort(), Object.keys(expected));
  for (const [folder, files] of Object.entries(expected)) {
    assert.deepEqual(readdirSync(new URL(folder + '/', images)).sort(), files);
  }
});

test('Moko sprite sheets keep their original 320 px frame grid', () => {
  const frameCounts = [4, 4, 1, 4, 2, 2, 4, 5];
  for (const [index, file] of expected.moko.entries()) {
    const png = readFileSync(new URL('moko/' + file, images));
    assert.equal(png.toString('ascii', 1, 4), 'PNG', file);
    assert.equal(png.readUInt32BE(16), 320 * frameCounts[index], file);
    assert.equal(png.readUInt32BE(20), 320, file);
  }
});

test('the five perches stay in the shared illustration coordinate system', () => {
  const scene = JSON.parse(readFileSync(new URL('../src/lib/scene/tree-perches.json', import.meta.url), 'utf8'));
  const { width, height } = scene.image;
  assert.equal(new Set(scene.restPoints.map(point => point.id)).size, 5);
  for (const { id, feetPx, feetNorm, walkToPx } of scene.restPoints) {
    for (const { x, y } of [feetPx, walkToPx]) {
      assert.ok(x >= 0 && x < width && y >= 0 && y < height, id);
    }
    assert.deepEqual(feetNorm, { x: feetPx.x / width, y: feetPx.y / height }, id);
  }
});
