import type { Language } from './i18n';

export const privacyContact = 'moko.islandevolution@outlook.com';
export const cnilComplaintUrl = 'https://www.cnil.fr/fr/adresser-une-plainte';
export const umamiDataAgreementUrl = 'https://umami.is/dpa';
export const umamiSubprocessorsUrl = 'https://umami.is/subprocessors';

export const privacyCopy = {
  fr: {
    title: 'Politique de confidentialité',
    back: 'Retour au site',
    draft:
      'Cette politique explique comment sont traitées les données liées aux candidatures à la bêta Android, aux vidéos et à la mesure d’audience.',
    controllerTitle: 'Responsable du traitement',
    controller:
      'Stéphane Morel, créateur indépendant de MOKO - Island Evolution, est le responsable des traitements décrits dans cette politique. Il agit à titre personnel, sans entreprise constituée. Contact pour la confidentialité et l’exercice de vos droits',
    analytics: {
      title: 'Mesure d’audience avec Umami',
      paragraphs: [
        'Lorsque la mesure d’audience est proposée, elle repose sur votre consentement (article 6, paragraphe 1, point a du RGPD). Elle sert à comprendre la fréquentation du site et les interactions avec le recrutement bêta Android. Cette mesure est facultative. Vous pouvez la refuser et continuer à accéder au site et au formulaire de candidature. Votre choix est indépendant des vidéos YouTube et de votre candidature.',
        'Nous envoyons le chemin des pages consultées, le domaine de certaines sources de trafic et des événements prédéfinis pour le teaser, les liens sociaux et les actions de candidature. Nous mesurons la demande d’ouverture du brouillon dans votre messagerie. L’envoi et la réception d’une candidature ne sont pas mesurés. Avec votre accord pour la mesure d’audience, seuls des paramètres marketing prédéfinis de l’URL (utm_source, utm_medium et utm_campaign) peuvent être transmis à Umami pour mesurer l’origine des campagnes. Les données du formulaire, le lien de messagerie et les paramètres privés, inconnus ou non autorisés sont exclus.',
        'Umami Software, Inc. agit comme sous-traitant pour la mesure d’audience. Pour fournir cette mesure, le service traite l’adresse IP et l’en-tête User-Agent du navigateur, notamment pour distinguer les sessions et estimer la localisation. L’adresse IP peut aussi figurer dans des journaux techniques distincts.',
        'Selon la documentation publique d’Umami, les statistiques de production de l’offre Umami Cloud Hobby sont conservées six mois. Les journaux techniques suivent des durées de conservation liées à leur finalité. Leur durée exacte n’est pas confirmée pour le compte MOKO. Des copies résiduelles peuvent subsister selon les cycles de sauvegarde applicables, sous réserve des obligations légales de conservation.',
        'Le choix de la région UE s’applique au stockage de ces statistiques. Le routage réseau, la sécurité, le support et les journaux peuvent impliquer des traitements hors de l’Espace économique européen, notamment aux États-Unis. Le contrat d’Umami prévoit des garanties pour ces transferts, dont les clauses contractuelles types de la Commission européenne lorsqu’elles s’appliquent.',
        'Votre choix, accord ou refus, est valide jusqu’à 180 jours dans ce navigateur. Après cette échéance, il n’est plus utilisé, même si l’entrée reste dans le stockage local.',
        'Le bouton « Votre confidentialité », en bas de page, permet de modifier votre choix et de retirer votre accord à tout moment. Le retrait bloque les nouveaux envois dans l’onglet courant. Une requête envoyée avant le retrait peut déjà avoir atteint Umami. Si votre navigateur empêche à la fois l’enregistrement du refus et la suppression de l’ancien choix, un accord encore valide peut subsister dans un autre onglet ou après rechargement. Le retrait ne remet pas en cause la licéité des traitements fondés sur votre consentement avant son retrait.'
      ],
      agreement: 'Accord de sous-traitance Umami',
      subprocessors: 'Liste des sous-traitants Umami'
    },
    sections: [
      {
        title: 'Vidéos YouTube',
        paragraphs: [
          'Les trois miniatures sont hébergées sur ce site. L’API et les lecteurs YouTube se chargent uniquement après votre accord. Après autorisation, les vidéos peuvent se lancer automatiquement sans son en entrant dans l’écran.',
          'YouTube (Google) reçoit des données techniques à la connexion, puis des informations de lecture. Il peut utiliser des cookies et d’autres stockages, notamment pour le fonctionnement et la sécurité du lecteur, la mesure de la lecture et le déploiement de fonctions. La base du chargement des lecteurs et des traceurs soumis à cette règle est votre consentement.',
          'Le choix est conservé sur cet appareil et réutilisé jusqu’à 180 jours. Vous pouvez refuser ou retirer votre consentement à tout moment dans « Votre confidentialité », en bas de page. Le retrait arrête et décharge les lecteurs, et bloque les prochains chargements. Si le navigateur bloque la sauvegarde du refus et la suppression de l’ancien accord, cet accord peut subsister dans un autre onglet ou après rechargement. Les cookies tiers déjà déposés restent gérés par votre navigateur.'
        ]
      },
      {
        title: 'Données de candidature',
        paragraphs: [
          'Lorsque vous envoyez votre candidature depuis votre messagerie, nous recevons votre pseudonyme si vous le renseignez, votre adresse de compte Google Play, votre adresse d’expéditeur et le contenu de votre message. L’adresse d’expéditeur peut être différente de celle du compte Google Play.',
          'Le site prépare un brouillon dans votre messagerie. Vous choisissez de l’envoyer. Le formulaire ne transmet et ne conserve aucune candidature côté site.',
          'En dehors du recrutement, GitHub indique que GitHub Pages journalise et conserve l’adresse IP des visiteurs pour des raisons de sécurité.'
        ]
      },
      {
        title: 'Finalités et base juridique',
        paragraphs: [
          'Nous utilisons ces informations pour traiter les candidatures, confirmer manuellement l’adresse Google Play auprès du candidat, sélectionner 20 bêta-testeurs Android, les inviter et gérer une liste d’attente. Une adresse au format valide reste à vérifier. Une candidature reçue ne garantit aucune place et la sélection est manuelle.',
          'L’intérêt légitime (article 6, paragraphe 1, point f du RGPD) est la base retenue pour la réception et la vérification des candidatures, la sélection, les invitations et la gestion de la liste d’attente. L’intérêt poursuivi est d’organiser un test limité et de donner accès à la bêta aux comptes confirmés. Le traitement est limité aux informations nécessaires au recrutement, avec une durée de conservation définie et la possibilité de vous opposer au traitement dans les conditions prévues par le RGPD.',
          'La case du formulaire atteste la prise de connaissance de cette politique. Les choix concernant les vidéos et la mesure d’audience sont recueillis séparément.'
        ]
      },
      {
        title: 'Destinataires et stockage',
        paragraphs: [
          'Les personnes habilitées à gérer la bêta consultent les candidatures dans Microsoft Outlook et les suivent dans un fichier Excel local. Seule l’adresse Google Play confirmée des personnes retenues est ajoutée manuellement dans Google Play Console pour leur donner accès au test.',
          'Microsoft fournit le service de messagerie Outlook utilisé pour recevoir les candidatures. Google fournit Google Play Console pour gérer les accès des testeurs sélectionnés. Ces entreprises peuvent traiter certaines données en dehors de l’Espace économique européen (EEE), notamment aux États-Unis. Leurs politiques de confidentialité décrivent les mécanismes de protection des transferts internationaux. Pour connaître les garanties applicables, notamment les décisions d’adéquation et les clauses contractuelles types selon les transferts concernés, consultez les déclarations officielles de Microsoft (https://www.microsoft.com/fr-fr/privacy/privacystatement) et de Google (https://policies.google.com/privacy?hl=fr), ainsi que les cadres de transfert Google (https://policies.google.com/privacy/frameworks?hl=fr).'
        ]
      }
    ],
    retentionTitle: 'Conservation et suppression',
    retention: [
      {
        group: 'Candidatures non retenues',
        deadline: 'Suppression 3 mois après la clôture du recrutement.'
      },
      {
        group: 'Liste d’attente',
        deadline:
          'Suppression à la clôture de la bêta ou 6 mois après la clôture du recrutement, selon la première échéance atteinte.'
      },
      {
        group: 'Testeurs sélectionnés',
        deadline: 'Conservation pendant la bêta et suppression 3 mois après sa fin.'
      }
    ],
    deletion:
      'Ces délais s’appliquent aux données personnelles dans Outlook, dans Excel et dans leurs éventuelles copies. Les suppressions sont effectuées manuellement à l’échéance applicable.',
    rightsTitle: 'Vos droits',
    rights:
      'Vous pouvez demander l’accès à vos données, leur rectification, leur effacement ou la limitation du traitement dans les conditions prévues par le RGPD. Vous pouvez vous opposer au traitement fondé sur l’intérêt légitime pour des raisons tenant à votre situation particulière. Le droit à l’effacement s’exerce sous réserve des exceptions légales applicables. Vous pouvez également demander la portabilité de vos données lorsque les conditions de l’article 20 du RGPD sont réunies.',
    exercise:
      'Pour exercer vos droits, écrivez à l’adresse de contact ci-dessus en précisant votre demande. Vous pouvez également introduire une réclamation auprès de la CNIL.',
    complaint: 'Adresser une réclamation à la CNIL'
  },
  en: {
    title: 'Privacy Policy',
    back: 'Back to the site',
    draft:
      'This policy explains how data related to Android beta applications, videos and audience analytics is handled.',
    controllerTitle: 'Data controller',
    controller:
      'Stéphane Morel, the independent creator of MOKO - Island Evolution, is the controller for the processing described in this policy. He acts in a personal capacity, with no registered company. Contact for privacy questions and exercising your rights',
    analytics: {
      title: 'Audience analytics with Umami',
      paragraphs: [
        'Where audience analytics is offered, it relies on your consent (Article 6(1)(a) GDPR). We use it to understand site traffic and interactions with Android beta recruitment. Analytics is optional. You can decline it and still access the site and the application form. Your choice is separate from YouTube videos and your beta application.',
        'We send the paths of pages visited, the domain of certain traffic sources and predefined events about teaser playback, social links and application actions. We measure the request to open a draft in your email app. We do not measure whether an application is sent or received. With your consent to audience analytics, only predefined marketing parameters from the URL (utm_source, utm_medium and utm_campaign) may be sent to Umami to measure where campaign visits come from. Form data, the email draft link, and private, unknown or unauthorised parameters are excluded.',
        'Umami Software, Inc. acts as our processor for audience analytics. The service processes IP addresses and the browser’s User-Agent header to provide analytics, including distinguishing sessions and estimating location. IP addresses may also appear in separate technical logs.',
        'According to Umami’s public documentation, production analytics on the Umami Cloud Hobby plan are retained for six months. Technical logs are kept for periods appropriate to their purpose. The exact retention period for MOKO’s account has not been confirmed. Residual copies may remain under applicable backup cycles, subject to legal retention requirements.',
        'The EU region selection applies to the storage of those analytics. Network routing, security, support and logging may involve processing outside the European Economic Area, including in the United States. Umami’s agreement provides safeguards for these transfers, including European Commission Standard Contractual Clauses where applicable.',
        'Your choice, whether consent or refusal, is valid for up to 180 days in this browser. After that, it is no longer used, even if the entry remains in local storage.',
        'Use the “Your privacy” button at the bottom of the page to change your choice or withdraw your consent at any time. Withdrawal blocks new transmissions in the current tab. A request sent before withdrawal may already have reached Umami. If your browser prevents both saving the refusal and deleting the previous choice, a valid consent may still apply in another tab or after reloading. Withdrawal does not affect the lawfulness of processing based on your consent before withdrawal.'
      ],
      agreement: 'Umami Data Processing Agreement',
      subprocessors: 'Umami subprocessor list'
    },
    sections: [
      {
        title: 'YouTube videos',
        paragraphs: [
          'The three thumbnails are hosted on this site. The YouTube API and players load only after you give consent. Once allowed, videos can start automatically without sound when they come into view.',
          'YouTube (Google) receives technical data when connecting and playback data when videos run. It may use cookies and other storage for purposes including player functionality and security, playback measurement, and feature rollouts. Your consent is the basis for loading the players and for trackers subject to that requirement.',
          'Your preference is stored on this device and reused for up to 180 days. You can decline or withdraw consent at any time under “Your privacy” at the bottom of the page. Withdrawal stops and unloads the players and prevents future loads. If the browser blocks both saving the refusal and removing the earlier consent, that consent may still apply in another tab or after reloading. Previously set third-party cookies remain managed by your browser.'
        ]
      },
      {
        title: 'Application data',
        paragraphs: [
          'When you send an application from your email app, we receive your nickname if you provide one, your Google Play account email, your sender email address and the contents of your message. The sender address can differ from your Google Play account email.',
          'The site prepares a draft in your email app. You choose whether to send it. The form does not transmit or store applications on the site.',
          'Separately from recruitment, GitHub states that GitHub Pages logs and stores visitors’ IP addresses for security purposes.'
        ]
      },
      {
        title: 'Purposes and legal basis',
        paragraphs: [
          'We use this information to handle applications, manually confirm each Google Play email with the applicant, select and invite 20 Android beta testers, and manage a waiting list. A correctly formatted address still needs verification. Receiving an application does not guarantee a place, and selection is manual.',
          'Legitimate interests (Article 6(1)(f) GDPR) are the legal basis for receiving and verifying applications, selecting and inviting testers, and managing the waiting list. The interest is to organise a limited test and grant beta access to confirmed accounts. Processing is limited to information necessary for recruitment, with defined retention periods and the right to object under the conditions set out in the GDPR.',
          'The checkbox on the form acknowledges that you have read this policy. Choices about videos and audience analytics are collected separately.'
        ]
      },
      {
        title: 'Recipients and storage',
        paragraphs: [
          'Only people authorised to manage the beta can access applications in Microsoft Outlook and track them in a local Excel file. Only selected testers’ confirmed Google Play email addresses are manually added to Google Play Console to give them access to the test.',
          'Microsoft provides the Outlook email service used to receive applications. Google provides Google Play Console to manage access for selected testers. These companies may process certain data outside the European Economic Area (EEA), including in the United States. Their privacy policies describe safeguards for international data transfers. For information about applicable safeguards, including adequacy decisions and standard contractual clauses depending on the transfer, please consult the official Microsoft privacy statement (https://www.microsoft.com/en-us/privacy/privacystatement), Google Privacy Policy (https://policies.google.com/privacy?hl=en), and Google transfer frameworks (https://policies.google.com/privacy/frameworks?hl=en).'
        ]
      }
    ],
    retentionTitle: 'Retention and deletion',
    retention: [
      { group: 'Unsuccessful applicants', deadline: 'Deleted 3 months after recruitment closes.' },
      {
        group: 'Waiting list',
        deadline:
          'Deleted when the beta ends or 6 months after recruitment closes, whichever comes first.'
      },
      {
        group: 'Selected testers',
        deadline: 'Kept during the beta and deleted 3 months after it ends.'
      }
    ],
    deletion:
      'These periods apply to personal data in Outlook, in Excel and in any copies. Records are deleted manually when the relevant deadline is reached.',
    rightsTitle: 'Your rights',
    rights:
      'You can request access to your data, ask for it to be corrected or deleted, or request a restriction on processing under the GDPR. You may object to processing based on legitimate interests on grounds relating to your particular situation. The right to erasure is subject to applicable legal exceptions. You may also request data portability where the conditions of Article 20 of the GDPR are met.',
    exercise:
      'To exercise your rights, email the address above and explain your request. You can also lodge a complaint with the CNIL, the French data protection authority.',
    complaint: 'Lodge a complaint with the CNIL'
  }
} satisfies Record<Language, object>;
