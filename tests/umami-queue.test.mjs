import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import test from 'node:test';
import {
  analyticsConsentKey,
  analyticsConsentMaxAge,
  readAnalyticsConsent,
  saveAnalyticsChoice
} from '../src/lib/analytics/consent.ts';

const source = readFileSync(new URL('../src/lib/analytics/umami.ts', import.meta.url), 'utf8');
const consentUrl = new URL('../src/lib/analytics/consent.ts', import.meta.url).href;
const moduleSource = ts.transpileModule(source.replace("'./consent'", JSON.stringify(consentUrl)), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ESNext }
}).outputText;
const moduleUrl =
  'data:text/javascript,' +
  encodeURIComponent('import.meta.env = { VITE_UMAMI_ENABLED: "true" };\n' + moduleSource);
let instance = 0;

async function setup(t, choice = 'allowed', duration = analyticsConsentMaxAge) {
  t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 1760000000000 });
  const scripts = [];
  const sent = [];
  const values = new Map();
  const trackerWindow = {};
  const globals = {
    location: { origin: 'https://moko-islandevolution.com' },
    localStorage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value)
    },
    window: trackerWindow,
    document: {
      referrer: '',
      createElement: () => {
        const script = new EventTarget();
        script.dataset = {};
        script.remove = () => {
          scripts.splice(scripts.indexOf(script), 1);
        };
        return script;
      },
      head: { append: (script) => scripts.push(script) }
    }
  };
  for (const [key, value] of Object.entries(globals)) {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, value });
    t.after(() => {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    });
  }

  function storeChoice(next = choice, lifetime = duration) {
    values.set(
      analyticsConsentKey,
      JSON.stringify({ choice: next, expiresAt: Date.now() + lifetime })
    );
  }

  const analytics = await import(moduleUrl + '#' + ++instance);
  storeChoice();
  analytics.setAnalyticsPage('/');
  analytics.setAnalyticsConsent(choice);

  return {
    ...analytics,
    scripts,
    sent,
    storeChoice,
    events: () => sent.filter(({ name }) => name),
    load(script = scripts.at(-1)) {
      trackerWindow.umami = {
        track() {
          const accepted = trackerWindow.mokoAnalyticsBeforeSend('event');
          if (accepted) sent.push(accepted);
        }
      };
      script.dispatchEvent(new Event('load'));
    }
  };
}

test('un événement émis pendant le chargement est transmis une seule fois à disponibilité', async (t) => {
  const analytics = await setup(t);
  analytics.trackAnalyticsEvent({ name: 'beta_open' });
  assert.equal(analytics.sent.length, 0);

  analytics.load();
  analytics.load();
  assert.deepEqual(
    analytics.events().map(({ name }) => name),
    ['beta_open']
  );
  assert.equal(analytics.scripts[0].src, 'https://cloud.umami.is/script.js');
});

test('la file conserve l’ordre et le chemin d’origine de chaque interaction', async (t) => {
  const analytics = await setup(t);
  analytics.trackAnalyticsEvent({ name: 'beta_open' });
  analytics.trackAnalyticsEvent({ name: 'beta_mailto' });
  analytics.trackAnalyticsEvent({ name: 'teaser_play' });
  analytics.setAnalyticsPage('/confidentialite');
  analytics.trackAnalyticsEvent({ name: 'external_link', category: 'social' });

  analytics.load();
  assert.deepEqual(
    analytics.events().map(({ name, url, data }) => [name, url, data]),
    [
      ['beta_open', '/', undefined],
      ['beta_mailto', '/', undefined],
      ['teaser_play', '/', undefined],
      ['external_link', '/confidentialite/', { category: 'social' }]
    ]
  );
});

test('le retrait supprime la file avant le chargement, même après un nouvel accord', async (t) => {
  const analytics = await setup(t);
  analytics.trackAnalyticsEvent({ name: 'beta_open' });
  analytics.setAnalyticsConsent('refused');
  analytics.storeChoice('refused');
  analytics.trackAnalyticsEvent({ name: 'beta_mailto' });

  analytics.load();
  assert.deepEqual(analytics.sent, []);

  analytics.storeChoice('allowed');
  analytics.setAnalyticsConsent('allowed');
  assert.deepEqual(analytics.events(), []);
});

test('l’expiration du consentement bloque la collecte avant disponibilité', async (t) => {
  const analytics = await setup(t, 'allowed', 1000);
  analytics.trackAnalyticsEvent({ name: 'beta_open' });
  t.mock.timers.tick(1000);

  analytics.load();
  assert.deepEqual(analytics.sent, []);
  assert.equal(analytics.scripts.length, 1);
});

test('un échec de chargement vide la file avant une tentative ultérieure', async (t) => {
  const analytics = await setup(t);
  const failed = analytics.scripts[0];
  analytics.trackAnalyticsEvent({ name: 'beta_open' });
  failed.dispatchEvent(new Event('error'));
  assert.equal(analytics.scripts.length, 0);
  assert.deepEqual(analytics.sent, []);

  analytics.setAnalyticsConsent('allowed');
  analytics.trackAnalyticsEvent({ name: 'beta_mailto' });
  analytics.load(failed);
  assert.deepEqual(analytics.sent, []);
  analytics.load();
  assert.deepEqual(
    analytics.events().map(({ name }) => name),
    ['beta_mailto']
  );
});

test('un chargement sans API disponible est traité comme un échec', async (t) => {
  const analytics = await setup(t);
  analytics.trackAnalyticsEvent({ name: 'beta_open' });
  analytics.scripts[0].dispatchEvent(new Event('load'));
  assert.equal(analytics.scripts.length, 0);
  assert.deepEqual(analytics.sent, []);
});

