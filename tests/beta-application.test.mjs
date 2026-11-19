import assert from 'node:assert/strict';
import test from 'node:test';
import {
  betaApplicationDestination, betaApplicationsOpen, betaEmailMaxLength, betaNicknameMaxLength,
  buildBetaMailto, validateBetaApplication
} from '../src/lib/beta-application.ts';

const application = { nickname: '', email: 'explorer+android@example.org', androidConfirmed: true, policyRead: true };

test('a Google Play email is required and must have a complete domain', () => {
  for (const email of ['', '   ', '\u00a0']) {
    const incomplete = { ...application, email };
    assert.equal(validateBetaApplication(incomplete).email, 'missing');
    assert.equal(buildBetaMailto('fr', incomplete), undefined);
  }

  for (const email of [
    'explorer', 'test@gmail', '  test@gmail  ', 'test@', 'test.com', 'test@gmail.', 'test@gmail..com',
    '@example.org', 'explorer@-example.org', 'two addresses@example.org', 'test@ gmail.com',
    'test@gmail .com', 'é@example.org', 'explorer@' + 'a'.repeat(64) + '.org'
  ]) {
    const invalid = { ...application, email };
    assert.equal(validateBetaApplication(invalid).email, 'invalid', email);
    for (const language of ['fr', 'en']) {
      assert.equal(buildBetaMailto(language, invalid), undefined, email);
      assert.equal(betaApplicationDestination(language, invalid), undefined, email);
    }
  }
});

test('Google Play emails can use Gmail, another provider or a custom domain', () => {
  assert.deepEqual(validateBetaApplication(application), { email: undefined, nickname: undefined, androidConfirmed: false, policyRead: false });
  for (const email of [
    'test@gmail.com', 'test@outlook.fr', 'test@yahoo.com', 'test@play.example.co.uk', 'explorer@xn--caf-dma.example'
  ]) {
    const valid = { ...application, email };
    assert.equal(validateBetaApplication(valid).email, undefined, email);
    assert.ok(buildBetaMailto('en', valid), email);
  }
});

test('surrounding spaces are removed before validation and from both mail drafts', () => {
  const padded = { ...application, email: ` \u00a0${application.email}\u202f ` };
  assert.equal(validateBetaApplication(padded).email, undefined);
  for (const language of ['fr', 'en']) {
    assert.equal(buildBetaMailto(language, padded), buildBetaMailto(language, application));
  }
});

test('privacy acknowledgement is required and a nickname is optional', () => {
  assert.equal(validateBetaApplication({ ...application, policyRead: false }).policyRead, true);
  assert.equal(buildBetaMailto('en', { ...application, policyRead: false }), undefined);
  assert.equal(buildBetaMailto('en', { ...application, email: '' }), undefined);
  for (const [language, fallback] of [['fr', 'Pseudo : Non renseigné'], ['en', 'Nickname: Not provided']]) {
    const draft = new URL(buildBetaMailto(language, application));
    assert.ok(draft.searchParams.get('body').includes(fallback));
  }
});

test('mailto encodes the French and English subjects and bodies independently', () => {
  const nickname = 'Éléonore 🧑‍🚀 <b>Moko</b> & ? # + %';
  for (const [language, subject, body] of [
    ['fr', 'Candidature bêta Android — MOKO Island Evolution', [
      'Bonjour,', '', 'Je souhaite participer à la bêta Android de MOKO – Island Evolution.', '',
      `Pseudo : ${nickname}`, 'Adresse Google Play : explorer+android@example.org', '',
      "Je confirme disposer d'un appareil Android avec accès à Google Play.",
      "J'ai pris connaissance de la politique de confidentialité."
    ]],
    ['en', 'Android Beta Application — MOKO Island Evolution', [
      'Hello,', '', 'I would like to participate in the Android beta of MOKO – Island Evolution.', '',
      `Nickname: ${nickname}`, 'Google Play email: explorer+android@example.org', '',
      'I confirm that I have an Android device with access to Google Play.',
      'I have read the Privacy Policy.'
    ]]
  ]) {
    const draft = new URL(buildBetaMailto(language, { ...application, nickname }));
    assert.equal(draft.protocol, 'mailto:');
    assert.equal(draft.pathname, 'moko.islandevolution@outlook.com');
    assert.equal(draft.hash, '');
    assert.deepEqual([...draft.searchParams], [['subject', subject], ['body', body.join('\r\n')]]);
  }
});

test('address and nickname limits are enforced directly by the generator', () => {
  const local = 'a'.repeat(64) + '@';
  const domain = ['b'.repeat(63), 'c'.repeat(63), 'd'.repeat(63)].join('.');
  const email = local + domain.slice(0, betaEmailMaxLength - local.length);
  const nickname = '🥥'.repeat(betaNicknameMaxLength / 2);
  assert.ok(buildBetaMailto('fr', { ...application, email, nickname }));
  assert.equal(validateBetaApplication({ ...application, email: ` ${email} ` }).email, undefined);
  const oversizedEmail = { ...application, email: 'a' + email };
  const oversizedNickname = { ...application, nickname: nickname + 'x' };
  assert.equal(validateBetaApplication(oversizedEmail).email, 'tooLong');
  assert.equal(validateBetaApplication(oversizedNickname).nickname, 'tooLong');
  assert.equal(buildBetaMailto('fr', oversizedEmail), undefined);
  assert.equal(buildBetaMailto('en', oversizedNickname), undefined);
});

test('control characters, line separators and lone surrogates are rejected without cleanup', () => {
  for (const character of ['\r', '\n', '\r\n', '\t', '\x00', '\x7f', '\x85', '\u2028', '\u2029', '\ud800', '\udfff']) {
    const email = { ...application, email: application.email + character };
    const nickname = { ...application, nickname: character + 'Moko' };
    assert.equal(validateBetaApplication(email).email, 'invalid');
    assert.equal(validateBetaApplication(nickname).nickname, 'invalid');
    assert.equal(buildBetaMailto('fr', email), undefined);
    assert.equal(buildBetaMailto('en', nickname), undefined);
  }
});

test('recruitment state gates valid applications and never bypasses validation', () => {
  for (const language of ['fr', 'en']) {
    const destination = betaApplicationDestination(language, application);
    assert.equal(destination, betaApplicationsOpen ? buildBetaMailto(language, application) : undefined);
    if (betaApplicationsOpen) {
      const draft = new URL(destination);
      assert.equal(draft.pathname, 'moko.islandevolution@outlook.com');
      const emailLabel = language === 'fr' ? 'Adresse Google Play : ' : 'Google Play email: ';
      assert.ok(draft.searchParams.get('body').split('\r\n').includes(emailLabel + application.email));
    }
    assert.equal(betaApplicationDestination(language, { ...application, policyRead: false }), undefined);
    for (const androidConfirmed of [false, undefined]) {
      const incomplete = { ...application, androidConfirmed };
      assert.equal(validateBetaApplication(incomplete).androidConfirmed, true);
      assert.equal(buildBetaMailto(language, incomplete), undefined);
      assert.equal(betaApplicationDestination(language, incomplete), undefined);
    }
    assert.equal(betaApplicationDestination(language, { ...application, email: 'invalid' }), undefined);
  }
});
