<script lang="ts">
  import { resolve } from '$app/paths';
  import { onMount } from 'svelte';
  import LanguageSwitcher from '../../lib/components/LanguageSwitcher.svelte';
  import { translations, type Language } from '../../lib/i18n';
  import { readPageLanguage, rememberPageLanguage } from '../../lib/page-language';
  import {
    cnilComplaintUrl,
    privacyContact,
    privacyCopy,
    umamiDataAgreementUrl,
    umamiSubprocessorsUrl
  } from '../../lib/privacy';

  let language = $state<Language>('fr');
  const copy = $derived(privacyCopy[language]);

  function applyLanguage(next: Language) {
    language = next;
    document.documentElement.lang = next;
  }

  onMount(() => {
    const requested = new URLSearchParams(window.location.search).get('lang');
    applyLanguage(readPageLanguage(requested));
  });

  function selectLanguage(next: Language) {
    applyLanguage(next);
    rememberPageLanguage(next);
  }
</script>

<svelte:head>
  <title>{copy.title} | MOKO - Island Evolution</title>
  <meta
    name="description"
    content={language === 'fr'
      ? 'Données utilisées pour les candidatures à la bêta Android de MOKO - Island Evolution, durées de conservation et exercice de vos droits.'
      : 'Data used for MOKO - Island Evolution Android beta applications, retention periods and how to exercise your rights.'}
  />
  <meta name="robots" content="noindex" />
</svelte:head>

<main class="policy" lang={language}>
  <header>
    <a href={`${resolve('/')}?lang=${language}`}>{copy.back}</a>
    <LanguageSwitcher {language} label={translations[language].language} select={selectLanguage} />
  </header>
  <h1>{copy.title}</h1>
  <p class="draft">{copy.draft}</p>

  <section>
    <h2>{copy.controllerTitle}</h2>
    <p>{copy.controller} <a href={`mailto:${privacyContact}`}>{privacyContact}</a>.</p>
  </section>

  <section>
    <h2>{copy.analytics.title}</h2>
    {#each copy.analytics.paragraphs as paragraph}
      <p>{paragraph}</p>
    {/each}
    <ul>
      <li><a href={umamiDataAgreementUrl}>{copy.analytics.agreement}</a></li>
      <li><a href={umamiSubprocessorsUrl}>{copy.analytics.subprocessors}</a></li>
    </ul>
  </section>

  {#each copy.sections as section}
    <section>
      <h2>{section.title}</h2>
      {#each section.paragraphs as paragraph}
        <p>{paragraph}</p>
      {/each}
    </section>
  {/each}

  <section>
    <h2>{copy.retentionTitle}</h2>
    <dl>
      {#each copy.retention as item}
        <dt>{item.group}</dt>
        <dd>{item.deadline}</dd>
      {/each}
    </dl>
    <p>{copy.deletion}</p>
  </section>

  <section>
    <h2>{copy.rightsTitle}</h2>
    <p>{copy.rights}</p>
    <p>{copy.exercise}</p>
    <a href={cnilComplaintUrl}>{copy.complaint}</a>
  </section>
</main>

<style>
  :global(html:has(.policy)) {
    color-scheme: dark;
    background: #101411;
  }
  :global(body:has(.policy)) {
    margin: 0;
    font-family: system-ui, sans-serif;
    color: #fff2d8;
  }
  .policy {
    max-width: 45rem;
    margin-inline: auto;
    padding: clamp(1rem, 5vw, 3rem);
    line-height: 1.65;
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  h1 {
    font-size: clamp(1.8rem, 5vw, 3rem);
    line-height: 1.15;
  }
  h2 {
    font-size: clamp(1.15rem, 3vw, 1.5rem);
    line-height: 1.3;
  }
  section {
    margin-top: 2rem;
  }
  .draft {
    border-inline-start: 0.2rem solid #e2be78;
    padding-inline-start: 1rem;
  }
  a {
    color: #f1cf8e;
    overflow-wrap: anywhere;
  }
  :is(a, :global(button)):focus-visible {
    outline: 2px solid #f1cf8e;
    outline-offset: 3px;
  }
  header :global(button) {
    border: 1px solid #dce9b56b;
    border-radius: 0.5rem;
    background: #203e2a;
    cursor: pointer;
  }
  header :global(button[aria-pressed='true']) {
    border-color: #e2be78;
  }
  dt {
    font-weight: 700;
  }
  dd {
    margin: 0.2rem 0 0.8rem;
  }
</style>
