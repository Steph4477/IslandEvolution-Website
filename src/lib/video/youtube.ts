export interface YouTubePlayer {
  playVideo(): void;
  pauseVideo(): void;
  mute(): void;
  destroy(): void;
}

interface PlayerEvent { target: YouTubePlayer }

interface YouTubeApi {
  Player: new (frame: HTMLIFrameElement, options: {
    events: {
      onReady: (event: PlayerEvent) => void;
      onStateChange: (event: PlayerEvent & { data: number }) => void;
      onAutoplayBlocked: () => void;
      onError: () => void;
    };
  }) => YouTubePlayer;
}

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let pending: Promise<YouTubeApi> | undefined;

export function loadYouTube(): Promise<YouTubeApi> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  pending ??= new Promise<YouTubeApi>((resolve, reject) => {
    const script = document.createElement('script');
    const previous = window.onYouTubeIframeAPIReady;

    function cleanUp() {
      window.clearTimeout(timeout);
      window.onYouTubeIframeAPIReady = previous;
    }

    function fail() {
      cleanUp();
      script.remove();
      reject(new Error('YouTube player API unavailable'));
    }

    const timeout = window.setTimeout(fail, 12000);
    window.onYouTubeIframeAPIReady = () => {
      if (!window.YT?.Player) return fail();
      cleanUp();
      resolve(window.YT);
      previous?.();
    };
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = fail;
    document.head.append(script);
  }).catch((error) => {
    pending = undefined;
    throw error;
  });
  return pending;
}

export function createYouTubeFrame(id: string, title: string) {
  const iframe = document.createElement('iframe');
  const url = new URL('https://www.youtube-nocookie.com/embed/' + id);
  url.searchParams.set('enablejsapi', '1');
  url.searchParams.set('playsinline', '1');
  url.searchParams.set('origin', window.location.origin);
  iframe.src = url.href;
  iframe.title = title;
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  return iframe;
}

// Shared by all embeds. Manual playback can replace the current owner.
let owner: (() => void) | undefined;
const waiting = new Set<() => void>();

export function onPlaybackAvailable(listener: () => void) {
  waiting.add(listener);
  return () => waiting.delete(listener);
}

export function claimPlayback(pause: () => void, manual: boolean) {
  if (owner === pause) return true;
  if (owner && !manual) return false;
  owner?.();
  owner = pause;
  return true;
}

export function releasePlayback(pause: () => void) {
  if (owner !== pause) return;
  owner = undefined;
  queueMicrotask(() => {
    if (!owner) waiting.forEach((listener) => listener());
  });
}
