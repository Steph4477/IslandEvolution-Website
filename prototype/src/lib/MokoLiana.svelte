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
  import { mokoAnimations, type MokoClip } from './moko';
  import tree from './arbre-rest-points.json';
  import { introCamera, introProgress, introTiming } from './intro-timeline';

  let { introActive, introElapsed, treePlane }: {
    introActive: boolean;
    introElapsed: number;
    treePlane?: HTMLDivElement;
  } = $props();
  const reveal = $derived(introProgress(introElapsed, introTiming.pullback, introTiming.rejoin));

  type Point = { x: number; y: number };
  type Perch = (typeof tree.restPoints)[number];
  type Flight = { from: Point; to: Point; lift: number; start: number; duration: number };

  let rail: HTMLDivElement;
  let position: HTMLDivElement;
  let gripTrack: HTMLDivElement;
  let ready = $state(false);
  let perch = $state<Perch>();
  let clip = $state<MokoClip>('idle');
  let frameTime = $state<number>();
  let faceLeft = $state(false);

  const patternId = $props.id();
  const vineTop = 60;
  const vineBottom = 950;
  const vineOverscan = 12;
  let railWidth = $state(0);
  let vineScale = $state(0);
  const tileHeight = $derived((vineBottom - vineTop) * vineScale);
  const sheetWidth = $derived(1024 * vineScale);
  const sheetLeft = $derived(railWidth * .31 - sheetWidth / 2);

  // Centre de la liane dans le PNG, avant son miroir vertical.
  const grips = [
    [60, 502], [125, 505], [256, 514], [384, 541], [512, 560],
    [640, 536], [768, 498], [896, 514], [950, 526], [999, 526]
  ];
  const climb = mokoAnimations.climb_liana.render;
  const handX = climb.x + climb.scale * 200 / 320;
  const handY = climb.y + climb.scale * 165 / 320;
  const gripFoot = { x: climb.x + climb.scale * 180 / 320, y: climb.y + climb.scale * 245 / 320 };
  const idle = mokoAnimations.idle.render;
  const foot = { x: idle.x + idle.scale * 154 / 320, y: idle.y + idle.scale * 279 / 320 };
  const margin = tree.constraints.edgeMarginViewportPxSuggested;
  const navigationJumpDuration = .8;
  const introArrivalSpeed = 1.3;
  const mix = (a: number, b: number, t: number) => a + (b - a) * t;
  const clamp = (n: number, low: number, high: number) => Math.min(high, Math.max(low, n));

  function gripX(y: number) {
    const index = grips.findIndex(([height]) => height >= y);
    if (index === 0) return grips[0][1];
    if (index < 0) return grips[grips.length - 1][1];
    const [startY, startX] = grips[index - 1];
    const [endY, endX] = grips[index];
    return mix(startX, endX, (y - startY) / (endY - startY));
  }

  onMount(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let progress = 0;
    let movementClip: MokoClip = 'climb_liana';
    let current: Point = { x: 0, y: 0 };
    let restTimer: ReturnType<typeof setTimeout> | undefined;
    let frame = 0;
    let attackFrame = 0;
    let flight: Flight | undefined;
    let footerCatch: { target: Point; updated: number } | undefined;
    let walking: { perch: Perch; start: number; y: number } | undefined;
    let mode: 'intro' | 'rope' | 'out' | 'return' | 'walk' | 'rest' =
      introActive && !motion.matches ? 'intro' : 'rope';
    let introFlight: Flight | undefined;
    let restDue = false;

    try {
      const saved = sessionStorage.getItem(attackSessionKey);
      if (saved === 'kick' || saved === 'clac') nextAttack = saved;
    } catch {
      // L’alternance reste disponible en mémoire.
    }

    function rope() {
      const rect = gripTrack.getBoundingClientRect();
      const size = position.offsetWidth;
      const y = Math.max(0, gripTrack.clientHeight - size - 12) * progress;
      const hand = rect.top + y + size * handY;
      const textureTop = rail.getBoundingClientRect().top - vineOverscan;
      const period = tileHeight * 2;
      const phase = period ? ((hand - textureTop) % period + period) % period : 0;
      const textureY = vineScale ? vineTop + Math.min(phase, period - phase) / vineScale : vineTop;
      const x = railWidth * .31 + (gripX(textureY) - 512) * vineScale;
      // Moko saisit la liane depuis la droite : la main reste sur la texture
      // même lorsque celle-ci passe tout près du bord gauche.
      return { x: rect.left + x + size * (handX - gripFoot.x),
        y: rect.top + y + size * gripFoot.y };
    }

    function project(point: Point): Point | undefined {
      if (!treePlane) return;
      const rect = treePlane.getBoundingClientRect();
      return { x: rect.left + point.x * rect.width / tree.image.width,
        y: rect.top + point.y * rect.height / tree.image.height };
    }

    function paint(point: Point, nextClip: MokoClip, time?: number, left = false, onRope = false, scale = 1) {
      current = point;
      clip = nextClip;
      frameTime = time;
      faceLeft = left;
      const size = position.offsetWidth;
      const anchor = onRope ? gripFoot : foot;
      position.style.transform = `translate3d(${point.x - size * anchor.x}px, ${point.y - size * anchor.y}px, 0) scale(${scale})`;
      position.style.transformOrigin = `${anchor.x * 100}% ${anchor.y * 100}%`;
      ready = size > 0;
    }

    function clearance(point: Point, halfWidth: number) {
      const size = position.offsetWidth;
      const top = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0;
      return Math.min(point.x - size * halfWidth, document.documentElement.clientWidth - point.x - size * halfWidth,
        point.y - size * .405 - top, innerHeight - point.y - size * .015);
    }

    function fits(point: Point) {
      return clearance(point, .153) >= 0;
    }

    function arc(route: Flight, t: number, destination = route.to) {
      const eased = t * t * (3 - 2 * t);
      return {
        x: mix(route.from.x, destination.x, eased),
        y: mix(route.from.y, destination.y, eased) - Math.sin(Math.PI * t) * route.lift
      };
    }

    function plan(from: Point, to: Point, start: number, returns: boolean): Flight | undefined {
      const distance = Math.hypot(to.x - from.x, to.y - from.y);
      const route = { from, to, start, duration: clamp(330 + distance * 2, 380, 1150) * navigationJumpDuration, lift: 0 };
      // Monter au-dessus de l’appui avant la descente. Réduire l’arc près du haut de la fenêtre.
      const lift = clamp(distance * .27 + 20, 24, 130);
      const halfWidth = returns ? .19 : .175;
      for (const preferMargin of [true, false]) {
        for (const ratio of [1, .65, .35, 0]) {
          route.lift = lift * ratio;
          let clear = true;
          for (let step = 0; step <= 24; step++) {
            const t = step / 24;
            if ((returns && step === 24) || (!returns && step === 0)) continue;
            const point = arc(route, t);
            const edgeAllowance = Math.max(0, mix(clearance(from, halfWidth), clearance(to, halfWidth), t));
            const required = preferMargin ? Math.min(margin, edgeAllowance) : 0;
            if (clearance(point, halfWidth) < required - .5) { clear = false; break; }
          }
          if (clear) return { ...route };
        }
      }
    }

    function drawRope() {
      paint(rope(), movementClip, undefined, true, true);
    }

    function stopAttack() {
      cancelAnimationFrame(attackFrame);
      attackFrame = 0;
    }

    function idleAt(point: Point) {
      paint(point, 'idle');
    }

    function onClick(event: MouseEvent) {
      if (introActive || event.button !== 0 || event.detail === 0 || mode !== 'rest' || attackFrame
        || (event.target instanceof Element && event.target.closest('a, button, input, select'))) return;
      const attack = nextAttack;
      nextAttack = attack === 'kick' ? 'clac' : 'kick';
      try { sessionStorage.setItem(attackSessionKey, nextAttack); } catch { /* Stockage facultatif. */ }
      const started = performance.now();
      const duration = mokoAnimations[attack].animationPlayer.durationMs;
      function play(now: number) {
        if (now - started >= duration) {
          attackFrame = 0;
          idleAt(current);
          return;
        }
        paint(current, attack, now - started);
        attackFrame = requestAnimationFrame(play);
      }
      attackFrame = requestAnimationFrame(play);
    }

    function beginRest() {
      if (mode !== 'rope' || introActive) { restDue = true; return; }
      restDue = false;
      const from = rope();
      let nearest: { perch: Perch; point: Point; score: number } | undefined;
      for (const candidate of tree.restPoints) {
        const point = project(candidate.feetPx);
        if (!point) continue;
        const score = Math.abs(point.y - from.y);
        if (!nearest || score < nearest.score) nearest = { perch: candidate, point, score };
      }
      if (nearest && fits(nearest.point)) {
        const route = plan(from, nearest.point, performance.now(), false);
        if (route) {
          perch = nearest.perch;
          if (motion.matches) {
            mode = 'rest';
            idleAt(nearest.point);
          } else {
            flight = route;
            mode = 'out';
            schedule();
          }
          return;
        }
      }

      paint(from, 'climb_liana', undefined, true, true);
    }

    function armRest() {
      clearTimeout(restTimer);
      restDue = false;
      restTimer = setTimeout(beginRest, 250);
    }

    function startReturn(now: number, fromFooter = false) {
      walking = undefined;
      perch = undefined;

      const target = rope();
      footerCatch = fromFooter ? { target, updated: now } : undefined;
      flight = plan(current, target, now, true);
      if (!flight) {
        // Même en cas de changement brusque de cadrage, reprendre depuis la pose visible.
        flight = { from: current, to: target, start: now, duration: 360 * navigationJumpDuration, lift: 0 };
      }
      mode = 'return';
      schedule();
    }

    function run(now: number) {
      frame = 0;
      if (mode === 'intro') {
        if (!introActive || motion.matches) {
          mode = 'rope';
          drawRope();
          if (progress > 0) armRest();
          return;
        }
        const { entry, landing, rejoin, end } = introTiming;
        const elapsed = introElapsed;
        const branch = project(tree.restPoints[0].feetPx);
        if (branch && elapsed < landing) {
          const size = position.offsetWidth;
          const outside = { x: -size * 1.25 - 10, y: -size * .5 - 30 };
          const departure = landing - (landing - entry) / introArrivalSpeed;
          const t = introProgress(elapsed, departure, landing);
          const arriving = {
            x: mix(outside.x, branch.x, t * t * (3 - 2 * t)),
            y: mix(outside.y, branch.y, t ** 1.85)
          };
          paint(arriving, 'jump_down', t * 400, false, false, introCamera(elapsed).scale);
        } else if (branch && elapsed < rejoin) {
          paint(branch, 'idle', undefined, false, false, introCamera(elapsed).scale);
        } else if (branch) {
          const target = rope();
          introFlight ??= plan(branch, target, rejoin, true) ?? {
            from: branch, to: target, lift: 24, start: rejoin, duration: end - rejoin
          };
          const t = introProgress(elapsed, rejoin, end);
          const point = arc(introFlight, t, target);
          // Aligner la main de la dernière image de saut avec celle de la pose de grimpe.
          const hand = { x: idle.x + idle.scale * 216 / 320, y: idle.y + idle.scale * 214 / 320 };
          const gripBlend = introProgress(t, .72, 1) * position.offsetWidth;
          point.x += gripBlend * (hand.x - foot.x + gripFoot.x - handX);
          point.y += gripBlend * (handY - gripFoot.y - hand.y + foot.y);
          paint(point, 'jump_up', t * 800, true);
        }
        schedule();
      } else if (mode === 'walk' && walking) {
        const from = project(walking.perch.feetPx);
        const to = project(walking.perch.walkToPx);
        const elapsed = now - walking.start;
        if (!from || !to || Math.abs(from.y - walking.y) > 24 || !fits(to)) {
          startReturn(now);
          return;
        }
        const t = clamp(elapsed / 640, 0, 1);
        paint({ x: mix(from.x, to.x, t), y: mix(from.y, to.y, t) }, 'walk', elapsed, true);
        if (t === 1) startReturn(now);
        else schedule();
      } else if ((mode === 'out' || mode === 'return') && flight) {
        const t = clamp((now - flight.start) / flight.duration, 0, 1);
        if (mode === 'out') {
          if (t === 1) {
            mode = 'rest';
            idleAt(flight.to);
            flight = undefined;
          } else {
            paint(arc(flight, t), 'jump_down', t * 400);
            schedule();
          }
        } else if (t === 1) {
          mode = 'rope';
          flight = undefined;
          footerCatch = undefined;
          drawRope();
          if (restDue) armRest();
        } else {
          const target = rope();
          let destination = target;
          if (footerCatch) {
            // Absorber les grands écarts de scroll, puis rejoindre la prise réelle.
            const follow = 1 - Math.exp(-(now - footerCatch.updated) / 65);
            footerCatch.target = {
              x: mix(footerCatch.target.x, target.x, follow),
              y: mix(footerCatch.target.y, target.y, follow)
            };
            footerCatch.updated = now;
            const catchUp = introProgress(t, .7, 1);
            destination = {
              x: mix(footerCatch.target.x, target.x, catchUp),
              y: mix(footerCatch.target.y, target.y, catchUp)
            };
          }
          const point = arc(flight, t, destination);
          paint(point, 'jump_up', t * 800, true);
          schedule();
        }
      }
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(run);
    }

    const stopScroll = observeScroll((next) => {
      progress = next.progress;
      if (next.direction === 'none') return;
      movementClip = next.direction === 'up' ? 'climb_liana_cycle' : 'climb_liana';
      if (introActive || mode === 'intro') return;
      if (motion.matches) {
        mode = 'rope';

        perch = undefined;
        drawRope();
      } else if (mode === 'rest' && perch) {
        stopAttack();
        const now = performance.now();
        if (perch.id === 'roots_ground') {
          startReturn(now, true);
        } else {
          walking = { perch, start: now, y: current.y };
          mode = 'walk';
          schedule();
        }
      } else if (mode === 'out') {
        stopAttack();
        startReturn(performance.now());
      } else if (mode === 'rope') drawRope();
      armRest();
    });

    function recalculate() {
      railWidth = rail.clientWidth;
      // L'échelle de la texture reste celle de l'ancienne liane à l'écran.
      vineScale = gripTrack.clientHeight / 1970;
      if (mode === 'intro') return;
      if (mode === 'rest' && perch) {
        const point = project(perch.feetPx);
        if (point && fits(point)) {
          stopAttack();
          idleAt(point);
          return;
        }
      }
      stopAttack();
      mode = 'rope';
      perch = undefined;

      drawRope();
      if (progress > 0) armRest();
    }

    const resize = new ResizeObserver(recalculate);
    resize.observe(rail);
    resize.observe(gripTrack);
    // Diagnostic : les repères et Moko relisent la même transformation.
    let lastFraming = treePlane?.style.getPropertyValue('--diagnostic-framing') ?? '';
    const framing = new MutationObserver(() => {
      const nextFraming = treePlane?.style.getPropertyValue('--diagnostic-framing') ?? '';
      if (lastFraming === nextFraming) return;
      lastFraming = nextFraming;
      recalculate();
    });
    if (treePlane) framing.observe(treePlane, { attributes: true, attributeFilter: ['style'] });
    motion.addEventListener('change', recalculate);
    document.addEventListener('click', onClick, true);
    recalculate();
    if (mode === 'intro') schedule();

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(restTimer);
      stopAttack();
      stopScroll();
      resize.disconnect();
      framing.disconnect();
      motion.removeEventListener('change', recalculate);
      document.removeEventListener('click', onClick, true);
    };
  });
