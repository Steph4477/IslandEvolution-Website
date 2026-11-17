<script lang="ts">
  import { introTiming } from '../scene/intro-timeline';

  let { active, onFrame, onFinish, skipLabel }: {
    active: boolean;
    onFrame: (elapsed: number) => void;
    onFinish: () => void;
    skipLabel: string;
  } = $props();

  function finish() {
    if (active) onFinish();
  }

  $effect(() => {
    if (!active) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    if (motion.matches || window.scrollY !== 0 || (location.hash && location.hash !== '#accueil')) {
      finish();
      return;
    }

    function onMotionChange() {
      if (motion.matches) finish();
    }

    let started: number | undefined;
    let frame = requestAnimationFrame(advance);

    function advance(now: number) {
      if (!active) return;
      started ??= now;
      const elapsed = Math.min(introTiming.end, now - started);
      onFrame(elapsed);
      if (elapsed === introTiming.end) finish();
      else frame = requestAnimationFrame(advance);
    }

    window.addEventListener('scroll', finish, { passive: true, once: true });
    motion.addEventListener('change', onMotionChange);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', finish);
      motion.removeEventListener('change', onMotionChange);
    };
  });
</script>

{#if active}
  <button class="skip" type="button" onclick={finish}>{skipLabel}</button>
{/if}

<style>
  .skip {
    position: absolute;
    z-index: 1;
    right: clamp(1rem, 4vw, 3rem);
    top: calc(var(--controls-height) + 1rem);
    min-height: 44px;
    padding: .5rem .9rem;
    border: 1px solid #c9d89f;
    border-radius: 3px;
    background: #142019;
    color: #f8f1da;
    font: inherit;
    font-size: .85rem;
    cursor: pointer;
  }

  @media (prefers-reduced-motion: reduce) {
    .skip { display: none; }
  }
</style>
