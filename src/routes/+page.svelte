<script lang="ts">
  import { onMount } from 'svelte';
  import { asset } from '$app/paths';
  import { descriptions, siteName, siteUrl, socialImage, socialImageAlts, structuredData, title } from '../lib/seo';
  import MokoLiana from '../lib/components/MokoLiana.svelte';
  import CinematicIntro from '../lib/components/CinematicIntro.svelte';
  import JungleBackdrop from '../lib/components/JungleBackdrop.svelte';
  import LanguageSwitcher from '../lib/components/LanguageSwitcher.svelte';
  import CanopyGallery from '../lib/components/CanopyGallery.svelte';
  import AdventureVideo from '../lib/components/AdventureVideo.svelte';
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
  const difficultyRunes = [
    ['Explorer', 'runes/explorer.png'],
    ['Survivor', 'runes/survivor.png'],
    ['King', 'runes/king.png']
  ] as const;

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
      <a class="header-beta" href="#beta" aria-label={copy.joinBeta} aria-describedby="beta-status">
        <span class="beta-label-full">{copy.joinBeta}</span>
        <span class="beta-label-short">{copy.betaShort}</span>
      </a>
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
          <a class="hero-link" href="#beta" aria-describedby="beta-status">{copy.joinBeta}</a>
          <small class="beta-details">{copy.betaDetails}</small>
          <small class="beta-status" id="beta-status">{copy.betaStatus}</small>
        </div>
      </div>
    </section>

    <section id="jungle" class="canopy" aria-labelledby="jungle-title">
      <div class="canopy-copy">
        <h2 id="jungle-title">{copy.jungle}</h2>
        <p>{copy.canopyIntroStart} <strong>Island Evolution</strong>, {copy.canopyIntroEnd}</p>
        <p><strong>{copy.canopyAction}</strong> {copy.canopyEnemies}</p>
        <p><strong>{copy.canopyChallenge}</strong></p>
      </div>
      <div class="reading">
        <CanopyGallery labels={copy.gallery} shots={[
          { src: asset('images/gameplay/jungle-exploration.webp'), alt: copy.jungleAlt, caption: copy.jungleCaption, width: 2048, height: 900 },
          { src: asset('images/gameplay/temple-sunset.webp'), alt: copy.templeAlt, caption: copy.templeCaption, width: 1917, height: 1077 }
        ]} />
      </div>
    </section>

    <section id="aventure" class="adventure" aria-labelledby="aventure-title">
      <div class="adventure-copy">
        <h2 id="aventure-title">{copy.adventure.title}</h2>
        <p><strong>{copy.adventure.tagline}</strong></p>
        <p>{copy.adventure.description}</p>
      </div>
      <div class="reading adventure-video">
        <AdventureVideo id="aSYfR35iuqI" title={copy.adventure.title}
          poster={asset('video/adventure.jpg')} labels={copy.adventure} />
      </div>
    </section>

    <section id="difficultes" class="difficulty-section" aria-labelledby="difficultes-title">
      <div class="adventure-copy">
        <h2 id="difficultes-title">{copy.difficulties.title}</h2>
        <p>{copy.difficulties.intro}</p>
      </div>
      <ul class="reading difficulty-list">
        {#each difficultyRunes as [name, rune], index (name)}
          <li>
            <img src={asset(rune)} alt={copy.difficulties.modes[index].alt} width="75" height="72"
              loading="lazy" decoding="async" />
            <div class="difficulty-copy">
              <h3>{copy.difficulties.modes[index].name}</h3>
              <p>{copy.difficulties.modes[index].description}</p>
            </div>
          </li>
        {/each}
      </ul>
      <div class="reading adventure-video">
        <AdventureVideo id="je1Ffg7VBxA" title={copy.difficulties.teaser}
          poster={asset('video/difficulties.jpg')} labels={{ ...copy.adventure, play: copy.difficulties.play }} />
      </div>
    </section>

    <section id="endgame" class="adventure" aria-labelledby="endgame-title">
      <div class="adventure-copy">
        <h2 id="endgame-title">{copy.endgame.title}</h2>
        <p><strong>{copy.endgame.tagline}</strong></p>
        <p><strong>{copy.endgame.description}</strong></p>
      </div>
      <div class="reading adventure-video">
        <AdventureVideo id="8Bcc1L_52IE" title={copy.endgame.title}
          poster={asset('video/endgame.jpg')} labels={{ ...copy.adventure, play: copy.endgame.play }} />
      </div>
    </section>

    <div id="skills" class="skills-slot" aria-hidden="true">
      <span class="skills-landing" data-skills-landing></span>
    </div>

    <section id="beta" aria-labelledby="beta-title" tabindex="-1">
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
    --content-gutter: clamp(1.125rem, 3vw, 3rem);
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

  .header-controls :global(button), .header-beta {
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
    .header-controls :global(button:hover), .header-controls .header-beta:hover {
      border-color: #f0cf84;
      background: #1b3626ba;
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    .header-controls :global(button), .header-beta {
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

  .header-controls .header-beta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding-inline: .65rem;
    border-radius: 999px;
    background-color: #122c1bef;
    font-size: .8rem;
    font-weight: 650;
    white-space: nowrap;
    text-decoration: none;
  }

  .header-controls .header-beta:focus-visible { border-color: #f0cf84; }
  .beta-label-short { display: none; }

  @media (max-width: 480px) {
    .beta-label-full { display: none; }
    .beta-label-short { display: inline; }
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
    padding-block: clamp(2.5rem, 6vw, 5rem);
    padding-inline: var(--content-gutter);
  }

  section { flex: 1; }

  .intro {
    position: relative;
    isolation: isolate;
    display: grid;
    align-items: center;
    min-height: 94svh;
    padding-block: 5rem 3.5rem;
    text-shadow: 0 2px 12px #111e16;
  }

  .reading, .canopy-copy, .adventure-copy {
    width: 100%;
    margin-inline: auto;
  }

  .reading { max-width: 58rem; }
  .hero-copy {
    /* Preserve the approved logo sizing while centering the block in the viewport. */
    --hero-size-reserve: calc(var(--rail-width) + clamp(1rem, 6vw, 6rem));
    max-width: min(42rem, calc(100% + 2 * var(--content-gutter) - var(--hero-size-reserve) - clamp(1rem, 8vw, 9rem)));
  }

  .hero-copy p {
    position: relative;
    isolation: isolate;
    max-width: none;
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

  .hero-actions {
    display: grid;
    justify-items: center;
    gap: .35rem;
    margin-top: 1.5rem;
    text-align: center;
  }

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

  .game-title { display: block; width: 100%; height: auto; }
  h2 { font-size: clamp(2.15rem, 5vw, 5rem); }
  h3 { font-size: clamp(1.2rem, 2vw, 1.8rem); line-height: 1.15; letter-spacing: -.025em; }

  p {
    max-width: 40ch;
    margin: 1.5rem 0 0;
    color: #e2e7cf;
    line-height: 1.65;
  }

  a { color: #e6efbf; text-underline-offset: .25em; }

  .hero-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 44px;
    min-height: 48px;
    padding: .65rem clamp(1rem, 4vw, 1.7rem);
    border: 1px solid #c4a66c;
    border-radius: 999px;
    background: #203e2a;
    color: #fff2d8;
    font-weight: 700;
    text-decoration: none;
  }

  .hero-link:hover { border-color: #f0cf84; background: #2a4b34; }
  .hero-link:active { background: #142019; }

  .beta-details, .beta-status {
    color: #fff2d8;
    text-shadow: 0 1px 2px #07140c, 0 0 5px #07140c, 0 0 9px #07140c;
  }

  .canopy, .adventure, .difficulty-section {
    padding-block: clamp(1.25rem, 2.5vw, 2rem) clamp(1.75rem, 3.5vw, 2.75rem);
  }


  .canopy-copy, .adventure-copy {
    position: relative;
    isolation: isolate;
    max-width: 56rem;
    padding-block: .65rem;
    color: #fff2dc;
    text-align: center;
    text-shadow: 0 1px 2px #0b1711, 0 0 6px #0b1711;
  }

  .canopy-copy::before, .adventure-copy::before, .difficulty-copy::before {
    content: '';
    position: absolute;
    z-index: -1;
    inset: -.75rem -.65rem;
    background: linear-gradient(90deg, transparent, #0b1711b8 12% 88%, transparent);
    mask-image: linear-gradient(transparent, #000 18% 82%, transparent);
    pointer-events: none;
  }

  .canopy-copy p, .adventure-copy p {
    max-width: 74ch;
    margin: .6rem auto 0;
    color: inherit;
    font-size: clamp(1.0625rem, 1.5vw, 1.1875rem);
  }

  .canopy-copy h2 + p { margin-top: 1rem; }
  .adventure-copy { max-width: 42rem; }
  .adventure-video { max-width: 52rem; margin-top: .9rem; }

  .difficulty-list {
    display: grid;
    max-width: 52rem;
    gap: 1rem;
    margin-block: 1rem 0;
    padding: 0;
    list-style: none;
  }

  .difficulty-list li {
    display: grid;
    grid-template-columns: 75px minmax(0, 1fr);
    align-items: center;
    gap: .85rem;
  }

  .difficulty-list img { display: block; }

  .difficulty-copy {
    position: relative;
    isolation: isolate;
    min-width: 0;
    padding: .45rem .6rem;
    color: #fff2dc;
  }

  .difficulty-copy p { margin: .35rem auto 0; color: inherit; }

  @media (min-width: 768px) {
    .difficulty-list { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .difficulty-list li {
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: 72px 1fr;
      justify-items: center;
      align-items: start;
      text-align: center;
    }
  }

  .skills-slot {
    position: relative;
    min-block-size: clamp(8rem, 22svh, 14rem);
    pointer-events: none;
  }

  .skills-landing {
    position: absolute;
    inset-inline-start: clamp(8rem, 22vw, 16rem);
    inset-block-end: 1rem;
  }

  footer { padding-bottom: clamp(5rem, 10vw, 8rem); }
  .footer-title { font-size: clamp(1.6rem, 3vw, 2.6rem); margin: 0 0 1rem; }
  footer nav { display: flex; flex-wrap: wrap; gap: .75rem 1.3rem; }
  footer nav a { display: inline-flex; align-items: center; gap: .25em; min-height: 24px; }

  @media (min-width: 800px) {
    .hero-copy { --hero-size-reserve: max(calc(var(--rail-width) + clamp(1rem, 6vw, 6rem)), 34vw); }
    .adventure-copy { max-width: 52rem; }
    .adventure-copy h2 { font-size: clamp(2.15rem, 4vw, 4rem); }
  }
</style>

