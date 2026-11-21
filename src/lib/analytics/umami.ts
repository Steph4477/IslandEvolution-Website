import { readCampaignQuery } from './campaign';
import { readAnalyticsConsent, type AnalyticsChoice } from './consent';

const siteOrigin = 'https://moko-islandevolution.com';
const siteHostname = 'moko-islandevolution.com';
const website = 'f56cb79e-742f-4def-9bb9-ee13afdd0747';
const trackerUrl = 'https://cloud.umami.is/script.js';
const maxQueuedEvents = 20;
const queuedEventMaxAge = 10_000;
const publicRoutes = ['/', '/confidentialite/', '/mentions-legales/'] as const;
const sourceDomains = new Set([
  'bing.com',
  'duckduckgo.com',
  'facebook.com',
  'github.com',
  'google.com',
  'google.fr',
  'instagram.com',
  'linkedin.com',
  'tiktok.com',
  'youtu.be',
  'youtube.com'
]);

type AnalyticsRoute = (typeof publicRoutes)[number];
type Interaction =
  | { name: 'beta_open' | 'beta_mailto' | 'teaser_play' }
  | { name: 'external_link'; category: 'social' | 'portfolio' };
type Payload = {
  website: string;
  hostname: string;
  url: AnalyticsRoute;
  referrer?: string;
  name?: Interaction['name'];
  data?: { category: 'social' | 'portfolio' };
};

type TrackedPayload = Omit<Payload, 'url'> & {
  url: AnalyticsRoute | `${AnalyticsRoute}?${string}`;
};

declare global {
  interface Window {
    umami?: { track: (payload: Payload) => Promise<void> | void };
    mokoAnalyticsBeforeSend?: (type: string) => TrackedPayload | null;
  }
}

let allowed = false;
let tracker: HTMLScriptElement | undefined;
let trackerReady = false;
let currentPage: AnalyticsRoute | undefined;
let lastPage: AnalyticsRoute | undefined;
let pendingEvent: { payload: Payload; generation: string } | undefined;
let landingRead = false;
let campaignQuery: string | undefined;
let campaignConsent: { generation: string; expiresAt: number } | undefined;
const queuedEvents = new Map<
  Payload,
  { generation: string; expiresAt: number; timeout: ReturnType<typeof setTimeout> }
>();

export function supportsAnalytics(): boolean {
  return import.meta.env.VITE_UMAMI_ENABLED === 'true' && location.origin === siteOrigin;
}

function captureLandingCampaign() {
  if (landingRead || !supportsAnalytics()) return;
  landingRead = true;
  campaignQuery = readCampaignQuery(location.search);
}

function clearCampaign() {
  campaignQuery = undefined;
  campaignConsent = undefined;
}

function removeQueuedEvent(payload: Payload) {
  const entry = queuedEvents.get(payload);
  if (!entry) return;
  clearTimeout(entry.timeout);
  queuedEvents.delete(payload);
}

export function discardQueuedConsent(generation: string) {
  if (campaignConsent?.generation === generation) clearCampaign();
  for (const [payload, entry] of queuedEvents) {
    if (entry.generation === generation) removeQueuedEvent(payload);
  }
}

function clearQueuedEvents() {
  for (const entry of queuedEvents.values()) clearTimeout(entry.timeout);
  queuedEvents.clear();
}

function activeConsent() {
  // Relire le choix avant chaque envoi, sans attendre la notification des autres onglets.
  const consent = allowed ? readAnalyticsConsent() : null;
  if (
    campaignConsent &&
    (consent?.choice !== 'allowed' ||
      consent.generation !== campaignConsent.generation ||
      campaignConsent.expiresAt <= Date.now())
  )
    clearCampaign();

  if (consent?.choice === 'allowed') {
    if (campaignQuery && !campaignConsent) {
      campaignConsent = { generation: consent.generation, expiresAt: consent.expiresAt };
    }
    return consent;
  }
  clearQueuedEvents();
  return null;
}

function queueEvent(payload: Payload, consent: { expiresAt: number; generation: string }) {
  if (queuedEvents.size >= maxQueuedEvents) {
    const oldest = queuedEvents.keys().next().value;
    if (oldest) removeQueuedEvent(oldest);
  }

  const now = Date.now();
  const expiresAt = Math.min(now + queuedEventMaxAge, consent.expiresAt);
  queuedEvents.set(payload, {
    generation: consent.generation,
    expiresAt,
    timeout: setTimeout(() => queuedEvents.delete(payload), expiresAt - now)
  });
}

