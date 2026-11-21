<script lang="ts">
  import { resolve } from '$app/paths';
  import { onMount, tick } from 'svelte';
  import {
    analyticsConsentKey,
    parseAnalyticsConsent,
    readAnalyticsConsent,
    saveAnalyticsChoice,
    type AnalyticsChoice
  } from '../analytics/consent';
  import { discardQueuedConsent, setAnalyticsConsent } from '../analytics/umami';
  import type { Language } from '../i18n';

  const translations = {
    fr: {
      title: 'Mesure d’audience',
      description:
        'Avec votre accord, Umami mesure les pages visitées, les sources de trafic et les interactions avec le site et la bêta Android.',
      privacy: 'Politique de confidentialité',
      allow: 'Accepter',
      refuse: 'Refuser',
      withdraw: 'Retirer mon accord',
      close: 'Fermer',
      allowed: 'Mesure d’audience autorisée.',
      refused: 'Mesure d’audience désactivée.',
      unavailable: 'Votre navigateur n’a pas pu enregistrer le choix. La mesure reste désactivée.',
      withdrawalUnavailable:
        'La mesure est arrêtée dans cet onglet. Le refus n’a pas pu être enregistré. Un accord antérieur peut rester actif dans un autre onglet ou au prochain chargement.'
    },
    en: {
      title: 'Audience analytics',
      description:
        'With your consent, Umami measures page visits, traffic sources and interactions with the site and the Android beta.',
      privacy: 'Privacy policy',
      allow: 'Accept',
      refuse: 'Decline',
      withdraw: 'Withdraw consent',
      close: 'Close',
      allowed: 'Audience analytics is enabled.',
      refused: 'Audience analytics is disabled.',
      unavailable: 'Your browser could not save your choice. Analytics remains disabled.',
      withdrawalUnavailable:
        'Analytics has stopped in this tab. Your refusal could not be saved. A previous consent may still apply in another tab or on the next page load.'
    }
  } satisfies Record<Language, Record<string, string>>;

  const maxTimeoutDelay = 2_147_483_647;

  let language = $state<Language>('fr');
  let choice = $state<AnalyticsChoice | null>(null);
  let ready = $state(false);
  let showChoices = $state(false);
  let failedChoice = $state<AnalyticsChoice | null>(null);
  let choiceExpiresAt = $state<number>();
  let settingsButton: HTMLButtonElement | undefined = $state();
  let panel: HTMLElement | undefined = $state();
  const copy = $derived(translations[language]);
  const panelVisible = $derived(showChoices || choice === null);

  function refreshChoice(syncTracker = true) {
    if (failedChoice) return;
    const consent = readAnalyticsConsent();
    choice = consent?.choice ?? null;
    choiceExpiresAt = consent?.expiresAt;
    if (syncTracker || choice !== 'allowed') setAnalyticsConsent(choice);
  }

  $effect(() => {
    if (!showChoices || choiceExpiresAt === undefined) return;
    const deadline = choiceExpiresAt;
    let timer: ReturnType<typeof setTimeout>;

    function checkExpiry() {
      const remaining = deadline - Date.now();
      if (remaining <= 0) refreshChoice(false);
      else timer = setTimeout(checkExpiry, Math.min(remaining, maxTimeoutDelay));
    }

    checkExpiry();
    return () => clearTimeout(timer);
  });

  onMount(() => {
    function updateLanguage() {
      language = document.documentElement.lang === 'en' ? 'en' : 'fr';
    }

    function syncChoice(event: StorageEvent) {
      if (
        event.storageArea !== localStorage ||
        (event.key !== analyticsConsentKey && event.key !== null)
      )
        return;

      const previous = parseAnalyticsConsent(event.oldValue);
      const next = parseAnalyticsConsent(event.newValue);
      if (
        previous?.choice === 'allowed' &&
        (next?.choice !== 'allowed' || next.generation !== previous.generation)
      ) {
        discardQueuedConsent(previous.generation);
      }
      refreshChoice();
    }

    function refreshFromStorage() {
      refreshChoice();
    }

    updateLanguage();
    const observer = new MutationObserver(updateLanguage);
    observer.observe(document.documentElement, { attributeFilter: ['lang'] });
    refreshChoice();
    ready = true;
    window.addEventListener('storage', syncChoice);
    window.addEventListener('pageshow', refreshFromStorage);
    document.addEventListener('visibilitychange', refreshFromStorage);

    return () => {
      setAnalyticsConsent(null);
      observer.disconnect();
      window.removeEventListener('storage', syncChoice);
      window.removeEventListener('pageshow', refreshFromStorage);
      document.removeEventListener('visibilitychange', refreshFromStorage);
    };
  });

  async function choose(next: AnalyticsChoice) {
    if (next === 'refused') setAnalyticsConsent('refused');
    failedChoice = saveAnalyticsChoice(next) ? null : next;
    if (failedChoice) {
      choice = 'refused';
      choiceExpiresAt = undefined;
      setAnalyticsConsent('refused');
    } else {
      refreshChoice();
    }
    await showPanel(failedChoice !== null);
  }

  async function showPanel(open: boolean) {
    if (open) refreshChoice(false);
    showChoices = open;
    await tick();
    (open ? panel : settingsButton)?.focus({ preventScroll: true });
    if (open) panel?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }
</script>

{#if ready}
  <div class="analytics-preferences" lang={language}>
    {#if panelVisible}
      <section aria-labelledby="analytics-title" tabindex="-1" bind:this={panel}>
        <h2 id="analytics-title">{copy.title}</h2>
        <p>{copy.description}</p>
        <a href={`${resolve('/confidentialite')}/?lang=${language}`}>{copy.privacy}</a>
        {#if failedChoice}
          <p role="status">
            {failedChoice === 'refused' ? copy.withdrawalUnavailable : copy.unavailable}
          </p>
        {:else if choice}
          <p role="status">{copy[choice]}</p>
        {/if}
        <div class="actions">
          {#if choice !== 'allowed'}
            <button type="button" onclick={() => choose('allowed')}>{copy.allow}</button>
          {/if}
          {#if choice !== 'refused'}
            <button type="button" onclick={() => choose('refused')}>
              {choice === 'allowed' ? copy.withdraw : copy.refuse}
            </button>
          {/if}
          {#if choice}
            <button type="button" onclick={() => showPanel(false)}>{copy.close}</button>
          {/if}
        </div>
      </section>
    {:else}
      <button type="button" bind:this={settingsButton} onclick={() => showPanel(true)}>
        {copy.title}
      </button>
    {/if}
  </div>
{/if}

<style>
  .analytics-preferences {
    display: grid;
    justify-items: center;
    padding: 0.75rem 1rem 1rem;
    color: #fff2d8;
    background: #142019;
    font:
      0.875rem/1.45 system-ui,
      sans-serif;
  }

  section {
    max-width: 38rem;
  }

  h2 {
    margin: 0;
    font-size: 1rem;
  }

  p {
    margin: 0.4rem 0;
  }

  a {
    color: #f1cf8e;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
    margin-top: 0.65rem;
  }

  button {
    min-height: 44px;
    padding: 0.35rem 0.7rem;
    font: inherit;
    color: inherit;
    background: #203e2a;
    border: 1px solid #e2be78;
    border-radius: 0.4rem;
    cursor: pointer;
  }

  .analytics-preferences > button {
    padding-inline: 0;
    border: 0;
    background: transparent;
    color: #f1cf8e;
    text-decoration: underline;
  }

  :is(a, button):focus-visible {
    outline: 2px solid #f1cf8e;
    outline-offset: 2px;
  }
</style>
