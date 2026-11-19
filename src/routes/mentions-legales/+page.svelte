<script lang="ts">
  import { resolve } from '$app/paths';
  import { onMount } from 'svelte';
  import LanguageSwitcher from '../../lib/components/LanguageSwitcher.svelte';
  import { languageKey, translations, type Language } from '../../lib/i18n';
  import { privacyContact } from '../../lib/privacy';

  const notices = {
    fr: {
      title: 'Mentions légales',
      back: 'Retour au site',
      draft:
        'Informations relatives à l’édition, à l’hébergement et au contact du site officiel MOKO - Island Evolution.',
      publisher: 'Édition du site',
      project:
        'MOKO - Island Evolution est un projet personnel indépendant, non commercial, porté par une personne physique. La démo Android est gratuite.',
      contact: 'Contact du projet',
      hosting: 'Hébergement',
      host: 'Le site MOKO - Island Evolution est hébergé par GitHub Pages, un service de GitHub, Inc. Les coordonnées ci-dessous sont publiées dans la documentation officielle de GitHub.',
      terms: 'Conditions d’utilisation de GitHub',
      addressSource: 'Coordonnées publiées par GitHub',
      country: 'États-Unis',
      data: 'Données personnelles',
      privacy: 'Politique de confidentialité'
    },
    en: {
      title: 'Legal Notice',
      back: 'Back to the site',
      draft:
        'Publisher, hosting and contact information for the official MOKO - Island Evolution website.',
      publisher: 'Site publisher',
      project:
        'MOKO - Island Evolution is an independent, non-commercial personal project run by an individual. The Android demo is free.',
      contact: 'Project contact',
      hosting: 'Hosting',
      host: 'The MOKO - Island Evolution website is hosted on GitHub Pages, a service provided by GitHub, Inc. The contact details below are published in GitHub’s official documentation.',
      terms: 'GitHub Terms of Service',
      addressSource: 'Contact details published by GitHub',
      country: 'United States',
      data: 'Personal data',
      privacy: 'Privacy Policy'
    }
  };

  let language = $state<Language>('fr');
  const copy = $derived(notices[language]);

  function applyLanguage(next: Language) {
    language = next;
    document.documentElement.lang = next;
  }

  onMount(() => {
    const requested = new URLSearchParams(window.location.search).get('lang');
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(languageKey);
    } catch {
      // The selector is also usable without storage.
    }
    applyLanguage(requested === 'en' || (requested === null && saved === 'en') ? 'en' : 'fr');
  });

  function selectLanguage(next: Language) {
    applyLanguage(next);
    try {
      localStorage.setItem(languageKey, next);
    } catch {
      // Navigation links include the selected language.
    }
  }
</script>

<svelte:head>
  <title>{copy.title} | MOKO - Island Evolution</title>
  <meta
    name="description"
    content={language === 'fr'
      ? 'Informations sur l’édition, l’hébergement et le contact du site officiel MOKO - Island Evolution.'
      : 'Publisher, hosting and contact information for the official MOKO - Island Evolution website.'}
  />
  <meta name="robots" content="noindex" />
</svelte:head>

<main class="legal-notice" lang={language}>
  <header>
    <a href={`${resolve('/')}?lang=${language}`}>{copy.back}</a>
    <LanguageSwitcher {language} label={translations[language].language} select={selectLanguage} />
  </header>
  <h1>{copy.title}</h1>
  <p class="draft">{copy.draft}</p>

  <section>
    <h2>{copy.publisher}</h2>
    <p>{copy.project}</p>
    <p>{copy.contact} <a href={`mailto:${privacyContact}`}>{privacyContact}</a>.</p>
  </section>

  <section>
    <h2>{copy.hosting}</h2>
    <p>{copy.host}</p>
    <address>
      GitHub, Inc.<br />
      88 Colin P. Kelly Jr. St.<br />
      San Francisco, CA 94107<br />
      {copy.country}
    </address>
    <ul>
      <li>
        <a href="https://docs.github.com/en/site-policy/github-terms/github-terms-of-service"
          >{copy.terms}</a
        >
      </li>
      <li>
        <a
          href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement#contact-us"
          >{copy.addressSource}</a
        >
      </li>
    </ul>
  </section>

  <section>
    <h2>{copy.data}</h2>
    <a href={`${resolve('/confidentialite')}/?lang=${language}`}>{copy.privacy}</a>
  </section>
</main>

<style>
  :global(html:has(.legal-notice)) {
    color-scheme: dark;
    background: #101411;
  }
  :global(body:has(.legal-notice)) {
    margin: 0;
    font-family: system-ui, sans-serif;
    color: #fff2d8;
  }
  .legal-notice {
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
  address {
    font-style: normal;
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
</style>
