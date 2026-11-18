<script lang="ts">
  import { flushSync, onMount, tick } from 'svelte';
  import { asset, resolve } from '$app/paths';
  import { descriptions, siteName, siteUrl, socialImage, socialImageAlts, structuredData, title } from '../lib/seo';
  import MokoLiana from '../lib/components/MokoLiana.svelte';
  import CinematicIntro from '../lib/components/CinematicIntro.svelte';
  import JungleBackdrop from '../lib/components/JungleBackdrop.svelte';
  import LanguageSwitcher from '../lib/components/LanguageSwitcher.svelte';
  import { betaApplicationsOpen } from '../lib/beta-application';
  import { privacyContact } from '../lib/privacy';
  import BetaLaunchSection from '../lib/components/BetaLaunchSection.svelte';
  import BetaApplicationDialog from '../lib/components/BetaApplicationDialog.svelte';
  import CanopyGallery from '../lib/components/CanopyGallery.svelte';
  import AdventureVideo from '../lib/components/AdventureVideo.svelte';
  import { languageKey, translations, type Language } from '../lib/i18n';
  import { acceptsSkill, type SkillsState } from '../lib/scene/skills-actions';
  import { introProgress, introTiming } from '../lib/scene/intro-timeline';
  import { observeScroll } from '../lib/scene/scroll-controller';
  import { readVideoConsent, videoConsentKey, videoConsentMaxAge, type VideoConsent } from '../lib/video/consent';

  let betaDialog: ReturnType<typeof BetaApplicationDialog> | undefined = $state();
  let showMoko = $state(true);
  let world: HTMLDivElement;
  let videoConsent = $state<VideoConsent | null>(null);
  let firstVideoHeading: HTMLHeadingElement;
  let videoPreferences: HTMLElement;
  let skillsCopy: HTMLDivElement;
  let moko: ReturnType<typeof MokoLiana> | undefined = $state();
  let skillsState = $state<SkillsState>('unavailable');
  let introActive = $state(true);
  let introElapsed = $state(0);
  const introReveal = $derived(introActive ? introProgress(introElapsed, introTiming.rejoin + 200, introTiming.end) : 1);
  let treePlane = $state<HTMLDivElement>();
  let language = $state<Language>('fr');
  const copy = $derived(translations[language]);
  const videosAllowed = $derived(videoConsent === 'allowed');
  const privacyUrl = $derived(`${resolve('/confidentialite')}/?lang=${language}`);
  const betaStatus = $derived(betaApplicationsOpen ? copy.betaOpenStatus : copy.betaStatus);
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
    const requested = new URLSearchParams(window.location.search).get('lang');
    if (requested === 'fr' || requested === 'en') applyLanguage(requested);
    else try {
      applyLanguage(localStorage.getItem(languageKey) === 'en' ? 'en' : 'fr');
    } catch {
      applyLanguage('fr');
    }

    try {
      videoConsent = readVideoConsent(localStorage.getItem(videoConsentKey));
    } catch {
      // The previews remain available without storage.
    }
    try {
      const returnKey = videoConsentKey + ':return';
      if (sessionStorage.getItem(returnKey)) {
        sessionStorage.removeItem(returnKey);
        videoPreferences.focus({ preventScroll: true });
      }
    } catch {
      // The preference controls remain usable without storage.
    }
    function syncVideoConsent(event: StorageEvent) {
      if (event.key === videoConsentKey || event.key === null) {
        applyVideoConsent(readVideoConsent(event.newValue));
      }
    }
    window.addEventListener('storage', syncVideoConsent);

    const skillsVisibility = new IntersectionObserver(([entry]) => {
      if (entry.intersectionRatio >= 0.5 && !showMoko) showMoko = true;
    }, { threshold: 0.5 });
    skillsVisibility.observe(skillsCopy);

    function updateWorldClip() {
      const { top, bottom } = world.getBoundingClientRect();
      world.style.setProperty('--world-top', `${top}px`);
      world.style.setProperty('--world-bottom', `${bottom}px`);
    }

    const stopWorldScroll = observeScroll(updateWorldClip);
    const worldSize = new ResizeObserver(updateWorldClip);
    worldSize.observe(world);
    return () => {
      skillsVisibility.disconnect();
      stopWorldScroll();
      worldSize.disconnect();
      window.removeEventListener('storage', syncVideoConsent);
    };
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

  function applyVideoConsent(next: VideoConsent | null) {
    if (videoConsent === 'allowed' && next !== 'allowed') {
      // Destroy every player before reloading to unload the third-party API itself.
      flushSync(() => { videoConsent = next; });
      window.location.reload();
    } else {
      videoConsent = next;
    }
  }

  async function chooseVideoConsent(next: VideoConsent, fromPreview: boolean) {
    const withdrawing = videoConsent === 'allowed' && next === 'refused';
    try {
      localStorage.setItem(videoConsentKey, JSON.stringify({ choice: next, expiresAt: Date.now() + videoConsentMaxAge }));
    } catch {
      // The choice still takes effect for the current visit.
    }
    if (withdrawing && !fromPreview) try {
      sessionStorage.setItem(videoConsentKey + ':return', '1');
    } catch {
      // Focus restoration on reload is optional when storage is blocked.
    }
    applyVideoConsent(next);
    if (fromPreview) {
      await tick();
      firstVideoHeading.focus({ preventScroll: true });
    }
  }