</script>

<div class="rail" class:unrolling={introActive}
  style:--reveal-height={reveal < 1 ? `${reveal * 100}dvh` : undefined}
  bind:this={rail} aria-hidden="true">
  {#if tileHeight && railWidth}
    <svg class="liana" style:--overscan={vineOverscan + 'px'}>
      <defs>
        <pattern id={patternId} width={railWidth} height={tileHeight * 2} patternUnits="userSpaceOnUse">
          <!-- Deux coupes du même corps de liane se rejoignent à la même ligne de pixels. -->
          {#each [false, true] as mirrored}
            <g transform={mirrored ? 'translate(0 ' + tileHeight * 2 + ') scale(1 -1)' : undefined}>
              <svg x={sheetLeft} width={sheetWidth} height={tileHeight}
                viewBox={'0 ' + vineTop + ' 1024 ' + (vineBottom - vineTop)} overflow="hidden">
                <image href={asset('astra/Liana.png')} width="1024" height="1024" />
              </svg>
            </g>
          {/each}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={'url(#' + patternId + ')'} />
    </svg>
  {/if}
</div>
<div class="grip-track" bind:this={gripTrack} aria-hidden="true"></div>
<div class="sprite-track" class:ready aria-hidden="true">
  <div class="position" bind:this={position}>
    <div class:face-left={faceLeft}>
      <Moko {clip} {frameTime} />
    </div>
  </div>
</div>

<style>
  .rail {
    position: absolute;
    inset: 0 auto 0 0;
    z-index: 2;
    width: var(--rail-width);
    overflow: clip;
    pointer-events: none;
  }

  .grip-track {
    position: fixed;
    inset: max(4.5rem, calc(100% - 45rem), env(safe-area-inset-top)) auto max(1rem, env(safe-area-inset-bottom)) 0;
    pointer-events: none;
  }

  .rail.unrolling { clip-path: inset(0 0 max(0px, calc(100% - var(--reveal-height, 100%)))); }

  .liana {
    position: absolute;
    top: calc(-1 * var(--overscan));
    left: 0;
    width: 100%;
    height: calc(100% + 2 * var(--overscan));
  }

  .sprite-track {
    --moko-size: calc(var(--rail-width) * 1.25);
    position: fixed;
    inset: 0;
    z-index: 5;
    pointer-events: none;
    overflow: clip;
    visibility: hidden;
  }

  .sprite-track.ready { visibility: visible; }

  .position {
    position: absolute;
    top: 0;
    left: 0;
    width: var(--moko-size);
    max-width: max(0px, calc(100dvh - max(4.5rem, calc(100dvh - 45rem), env(safe-area-inset-top)) - max(1rem, env(safe-area-inset-bottom)) - 12px));
    aspect-ratio: 1;
    transform: translate(-120%, -120%);
  }

  .position > div { transform-origin: inherit; }
  .face-left { transform: scaleX(-1); }

  @media (min-width: 768px) and (pointer: fine) {
    .sprite-track { --moko-size: calc(var(--rail-width) * 1.5); }
  }

  @media (prefers-reduced-motion: reduce) {
    .rail.unrolling { clip-path: none; }
  }
</style>
