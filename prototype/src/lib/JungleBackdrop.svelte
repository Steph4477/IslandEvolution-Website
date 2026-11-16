<script lang="ts">
  import { onMount } from 'svelte';
  import { asset } from '$app/paths';
  import manifest from './arbre-rest-points.json';
  import { introCamera } from './intro-timeline';

  let { active, elapsed, plane = $bindable() }: {
    active: boolean;
    elapsed: number;
    plane?: HTMLDivElement;
  } = $props();
  let diagnostic = $state(false);

  let zoom = $state(100);
  let offsetX = $state(0);
  const framing = $derived(diagnostic && (zoom !== 100 || offsetX !== 0)
    ? `translateX(${offsetX}px) scale(${zoom / 100})`
    : undefined);
  const { width, height } = manifest.image;
  const layers = ['jungle', 'sol', 'arbre'] as const;
  const focus = manifest.restPoints[0].feetNorm;
  const camera = $derived(introCamera(elapsed));
  const zoomOffset = $derived(1 - Math.max(1, camera.scale));
  const cameraTransform = $derived(
    `translate(calc(${focus.x * zoomOffset * 100}% + min(0px, calc(${camera.pan * 100}vw - ${camera.pan * 62}px - ${focus.x * camera.pan * 100}%))), ${focus.y * zoomOffset * 100}%) scale(${camera.scale})`
  );

  onMount(() => {
    diagnostic = new URLSearchParams(location.search).get('diagnostic') === '1';
  });
</script>

<div class="scene backdrop" class:active aria-hidden="true">
  <div class="plane" bind:this={plane} style:--diagnostic-framing={framing}
    style:--decor-ratio={`${width} / ${height}`}
    style:--intro-camera={active ? cameraTransform : undefined}>
    {#each layers as layer (layer)}
      <img src={asset(`astra/decor-v3/${layer}.webp`)} alt="" {width} {height} data-layer={layer} />
    {/each}
    {#each manifest.restPoints as point, index (point.id)}
      {#if diagnostic}
        <span
          class="point"
          data-point={point.id}
          title={point.label}
          style:left={`${point.feetPx.x / width * 100}%`}
          style:top={`${point.feetPx.y / height * 100}%`}
        >{index + 1}</span>
      {/if}
    {/each}
  </div>
</div>

{#if diagnostic}
  <details class="diagnostic">
    <summary>Cadrage du décor</summary>
    <fieldset disabled={active}>
      <legend>Réglages</legend>
      <label for="tree-zoom">Zoom · {zoom} %</label>
      <input id="tree-zoom" type="range" min="50" max="125" bind:value={zoom} />
      <label for="tree-offset">Décalage horizontal · {offsetX} px</label>
      <input id="tree-offset" type="range" min="-750" max="150" bind:value={offsetX} />
      <button type="button" onclick={() => { zoom = 100; offsetX = 0; }}>Cadrage initial</button>
    </fieldset>
    <ol class="coordinates" aria-label="Coordonnées comparées V2 vers V3">
      {#each manifest.restPoints as point (point.id)}
        <li>{point.label}<br />
          V2 ({point.previousFeetPx.x}, {point.previousFeetPx.y}) → V3 ({point.feetPx.x}, {point.feetPx.y})
        </li>
      {/each}
    </ol>
  </details>
{/if}

<style>
  .scene {
    position: absolute;
    inset: 0;
    overflow: clip;
    pointer-events: none;
  }

  .backdrop {
    z-index: 0;
  }


  /* Le décor et les repères partagent le même plan. */
  .plane {
    position: absolute;
    top: 0;
    left: 0;
    width: max(100cqw, calc(100cqh * 1885 / 2048));
    aspect-ratio: var(--decor-ratio);
    transform-origin: 0 0;
  }

  .scene { container-type: size; }
  .plane img { position: absolute; inset: 0; width: 100%; height: 100%; }

  .active .plane { transform: var(--intro-camera, none); }
  .scene:not(.active) .plane { transform: var(--diagnostic-framing, none); }

  .point {
    position: absolute;
    translate: -50% -50%;
    width: 1.15rem;
    height: 1.15rem;
    display: grid;
    place-items: center;
    border: 1px solid #fff9d9;
    border-radius: 50%;
    background: #153b32;
    color: #fff9d9;
    font: 700 .65rem system-ui, sans-serif;
  }

  .diagnostic {
    position: fixed;
    z-index: 6;
    right: .75rem;
    bottom: .75rem;
    display: grid;
    gap: .35rem;
    width: min(15rem, calc(100vw - 1.5rem));
    padding: .55rem .75rem;
    border: 1px solid #c9d89f;
    background: #142019;
    color: #f8f1da;
    font-size: .8rem;
  }

  .diagnostic fieldset {
    display: grid;
    gap: .25rem;
    min-width: 0;
    margin: 0;
  }
  .diagnostic summary { cursor: pointer; }
  .diagnostic input { width: 100%; margin: 0; }
  .coordinates { padding-left: 1.2rem; }

  @media (prefers-reduced-motion: reduce) {
    .active .plane { transform: none; }
  }
</style>