</script>

{#snippet videoConsentCopy()}
  <div class="video-consent-copy">
    <p class="video-consent-title">{copy.videoConsent.title}</p>
    <p>{copy.videoConsent.description}</p>
    <a href="https://policies.google.com/privacy?hl={language}">{copy.videoConsent.policy}</a>
  </div>
{/snippet}

{#snippet videoChoices(fromPreview: boolean)}
  <div class="video-choices">
    <button type="button" onclick={() => chooseVideoConsent('allowed', fromPreview)}>{copy.videoConsent.allow}</button>
    <button type="button" onclick={() => chooseVideoConsent('refused', fromPreview)}>{copy.videoConsent.refuse}</button>
  </div>
{/snippet}

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
      <button type="button" class="header-beta" aria-haspopup="dialog" onclick={(event) => betaDialog?.open(event.currentTarget)} aria-describedby="beta-status">
        {copy.joinBeta}
      </button>
      <button type="button" class:moko-visible={showMoko} onclick={() => showMoko = !showMoko}>
        {showMoko ? copy.hideMoko : copy.showMoko}
      </button>
      <LanguageSwitcher {language} label={copy.language} select={selectLanguage} />
    </div>
  </header>

  <main>
  <div class="world" bind:this={world}>
    <JungleBackdrop active={introActive} elapsed={introElapsed} bind:plane={treePlane} {language} />
    {#if showMoko}
      <MokoLiana bind:this={moko} {introActive} {introElapsed} {treePlane}
        bind:skillsState />
    {/if}
  <div id="jeu" tabindex="-1" class="immersive-content" class:awaitingReveal={introReveal === 0} style:--intro-reveal={introReveal}>
    <section id="accueil" class="intro" class:opening={introActive} aria-labelledby="title">
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
          <button type="button" class="hero-link" aria-haspopup="dialog" aria-describedby="beta-status"
            onclick={(event) => betaDialog?.open(event.currentTarget)}>{copy.joinBeta}</button>
          <small class="beta-details">{copy.betaDetails}</small>
          <small class="beta-status" id="beta-status">{betaStatus}</small>
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
        <h2 id="aventure-title" tabindex="-1" bind:this={firstVideoHeading}>{copy.adventure.title}</h2>
        <p><strong>{copy.adventure.tagline}</strong></p>
        <p>{copy.adventure.description}</p>
      </div>
      <div class="reading adventure-video">
        <AdventureVideo id="aSYfR35iuqI" title={copy.adventure.title}
          poster={asset('video/adventure.jpg')} labels={copy.adventure} allowed={videosAllowed} />
        {#if videoConsent === null}
          <div class="video-consent-panel">
            {@render videoConsentCopy()}
            {@render videoChoices(true)}
          </div>
        {/if}
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
          poster={asset('video/difficulties.jpg')} labels={{ ...copy.adventure, play: copy.difficulties.play }} allowed={videosAllowed} />
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
          poster={asset('video/endgame.jpg')} labels={{ ...copy.adventure, play: copy.endgame.play }} allowed={videosAllowed} />
      </div>
    </section>

    <section id="skills" class="skills-slot" aria-labelledby="skills-title">
      <div class="skills-copy" bind:this={skillsCopy}>
        <h2 id="skills-title">{copy.skills.title}</h2>
        <p>{copy.skills.description}</p>
        <p>{copy.skills.more}</p>
        <div class="skill-controls">
          <button type="button" aria-disabled={!showMoko || !acceptsSkill(skillsState, 'jump')} onclick={() => moko?.playSkill('jump')}>{copy.skills.jump}</button>
          <button type="button" aria-disabled={!showMoko || !acceptsSkill(skillsState, 'shoot')} onclick={() => moko?.playSkill('shoot')}>{copy.skills.shoot}</button>
        </div>
      </div>
    </section>
  </div>
  </div>

    <section id="au-dela-de-la-demo" class="beyond-demo" aria-labelledby="beyond-demo-title">
      <div class="beyond-demo-copy">
        <h2 id="beyond-demo-title">{copy.beyondDemo.title}</h2>
        <p><strong>{copy.beyondDemo.tagline}</strong></p>
        <p>{copy.beyondDemo.intro}</p>
        <p>{copy.beyondDemo.preview}</p>
      </div>
      <div class="reading">
        <CanopyGallery labels={copy.gallery} shots={[
          { src: asset('images/beyond-demo/01-mangrove-exploration.webp'), ...copy.beyondDemo.mangrove, width: 1600, height: 900 },
          { src: asset('images/beyond-demo/02-temple-bone-tunnel.webp'), ...copy.beyondDemo.passage, width: 1600, height: 900 },
          { src: asset('images/beyond-demo/03-temple-interior-platforming.webp'), ...copy.beyondDemo.temple, width: 1600, height: 900 },
          { src: asset('images/beyond-demo/04-arena-entrance.webp'), ...copy.beyondDemo.arena, width: 1600, height: 900 }
        ]} />
      </div>
    </section>
    <BetaLaunchSection copy={copy.betaLaunch} joinBeta={copy.joinBeta} status={betaStatus}
      openBeta={(trigger) => betaDialog?.open(trigger)} />
  </main>
  <footer class="site-footer">
    <nav class="footer-social" aria-label={copy.socialLinks.label}>
      <a href="https://www.tiktok.com/@islandevolution2d" target="_blank" rel="noopener noreferrer"
        aria-label={copy.socialLinks.tiktok}>TikTok</a>
      <a href="https://www.youtube.com/@stephanemorel3306" target="_blank" rel="noopener noreferrer"
        aria-label={copy.socialLinks.youtube}>
        <img src={asset('social/youtube-icon.png')} alt="" width="32" height="32" loading="lazy" decoding="async" />
        YouTube
      </a>
    </nav>
    <div class="footer-legal">
      <a href={privacyUrl}>{copy.betaApplication.privacy}</a>
      <a href={`${resolve('/mentions-legales')}/?lang=${language}`}>{copy.legalNotice}</a>
    </div>
    <details class="footer-video-preferences">
      <summary bind:this={videoPreferences}>{copy.videoConsent.preferences}</summary>
      <div class="video-consent-panel">
        <p role="status">{copy.videoConsent[videoConsent ?? 'undecided']}</p>
        {@render videoConsentCopy()}
        {@render videoChoices(false)}
      </div>
    </details>
    <a class="footer-contact" href={`mailto:${privacyContact}`}>{privacyContact}</a>
    <small class="footer-copyright">{copy.footerCopyright}</small>
  </footer>
  <BetaApplicationDialog bind:this={betaDialog} {language} {privacyUrl} copy={copy.betaApplication} status={betaStatus} />
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
    .header-controls :global(button:not(:disabled):hover) {
      border-color: #f0cf84;
      background: #1b3626ba;
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    .header-controls :global(button), .header-beta {
      transition: border-color 160ms ease, background-color 160ms ease;
    }
  }

  .header-controls > button:not(.header-beta) {
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
    font-family: inherit;
    border-radius: 999px;
    background-color: #122c1bef;
    font-size: .8rem;
    font-weight: 650;
    white-space: nowrap;
    text-decoration: none;
  }

  .header-controls .header-beta:focus-visible { border-color: #f0cf84; }
  @media (max-width: 480px) {
    .header-controls > button:not(.header-beta) {
      min-width: 44px;
      padding-inline: .45rem;
    }

    .header-controls .header-beta { padding-inline: .45rem; }
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
    --skills-tail: clamp(5.5rem, calc(8rem - 4vw), 7rem);
    position: relative;
    isolation: isolate;
  }

  .immersive-content {
    position: relative;
    z-index: 4;
    display: flex;
    flex-direction: column;
    min-height: clamp(0px, 250vw, 3350px);
    text-shadow: 0 0 2px #0b1711, 0 1px 4px #0b1711, 0 0 12px #0b1711;
  }

  section {
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

  .opening { overflow: clip; }
  .hero-copy, .canopy { opacity: var(--intro-reveal); }
  .awaitingReveal :is(.hero-copy, .canopy) { visibility: hidden; }

  @media (prefers-reduced-motion: reduce) {
    .hero-copy, .canopy { opacity: 1; }
    .awaitingReveal :is(.hero-copy, .canopy) { visibility: visible; }
  }

  h1, h2, h3 {
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

  .video-consent-panel {
    display: grid;
    gap: .5rem;
    padding: .55rem .7rem;
    border: 1px solid #b69a5980;
    border-radius: .55rem;
    background: #142019;
    color: #fff2dc;
    font-size: .85rem;
    line-height: 1.35;
    text-align: start;
  }
  .adventure-video .video-consent-panel { margin-top: .45rem; }
  .video-consent-copy { min-width: 0; }
  .video-consent-panel p { max-width: none; margin: 0; color: inherit; font-size: inherit; line-height: inherit; }
  .video-consent-panel .video-consent-title { margin-bottom: .15rem; color: #f1cf8e; font-weight: 750; }
  .video-consent-panel a { color: #f1cf8e; font-size: .78rem; }
  .video-choices {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: .45rem;
  }
  .video-choices button {
    min-height: 44px;
    padding: .4rem .55rem;
    border: 1px solid #d4b473;
    border-radius: .45rem;
    background: #213528;
    color: #fff2dc;
    font: inherit;
    font-weight: 650;
    cursor: pointer;
  }
  .video-choices button:hover { background: #2d4536; }
  @media (min-width: 740px) {
    .video-consent-panel { grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: .45rem .85rem; }
    .video-consent-panel > [role='status'] { grid-column: 1 / -1; }
    .video-choices { grid-template-columns: repeat(2, minmax(6.6rem, 1fr)); }
  }

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
    flex: none;
    padding: 0;
    min-block-size: calc(clamp(17rem, 34svh, 22rem) + var(--skills-tail));
    background: linear-gradient(to bottom, transparent calc(100% - var(--skills-tail) - 9rem),
      rgb(21 19 13 / .38) calc(100% - var(--skills-tail) - 4.5rem), #101411 calc(100% - var(--skills-tail)));
  }

  .site-footer {
    display: grid;
    justify-items: center;
    gap: 1.2rem;
    padding: 1.75rem var(--content-gutter);
    border-top: 1px solid #f1cf8e33;
    text-align: center;
    background: #101411;
  }
  .site-footer a { color: #f1cf8e; }
  .footer-social {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: .75rem;
    width: min(100%, 18rem);
  }
  .footer-legal {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: .5rem .75rem;
  }
  .footer-social a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: .55rem;
    min-height: 44px;
    padding-inline: .85rem;
    border: 1px solid #b69a5966;
    border-radius: .55rem;
    background: #18221a;
    font-weight: 650;
    text-decoration: none;
  }
  .footer-social a:hover { border-color: #f1cf8e; background: #233024; }
  .site-footer a:focus-visible { outline: 2px solid #f1cf8e; outline-offset: 4px; }
  .footer-legal a { font-size: .92rem; text-underline-offset: .18em; }
  .footer-video-preferences { width: min(100%, 36rem); font-size: .92rem; }
  .footer-video-preferences summary { color: #f1cf8e; cursor: pointer; text-underline-offset: .18em; text-decoration: underline; }
  .footer-video-preferences .video-consent-panel { margin-top: .7rem; }
  .site-footer .footer-contact { color: #d8cbad; font-size: .9rem; overflow-wrap: anywhere; text-underline-offset: .18em; }
  .footer-copyright { color: #adb5a4; font-size: .8rem; line-height: 1.45; }

  .beyond-demo { background: #101411; }

  .beyond-demo-copy {
    max-width: 38rem;
    margin-inline: auto;
    text-align: center;
  }

  .beyond-demo-copy p { margin: .75rem auto 0; }

  .skills-copy {
    position: absolute;
    isolation: isolate;
    inset-inline: var(--content-gutter);
    inset-block-end: .6rem;
    margin-inline: auto;
    max-width: 30rem;
    color: #fff2dc;
    text-align: center;
  }

  .skills-copy::before {
    content: '';
    position: absolute;
    z-index: -1;
    inset: -.65rem;
    background: linear-gradient(90deg, transparent, #0b1711d9 10% 90%, transparent);
    mask-image: linear-gradient(transparent, #000 18% 86%, transparent);
    pointer-events: none;
  }

  .skills-copy h2 { font-size: clamp(1.65rem, 3vw, 2.5rem); line-height: 1.08; }
  .skills-copy p { margin: .45rem auto .65rem; color: inherit; line-height: 1.35; }

  .skills-copy p + p { margin-block-start: .35rem; }

  .skill-controls { display: flex; justify-content: center; flex-wrap: wrap; gap: .5rem; }
  .skill-controls button {
    min-height: 44px;
    border: 1px solid #e2be78;
    border-radius: 99px;
    padding: .35rem .9rem;
    background: #203c2b;
    color: #fff2dc;
    cursor: pointer;
    font: inherit;
    font-weight: 650;
  }

  .skill-controls button[aria-disabled='true'] { border-color: #abac93; background: #27382f; cursor: default; }

  @media (min-width: 800px) {
    .hero-copy { --hero-size-reserve: max(calc(var(--rail-width) + clamp(1rem, 6vw, 6rem)), 34vw); }
    .adventure-copy { max-width: 52rem; }
    .adventure-copy h2 { font-size: clamp(2.15rem, 4vw, 4rem); }
  }
</style>

