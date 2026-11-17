<script lang="ts">
  type Shot = { src: string; alt: string; caption: string; width: number; height: number };

  let { shots, labels }: {
    shots: Shot[];
    labels: { viewer: string; open: string; close: string; previous: string; next: string };
  } = $props();

  let dialog: HTMLDialogElement;
  let closeButton: HTMLButtonElement;
  let previousButton: HTMLButtonElement;
  let opener: HTMLButtonElement | undefined;
  let selected = $state(-1);
  const current = $derived(shots[selected]);

  function open(index: number, trigger: HTMLButtonElement) {
    opener = trigger;
    selected = index;
    dialog.showModal();
    closeButton.focus();
  }

  function move(offset: number) {
    selected = (selected + offset + shots.length) % shots.length;
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Tab') {
      const start = event.shiftKey ? previousButton : closeButton;
      if (document.activeElement === start) {
        event.preventDefault();
        (event.shiftKey ? closeButton : previousButton).focus();
      }
      return;
    }
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    move(event.key === 'ArrowLeft' ? -1 : 1);
  }

  function restoreFocus() {
    selected = -1;
    opener?.focus({ preventScroll: true });
    opener = undefined;
  }
</script>

<div class="gallery">
  {#each shots as shot, index (shot.src)}
    <figure>
      <button class="thumbnail" type="button" aria-haspopup="dialog" aria-label={`${labels.open} · ${shot.caption}`}
        onclick={(event) => open(index, event.currentTarget)}>
        <img src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} loading="lazy" decoding="async" />
      </button>
      <figcaption>{shot.caption}</figcaption>
    </figure>
  {/each}
</div>

<dialog class="canopy-lightbox" bind:this={dialog} aria-label={labels.viewer} onkeydown={onKeydown} onclose={restoreFocus}>
  <div class="controls">
    <div class="navigation">
      <button type="button" bind:this={previousButton} onclick={() => move(-1)} aria-label={labels.previous}>‹</button>
      <button type="button" onclick={() => move(1)} aria-label={labels.next}>›</button>
    </div>
    <button type="button" bind:this={closeButton} onclick={() => dialog.close()}>{labels.close}</button>
  </div>
  {#if current}
    <figure>
      <img src={current.src} alt={current.alt} width={current.width} height={current.height} />
      <figcaption aria-live="polite" aria-atomic="true">{current.caption} · {selected + 1} / {shots.length}</figcaption>
    </figure>
  {/if}
</dialog>

<style>
  .gallery {
    display: grid;
    gap: 1rem;
    margin-top: 1.25rem;
  }

  figure {
    min-width: 0;
    margin: 0;
    text-align: center;
  }

  .gallery figure { display: grid; grid-template-rows: 1fr auto; }

  .thumbnail {
    align-self: center;
    min-width: 44px;
    min-height: 44px;
    width: 100%;
    padding: 0;
    border: 1px solid #dce9b56b;
    background: transparent;
    cursor: zoom-in;
  }

  .thumbnail img { display: block; width: 100%; height: auto; }
  figcaption { margin-top: .55rem; color: #e2e7cf; font-size: .85rem; }

  dialog {
    width: min(72rem, calc(100% - 1.5rem));
    max-height: calc(100dvh - 1.5rem);
    padding: clamp(.6rem, 2vw, 1rem);
    border: 1px solid #dce9b56b;
    border-radius: .65rem;
    background: #142019;
    color: #fff2d8;
  }

  dialog::backdrop { background: #07140cde; }

  .controls, .navigation { display: flex; gap: .5rem; }
  .controls { justify-content: space-between; margin-bottom: .65rem; }

  .controls button {
    min-width: 44px;
    min-height: 44px;
    padding-inline: .7rem;
    border: 1px solid #dce9b56b;
    border-radius: .4rem;
    background: #203e2a;
    color: inherit;
    font: inherit;
    cursor: pointer;
  }

  dialog img {
    display: block;
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: max(4rem, calc(100dvh - 8rem));
    margin-inline: auto;
  }

  :global(html:has(.canopy-lightbox[open])) { overflow: hidden; scrollbar-gutter: stable; }

  @media (min-width: 800px) {
    .gallery { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
</style>
