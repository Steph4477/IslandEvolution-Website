<script module lang="ts">
  import type { MokoAttack } from '../moko/moko-attacks';

  const attackSessionKey = 'island-evolution:moko-next-attack';
  let nextAttack: MokoAttack = 'kick';
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import { asset } from '$app/paths';
  import Moko from './Moko.svelte';
  import {
    acceptsSkill,
    cocoShotTiming,
    jumpDuration,
    skillsJumpLift,
    skillsJumpPeak,
    type Skill,
    type SkillsState
  } from '../scene/skills-actions';
  import { cocoTrajectory } from '../scene/coco-trajectory';
  import { observeScroll } from '../scene/scroll-controller';
  import { skillsGround, wantsSkillsGround } from '../scene/skills-transfer';
  import { mokoAnimations, type MokoClip } from '../moko/moko';
  import tree from '../scene/tree-perches.json';
  import { introCamera, introProgress, introTiming } from '../scene/intro-timeline';

  let {
    introActive,
    introElapsed,
    treePlane,
    skillsState = $bindable<SkillsState>('unavailable')
  }: {
    introActive: boolean;
    introElapsed: number;
    treePlane?: HTMLDivElement;
    skillsState?: SkillsState;
  } = $props();
  const reveal = $derived(introProgress(introElapsed, introTiming.pullback, introTiming.rejoin));

  type Point = { x: number; y: number };
  type Coco = { id: number; x: number; y: number; size: number; unitsToCss: number };
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
  let coconuts = $state<Coco[]>([]);
  let requestSkill: ((skill: Skill) => void) | undefined;

  export function playSkill(skill: Skill) {
    requestSkill?.(skill);
  }

  function removeCoco(id: number) {
    coconuts = coconuts.filter((coco) => coco.id !== id);
  }

  function flyCoco(node: HTMLImageElement, coco: Coco) {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const frames = cocoTrajectory(
      coco.unitsToCss,
      document.documentElement.clientWidth - coco.x + coco.size / 2 + 1,
      innerHeight - coco.y + coco.size / 2 + 1
    );
    const duration = frames[frames.length - 1].time;
    const animation = motion.matches
      ? node.animate([{ opacity: 1 }, { opacity: 1 }], 200)
      : node.animate(
          frames.map(({ x, y, time }) => ({
            transform: 'translate3d(' + x + 'px,' + y + 'px,0)',
            offset: duration ? time / duration : 0
          })),
          { duration, fill: 'forwards' }
        );
    const remove = () => removeCoco(coco.id);
    animation.onfinish = remove;
    motion.addEventListener('change', remove);
    return {
      destroy() {
        animation.onfinish = null;
        animation.cancel();
        motion.removeEventListener('change', remove);
      }
    };
  }

  const cocoSprite = asset('skills/coconut.png');
  const patternId = $props.id();
  const vineTop = 60;
  const vineBottom = 950;
  const vineOverscan = 12;
  let railWidth = $state(0);
  let vineScale = $state(0);
  const tileHeight = $derived((vineBottom - vineTop) * vineScale);
  const sheetWidth = $derived(1024 * vineScale);
  const sheetLeft = $derived(railWidth * 0.31 - sheetWidth / 2);

  // Centre de la liane dans le PNG, avant son miroir vertical.
  const grips = [
    [60, 502],
    [125, 505],
    [256, 514],
    [384, 541],
    [512, 560],
    [640, 536],
    [768, 498],
    [896, 514],
    [950, 526],
    [999, 526]
  ];
  const climb = mokoAnimations.climb_liana.render;
  const handX = climb.x + (climb.scale * 200) / 320;
  const handY = climb.y + (climb.scale * 165) / 320;
  const gripFoot = {
    x: climb.x + (climb.scale * 180) / 320,
    y: climb.y + (climb.scale * 245) / 320
  };
  const idle = mokoAnimations.idle.render;
  const foot = { x: idle.x + (idle.scale * 154) / 320, y: idle.y + (idle.scale * 279) / 320 };
  const desktopScale = 1.5;
  const margin = tree.constraints.edgeMarginViewportPxSuggested;
  const JUMP_SPEED_MULTIPLIER = 1.5;
  const navigationJumpDuration = 0.8;
  const introArrivalPoseDuration = (introTiming.landing - introTiming.entry) / 1.3;
  const introArrivalDuration = introArrivalPoseDuration / 1.4;
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
    const desktop = matchMedia('(min-width: 1000px) and (pointer: fine)');
    let progress = 0;
    let movementClip: MokoClip = 'climb_liana';
    let current: Point = { x: 0, y: 0 };
    let restTimer: ReturnType<typeof setTimeout> | undefined;
    let frame = 0;
    let attackFrame = 0;
    let flight: Flight | undefined;
    let footerCatch: { target: Point; updated: number } | undefined;
    let walking: { perch: Perch; start: number; y: number } | undefined;
    let mode:
      | 'intro'
      | 'rope'
      | 'out'
      | 'return'
      | 'walk'
      | 'rest'
      | 'skills-out'
      | 'skills-idle'
      | 'skills-return' = introActive && !motion.matches ? 'intro' : 'rope';
    let introFlight: Flight | undefined;
    let restDue = false;
    let skillStart = 0;
    let lootedThisVisit = false;
    let jumpStart: number | undefined;
    let queuedCoco: { time: number; airborne: boolean } | undefined;
    let nextCocoId = 0;
    let cocoImage: HTMLImageElement | undefined;

    function jumpPoint(landing: Point, size: number, progress: number) {
      if (motion.matches) return landing;
      const apex = skillsJumpPeak(
        desktop.matches ? size / desktopScale : size,
        landing.y - size * 0.44 - 80
      );
      return { x: landing.x, y: landing.y - apex * skillsJumpLift(progress) };
    }

    function releaseCoco(point: Point, spriteSize: number, airborne: boolean) {
      // La Coco de la pose shoot occupe environ 33 px dans la frame de 320 px.
      // Le PNG indépendant n'occupe que 70 px sur 80 en largeur.
      const size = spriteSize * idle.scale * (33 / 320) * (80 / 70);
      // Coordonnées de la main sur les poses de lancer : shoot 5 et jump_shoot 4.
      const x = point.x + (spriteSize * idle.scale * ((airborne ? 237 : 231) - 154)) / 320;
      const y = point.y + (spriteSize * idle.scale * ((airborne ? 190 : 206) - 279)) / 320;
      // Godot applique 1,2 sur Node2D, puis 0,5 sur le sprite de Moko.
      const unitsToCss = (spriteSize * idle.scale) / (320 * 1.2 * 0.5);
      coconuts = [...coconuts, { id: ++nextCocoId, x, y, size, unitsToCss }];
    }

    function endSkills() {
      skillsState = 'unavailable';
      jumpStart = undefined;
      queuedCoco = undefined;
      coconuts = [];
    }

    function landInSkills(point: Point, now: number) {
      if (!cocoImage) {
        cocoImage = new Image();
        cocoImage.src = cocoSprite;
      }
      idleAt(point);
      skillsState = 'idle';
      if (!lootedThisVisit) {
        lootedThisVisit = true;
        if (!motion.matches) {
          skillsState = 'loot';
          skillStart = now;
          paint(point, 'loot_skill', 0);
          schedule();
        }
      }
    }

    function catchRopeAfterSkills() {
      lootedThisVisit = false;
      drawRope();
    }

    requestSkill = (skill) => {
      if (mode !== 'skills-idle' || !acceptsSkill(skillsState, skill)) return;
      const now = performance.now();
      const landing = project(skillsGround);
      if (!landing || !fits(landing)) return;

      if (skill === 'jump') {
        jumpStart = now;
        skillsState = 'jump';
      } else {
        if (jumpStart !== undefined && now - jumpStart >= jumpDuration) return;
        const timing = cocoShotTiming(now, jumpStart);
        skillStart = timing.animationStart;
        queuedCoco = { time: timing.releaseAt, airborne: jumpStart !== undefined };
        skillsState = jumpStart === undefined ? 'shoot' : 'jump_shoot';
      }
      schedule();
    };

    function updateSkills(now: number, landing: Point) {
      const state = skillsState;
      const elapsed = now - skillStart;
      const size = position.offsetWidth;
      if (queuedCoco && now >= queuedCoco.time) {
        const progress =
          jumpStart === undefined ? 0 : clamp((queuedCoco.time - jumpStart) / jumpDuration, 0, 1);
        releaseCoco(jumpPoint(landing, size, progress), size, queuedCoco.airborne);
        queuedCoco = undefined;
      }
      if (jumpStart !== undefined) {
        const progress = clamp((now - jumpStart) / jumpDuration, 0, 1);
        if (progress < 1) {
          const point = jumpPoint(landing, size, progress);
          const pose = progress < 0.5 ? 'jump_up' : 'jump_down';
          const poseTime = (progress < 0.5 ? progress : progress - 0.5) * jumpDuration;
          if (
            state === 'jump_shoot' &&
            elapsed < mokoAnimations.jump_shoot.animationPlayer.durationMs
          ) {
            paint(point, 'jump_shoot', motion.matches ? 400 : elapsed);
          } else {
            skillsState = 'jump';
            paint(point, motion.matches ? 'jump_up' : pose, motion.matches ? 0 : poseTime);
          }
          schedule();
          return;
        }
        jumpStart = undefined;
      } else if (state === 'loot' || state === 'shoot') {
        const skillClip = state === 'loot' ? 'loot_skill' : 'shoot';
        if (!motion.matches && elapsed < mokoAnimations[skillClip].animationPlayer.durationMs) {
          paint(landing, skillClip, elapsed);
          schedule();
          return;
        }
        if (
          motion.matches &&
          state === 'shoot' &&
          elapsed < mokoAnimations.shoot.animationPlayer.durationMs
        ) {
          paint(landing, 'shoot', 500);
          schedule();
          return;
        }
      }
      skillsState = 'idle';
      idleAt(landing);
    }

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
      const phase = period ? (((hand - textureTop) % period) + period) % period : 0;
      const textureY = vineScale ? vineTop + Math.min(phase, period - phase) / vineScale : vineTop;
      const x = railWidth * 0.31 + (gripX(textureY) - 512) * vineScale;
      // Moko saisit la liane depuis la droite : la main reste sur la texture
      // même lorsque celle-ci passe tout près du bord gauche.
      return {
        x: rect.left + x + size * (handX - gripFoot.x),
        y: rect.top + y + size * gripFoot.y
      };
    }

    function project(point: Point): Point | undefined {
      if (!treePlane) return;
      const rect = treePlane.getBoundingClientRect();
      return {
        x: rect.left + (point.x * rect.width) / tree.image.width,
        y: rect.top + (point.y * rect.height) / tree.image.height
      };
    }

    function paint(
      point: Point,
      nextClip: MokoClip,
      time?: number,
      left = false,
      onRope = false,
      scale = 1
    ) {
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

    function clearance(point: Point, halfWidth: number, leftEdge = 0) {
      const size = position.offsetWidth;
      const top = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0;
      return Math.min(
        point.x - size * halfWidth - leftEdge,
        document.documentElement.clientWidth - point.x - size * halfWidth,
        point.y - size * 0.405 - top,
        innerHeight - point.y - size * 0.015
      );
    }

    function fits(point: Point) {
      return clearance(point, 0.153) >= 0;
    }

    function arc(route: Flight, t: number, destination = route.to) {
      const eased = t * t * (3 - 2 * t);
      return {
        x: mix(route.from.x, destination.x, eased),
        y: mix(route.from.y, destination.y, eased) - Math.sin(Math.PI * t) * route.lift
      };
    }

    function plan(
      from: Point,
      to: Point,
      start: number,
      returns: boolean,
      startsOnRope = false
    ): Flight | undefined {
      const distance = Math.hypot(to.x - from.x, to.y - from.y);
      const duration = clamp(330 + distance * 2, 380, 1150) * navigationJumpDuration;
      const route = { from, to, start, duration: duration / JUMP_SPEED_MULTIPLIER, lift: 0 };
      // Monter au-dessus de l’appui avant la descente. Réduire l’arc près du haut de la fenêtre.
      const lift = clamp(distance * 0.27 + 20, 24, 130);
      const halfWidth = returns ? 0.19 : 0.175;
      // Au départ de Skills, accepter uniquement le recadrage déjà présent sur la liane.
      const launchEdge = startsOnRope ? Math.min(0, from.x - position.offsetWidth * halfWidth) : 0;
      for (const preferMargin of [true, false]) {
        for (const ratio of [1, 0.65, 0.35, 0]) {
          route.lift = lift * ratio;
          let clear = true;
          for (let step = 0; step <= 24; step++) {
            const t = step / 24;
            if ((returns && step === 24) || (!returns && step === 0)) continue;
            const point = arc(route, t);
            const edgeAllowance = Math.max(
              0,
              mix(clearance(from, halfWidth), clearance(to, halfWidth), t)
            );
            const required = preferMargin ? Math.min(margin, edgeAllowance) : 0;
            if (
              clearance(point, halfWidth, launchEdge * (1 - t * t * (3 - 2 * t))) <
              required - 0.5
            ) {
              clear = false;
              break;
            }
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

    function syncSkills(now: number) {
      const landing = project(skillsGround);
      if (!landing) return false;

      const headingToGround = mode === 'skills-out' || mode === 'skills-idle';
      const wantsGround = wantsSkillsGround(landing.y, innerHeight, headingToGround);
      if (wantsGround && headingToGround) {
        if (mode === 'skills-idle' && skillsState === 'idle') idleAt(landing);
        return true;
      }
      if (
        (!wantsGround && !headingToGround) ||
        (wantsGround && mode !== 'rope' && mode !== 'skills-return')
      ) {
        return mode === 'skills-return';
      }

      const target = wantsGround ? landing : rope();
      if (wantsGround && !fits(target)) return mode === 'skills-return';

      const route = plan(current, target, now, !wantsGround, wantsGround && mode === 'rope');
      if (wantsGround && !route && !motion.matches) return mode === 'skills-return';

      clearTimeout(restTimer);
      restDue = false;
      perch = undefined;
      if (!wantsGround) endSkills();
      if (motion.matches) {
        flight = undefined;
        mode = wantsGround ? 'skills-idle' : 'rope';
        if (wantsGround) landInSkills(target, now);
        else catchRopeAfterSkills();
      } else {
        flight = route ?? { from: current, to: target, start: now, duration: 280, lift: 28 };
        mode = wantsGround ? 'skills-out' : 'skills-return';
        schedule();
      }
      return true;
    }

    function onClick(event: MouseEvent) {
      if (
        introActive ||
        event.button !== 0 ||
        event.detail === 0 ||
        mode !== 'rest' ||
        attackFrame ||
        (event.target instanceof Element &&
          event.target.closest('a, button, input, select, .beta-dialog[open]'))
      )
        return;
      const attack = nextAttack;
      nextAttack = attack === 'kick' ? 'clac' : 'kick';
      try {
        sessionStorage.setItem(attackSessionKey, nextAttack);
      } catch {
        /* Stockage facultatif. */
      }
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
      if (mode !== 'rope' || introActive) {
        restDue = true;
        return;
      }
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
        flight = {
          from: current,
          to: target,
          start: now,
          duration: (360 * navigationJumpDuration) / JUMP_SPEED_MULTIPLIER,
          lift: 0
        };
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
          if (!syncSkills(now) && progress > 0) armRest();
          return;
        }
        const { landing, rejoin, end } = introTiming;
        const elapsed = introElapsed;
        const branch = project(tree.restPoints[0].feetPx);
        if (branch && elapsed < landing) {
          const size = position.offsetWidth;
          const outside = { x: -size * 1.25 - 10, y: -size * 0.5 - 30 };
          const departure = landing - introArrivalDuration / JUMP_SPEED_MULTIPLIER;
          const t = introProgress(elapsed, departure, landing);
          const arriving = {
            x: mix(outside.x, branch.x, t * t * (3 - 2 * t)),
            y: mix(outside.y, branch.y, t ** 2.1)
          };
          // Conserver le même instant relatif de changement de pose dans le bond.
          const pose = (t * introArrivalDuration) / introArrivalPoseDuration;
          paint(
            arriving,
            'jump_down',
            pose * mokoAnimations.jump_down.animationPlayer.durationMs,
            false,
            false,
            introCamera(elapsed).scale
          );
        } else if (branch && elapsed < rejoin) {
          paint(branch, 'idle', undefined, false, false, introCamera(elapsed).scale);
        } else if (branch) {
          const catchTime = rejoin + (end - rejoin) / JUMP_SPEED_MULTIPLIER;
          const t = introProgress(elapsed, rejoin, catchTime);
          if (t === 1) {
            drawRope();
            schedule();
            return;
          }
          const target = rope();
          introFlight ??= plan(branch, target, rejoin, true) ?? {
            from: branch,
            to: target,
            lift: 24,
            start: rejoin,
            duration: catchTime - rejoin
          };
          const point = arc(introFlight, t, target);
          // Aligner la main de la dernière image de saut avec celle de la pose de grimpe.
          const hand = {
            x: idle.x + (idle.scale * 216) / 320,
            y: idle.y + (idle.scale * 214) / 320
          };
          const gripBlend = introProgress(t, 0.72, 1) * position.offsetWidth;
          point.x += gripBlend * (hand.x - foot.x + gripFoot.x - handX);
          point.y += gripBlend * (handY - gripFoot.y - hand.y + foot.y);
          paint(point, 'jump_up', t * mokoAnimations.jump_up.animationPlayer.durationMs, true);
        }
        schedule();
      } else if (mode === 'skills-idle') {
        syncSkills(now);
        const landing = project(skillsGround);
        if (mode === 'skills-idle' && landing && skillsState !== 'idle') updateSkills(now, landing);
      } else if ((mode === 'skills-out' || mode === 'skills-return') && flight) {
        syncSkills(now);
        if (!flight) return;
        const landing = mode === 'skills-out';
        const target = landing ? (project(skillsGround) ?? flight.to) : rope();
        const t = motion.matches ? 1 : clamp((now - flight.start) / flight.duration, 0, 1);
        if (t === 1) {
          flight = undefined;
          mode = landing ? 'skills-idle' : 'rope';
          if (landing) landInSkills(target, now);
          else catchRopeAfterSkills();
        } else {
          const jump = landing ? 'jump_down' : 'jump_up';
          paint(
            arc(flight, t, target),
            jump,
            t * mokoAnimations[jump].animationPlayer.durationMs,
            !landing
          );
          schedule();
        }
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
            paint(
              arc(flight, t),
              'jump_down',
              t * mokoAnimations.jump_down.animationPlayer.durationMs
            );
            schedule();
          }
        } else if (t === 1) {
          mode = 'rope';
          flight = undefined;
          footerCatch = undefined;
          drawRope();
          if (!syncSkills(now) && restDue) armRest();
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
            const catchUp = introProgress(t, 0.7, 1);
            destination = {
              x: mix(footerCatch.target.x, target.x, catchUp),
              y: mix(footerCatch.target.y, target.y, catchUp)
            };
          }
          const point = arc(flight, t, destination);
          paint(point, 'jump_up', t * mokoAnimations.jump_up.animationPlayer.durationMs, true);
          schedule();
        }
      }
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(run);
    }

    const stopScroll = observeScroll((next) => {
      progress = next.progress;
      if (next.direction !== 'none')
        movementClip = next.direction === 'up' ? 'climb_liana_cycle' : 'climb_liana';
      if (introActive || mode === 'intro') return;
      if (syncSkills(performance.now()) || next.direction === 'none') return;
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
      if (mode === 'skills-out' || mode === 'skills-return' || mode === 'skills-idle') {
        syncSkills(performance.now());
        return;
      }
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
      if (!syncSkills(performance.now()) && progress > 0) armRest();
    }

    const resize = new ResizeObserver(recalculate);
    resize.observe(rail);
    resize.observe(gripTrack);
    resize.observe(position);
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
      requestSkill = undefined;
      endSkills();
    };
  });
