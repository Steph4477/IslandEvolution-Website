<script lang="ts">
  import { onMount } from 'svelte';
  import { asset } from '$app/paths';
  import { descriptions, siteName, siteUrl, socialImage, socialImageAlts, structuredData, title } from '../lib/seo';
  import MokoLiana from '../lib/components/MokoLiana.svelte';
  import CinematicIntro from '../lib/components/CinematicIntro.svelte';
  import JungleBackdrop from '../lib/components/JungleBackdrop.svelte';
  import LanguageSwitcher from '../lib/components/LanguageSwitcher.svelte';
  import { languageKey, translations, type Language } from '../lib/i18n';
  import { introProgress, introTiming } from '../lib/scene/intro-timeline';

  let showMoko = $state(true);
  let introActive = $state(true);
  let introElapsed = $state(0);
  let treePlane = $state<HTMLDivElement>();
  let language = $state<Language>('fr');
  const copy = $derived(translations[language]);
  const description = $derived(descriptions[language]);
  const socialImageAlt = $derived(socialImageAlts[language]);

  function applyLanguage(next: Language) {
    language = next;
    document.documentElement.lang = next;
  }

  onMount(() => {
    try {
      if (localStorage.getItem(languageKey) === 'en') applyLanguage('en');
    } catch {
      // La page reste utilisable lorsque le stockage est désactivé.
    }
  });

  function selectLanguage(next: Language) {
    applyLanguage(next);
    try {
      localStorage.setItem(languageKey, next);
    } catch {
      // La langue reste active pour cette visite.
    }
  }

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
  <meta property="og:locale" content={language === 'fr' ? 'fr_FR' : 'en_GB'} />
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
    <a class="skip-content" href="#jeu">{copy.skipToContent}</a>
    <div class="header-controls">
      <button type="button" class:moko-visible={showMoko} onclick={() => showMoko = !showMoko}>
        {showMoko ? copy.hideMoko : copy.showMoko}
      </button>
      <LanguageSwitcher {language} label={copy.language} select={selectLanguage} />
    </div>
  </header>

  <div class="world">
    <JungleBackdrop active={introActive} elapsed={introElapsed} bind:plane={treePlane} {language} />
    {#if showMoko}<MokoLiana {introActive} {introElapsed} {treePlane} />{/if}
  <main id="jeu" tabindex="-1">
    <section id="accueil" class="intro" class:opening={introActive} aria-labelledby="title"
      style:--hero-opacity={introActive ? introProgress(introElapsed, introTiming.rejoin + 200, introTiming.end) : undefined}>
      <CinematicIntro active={introActive} onFrame={(elapsed) => { introElapsed = elapsed; }} onFinish={finishIntro} skipLabel={copy.skip} />
      <div class="reading hero-copy">
        <h1 id="title">
          <picture>
            <source srcset={asset('images/moko-title.webp')} type="image/webp" />
            <img class="game-title" src={asset('images/moko-title.png')} width="1920" height="819"
              alt="MOKO – ISLAND EVOLUTION" decoding="async" fetchpriority="low" />
          </picture>
        </h1>
        <p>{copy.intro}</p>
        <div class="hero-actions">
          <a class="next hero-link" href="#jungle"><span aria-hidden="true">↓</span> {copy.descend}</a>
        </div>
      </div>
    </section>

    <section id="jungle" aria-labelledby="jungle-title">
      <div class="reading">
        <h2 id="jungle-title">{copy.jungle}</h2>
        <p>{copy.galleryIntro}</p>
        <div class="gallery">
          <figure>
            <img src={asset('images/gameplay/jungle-exploration.webp')} alt={copy.jungleAlt} loading="lazy" />
            <figcaption>{copy.jungleCaption}</figcaption>
          </figure>
          <figure>
            <img src={asset('images/gameplay/temple-sunset.webp')} alt={copy.templeAlt} loading="lazy" />
            <figcaption>{copy.templeCaption}</figcaption>
          </figure>
        </div>
        <p class="note">{copy.videos}</p>
      </div>
    </section>

    <section id="defis" aria-labelledby="defis-title">
      <div class="reading">
        <h2 id="defis-title">{copy.island}</h2>
        <div class="topics">
          {#each copy.topics as [heading, text]}
            <article><h3>{heading}</h3><p>{text}</p></article>
          {/each}
        </div>
      </div>
    </section>

    <section id="beta" aria-labelledby="beta-title">
      <div class="reading">
        <h2 id="beta-title">{copy.beta}</h2>
        <p>{copy.betaInfo}</p>
      </div>
    </section>

    <footer>
      <div class="reading">
        <p class="footer-title">Island Evolution</p>
        <nav aria-label={copy.footer}>
          <a href="#jungle">{copy.screenshots}</a>
          <a href="#beta">{copy.beta}</a>
          <a href="#accueil"><span aria-hidden="true">↑</span> {copy.top}</a>
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
    --controls-height: 4.5rem;
    --rail-width: clamp(4.3rem, 16vw, 9.5rem);
    --content-inset: calc(var(--rail-width) + clamp(1rem, 6vw, 6rem));
    --reading-start: var(--content-inset);
  }

  header {
    position: sticky;
    z-index: 6;
    top: 0;
    min-height: var(--controls-height);
    margin-block-end: calc(-1 * var(--controls-height));
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.6rem;
    padding: 0.6rem clamp(0.7rem, 4vw, 3rem);
    pointer-events: none;
  }

  .header-controls {
    display: flex;
    align-items: center;
    gap: .25rem;
    pointer-events: auto;
  }

  .skip-content {
    position: absolute;
    inset: 100% auto auto 1rem;
    clip-path: inset(100%);
    padding: .7rem 1rem;
    background: #142019;
    pointer-events: auto;
  }

  .skip-content:focus { clip-path: none; }

  .page :global(:is(a, button, input, summary):focus-visible) {
    outline: 2px solid #fff;
    outline-offset: 2px;
    box-shadow: 0 0 0 5px #142019;
  }

  .header-controls :global(button) {
    min-width: 44px;
    min-height: 44px;
    position: relative;
    border: 1px solid transparent;
    border-radius: 1rem;
    color: #fff2d8;
    background: #0b2015b5;
    box-shadow: 0 2px 6px #07140c85;
    cursor: pointer;
  }

  @media (hover: hover) {
    .header-controls :global(button:hover) {
      border-color: #f0cf84;
      background: #1b3626ba;
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    .header-controls :global(button) {
      transition: border-color 160ms ease, background-color 160ms ease;
    }
  }

  .header-controls > button {
    min-width: 7rem;
    border-radius: 999px;
    padding: 0.4rem 0.7rem;
    font: inherit;
    font-size: 0.8rem;
  }

  .header-controls :global(button[aria-pressed='true']::after) {
    content: '';
    position: absolute;
    inset: auto 14px 6px;
    height: 2px;
    border-radius: 2px;
    background: currentColor;
  }

  .header-controls :global(button:focus-visible) {
    outline-color: #fff2d8;
    outline-offset: 3px;
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
    text-shadow: 0 0 2px #0b1711, 0 1px 4px #0b1711, 0 0 12px #0b1711;
  }

  section, footer {
    scroll-margin-top: var(--controls-height);
    padding: clamp(3.5rem, 10vw, 8rem) clamp(1rem, 8vw, 9rem) clamp(3.5rem, 10vw, 8rem) var(--reading-start);
  }

  section { flex: 1; }

  .intro {
    position: relative;
    isolation: isolate;
    display: grid;
    align-items: center;
    min-height: 100svh;
    padding-block: 5rem;
    text-shadow: 0 2px 12px #111e16;
  }

  .reading {
    width: 100%;
    max-width: 58rem;
  }

  .hero-copy {
    --hero-title-width: min(100%, 42rem);
  }

  .hero-copy p {
    position: relative;
    isolation: isolate;
    max-width: var(--hero-title-width);
    color: #fff;
    font-size: clamp(1rem, 1.65vw, 1.3rem);
    text-align: center;
    text-shadow: 0 1px 2px #0b1711, 0 0 6px #0b1711;
  }

  .hero-copy p::before {
    content: '';
    position: absolute;
    z-index: -1;
    inset: -.6rem -.7rem;
    background: linear-gradient(90deg, transparent, #0b1711b8 9% 91%, transparent);
    mask-image: linear-gradient(transparent, #000 22% 78%, transparent);
    pointer-events: none;
  }

  .hero-actions { width: var(--hero-title-width); display: flex; justify-content: center; }

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

  .game-title { display: block; width: var(--hero-title-width); height: auto; }
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
    background: #142019e8;
    text-decoration: none;
  }

  .hero-link:hover { border-color: #e6efbf; background: #243726; }
  .hero-link:active { background: #142019; }

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
  footer nav a { display: inline-flex; align-items: center; gap: .25em; min-height: 24px; }

  @media (min-width: 800px) {
    .page { --reading-start: max(var(--content-inset), 34vw); }
    .gallery, .topics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
</style>

