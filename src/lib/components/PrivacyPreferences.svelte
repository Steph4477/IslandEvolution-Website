<script lang="ts">
  import { flushSync, onMount, untrack } from 'svelte';
  import { resolve } from '$app/paths';
  import {
    analyticsConsentKey,
    parseAnalyticsConsent,
    saveAnalyticsChoice
  } from '../analytics/consent';
  import { discardQueuedConsent, setAnalyticsConsent, supportsAnalytics } from '../analytics/umami';
  import { videoConsentKey, parseVideoConsent, saveVideoChoice } from '../video/consent';
  import { resolveDraft, sameRecord, type Choice, type RecordOfChoice } from '../preference-choice';

  let {
    readyToPrompt,
    home,
    videosAllowed = $bindable(false)
  }: { readyToPrompt: boolean; home: boolean; videosAllowed?: boolean } = $props();
  const services = ['analytics', 'youtube'] as const;
  type Service = (typeof services)[number];
  const settings = {
    analytics: {
      key: analyticsConsentKey,
      parse: parseAnalyticsConsent,
      save: saveAnalyticsChoice
    },
    youtube: { key: videoConsentKey, parse: parseVideoConsent, save: saveVideoChoice }
  };
  const words = {
    fr: {
      title: 'Votre confidentialité',
      intro: 'Choisissez les services que vous autorisez sur ce site.',
      videoOnly: 'Sur cette version du site, seules les vidéos YouTube nécessitent votre choix.',
      analytics: 'Statistiques d’audience - Umami',
      stats:
        'Mesure les visites, les sources de trafic et les interactions avec le site et la bêta Android.',
      youtube: 'Vidéos YouTube',
      video:
        'Autorise la connexion à Google pour lire les vidéos. YouTube peut utiliser des cookies.',
      accept: 'Tout accepter',
      deny: 'Tout refuser',
      save: 'Enregistrer mes choix',
      close: 'Fermer',
      policy: 'Politique de confidentialité',
      failure:
        'Le navigateur n’a pas pu enregistrer tous vos choix. Les services concernés sont bloqués ici. Un ancien accord peut subsister ailleurs ou après rechargement.'
    },
    en: {
      title: 'Your privacy',
      intro: 'Choose which services you allow on this site.',
      videoOnly: 'On this version of the site, only YouTube videos require your choice.',
      analytics: 'Audience analytics - Umami',
      stats:
        'Measures visits, traffic sources and interactions with the site and the Android beta.',
      youtube: 'YouTube videos',
      video: 'Allows connections to Google to play videos. YouTube may use cookies.',
      accept: 'Accept all',
      deny: 'Reject all',
      save: 'Save my choices',
      close: 'Close',
      policy: 'Privacy policy',
      failure:
        'Your browser could not save all choices. The affected services are blocked here. An earlier consent may still apply elsewhere or after reloading.'
    }
  };
  let language = $state<'fr' | 'en'>('fr');
  const copy = $derived(words[language]);
  let analyticsAvailable = $state(false);
  let mounted = $state(false);
  let offered = false;
  let dialog: HTMLDialogElement;
  let heading: HTMLHeadingElement;
  let trigger: HTMLElement | null = null;
  const records: Record<Service, RecordOfChoice> = { analytics: null, youtube: null };
  const baseline = { ...records };
  const checked = $state({ analytics: false, youtube: false });
  const failed = $state({ analytics: false, youtube: false });
  let timer: number;
  let withdrawalPending = false;
  let fallbackFocus: HTMLElement | null = null;

  function enabled(service: Service) {
    return service === 'youtube' || analyticsAvailable;
  }
  function refresh() {
    clearTimeout(timer);
    let deadline = Infinity;
    let readable = true;
    for (const service of services) {
      if (!enabled(service)) continue;
      const { key, parse } = settings[service];
      let next: RecordOfChoice = null;
      try {
        if (!failed[service]) next = parse(localStorage.getItem(key));
      } catch {
        readable = false;
      }
      if (next) deadline = Math.min(deadline, next.expiresAt);
      if (dialog.open && !sameRecord(records[service], next)) {
        baseline[service] = next;
        checked[service] = next?.choice === 'allowed';
      }
      if (service === 'analytics') {
        if (
          records.analytics?.choice === 'allowed' &&
          records.analytics.generation &&
          records.analytics.generation !== next?.generation
        )
          discardQueuedConsent(records.analytics.generation);
        setAnalyticsConsent(next?.choice ?? null);
      }
      records[service] = next;
    }
    const allow = records.youtube?.choice === 'allowed';
    if (videosAllowed && !allow) withdrawalPending = true;
    videosAllowed = allow;
    if (allow) withdrawalPending = false;
    if (Number.isFinite(deadline))
      timer = window.setTimeout(refresh, Math.min(2147483647, Math.max(1, deadline - Date.now())));
    if (withdrawalPending && !dialog.open && readable && !failed.analytics && !failed.youtube) {
      withdrawalPending = false;
      flushSync();
      try {
        sessionStorage.setItem(videoConsentKey + ':return', '1');
      } catch {
        /* Le retour du focus est facultatif. */
      }
      location.reload();
    }
  }

  export function open(source: HTMLElement | null = null) {
    if (!mounted || document.querySelector('dialog[open]')) return;
    refresh();
    offered = true;
    trigger = source;
    fallbackFocus =
      source?.closest('section')?.querySelector<HTMLElement>('h2') ??
      document.querySelector<HTMLElement>('h1');
    for (const service of services) {
      baseline[service] = records[service];
      checked[service] = records[service]?.choice === 'allowed';
    }
    dialog.showModal();
    heading.focus({ preventScroll: true });
  }
  function maybeOffer() {
    if (!mounted || !readyToPrompt || offered) return;
    if (records.youtube || records.analytics) {
      offered = true;
      return;
    }
    open();
  }
  $effect(() => {
    if (mounted && readyToPrompt) untrack(maybeOffer);
  });

  function submit(mode: 'accept' | 'deny' | 'save') {
    // Traiter les deux choix avant tout rechargement lié au retrait de YouTube.
    for (const service of services) {
      if (!enabled(service)) continue;
      const config = settings[service];
      let current: RecordOfChoice = null;
      let readable = true;
      try {
        if (!failed[service]) current = config.parse(localStorage.getItem(config.key));
      } catch {
        readable = false;
      }
      const next: Choice | null =
        mode === 'accept'
          ? 'allowed'
          : mode === 'deny'
            ? 'refused'
            : !readable && !checked[service]
              ? 'refused'
              : resolveDraft(baseline[service], current, checked[service]);
      if (next === null || (!failed[service] && current?.choice === next)) continue;
      if (service === 'analytics' && next === 'refused') setAnalyticsConsent('refused');
      failed[service] = !config.save(next);
      // Le verrou de session couvre aussi un rechargement manuel si le stockage local échoue.
      try {
        if (failed[service]) sessionStorage.setItem(config.key + ':blocked', '1');
        else sessionStorage.removeItem(config.key + ':blocked');
      } catch {
        /* Le verrou en mémoire protège toujours le document courant. */
      }
      if (failed[service]) checked[service] = false;
    }
    refresh();
    if (!failed.analytics && !failed.youtube) dialog.close();
  }

  function restoreFocus() {
    if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    else if (fallbackFocus?.isConnected) {
      fallbackFocus.tabIndex = -1;
      fallbackFocus.focus({ preventScroll: true });
    }
    trigger = null;
    fallbackFocus = null;
    if (withdrawalPending) refresh();
  }

  onMount(() => {
    analyticsAvailable = supportsAnalytics();
    function updateLanguage() {
      language = document.documentElement.lang === 'en' ? 'en' : 'fr';
    }
    updateLanguage();
    const observer = new MutationObserver(updateLanguage);
    observer.observe(document.documentElement, { attributeFilter: ['lang'] });
    for (const service of services) {
      try {
        failed[service] = sessionStorage.getItem(settings[service].key + ':blocked') === '1';
      } catch {
        /* Le stockage de session est facultatif. */
      }
    }
    refresh();
    mounted = true;
    try {
      if (sessionStorage.getItem(videoConsentKey + ':return')) {
        sessionStorage.removeItem(videoConsentKey + ':return');
        document
          .querySelector<HTMLElement>('[data-privacy-open="footer"]')
          ?.focus({ preventScroll: true });
      }
    } catch {
      /* Le focus natif reste disponible. */
    }
    function sync(event: StorageEvent) {
      if (event.key !== null && !services.some((service) => settings[service].key === event.key))
        return;
      if (event.key === analyticsConsentKey) {
        const previous = parseAnalyticsConsent(event.oldValue);
        const next = parseAnalyticsConsent(event.newValue);
        if (previous?.choice === 'allowed' && previous.generation !== next?.generation)
          discardQueuedConsent(previous.generation);
      }
      refresh();
    }
    window.addEventListener('storage', sync);
    window.addEventListener('pageshow', refresh);
    document.addEventListener('visibilitychange', refresh);
    document.addEventListener('close', maybeOffer, true);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener('storage', sync);
      window.removeEventListener('pageshow', refresh);
      document.removeEventListener('visibilitychange', refresh);
      document.removeEventListener('close', maybeOffer, true);
      setAnalyticsConsent(null);
    };
  });
