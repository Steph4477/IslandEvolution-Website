import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';

const [source, option] = process.argv.slice(2);
if (!source || source.startsWith('-') || (option && option !== '--check') || process.argv.length > 4) {
  console.error('Usage : npm run export:moko -- <scène-Godot-de-référence.tscn> [--check]');
  process.exit(1);
}
const scene = readFileSync(source, 'utf8')
  .replaceAll('\r', '');
const sections = scene.split(/^\[(?=\w+ )/m).slice(1).map((section) => {
  const end = section.indexOf(']\n');
  return [section.slice(0, end), section.slice(end + 2)];
});
const resources = Object.fromEntries(sections.filter(([header]) => header.startsWith('sub_resource '))
  .map(([header, body]) => [header.match(/ id="([^"]+)"/)[1], body]));
const textures = Object.fromEntries(sections.filter(([header]) => header.startsWith('ext_resource '))
  .map(([header]) => [header.match(/ id="([^"]+)"/)[1], header.match(/path="([^"]+)"/)[1]]));
const sprite = sections.find(([header]) => header.startsWith('node name="Sprite" type="AnimatedSprite2D"'))[1];
const framesId = sprite.match(/sprite_frames = SubResource\("([^"]+)"\)/)[1];
const clips = Object.values(resources).filter((body) => body.startsWith('resource_name = '));
const selected = new Set(['idle', 'climb_liana']);
const frameSize = 320;
// Hauteur visible et ancre bas-centre relevées sur les planches 2D et 3D.
const display = {
  idle: { old: [80, 98, 204], current: [150, 154, 280] },
  climb_liana: { old: [93, 90.5, 199], current: [176, 147, 290] }
};

const entries = [...resources[framesId].matchAll(/"frames": \[([\s\S]*?)\],\s*"loop": (\w+),\s*"name": &"([^"]+)",\s*"speed": ([\d.]+)/g)];
const rows = entries.filter(([, , , name]) => selected.has(name)).map(([, body, loop, name, speed]) => {
  const fps = Number(speed);
  const [oldHeight, oldX, oldY] = display[name].old;
  const [newHeight, newX, newY] = display[name].current;
  const scale = (oldHeight / 205) / (newHeight / frameSize);
  const render = {
    scale,
    x: oldX / 205 - scale * newX / frameSize,
    y: oldY / 205 - scale * newY / frameSize
  };
  const frames = [...body.matchAll(/"duration": ([\d.]+),\s*"texture": SubResource\("([^"]+)"\)/g)]
    .map(([, duration, key], index, entries) => {
      const atlas = resources[key];
      const ref = atlas.match(/atlas = ExtResource\("([^"]+)"\)/)[1];
      const file = basename(textures[ref]).replaceAll('_', '-');
      const path = `images/moko/${file}`;
      const rect = [index * frameSize, 0, frameSize, frameSize];
      const png = readFileSync(new URL(`../static/${path}`, import.meta.url));
      const sheet = { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
      if (sheet.width !== entries.length * frameSize || sheet.height !== frameSize) {
        throw new Error(`Dimensions inattendues : ${path}`);
      }
      return { path, rect, sheet, durationMs: Number(duration) * 1000 / fps };
    });

  const clip = clips.find((body) => body.startsWith(`resource_name = "${name}"\n`));
  const track = clip?.match(/NodePath\("Node2D\/Sprite:frame"\)[\s\S]*?"times": PackedFloat32Array\(([^)]*)\)[\s\S]*?"values": \[([^\]]*)\]/);
  const indices = track?.[2].split(',').map(Number);
  const animationPlayer = clip ? {
    durationMs: Number(clip.match(/^length = ([\d.]+)/m)?.[1] ?? 1) * 1000,
    loopMode: Number(clip.match(/^loop_mode = (\d+)/m)?.[1] ?? 0),
    keys: track ? track[1].split(',').map((time, index) => [Number(time) * 1000, indices[index]]) : []
  } : null;
  const frameLines = frames.map((frame) => '      ' + JSON.stringify(frame)).join(',\n');
  return `  ${name}: {
    fps: ${fps}, loop: ${loop === '1' || loop === 'true'},
    render: ${JSON.stringify(render)},
    frames: [
${frameLines}
    ],
    animationPlayer: ${JSON.stringify(animationPlayer)}
  }`;
});
if (rows.length !== selected.size) throw new Error('Une animation de Moko est absente de la scène.');

const manifest = new URL('../src/lib/moko/moko-manifest.ts', import.meta.url);
const generated = `// Node2D/Sprite → ${framesId} dans player_reference.tscn.
// Clés AnimationPlayer : [temps en ms, index dans frames].
export const mokoAnimations = {
${rows.join(',\n')}
} as const;
`;
if (option === '--check') {
  if (readFileSync(manifest, 'utf8').replaceAll('\r\n', '\n') !== generated) {
    console.error('Le manifeste calculé diffère du manifeste versionné.');
    process.exit(1);
  }
  console.log('Manifeste vérifié.');
  process.exit(0);
}
writeFileSync(manifest, generated);
console.log(`Animations exportées : ${[...selected].join(', ')}`);
