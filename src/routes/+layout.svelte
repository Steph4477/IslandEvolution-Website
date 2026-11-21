<script lang="ts">
  import { afterNavigate } from '$app/navigation';
  import { onMount } from 'svelte';
  import { setAnalyticsPage, supportsAnalytics } from '../lib/analytics/umami';
  import AnalyticsPreferences from '../lib/components/AnalyticsPreferences.svelte';

  let { children } = $props();
  let analyticsAvailable = $state(false);

  afterNavigate(({ to }) => setAnalyticsPage(to?.route.id ?? null));
  onMount(() => {
    analyticsAvailable = supportsAnalytics();
  });
</script>

{@render children()}

{#if analyticsAvailable}
  <AnalyticsPreferences />
{/if}