</script>

{#if !home}<footer>
    <button
      type="button"
      data-privacy-open="footer"
      aria-haspopup="dialog"
      onclick={(event) => open(event.currentTarget)}>{copy.title}</button
    >
  </footer>{/if}
<dialog
  id="privacy-preferences"
  bind:this={dialog}
  aria-labelledby="privacy-title"
  aria-describedby="privacy-intro"
  onclose={restoreFocus}
  lang={language}
>
  <header>
    <h2 id="privacy-title" tabindex="-1" bind:this={heading}>{copy.title}</h2>
    <button type="button" data-privacy-action="close" onclick={() => dialog.close()}
      >{copy.close}</button
    >
  </header>
  <p id="privacy-intro">{analyticsAvailable ? copy.intro : copy.videoOnly}</p>
  {#each services.filter(enabled) as service (service)}
    <label
      ><input type="checkbox" id={'privacy-' + service} bind:checked={checked[service]} /><span
        ><strong>{copy[service]}</strong><small
          >{service === 'analytics' ? copy.stats : copy.video}</small
        ></span
      ></label
    >
  {/each}
  <a href={resolve('/confidentialite') + '/?lang=' + language} onclick={() => dialog.close()}
    >{copy.policy}</a
  >
  {#if failed.analytics || failed.youtube}<p role="status">{copy.failure}</p>{/if}
  <div class="actions">
    {#each ['accept', 'deny', 'save'] as mode}<button
        type="button"
        data-privacy-action={mode}
        onclick={() => submit(mode as 'accept' | 'deny' | 'save')}
        >{copy[mode as 'accept' | 'deny' | 'save']}</button
      >{/each}
  </div>
</dialog>

<style>
  dialog,
  footer {
    color: #fff2dc;
    background: #142019;
    font:
      1rem/1.4 system-ui,
      sans-serif;
  }
  dialog {
    box-sizing: border-box;
    width: min(31rem, calc(100% - 1.5rem));
    max-height: calc(100dvh - 2rem);
    margin: auto;
    padding: clamp(0.85rem, 3vw, 1.3rem);
    border: 1px solid #d4b473;
    border-radius: 0.7rem;
    overflow: auto;
    overscroll-behavior: contain;
  }
  dialog::backdrop {
    background: #07100bc9;
  }
  :global(html:has(#privacy-preferences[open])) {
    overflow: hidden;
  }
  header,
  .actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  header {
    justify-content: space-between;
  }
  h2,
  p {
    margin: 0 0 0.5rem;
  }
  label {
    display: flex;
    align-items: flex-start;
    gap: 0.65rem;
    padding: 0.5rem 0;
    cursor: pointer;
  }
  input {
    width: 1.25rem;
    height: 1.25rem;
    flex: none;
    accent-color: #cda764;
  }
  small {
    display: block;
  }
  a {
    color: #f1cf8e;
  }
  .actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    margin-top: 0.8rem;
  }
  .actions button:last-child {
    grid-column: 1/-1;
  }
  button {
    min-height: 44px;
    color: inherit;
    background: #203e2a;
    border: 1px solid #d4b473;
    border-radius: 0.4rem;
    font: inherit;
    cursor: pointer;
  }
  :is(a, button, input):focus-visible {
    outline: 2px solid #f1cf8e;
    outline-offset: 2px;
  }
  footer {
    text-align: center;
    padding: 0.7rem;
  }
</style>
