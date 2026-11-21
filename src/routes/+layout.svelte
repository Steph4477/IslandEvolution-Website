<script lang="ts">
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/state';
  import { setAnalyticsPage } from '../lib/analytics/umami';
  import PrivacyPreferences from '../lib/components/PrivacyPreferences.svelte';
  import { providePreferences } from '../lib/preferences';

  let { children } = $props();
  let panel: ReturnType<typeof PrivacyPreferences>;
  let introFinished = $state(false);
  let videosAllowed = $state(false);
  providePreferences({
    get videosAllowed() {
      return videosAllowed;
    },
    open(trigger) {
      panel?.open(trigger);
    },
    finishIntro() {
      introFinished = true;
    }
  });
  afterNavigate(({ to }) => {
    if (to?.route.id !== '/') introFinished = false;
    setAnalyticsPage(to?.route.id ?? null);
  });
</script>

{@render children()}
<PrivacyPreferences
  bind:this={panel}
  bind:videosAllowed
  readyToPrompt={page.route.id !== '/' || introFinished}
  home={page.route.id === '/'}
/>