</script>

<div
  class="rail"
  class:unrolling={introActive}
  style:--reveal-height={reveal < 1 ? `${reveal * 100}dvh` : undefined}
  bind:this={rail}
  aria-hidden="true"
>
  {#if tileHeight && railWidth}
    <svg class="liana" style:--overscan={vineOverscan + 'px'}>
      <defs>
        <pattern
          id={patternId}
          width={railWidth}
          height={tileHeight * 2}
          patternUnits="userSpaceOnUse"
        >
          <!-- Deux coupes du même corps de liane se rejoignent à la même ligne de pixels. -->
          {#each [false, true] as mirrored}
            <g transform={mirrored ? 'translate(0 ' + tileHeight * 2 + ') scale(1 -1)' : undefined}>
              <svg
                x={sheetLeft}
                width={sheetWidth}
                height={tileHeight}
                viewBox={'0 ' + vineTop + ' 1024 ' + (vineBottom - vineTop)}
                overflow="hidden"
              >
                <image href={asset('images/environment/liana.png')} width="1024" height="1024" />
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
<div
  class="sprite-track"
  class:ready
  style:--moko-desktop-scale={desktopScale}
  class:skills-foreground={skillsState !== 'unavailable' && skillsState !== 'idle'}
  aria-hidden="true"
>
  <div class="position" bind:this={position}>
    <div class:face-left={faceLeft}>
      <Moko {clip} {frameTime} />
    </div>
  </div>
</div>

{#if coconuts.length}
  <div class="coco-track" aria-hidden="true">
    {#each coconuts as coco (coco.id)}
      <img
        class="coco-shot"
        src={cocoSprite}
        alt=""
        width="80"
        height="80"
        style:left={coco.x + 'px'}
        style:top={coco.y + 'px'}
        style:width={coco.size + 'px'}
        use:flyCoco={coco}
      />
    {/each}
  </div>
{/if}

<style>
  .sprite-track,
  .coco-track {
    /* Keep viewport coordinates, but show only the part inside the immersive world. */
    clip-path: inset(
      clamp(0px, var(--world-top, 0px), 100%) 0
        clamp(0px, calc(100% - var(--world-bottom, 0px)), 100%) 0
    );
  }

  .coco-track {
    position: fixed;
    z-index: 6;
    inset: 0;
    overflow: clip;
    pointer-events: none;
  }

  .coco-shot {
    position: absolute;
    height: auto;
    translate: -50% -50%;
  }

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
    inset: max(4.5rem, calc(100% - 45rem), env(safe-area-inset-top)) auto
      max(1rem, env(safe-area-inset-bottom)) 0;
    pointer-events: none;
  }

  .rail.unrolling {
    clip-path: inset(0 0 max(0px, calc(100% - var(--reveal-height, 100%))));
  }

  .liana {
    position: absolute;
    top: calc(-1 * var(--overscan));
    left: 0;
    width: 100%;
    height: calc(100% + 2 * var(--overscan));
  }

  .sprite-track {
    --moko-size: calc(var(--rail-width) * 1.25);
    --moko-responsive-scale: 2;
    position: fixed;
    inset: 0;
    z-index: 3;
    pointer-events: none;
    overflow: clip;
    visibility: hidden;
  }

  .sprite-track.skills-foreground {
    z-index: 5;
  }
  .sprite-track.ready {
    visibility: visible;
  }

  .position {
    position: absolute;
    top: 0;
    left: 0;
    width: calc(var(--moko-size) * var(--moko-responsive-scale));
    max-width: calc(
      var(--moko-responsive-scale) *
        max(
          0px,
          100dvh - max(4.5rem, calc(100dvh - 45rem), env(safe-area-inset-top)) -
            max(1rem, env(safe-area-inset-bottom)) - 12px
        )
    );
    aspect-ratio: 1;
    transform: translate(-120%, -120%);
  }

  .position > div {
    transform-origin: inherit;
  }
  .face-left {
    transform: scaleX(-1);
  }

  @media (min-width: 768px) and (pointer: fine) {
    .sprite-track {
      --moko-size: calc(var(--rail-width) * 1.5);
      --moko-responsive-scale: 1;
    }
  }

  @media (min-width: 1000px) and (pointer: fine) {
    .sprite-track {
      --moko-responsive-scale: var(--moko-desktop-scale);
      z-index: 5;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .rail.unrolling {
      clip-path: none;
    }
  }
</style>
