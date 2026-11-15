<script module lang="ts">
  import type { MokoAttack } from './moko-attacks';

  const attackSessionKey = 'island-evolution:moko-next-attack';
  let nextAttack: MokoAttack = 'kick';
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import { asset } from '$app/paths';
  import Moko from './Moko.svelte';
  import { observeScroll } from './ScrollController';
  import { mokoAnimations } from './moko';

  let rail: HTMLDivElement;
  let spriteTrack: HTMLDivElement;
  let platform: HTMLDivElement;
  let position: HTMLDivElement;
  let sprite: HTMLDivElement;
  let phase = $state<'moving' | 'jumping' | 'falling' | 'landing' | 'idle'>('idle');
  let jumpTime = $state(0);
  let attack = $state<MokoAttack>();
  let attackTime = $state(0);
  const onPlatform = $derived(phase !== 'moving' && phase !== 'jumping');
  const returnDuration = 300;
  const fallDuration = mokoAnimations.jump_down.frames[0].durationMs;
  const jumpDuration = mokoAnimations.jump_down.animationPlayer.durationMs;
  let movementClip = $state<'climb_liana' | 'climb_liana_cycle'>('climb_liana');

  // Centre de la liane dans le PNG de 1024 × 1024.
  const grips = [
    [60, 502], [125, 505], [256, 514], [384, 541], [512, 560],
    [640, 536], [768, 498], [896, 514], [950, 526], [999, 526]
  ];
  // Main et bord visible du sprite Moko3D, après sa compensation de rendu.
  const climbRender = mokoAnimations.climb_liana.render;
  const handX = climbRender.x + climbRender.scale * 200 / 320;
  const handY = climbRender.y + climbRender.scale * 165 / 320;
  const handToLeft = climbRender.scale * (200 - 82) / 320;
  const idleRender = mokoAnimations.idle.render;
  // Décalage de repos de 12 % et borne alpha droite des quatre frames idle.
  const idleRight = 0.12 + idleRender.x + idleRender.scale * 245 / 320;

  function gripX(y: number) {
    const index = grips.findIndex(([height]) => height >= y);
    if (index === 0) return grips[0][1];
    if (index < 0) return grips[grips.length - 1][1];
    const [startY, startX] = grips[index - 1];
    const [endY, endX] = grips[index];
    return startX + (endX - startX) * (y - startY) / (endY - startY);
  }

  onMount(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let progress = 0;
    let width = 0;
    let spriteTrackWidth = 0;
    let height = 0;
    let size = 0;
    let restTimer: ReturnType<typeof setTimeout> | undefined;
    let hasDropped = false;
    let restDue = false;
    let returnFrame = 0;
    let launch = { x: 0, y: 0, time: 0 };
    let attackFrame = 0;

    try {
      const saved = sessionStorage.getItem(attackSessionKey);
      if (saved === 'kick' || saved === 'clac') nextAttack = saved;
    } catch {
      // L'alternance reste disponible en mémoire si le stockage est bloqué.
    }

    function stopAttack() {
      cancelAnimationFrame(attackFrame);
      attack = undefined;
    }

    function onClick(event: MouseEvent) {
      if (event.button !== 0 || event.detail === 0 || phase !== 'idle' || attack) return;
      const clip = nextAttack;
      nextAttack = clip === 'kick' ? 'clac' : 'kick';
      try {
        sessionStorage.setItem(attackSessionKey, nextAttack);
      } catch {
        // Le stockage est facultatif pour jouer l'attaque.
      }

      attackTime = 0;
      attack = clip;
      const started = performance.now();
      const duration = mokoAnimations[clip].animationPlayer.durationMs;
      function play(now: number) {
        if (now - started >= duration) {
          stopAttack();
          return;
        }
        attackTime = Math.max(0, now - started);
        attackFrame = requestAnimationFrame(play);
      }
      attackFrame = requestAnimationFrame(play);
    }

    function draw() {
      const travel = Math.max(0, height - size - 12);
      const y = travel * progress;
      const gripY = y + size * handY;
      // La deuxième moitié réutilise le PNG retourné verticalement.
      const ropeProgress = height ? 1 - Math.abs(1 - 2 * gripY / height) : 0;
      const textureY = 14 + ropeProgress * 985;
      const ropeX = width * 0.31 + (gripX(textureY) - 512) * height / 1970;
      const x = Math.max(ropeX, size * handToLeft) - size * handX;
      let spriteX = x;
      let spriteY = y;
      if (phase === 'jumping') {
        const fraction = jumpTime / returnDuration;
        const eased = fraction * (2 - fraction);
        spriteX = launch.x + (x - launch.x) * eased;
        const lift = Math.sin(Math.PI * fraction) * 12;
        spriteY = Math.max(0, Math.min(height + 12 - size, launch.y + (y - launch.y) * eased - lift));
      }
      position.style.transform = `translate3d(${spriteX}px, ${spriteY}px, 0)`;
      // Le bord inférieur des pieds du sprite idle est à 204/205 de sa boîte.
      const feetY = y + size * 204 / 205;
      // La marge basse de 16 px laisse 12 px de course supplémentaire.
      const drop = hasDropped ? Math.min(40, Math.max(0, height - feetY)) : 0;
      position.style.setProperty('--drop', `${drop}px`);
      platform.style.top = `${feetY + drop}px`;
      const visibleRight = Math.min(spriteTrackWidth, x + size * idleRight);
      platform.style.setProperty('--branch-end', `${visibleRight + 12}px`);
    }

    function measure() {
      width = rail.clientWidth;
      spriteTrackWidth = spriteTrack.clientWidth;
      height = rail.clientHeight;
      size = sprite.getBoundingClientRect().width;
      draw();
    }

    function resetRest() {
      clearTimeout(restTimer);
      cancelAnimationFrame(returnFrame);
      restDue = false;
      phase = 'idle';
      hasDropped = false;
    }

    function land() {
      if (phase !== 'falling') return;
      clearTimeout(restTimer);
      phase = 'landing';
      restTimer = setTimeout(() => { phase = 'idle'; }, jumpDuration - fallDuration);
    }

    function onFallEnd(event: TransitionEvent) {
      if (event.target === sprite && event.propertyName === 'translate') land();
    }

    function beginRest() {
      if (phase === 'jumping') {
        restDue = true;
        return;
      }
      if (motion.matches) {
        resetRest();
        draw();
        return;
      }
      hasDropped = true;
      phase = 'falling';
      draw();
      // Repli si le navigateur n'émet pas transitionend.
      restTimer = setTimeout(land, fallDuration + 80);
    }

    function returnToLiana(now: number) {
      jumpTime = Math.min(returnDuration, now - launch.time);
      if (jumpTime < returnDuration) {
        draw();
        returnFrame = requestAnimationFrame(returnToLiana);
        return;
      }
      phase = 'moving';
      draw();
      if (restDue) beginRest();
    }

    measure();
    const stopScroll = observeScroll((next) => {
      progress = next.progress;
      if (next.direction !== 'none') {
        if (attack) stopAttack();
        movementClip = next.direction === 'up' ? 'climb_liana_cycle' : 'climb_liana';
        clearTimeout(restTimer);
        restDue = false;
        if (motion.matches) {
          phase = 'moving';
        } else if (phase !== 'moving' && phase !== 'jumping') {
          const origin = rail.getBoundingClientRect();
          const current = sprite.getBoundingClientRect();
          launch = { x: current.left - origin.left, y: current.top - origin.top, time: performance.now() };
          jumpTime = 0;
          phase = 'jumping';
          returnFrame = requestAnimationFrame(returnToLiana);
        }
        hasDropped = false;
        restTimer = setTimeout(beginRest, 250);
      }
      draw();
    });

    function updateMotion() {
      resetRest();
      draw();
    }

    const resize = new ResizeObserver(measure);
    resize.observe(rail);
    resize.observe(spriteTrack);
    resize.observe(sprite);
    motion.addEventListener('change', updateMotion);
    sprite.addEventListener('transitionend', onFallEnd);
    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      stopAttack();
      resetRest();
      resize.disconnect();
      stopScroll();
      motion.removeEventListener('change', updateMotion);
      sprite.removeEventListener('transitionend', onFallEnd);
    };
  });