test('un événement conservé depuis dix secondes expire avant l’envoi', async (t) => {
  const analytics = await setup(t);
  analytics.trackAnalyticsEvent({ name: 'beta_open' });
  t.mock.timers.tick(1);
  analytics.trackAnalyticsEvent({ name: 'beta_mailto' });
  t.mock.timers.tick(9999);

  analytics.load();
  assert.deepEqual(
    analytics.events().map(({ name }) => name),
    ['beta_mailto']
  );
});

test('la file conserve les vingt interactions les plus récentes en cas de saturation', async (t) => {
  const analytics = await setup(t);
  analytics.trackAnalyticsEvent({ name: 'beta_open' });
  for (let i = 0; i < 19; i++) analytics.trackAnalyticsEvent({ name: 'beta_mailto' });
  analytics.trackAnalyticsEvent({ name: 'teaser_play' });

  analytics.load();
  assert.deepEqual(
    analytics.events().map(({ name }) => name),
    [...Array(19).fill('beta_mailto'), 'teaser_play']
  );
});

test('les navigations ne rejouent pas la file et dédupliquent les vues consécutives', async (t) => {
  const analytics = await setup(t);
  analytics.trackAnalyticsEvent({ name: 'beta_open' });
  analytics.setAnalyticsPage('/confidentialite');
  analytics.setAnalyticsPage('/');
  analytics.setAnalyticsConsent('allowed');
  assert.equal(analytics.scripts.length, 1);

  analytics.load();
  analytics.setAnalyticsPage('/');
  analytics.setAnalyticsPage('/confidentialite');
  analytics.setAnalyticsPage('/confidentialite/');
  analytics.setAnalyticsPage('/');
  assert.deepEqual(
    analytics.sent.filter(({ name }) => !name).map(({ url }) => url),
    ['/', '/confidentialite/', '/']
  );
  assert.equal(analytics.events().length, 1);
});

test('un refus initial ne charge aucun script et ne collecte aucun événement', async (t) => {
  const analytics = await setup(t, 'refused');
  analytics.trackAnalyticsEvent({ name: 'beta_open' });
  analytics.setAnalyticsPage('/confidentialite');
  assert.deepEqual(analytics.scripts, []);
  assert.deepEqual(analytics.sent, []);
});

test('les événements sont transmis immédiatement quand le traceur est prêt', async (t) => {
  const analytics = await setup(t);
  analytics.load();
  analytics.trackAnalyticsEvent({ name: 'beta_open' });
  assert.deepEqual(
    analytics.events().map(({ name }) => name),
    ['beta_open']
  );
});

test('le retrait et le nouvel accord entre deux notifications isolent les générations', async (t) => {
  for (const notifyBeforeLoad of [false, true]) {
    await t.test(
      notifyBeforeLoad ? 'traceur après la notification' : 'traceur avant la notification',
      async (scenario) => {
        const analytics = await setup(scenario);
        const previous = readAnalyticsConsent();
        analytics.trackAnalyticsEvent({ name: 'beta_open' });

        assert.equal(saveAnalyticsChoice('refused'), true);
        assert.equal(readAnalyticsConsent().choice, 'refused');
        assert.equal(saveAnalyticsChoice('allowed'), true);
        assert.notEqual(readAnalyticsConsent().generation, previous.generation);

        function notify() {
          analytics.discardQueuedConsent(previous.generation);
          analytics.setAnalyticsConsent(readAnalyticsConsent().choice);
        }

        analytics.trackAnalyticsEvent({ name: 'external_link', category: 'social' });
        if (notifyBeforeLoad) notify();
        analytics.load();
        if (!notifyBeforeLoad) notify();
        analytics.load();

        assert.deepEqual(
          analytics.events().map(({ name }) => name),
          ['external_link']
        );
        assert.ok(analytics.sent.every((payload) => !('generation' in payload)));
      }
    );
  }
});

test('seul le dernier accord conserve ses événements après plusieurs retraits successifs', async (t) => {
  const analytics = await setup(t);
  const revoked = [];
  for (const name of ['beta_open', 'beta_mailto', 'teaser_play']) {
    revoked.push(readAnalyticsConsent().generation);
    analytics.trackAnalyticsEvent({ name });
    assert.equal(saveAnalyticsChoice('refused'), true);
    assert.equal(saveAnalyticsChoice('allowed'), true);
  }
  analytics.trackAnalyticsEvent({ name: 'external_link', category: 'social' });
  for (const generation of revoked) analytics.discardQueuedConsent(generation);
  analytics.setAnalyticsConsent(readAnalyticsConsent().choice);
  analytics.load();

  assert.equal(new Set([...revoked, readAnalyticsConsent().generation]).size, 4);
  assert.deepEqual(
    analytics.events().map(({ name }) => name),
    ['external_link']
  );
});

test('un refus encore actif bloque le chargement tardif avant notification', async (t) => {
  const analytics = await setup(t);
  analytics.trackAnalyticsEvent({ name: 'beta_open' });
  assert.equal(saveAnalyticsChoice('refused'), true);
  analytics.load();
  analytics.trackAnalyticsEvent({ name: 'teaser_play' });
  assert.deepEqual(analytics.sent, []);
});

test('le filtre du traceur rejette un envoi dont l’accord change pendant l’appel', async (t) => {
  const analytics = await setup(t);
  analytics.load();
  let writes;
  let filtered;
  window.umami.track = () => {
    writes = [saveAnalyticsChoice('refused'), saveAnalyticsChoice('allowed')];
    filtered = window.mokoAnalyticsBeforeSend('event');
  };
  analytics.trackAnalyticsEvent({ name: 'beta_open' });

  assert.deepEqual(writes, [true, true]);
  assert.equal(filtered, null);
  assert.deepEqual(analytics.events(), []);
});
