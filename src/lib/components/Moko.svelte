<script lang="ts">
  import { onMount } from 'svelte';
  import { asset } from '$app/paths';
  import { mokoAnimations, mokoFrame, type MokoClip } from '../moko/moko';

  let { clip = 'idle', frameTime }: { clip?: MokoClip; frameTime?: number } = $props();
  let idleTime = $state(0);
  let climbTime = $state(0);
  const frame = $derived(mokoFrame(clip, frameTime ?? (clip === 'idle' ? idleTime : climbTime)));
  const [x, y, width, height] = $derived(frame.rect);
  const sheet = $derived(frame.sheet);
  const render = $derived(mokoAnimations[clip].render);
  const offset = (start: number, size: number, total: number) =>
    total === size ? '0%' : (start / (total - size)) * 100 + '%';

  onMount(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let request = 0;
    let started: number | undefined;
    let previous: number | undefined;

    function animate(now: number) {
      started ??= now;
      idleTime = now - started;
      if (clip === 'idle') climbTime = 0;
      else if (frameTime === undefined) climbTime += now - (previous ?? now);
      previous = now;
      request = requestAnimationFrame(animate);
    }

    function updatePreference() {
      cancelAnimationFrame(request);
      started = undefined;
      previous = undefined;
      idleTime = 0;
      climbTime = 0;
      if (!preference.matches) request = requestAnimationFrame(animate);
    }

    updatePreference();
    preference.addEventListener('change', updatePreference);
    return () => {
      cancelAnimationFrame(request);
      preference.removeEventListener('change', updatePreference);
    };
  });
</script>

<div
  class="moko"
  role="img"
  aria-label="Moko"
  data-clip={clip}
  data-frame={frame.rect[0] / frame.rect[2]}
  style:--sheet-url={'url("' + asset(frame.path) + '")'}
  style:--sheet-size={(sheet.width / width) * 100 + '% ' + (sheet.height / height) * 100 + '%'}
  style:--frame-position={offset(x, width, sheet.width) + ' ' + offset(y, height, sheet.height)}
  style:--sprite-transform={`translate(${render.x * 100}%, ${render.y * 100}%) scale(${render.scale})`}
></div>

<style>
  .moko {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
  }

  .moko::before {
    content: '';
    position: absolute;
    inset: 0;
    transform: var(--sprite-transform);
    transform-origin: top left;
    background-image: var(--sheet-url);
    background-size: var(--sheet-size);
    background-position: var(--frame-position);
    background-repeat: no-repeat;
  }
</style>