</script>

<div class="rail" bind:this={rail} aria-hidden="true">
  <img class="liana" src={asset('astra/Liana.png')} alt="" />
  <img class="liana mirrored" src={asset('astra/Liana.png')} alt="" />
</div>
<div class="platform-track" aria-hidden="true">
  <div class="platform" class:resting={onPlatform} bind:this={platform}></div>
</div>
<div class="sprite-track" class:settling={phase !== 'moving'} bind:this={spriteTrack} aria-hidden="true">
  <div class="position" class:resting={onPlatform} bind:this={position}>
    <div class="sprite" class:falling={phase === 'falling'} style:--fall-duration={`${fallDuration}ms`} bind:this={sprite}>
      <Moko
        clip={phase === 'moving' ? movementClip : phase === 'jumping' ? 'jump_up' : phase === 'idle' ? attack ?? 'idle' : 'jump_down'}
        frameTime={attack ? attackTime : phase === 'jumping' ? jumpTime : phase === 'falling' ? 0 : phase === 'landing' ? fallDuration : undefined}
      />
    </div>
  </div>
</div>

<style>
  .rail, .platform-track, .sprite-track {
    position: fixed;
    z-index: 1;
    inset: max(4.5rem, calc(100% - 45rem), env(safe-area-inset-top)) auto max(1rem, env(safe-area-inset-bottom)) 0;
    pointer-events: none;
    overflow: clip;
  }

  .rail {
    width: var(--rail-width);
  }

  .sprite-track, .platform-track {
    --moko-size: calc(var(--rail-width) * 1.25);
    width: calc(var(--content-inset) - 4px);
  }

  .sprite-track { container-type: size; }

  .sprite-track.settling, .platform-track {
    overflow: visible;
    clip-path: inset(0 0 -12px);
  }

  .liana {
    position: absolute;
    left: 31%;
    top: calc(-50% * 14 / 985);
    height: calc(50% * 1024 / 985);
    width: auto;
    transform: translateX(-50%);
  }

  .liana.mirrored {
    top: calc(50% - 50% * 25 / 985);
    transform: translateX(-50%) scaleY(-1);
  }

  .position {
    position: absolute;
    top: 0;
    left: 0;
    width: min(var(--moko-size), max(0px, calc(100cqh - 12px)));
    aspect-ratio: 1;
    transform: translateX(-25%);
  }

  .sprite {
    width: 100%;
  }

  .resting .sprite { translate: 12% var(--drop, 0px); }
  .sprite.falling { transition: translate var(--fall-duration) cubic-bezier(0.45, 0, 0.85, 0.6); }

  @media (min-width: 768px) and (pointer: fine) {
    .sprite-track, .platform-track { --moko-size: calc(var(--rail-width) * 1.5); }
  }

  .platform {
    position: absolute;
    top: calc(var(--moko-size) * 204 / 205);
    left: -20px;
    width: calc(20px + var(--branch-end, var(--rail-width)));
    height: 12px;
    background: linear-gradient(#9db660 0 27%, #65543b 27% 48%, #403326 48%);
    clip-path: polygon(0 0, 94% 0, 100% 22%, 94% 49%, 78% 68%, 50% 77%, 26% 90%, 0 100%);
    opacity: 0;
    transform: scaleX(0.25);
    transform-origin: left;
    transition: opacity 100ms ease, transform 140ms ease-out;
  }

  .platform.resting {
    opacity: 1;
    transform: scaleX(1);
  }

  @media (prefers-reduced-motion: reduce) {
    .sprite, .platform { transition: none; }
  }
</style>
