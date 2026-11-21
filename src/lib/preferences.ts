import { getContext, setContext } from 'svelte';

type Preferences = {
  readonly videosAllowed: boolean;
  open: (trigger: HTMLElement) => void;
  finishIntro: () => void;
};
const key = Symbol('preferences');
export const providePreferences = (preferences: Preferences) => setContext(key, preferences);
export const getPreferences = () => getContext<Preferences>(key);
