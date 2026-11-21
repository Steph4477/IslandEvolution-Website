const socialSources = new Set(['linkedin', 'facebook', 'tiktok', 'youtube']);

export function readCampaignQuery(search: string): string | undefined {
  const parameters = new URLSearchParams(search);
  const sources = parameters.getAll('utm_source');
  const media = parameters.getAll('utm_medium');
  const campaigns = parameters.getAll('utm_campaign');
  if (sources.length !== 1 || media.length !== 1 || campaigns.length !== 1) return;

  const [source] = sources;
  const [medium] = media;
  const [campaign] = campaigns;
  const expectedMedium = socialSources.has(source)
    ? 'social'
    : source === 'google'
      ? 'organic'
      : null;
  if (medium !== expectedMedium || campaign !== 'beta_android') return;

  return new URLSearchParams({
    utm_source: source,
    utm_medium: medium,
    utm_campaign: campaign
  }).toString();
}
