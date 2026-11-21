<script lang="ts">
  import { tick } from 'svelte';
  import {
    claimPlayback,
    createYouTubeFrame,
    loadYouTube,
    onPlaybackAvailable,
    releasePlayback,
    type YouTubePlayer
  } from '../video/youtube';

  let {
    id,
    poster,
    title,
    labels,
    allowed,
    onManualPlayback
  }: {
    id: string;
    poster: string;
    title: string;
    labels: { play: string; unavailable: string };
    allowed: boolean;
    onManualPlayback?: () => void;
  } = $props();

  const threshold = 0.6;
  let screen: HTMLDivElement;
  let host: HTMLDivElement;
  let trigger = $state<HTMLButtonElement>();
  let frame = $state<HTMLIFrameElement>();
  let status = $state<'idle' | 'loading' | 'ready' | 'error'>('idle');
  let startManually: (() => void) | undefined;

  $effect(() => {
    if (frame) frame.title = title;
  });

  $effect(() => {
    if (!allowed) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let ratio = 0;
    let player: YouTubePlayer | undefined;
    let disposed = false;
    let requested = false;
    let manual = false;
    let manualOnly = false;
    let pendingManualPlayback = false;
    let timeout: number | undefined;

    function pause() {
      const shouldPause = requested;
      requested = false;
      pendingManualPlayback = false;
      releasePlayback(pause);
      if (shouldPause) player?.pauseVideo();
    }

    function canPlay() {
      if (!allowed || disposed || document.hidden || ratio <= 0) return false;
      return manual || (!motion.matches && !manualOnly && ratio >= threshold);
    }

    function reconcile() {
      if (!canPlay()) {
        pause();
        return;
      }
      if (status === 'idle') {
        void load();
      } else if (status === 'ready' && !requested && claimPlayback(pause, manual)) {
        requested = true;
        if (!manual) player?.mute();
        player?.playVideo();
      }
    }

    function fail() {
      window.clearTimeout(timeout);
      pause();
      player?.destroy();
      player = undefined;
      host.replaceChildren();
      frame = undefined;
      status = 'error';
    }

    async function load() {
      status = 'loading';
      try {
        const api = await loadYouTube();
        if (disposed) return;
        if (!canPlay()) {
          status = 'idle';
          return;
        }
        const iframe = createYouTubeFrame(id, title);
        frame = iframe;
        host.replaceChildren(iframe);
        timeout = window.setTimeout(fail, 12000);
        player = new api.Player(iframe, {
          events: {
            onReady({ target }) {
              if (disposed || frame !== iframe) return;
              window.clearTimeout(timeout);
              player = target;
              target.mute();
              const moveFocus = document.activeElement === trigger;
              status = 'ready';
              reconcile();
              if (moveFocus) void tick().then(() => iframe.focus({ preventScroll: true }));
            },
            onStateChange({ data }) {
              if (disposed || frame !== iframe) return;
              if (data === 1) {
                if (document.hidden || ratio <= 0) {
                  requested = true;
                  pause();
                  return;
                }
                if (!requested) {
                  manual = true;
                  manualOnly = false;
                }
                requested = true;
                if (!canPlay() || !claimPlayback(pause, manual)) {
                  pause();
                } else if (pendingManualPlayback) {
                  pendingManualPlayback = false;
                  onManualPlayback?.();
                }
              } else if (data === 0 || (data === 2 && requested)) {
                manualOnly = true;
                manual = false;
                pendingManualPlayback = false;
                requested = false;
                releasePlayback(pause);
              }
            },
            onAutoplayBlocked() {
              if (frame !== iframe) return;
              manualOnly = true;
              manual = false;
              pendingManualPlayback = false;
              requested = false;
              releasePlayback(pause);
            },
            onError() {
              if (frame === iframe) fail();
            }
          }
        });
      } catch {
        if (!disposed) fail();
      }
    }

    startManually = () => {
      manual = true;
      manualOnly = false;
      pendingManualPlayback = true;
      ratio = Math.max(ratio, Number.EPSILON);
      if (status === 'error') status = 'idle';
      reconcile();
    };

    const observer =
      'IntersectionObserver' in window
        ? new IntersectionObserver(
            ([entry]) => {
              ratio = entry.intersectionRatio;
              reconcile();
            },
            { threshold: [0, 0.01, threshold] }
          )
        : undefined;
    observer?.observe(screen);
    const stopWaiting = onPlaybackAvailable(reconcile);
    document.addEventListener('visibilitychange', reconcile);
    motion.addEventListener('change', reconcile);
    return () => {
      disposed = true;
      observer?.disconnect();
      stopWaiting();
      document.removeEventListener('visibilitychange', reconcile);
      motion.removeEventListener('change', reconcile);
      window.clearTimeout(timeout);
      pause();
      player?.destroy();
      host.replaceChildren();
      frame = undefined;
      status = 'idle';
      startManually = undefined;
    };
  });
</script>

<div class="video">
  <div class="screen" bind:this={screen} aria-busy={status === 'loading'}>
    <div class="player" bind:this={host}></div>
    {#if !allowed}
      <img
        class="poster"
        src={poster}
        alt=""
        loading="lazy"
        decoding="async"
        width="1280"
        height="720"
      />
    {:else if status !== 'ready'}
      <button
        type="button"
        bind:this={trigger}
        onclick={() => startManually?.()}
        aria-label={labels.play}
      >
        <img src={poster} alt="" loading="lazy" decoding="async" width="1280" height="720" />
        <span aria-hidden="true">▶</span>
      </button>
    {/if}
  </div>
  {#if status === 'error'}<p role="status">{labels.unavailable}</p>{/if}
</div>

<style>
  .video {
    text-align: center;
  }
  .screen {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    min-height: 200px;
  }
  .player,
  .screen button {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
  .player :global(iframe) {
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
  }
  .player :global(iframe:focus-visible) {
    outline: 2px solid #fff2d8;
    outline-offset: 3px;
  }
  .screen button {
    display: grid;
    place-items: center;
    padding: 0;
    border: 0;
    background: transparent;
    color: #fff2d8;
    cursor: pointer;
  }
  .screen img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .screen span {
    position: relative;
    display: grid;
    place-items: center;
    width: 3.25rem;
    height: 3.25rem;
    border: 1px solid #c4a66c;
    border-radius: 50%;
    background: #142019ef;
  }
  .video p {
    margin: 0.5rem 0 0;
  }
</style>
