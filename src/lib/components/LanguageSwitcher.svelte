<script lang="ts">
  import type { Language } from '../i18n';

  let { language, label, select }: {
    language: Language;
    label: string;
    select: (language: Language) => void;
  } = $props();
</script>

<div class="languages" role="group" aria-label={label}>
  <button type="button" lang="fr" aria-label="Français" aria-pressed={language === 'fr'} onclick={() => select('fr')}>
    <svg viewBox="0 0 60 36" aria-hidden="true">
      <path d="M0 0h20v36H0z" fill="#002395" />
      <path d="M20 0h20v36H20z" fill="#fff" />
      <path d="M40 0h20v36H40z" fill="#ed2939" />
    </svg>
  </button>
  <button type="button" lang="en" aria-label="English" aria-pressed={language === 'en'} onclick={() => select('en')}>
    <svg viewBox="0 0 60 36" aria-hidden="true">
      <rect width="60" height="36" fill="#012169" />
      <path d="M0 0l60 36M60 0L0 36" stroke="#fff" stroke-width="8" />
      <path d="M0 1l60 36M60 1L0 37" stroke="#c8102e" stroke-width="3" />
      <path d="M30 0v36M0 18h60" stroke="#fff" stroke-width="12" />
      <path d="M30 0v36M0 18h60" stroke="#c8102e" stroke-width="7" />
    </svg>
  </button>
</div>

<style>
  .languages { display: flex; gap: .25rem; }
  button {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    padding: 0;
  }
  svg { width: 1.25rem; border-radius: 2px; }
</style>
