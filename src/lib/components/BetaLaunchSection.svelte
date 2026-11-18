<script lang="ts">
  import type { Language, translations } from '../i18n';

  let { copy, joinBeta, status, openBeta }: {
    copy: (typeof translations)[Language]['betaLaunch'];
    joinBeta: string;
    status: string;
    openBeta: (trigger: HTMLButtonElement) => void;
  } = $props();
</script>

<section id="beta" class="launch" aria-labelledby="beta-launch-title">
  <div class="inner">
    <header class="heading">
      <h2 id="beta-launch-title">{copy.title}</h2>
      <p>{copy.subtitle}</p>
    </header>

    <article class="recruitment" aria-labelledby="beta-recruitment-title">
      <div class="invitation">
        <h3 id="beta-recruitment-title">{copy.cardTitle}</h3>
        <p class="places">{copy.places}</p>
        <div class="action">
          <button type="button" aria-haspopup="dialog" aria-describedby="beta-launch-status"
            onclick={(event) => openBeta(event.currentTarget)}>{joinBeta}</button>
          <small id="beta-launch-status">{status}</small>
        </div>
      </div>
      <div class="details">
        {#each copy.paragraphs as paragraph}
          <p>{paragraph}</p>
        {/each}
      </div>
    </article>

    <ol class="platforms" role="list">
      {#each copy.platforms as platform, index (platform.name)}
        <li class:primary={index === 0}>
          <div class="platform-plaque">
            <div class="platform-label">
              <p class="platform-device">{platform.device}</p>
              <h3>{platform.name}</h3>
            </div>
          </div>
          <div class="platform-plan">
            <p>{platform.plan}</p>
            {#if index === 0}<p class="platform-status">{copy.firstStatus}</p>{/if}
          </div>
        </li>
      {/each}
    </ol>

    <p class="availability">{copy.availability}</p>
  </div>
</section>

<style>
  .launch {
    padding: clamp(3rem, 7vw, 6.5rem) var(--content-gutter, 1rem);
    scroll-margin-top: var(--controls-height, 4.5rem);
    background: radial-gradient(ellipse at 50% 35%, #1b2d20, #101411 72%);
    color: #fff2dc;
  }
  .inner { max-width: 58rem; margin-inline: auto; }
  .heading { text-align: center; margin-bottom: clamp(1.6rem, 4vw, 2.8rem); }
  h2, h3, p { margin: 0; }
  h2 { font-family: Georgia, serif; font-size: clamp(2.15rem, 5.15vw, 4.15rem); line-height: 1.02; text-wrap: balance; }
  .heading p { margin-top: .8rem; color: #d8dcca; font-size: clamp(1rem, 2vw, 1.22rem); }
  .recruitment {
    display: grid;
    gap: clamp(1.25rem, 3vw, 2.4rem);
    padding: clamp(1.2rem, 4vw, 2.6rem);
    border: 1px solid #8c7545;
    border-radius: .9rem;
    background: linear-gradient(130deg, #253825, #172219 65%);
    box-shadow: 0 1rem 2.5rem #080d09a6;
  }
  .invitation, .details { min-width: 0; }
  .invitation h3 { color: #efd29a; font-size: .95rem; }
  .places { margin-top: .45rem; font-family: Georgia, serif; font-size: clamp(1.75rem, 3.7vw, 3rem); line-height: 1.06; text-wrap: balance; }
  .action { display: grid; justify-items: start; gap: .45rem; margin-top: 1.15rem; }
  button {
    min-height: 44px;
    padding: .6rem 1rem;
    border: 1px solid #efcd8b;
    border-radius: .4rem;
    background: #efcd8b;
    color: #23190e;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }
  button:focus-visible { outline: 2px solid #fff2dc; outline-offset: 4px; }
  small, .availability { color: #c5ceba; }
  .details { display: grid; align-content: center; gap: .75rem; color: #e9e8d7; line-height: 1.55; }
  .platforms {
    display: grid;
    gap: .9rem;
    max-width: 42rem;
    list-style: none;
    margin: 1.6rem auto 0;
    padding: 0;
  }
  .platforms li {
    display: grid;
    align-content: start;
    gap: .48rem;
    min-width: 0;
  }
  .platform-plaque {
    --platform-edge: #a0b297;
    display: grid;
    place-items: center;
    text-align: center;
    min-height: 4rem;
    padding: .45rem .85rem;
    border: 1px solid var(--platform-edge);
    border-radius: .55rem;
    background: #080d0a;
    box-shadow: inset 0 1px #ffffff14, 0 3px 7px #05080580;
  }
  .platforms .primary .platform-plaque {
    --platform-edge: #d9b86e;
    background: #0d160d;
  }
  .platform-label { min-width: 0; }
  .platform-label h3 { font-size: clamp(1.15rem, 2.2vw, 1.45rem); line-height: 1.1; }
  .platform-device {
    margin-bottom: .15rem;
    color: #c5ceba;
    font-size: .7rem;
    font-weight: 700;
    letter-spacing: .08em;
    text-transform: uppercase;
  }
  .platform-plan { text-align: center; color: #d8dcca; font-size: .82rem; line-height: 1.35; }
  .platform-plan .platform-status { color: #e9ca8b; }
  .availability { margin-top: 1rem; text-align: center; font-size: .85rem; line-height: 1.45; }
  @media (min-width: 760px) {
    .recruitment { grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr); }
    .invitation { align-self: center; }
    .details { padding-inline-start: clamp(1.25rem, 3vw, 2.4rem); border-inline-start: 1px solid #667353; }
    .platforms { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  }
  @media (hover: hover) {
    button:hover { background: #ffe0a1; }
    .platform-plaque:hover { border-color: #d4dfce; }
    .platforms .primary .platform-plaque:hover { border-color: #f5dca2; }
  }
  @media (prefers-reduced-motion: no-preference) {
    button { transition: background-color 150ms ease; }
    .platform-plaque { transition: border-color 140ms ease; }
  }
</style>
