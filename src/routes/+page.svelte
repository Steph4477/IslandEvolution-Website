<script lang="ts">
  import { asset } from '$app/paths';
  import { description, siteName, siteUrl, socialImage, socialImageAlt, structuredData, title } from '../lib/seo';
  import MokoLiana from '../lib/components/MokoLiana.svelte';
  import CinematicIntro from '../lib/components/CinematicIntro.svelte';
  import JungleBackdrop from '../lib/components/JungleBackdrop.svelte';
  import { introProgress, introTiming } from '../lib/scene/intro-timeline';

  let showMoko = $state(true);
  let introActive = $state(true);
  let introElapsed = $state(0);
  let treePlane = $state<HTMLDivElement>();

  function finishIntro() {
    introActive = false;
  }
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta name="robots" content="index, follow" />
  <link rel="icon" type="image/png" sizes="16x16" href={asset('icons/favicon-16.png')} />
  <link rel="icon" type="image/png" sizes="32x32" href={asset('icons/favicon-32.png')} />
  <link rel="icon" type="image/png" sizes="48x48" href={asset('icons/favicon-48.png')} />
  <link rel="apple-touch-icon" sizes="180x180" href={asset('icons/apple-touch-icon.png')} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content={siteName} />
  <meta property="og:locale" content="fr_FR" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  {#if siteUrl && socialImage}
    <link rel="canonical" href={siteUrl.href} />
    <meta property="og:url" content={siteUrl.href} />
    <meta property="og:image" content={socialImage} />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content={socialImageAlt} />
    <meta name="twitter:image" content={socialImage} />
    <meta name="twitter:image:alt" content={socialImageAlt} />
  {/if}
  {@html structuredData}
</svelte:head>

<div class="page">
  <header>
    <a class="brand" href="#accueil">Island Evolution</a>
    <button type="button" aria-pressed={showMoko} onclick={() => showMoko = !showMoko}>Afficher Moko</button>
  </header>

  <div class="world">
    <JungleBackdrop active={introActive} elapsed={introElapsed} bind:plane={treePlane} />
    {#if showMoko}<MokoLiana {introActive} {introElapsed} {treePlane} />{/if}
  <main>
    <section id="accueil" class="intro" class:opening={introActive} aria-labelledby="title"
      style:--hero-opacity={introActive ? introProgress(introElapsed, introTiming.rejoin + 200, introTiming.end) : undefined}>
      <CinematicIntro active={introActive} onFrame={(elapsed) => { introElapsed = elapsed; }} onFinish={finishIntro} />
      <div class="reading hero-copy">
        <h1 id="title">Island<br />Evolution</h1>
        <p>Un jeu de plateforme 2D. Suivez Moko de la canopée jusqu’au sol de la jungle.</p>
        <a class="next hero-link" href="#jungle"><span aria-hidden="true">↓</span> Descendre dans la jungle</a>
      </div>
    </section>

    <section id="jungle" aria-labelledby="jungle-title">
      <div class="reading">
        <h2 id="jungle-title">Sous la canopée</h2>
        <p>Explorez la jungle avec Moko. Ces captures donnent un aperçu des décors et des rencontres du jeu.</p>
        <div class="gallery">
          <figure>
            <img src={asset('images/gameplay/jungle-exploration.webp')} alt="Moko explore la jungle du jeu" loading="lazy" />
            <figcaption>Exploration de la jungle</figcaption>
          </figure>
          <figure>
            <img src={asset('images/gameplay/temple-sunset.webp')} alt="Le temple du jeu au coucher du soleil" loading="lazy" />
            <figcaption>Le temple au crépuscule</figcaption>
          </figure>
        </div>
        <p class="note">Vidéos de gameplay à venir.</p>
      </div>
    </section>

    <section id="defis" aria-labelledby="defis-title">
      <div class="reading">
        <h2 id="defis-title">Au cœur de l’île</h2>
        <div class="topics">
          <article><h3>Difficultés</h3><p>Les niveaux de difficulté et leurs différences seront présentés ici.</p></article>
          <article><h3>Compétences de Moko</h3><p>Double saut, Coco Fire et attaques Clac et Kick.</p></article>
          <article><h3>Évolution</h3><p>Découvrez comment Moko évolue au fil de l’aventure.</p></article>
          <article><h3>Mode Endless</h3><p>Les règles et les objectifs du mode seront détaillés ici.</p></article>
        </div>
      </div>
    </section>

    <section id="beta" aria-labelledby="beta-title">
      <div class="reading">
        <h2 id="beta-title">Bêta Android</h2>
        <p>Les informations d’accès et de participation seront publiées ici.</p>
      </div>
    </section>

    <footer>
      <div class="reading">
        <p class="footer-title">Island Evolution</p>
        <nav aria-label="Liens de pied de page">
          <a href="#jungle">Captures du jeu</a>
          <a href="#beta">Bêta Android</a>
          <a href="#accueil"><span aria-hidden="true">↑</span> Retour à la canopée</a>
        </nav>
      </div>
    </footer>
  </main>
  </div>
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
    --reading-start: var(--content-inset);
  }

  header {
    position: sticky;
    z-index: 6;
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

  .world {
    position: relative;
    isolation: isolate;
  }

  main {
    position: relative;
    z-index: 4;
    display: flex;
    flex-direction: column;
    min-height: clamp(0px, 250vw, 3350px);
    text-shadow: 0 1px 4px #0b1711, 0 0 12px #0b1711;
  }

  section, footer {
    scroll-margin-top: 4.5rem;
    padding: clamp(3.5rem, 10vw, 8rem) clamp(1rem, 8vw, 9rem) clamp(3.5rem, 10vw, 8rem) var(--reading-start);
  }

  section { flex: 1; }

  .intro {
    position: relative;
    isolation: isolate;
    display: grid;
    align-items: center;
    min-height: calc(100svh - 4.5rem);
    padding-block: 5rem;
    text-shadow: 0 2px 12px #111e16;
  }

  .reading {
    width: 100%;
    max-width: 58rem;
  }

  .hero-copy p { font-size: clamp(1rem, 1.65vw, 1.3rem); }

  .opening .hero-copy { opacity: var(--hero-opacity, 0); }
  .opening .hero-copy:focus-within { opacity: 1; }

  @media (prefers-reduced-motion: reduce) {
    .opening .hero-copy { opacity: 1; }
  }

  h1, h2, h3, .footer-title {
    margin: 0;
    font-family: Georgia, serif;
    font-weight: 400;
    letter-spacing: -0.06em;
    line-height: 0.96;
  }

  h1 { font-size: clamp(2.65rem, 10vw, 9rem); }
  h2 { font-size: clamp(2.15rem, 5vw, 5rem); }
  h3 { font-size: clamp(1.2rem, 2vw, 1.8rem); line-height: 1.15; letter-spacing: -.025em; }

  p {
    max-width: 40ch;
    margin: 1.5rem 0 0;
    color: #e2e7cf;
    line-height: 1.65;
  }

  a { color: #e6efbf; text-underline-offset: .25em; }

  .next {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 44px;
    margin-top: 1.5rem;
  }

  .hero-link {
    padding: .6rem .85rem;
    border: 1px solid #dce9b575;
    background: #172b20b3;
    text-decoration: none;
  }

  .gallery, .topics {
    display: grid;
    gap: 1rem;
    margin-top: 2rem;
  }

  figure { margin: 0; }
  figure img {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    border: 1px solid #dce9b547;
  }

  figcaption, .note { color: #e2e7cf; font-size: .85rem; margin-top: .55rem; }
  .topics article {
    min-width: 0;
    padding: 1.1rem 0;
    border-top: 1px solid #dce9b54a;
  }
  .topics p { margin-top: .6rem; }

  footer { padding-bottom: clamp(7rem, 16vw, 13rem); }
  .footer-title { font-size: clamp(1.6rem, 3vw, 2.6rem); margin: 0 0 1rem; }
  footer nav { display: flex; flex-wrap: wrap; gap: .75rem 1.3rem; }

  @media (min-width: 800px) {
    .page { --reading-start: max(var(--content-inset), 34vw); }
    .gallery, .topics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
</style>

