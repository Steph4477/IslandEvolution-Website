<script lang="ts">
  import {
    androidConfirmation,
    betaApplicationDestination,
    betaApplicationsOpen,
    betaEmailMaxLength,
    betaNicknameMaxLength,
    hasInvalidBetaCharacters,
    trimBetaEmail,
    validateBetaApplication
  } from '../beta-application';
  import type { Language, translations } from '../i18n';

  let {
    language,
    copy,
    status,
    privacyUrl
  }: {
    language: Language;
    copy: (typeof translations)[Language]['betaApplication'];
    status: string;
    privacyUrl: string;
  } = $props();

  let dialog: HTMLDialogElement;
  let closeButton: HTMLButtonElement;
  let nicknameInput: HTMLInputElement;
  let emailInput: HTMLInputElement;
  let policyReadInput: HTMLInputElement;
  let androidInput: HTMLInputElement;
  let opener: HTMLButtonElement | undefined;
  let nickname = $state('');
  let email = $state('');
  let policyRead = $state(false);
  let androidConfirmed = $state(false);
  let emailTouched = $state(false);
  let nicknameTouched = $state(false);
  const pasteErrors = $state<{ email?: 'invalid' | 'tooLong'; nickname?: 'invalid' | 'tooLong' }>(
    {}
  );
  let policyReadTouched = $state(false);
  let attempted = $state(false);
  let lastLaunch = -Infinity;
  const application = $derived({ nickname, email, androidConfirmed, policyRead });
  const errors = $derived(validateBetaApplication(application));
  const emailIssue = $derived(
    pasteErrors.email ?? (emailTouched || attempted ? errors.email : undefined)
  );
  const nicknameIssue = $derived(
    pasteErrors.nickname ?? (nicknameTouched || attempted ? errors.nickname : undefined)
  );
  const emailError = $derived(
    emailIssue === 'tooLong'
      ? language === 'fr'
        ? `L’adresse est limitée à ${betaEmailMaxLength} caractères.`
        : `The email address is limited to ${betaEmailMaxLength} characters.`
      : emailIssue === 'missing'
        ? copy.errors.missing
        : undefined
  );
  const nicknameError = $derived(
    nicknameIssue === 'tooLong'
      ? language === 'fr'
        ? 'Le pseudo est trop long.'
        : 'The nickname is too long.'
      : nicknameIssue
        ? language === 'fr'
          ? 'Le pseudo contient des caractères non autorisés.'
          : 'The nickname contains disallowed characters.'
        : undefined
  );
  const policyReadError = $derived((policyReadTouched || attempted) && errors.policyRead);
  const androidError = $derived(attempted && errors.androidConfirmed);

  export function open(trigger: HTMLButtonElement) {
    if (dialog.open) return;
    opener = trigger;
    dialog.showModal();
    closeButton.focus({ preventScroll: true });
  }

  function close() {
    nickname = '';
    email = '';
    policyRead = false;
    androidConfirmed = false;
    emailTouched = false;
    nicknameTouched = false;
    pasteErrors.email = undefined;
    pasteErrors.nickname = undefined;
    policyReadTouched = false;
    attempted = false;
    opener?.focus({ preventScroll: true });
    opener = undefined;
  }

  function checkPaste(event: ClipboardEvent, field: 'email' | 'nickname', limit: number) {
    const pastedText = event.clipboardData?.getData('text/plain');
    if (pastedText === undefined) return;
    const input = field === 'email' ? emailInput : nicknameInput;
    const text = field === 'email' && !input.value ? trimBetaEmail(pastedText) : pastedText;
    // Le champ email ne donne pas accès à la sélection. Compter la valeur déjà saisie.
    const selectedLength = (input.selectionEnd ?? 0) - (input.selectionStart ?? 0);
    const resultLength = input.value.length - selectedLength + text.length;
    // Refuser un collage invalide avant que le champ ne retire les sauts de ligne.
    const issue = hasInvalidBetaCharacters(text)
      ? 'invalid'
      : resultLength > limit
        ? 'tooLong'
        : undefined;
    if (issue) {
      event.preventDefault();
      pasteErrors[field] = issue;
    } else if (text !== pastedText) {
      // Insérer l’adresse nettoyée avant que le navigateur applique maxlength.
      event.preventDefault();
      email = text;
      pasteErrors.email = undefined;
    }
  }

  function trimEmailInput() {
    email = trimBetaEmail(emailInput.value);
    if (emailInput.value !== email) emailInput.value = email;
  }

  function submit(event: SubmitEvent) {
    event.preventDefault();
    if (!betaApplicationsOpen) return;
    trimEmailInput();
    attempted = true;
    if (
      errors.nickname ||
      errors.email ||
      errors.androidConfirmed ||
      errors.policyRead ||
      pasteErrors.nickname ||
      pasteErrors.email
    ) {
      if (errors.nickname || pasteErrors.nickname) nicknameInput.focus();
      else if (errors.email || pasteErrors.email) emailInput.focus();
      else if (errors.androidConfirmed) androidInput.focus();
      else policyReadInput.focus();
      return;
    }
    const destination = betaApplicationDestination(language, application);
    const now = performance.now();
    if (!destination || now - lastLaunch < 1500) return;
    lastLaunch = now;
    window.location.assign(destination);
  }
</script>

<dialog
  class="beta-dialog"
  bind:this={dialog}
  aria-labelledby="beta-dialog-title"
  aria-describedby="beta-dialog-intro"
  onclose={close}