function flushQueuedEvents() {
  for (const [payload, { expiresAt, generation }] of queuedEvents) {
    removeQueuedEvent(payload);
    if (expiresAt > Date.now()) send(payload, generation);
  }
}

function beforeSend(type: string): TrackedPayload | null {
  if (type !== 'event' || !pendingEvent) return null;
  if (activeConsent()?.generation !== pendingEvent.generation) return null;

  const { payload } = pendingEvent;
  pendingEvent = undefined;
  if (
    campaignQuery &&
    (!payload.name || payload.name === 'beta_open' || payload.name === 'beta_mailto')
  ) {
    return { ...payload, url: `${payload.url}?${campaignQuery}` };
  }
  return payload;
}

function loadTracker() {
  if (tracker || !activeConsent()) return;

  const script = document.createElement('script');
  window.mokoAnalyticsBeforeSend = beforeSend;
  script.src = trackerUrl;
  script.async = true;
  script.referrerPolicy = 'no-referrer';
  script.dataset.websiteId = website;
  script.dataset.domains = siteHostname;
  script.dataset.autoPageview = 'false';
  script.dataset.excludeSearch = 'true';
  script.dataset.excludeHash = 'true';
  script.dataset.beforeSend = 'mokoAnalyticsBeforeSend';
  script.dataset.fetchCredentials = 'omit';

  function discardTracker() {
    if (tracker !== script || trackerReady) return;
    tracker = undefined;
    clearQueuedEvents();
    script.remove();
  }

  script.addEventListener(
    'load',
    () => {
      if (tracker !== script) return;
      if (typeof window.umami?.track !== 'function') {
        discardTracker();
        return;
      }
      trackerReady = true;
      trackPage();
      flushQueuedEvents();
    },
    { once: true }
  );
  script.addEventListener('error', discardTracker, { once: true });
  tracker = script;
  document.head.append(script);
}

function send(payload: Payload, generation: string): boolean {
  if (!trackerReady || activeConsent()?.generation !== generation || !window.umami) return false;

  // Le filtre du traceur vérifie encore l’accord qui autorise cette charge utile.
  pendingEvent = { payload, generation };
  try {
    void Promise.resolve(window.umami.track(payload)).catch(() => {});
    return pendingEvent === undefined;
  } catch {
    return false;
  } finally {
    pendingEvent = undefined;
  }
}

function landingReferrer(): string | undefined {
  try {
    const referrer = new URL(document.referrer);
    const hostname = referrer.hostname.replace(/^www\./, '');
    if (['http:', 'https:'].includes(referrer.protocol) && sourceDomains.has(hostname)) {
      return `https://${hostname}/`;
    }
  } catch {
    // Une visite directe ou un référent invalide ne fournit aucune source.
  }
}

function trackPage() {
  if (!currentPage || currentPage === lastPage || !trackerReady) return;
  const consent = activeConsent();
  if (!consent) return;

  const url = currentPage;
  const referrer = lastPage === undefined ? landingReferrer() : undefined;
  if (
    send(
      { website, hostname: siteHostname, url, ...(referrer && { referrer }) },
      consent.generation
    )
  )
    lastPage = url;
}

export function setAnalyticsPage(routeId: string | null) {
  captureLandingCampaign();
  currentPage = publicRoutes.find((route) => route === routeId || route.slice(0, -1) === routeId);
  trackPage();
}

export function setAnalyticsConsent(choice: AnalyticsChoice | null) {
  captureLandingCampaign();
  allowed = choice === 'allowed' && supportsAnalytics();
  if (!allowed) {
    if (choice === 'refused' || campaignConsent) clearCampaign();
    lastPage = undefined;
    pendingEvent = undefined;
    clearQueuedEvents();
    return;
  }
  const consent = activeConsent();
  if (!consent) return;
  for (const [payload, entry] of queuedEvents) {
    if (entry.generation !== consent.generation) removeQueuedEvent(payload);
  }
  loadTracker();
  trackPage();
}

export function trackAnalyticsEvent(event: Interaction) {
  if (!currentPage) return;

  const consent = activeConsent();
  if (!consent) return;

  const payload: Payload = {
    website,
    hostname: siteHostname,
    url: currentPage,
    name: event.name,
    ...(event.name === 'external_link' && { data: { category: event.category } })
  };

  if (trackerReady) send(payload, consent.generation);
  else if (tracker) queueEvent(payload, consent);
}
