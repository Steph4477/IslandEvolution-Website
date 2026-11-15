<script lang="ts">
  import MokoLiana from '../lib/MokoLiana.svelte';

  let showMoko = $state(true);
</script>

<svelte:head>
  <title>Island Evolution — Moko</title>
  <meta name="description" content="Prototype interactif du site Island Evolution." />
</svelte:head>

<div class="page">
  <header>
    <a class="brand" href="#accueil">Island Evolution</a>
    <button type="button" aria-pressed={showMoko} onclick={() => showMoko = !showMoko}>Afficher Moko</button>
  </header>

  {#if showMoko}<MokoLiana />{/if}

  <main>
    <section id="accueil" class="intro" aria-labelledby="title">
      <div>
        <h1 id="title">Island<br />Evolution</h1>
        <p>Faites défiler la page. Moko suit votre progression et se repose quand vous vous arrêtez.</p>
        <a class="next" href="#jungle"><span aria-hidden="true">↓</span> Vers la jungle</a>
      </div>
    </section>

    <section id="jungle" aria-labelledby="jungle-title">
      <div>
        <h2 id="jungle-title">Jungle</h2>
        <a class="next" href="#temple"><span aria-hidden="true">↓</span> Vers le temple</a>
      </div>
    </section>

    <section id="temple" aria-labelledby="temple-title">
      <div>
        <h2 id="temple-title">Temple</h2>
        <a class="next" href="#accueil"><span aria-hidden="true">↑</span> Retour à l’accueil</a>
      </div>
    </section>
  </main>
</div>

<style>
  :global(html) {
    color-scheme: dark;
    background: #142019;
  }

  :global(body) {
    margin: 0;
    color: #f8f1da;
    font-family: system-ui, sans-serif;
  }

  :global(*) { box-sizing: border-box; }

  .page {
    --rail-width: clamp(4.3rem, 16vw, 9.5rem);
    --content-inset: calc(var(--rail-width) + clamp(1rem, 6vw, 6rem));
  }

  header {
    position: sticky;
    z-index: 2;
    top: 0;
    min-height: 4.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
    padding: 0.6rem clamp(0.7rem, 4vw, 3rem);
    border-bottom: 1px solid #eff2d62b;
    background: #142019;
  }

  .brand {
    color: inherit;
    font-family: Georgia, serif;
    font-size: clamp(1rem, 4vw, 1.45rem);
    text-decoration: none;
  }

  button {
    min-height: 44px;
    border: 1px solid #748461;
    border-radius: 3px;
    color: inherit;
    background: transparent;
    padding: 0.4rem 0.7rem;
    font: inherit;
    font-size: 0.8rem;
    cursor: pointer;
  }

  button[aria-pressed='true'] {
    color: #172315;
    background: #c9d89f;
  }

  section {
    scroll-margin-top: 4.5rem;
    min-height: 90svh;
    display: grid;
    align-items: center;
    padding: 3rem clamp(1rem, 7vw, 8rem) 3rem var(--content-inset);
    border-bottom: 1px solid #eff2d629;
  }

  .intro {
    min-height: calc(100svh - 4.5rem);
    background: radial-gradient(ellipse at 80% 35%, #354b2c, transparent 72%);
  }

  #jungle { background: #23352a; }
  #temple { background: #2a2e23; }

  h1, h2 {
    margin: 0;
    font-family: Georgia, serif;
    font-size: clamp(2rem, 11vw, 8rem);
    font-weight: 400;
    letter-spacing: -0.06em;
    line-height: 0.96;
  }

  p {
    max-width: 29ch;
    margin: 1.5rem 0 0;
    color: #e2e7cf;
    line-height: 1.65;
  }

  .next {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 44px;
    margin-top: 1.5rem;
    color: #dce9b5;
    text-underline-offset: 0.3em;
  }
</style>