>
  <div class="heading">
    <h2 id="beta-dialog-title">{copy.title}</h2>
    <button type="button" bind:this={closeButton} onclick={() => dialog.close()}
      >{copy.close}</button
    >
  </div>
  {#if betaApplicationsOpen}
    <p id="beta-dialog-intro"><strong>{copy.openIntro.tagline}</strong></p>
    {#each copy.openIntro.paragraphs as paragraph}
      <p>{paragraph}</p>
    {/each}
  {:else}
    <p id="beta-dialog-intro">{copy.intro}</p>
    <p>{copy.places}</p>
  {/if}
  <form method="dialog" novalidate onsubmit={submit}>
    <div class="field">
      <label for="beta-nickname">{copy.nickname}</label>
      <input
        id="beta-nickname"
        type="text"
        bind:this={nicknameInput}
        bind:value={nickname}
        maxlength={betaNicknameMaxLength}
        placeholder="JungleExplorer"
        autocomplete="off"
        aria-invalid={nicknameError ? 'true' : undefined}
        aria-describedby={nicknameError ? 'beta-nickname-error' : undefined}
        onblur={() => (nicknameTouched = true)}
        oninput={() => (pasteErrors.nickname = undefined)}
        onpaste={(event) => checkPaste(event, 'nickname', betaNicknameMaxLength)}
      />
      {#if nicknameError}<small id="beta-nickname-error" class="error" aria-live="polite"
          >{nicknameError}</small
        >{/if}
    </div>
    <div class="field">
      <label for="beta-email">{copy.email}</label>
      <input
        id="beta-email"
        type="email"
        bind:this={emailInput}
        bind:value={email}
        maxlength={betaEmailMaxLength}
        required
        autocomplete="off"
        autocapitalize="none"
        spellcheck="false"
        aria-invalid={emailIssue ? 'true' : undefined}
        aria-describedby={emailIssue ? 'beta-email-help beta-email-error' : 'beta-email-help'}
        onblur={() => {
          trimEmailInput();
          emailTouched = true;
        }}
        oninput={() => (pasteErrors.email = undefined)}
        onpaste={(event) => checkPaste(event, 'email', betaEmailMaxLength)}
      />
      <div class="email-feedback">
        <small id="beta-email-help">{copy.emailHelp}</small>
        <small id="beta-email-error" class="error" aria-live="polite">
          {#if emailIssue === 'invalid'}
            {copy.errors.emailFormat}
          {:else if emailError}
            {emailError}
          {/if}
        </small>
      </div>
    </div>
    <label class="acknowledgement">
      <input
        type="checkbox"
        bind:this={androidInput}
        bind:checked={androidConfirmed}
        required
        aria-invalid={androidError ? 'true' : undefined}
        aria-describedby={androidError ? 'beta-android-error' : undefined}
      />
      <span>{androidConfirmation[language]}</span>
    </label>
    {#if androidError}<small id="beta-android-error" class="error" aria-live="polite"
        >{copy.errors.androidConfirmed}</small
      >{/if}
    <label class="acknowledgement">
      <input
        type="checkbox"
        bind:this={policyReadInput}
        bind:checked={policyRead}
        required
        aria-invalid={policyReadError ? 'true' : undefined}
        aria-describedby={policyReadError ? 'beta-privacy beta-policy-read-error' : 'beta-privacy'}
        onchange={() => (policyReadTouched = true)}
      />
      <span>{copy.policyRead}</span>
    </label>
    {#if policyReadError}<small id="beta-policy-read-error" class="error" aria-live="polite"
        >{copy.errors.policyRead}</small
      >{/if}
    <small id="beta-privacy"><a href={privacyUrl}>{copy.privacy}</a></small>
    <div class="action">
      <button
        type="submit"
        disabled={!betaApplicationsOpen}
        aria-describedby="beta-mail-help beta-dialog-status">{copy.submit}</button
      >
      <small id="beta-mail-help">{copy.mailHelp}</small>
      <strong id="beta-dialog-status">{status}</strong>
    </div>
  </form>
</dialog>

<style>
  .beta-dialog {
    box-sizing: border-box;
    width: min(34rem, calc(100% - 1.5rem));
    max-height: calc(100dvh - 1.5rem);
    overflow: auto;
    overscroll-behavior: contain;
    padding: clamp(1rem, 4vw, 1.5rem);
    border: 1px solid #dce9b56b;
    border-radius: 0.75rem;
    background: #142019;
    color: #fff2d8;
  }
  .beta-dialog::backdrop {
    background: rgb(7 20 12 / 0.65);
  }
  .heading {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: 0.75rem;
  }
  h2 {
    margin: 0;
    font-size: clamp(1.2rem, 5vw, 1.65rem);
    line-height: 1.2;
  }
  form,
  .field,
  .action {
    display: grid;
    gap: 0.4rem;
  }
  form {
    gap: 0.85rem;
  }
  input:not([type='checkbox']),
  button {
    min-height: 44px;
    padding: 0.45rem 0.65rem;
    border: 1px solid #dce9b58c;
    border-radius: 0.4rem;
    background: #203e2a;
    color: inherit;
    font: inherit;
  }
  input:not([type='checkbox']) {
    width: 100%;
    min-width: 0;
    background: #101a14;
  }
  button {
    cursor: pointer;
  }
  button:disabled {
    cursor: default;
    opacity: 0.75;
  }
  .acknowledgement {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    min-height: 44px;
  }
  .acknowledgement input {
    flex: none;
    width: 1.25rem;
    height: 1.25rem;
    margin: 0;
  }
  small {
    color: #e2e7cf;
  }
  #beta-privacy a {
    color: #f1cf8e;
  }
  .error {
    color: #ffb6a5;
  }
  .email-feedback small {
    display: block;
  }
  .email-feedback .error:not(:empty) {
    margin-top: 0.4rem;
  }
  .action {
    justify-items: start;
  }
  :global(html:has(.beta-dialog[open])) {
    overflow: hidden;
    scrollbar-gutter: stable;
  }
</style>
