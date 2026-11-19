import type { Language } from './i18n';

export const privacyContact = 'moko.islandevolution@outlook.com';
export const cnilComplaintUrl = 'https://www.cnil.fr/fr/adresser-une-plainte';

export const privacyCopy = {
  fr: {
    title: 'Politique de confidentialité',
    back: 'Retour au site',
    draft:
      'Cette politique explique comment les données des candidats à la bêta Android sont utilisées, conservées et supprimées.',
    controllerTitle: 'Responsable du traitement',
    controller:
      'Stéphane Morel, créateur indépendant de MOKO - Island Evolution, est le responsable du traitement des candidatures. Il agit à titre personnel, sans entreprise constituée. Contact pour la confidentialité et l’exercice de vos droits',
    sections: [
      {
        title: 'Vidéos YouTube',
        paragraphs: [
          'Les trois miniatures sont hébergées sur ce site. L’API et les lecteurs YouTube se chargent uniquement après votre accord. Après autorisation, les vidéos peuvent se lancer automatiquement sans son en entrant dans l’écran.',
          'YouTube (Google) reçoit des données techniques à la connexion, puis des informations de lecture. Il peut utiliser des cookies et d’autres stockages, notamment pour le fonctionnement et la sécurité du lecteur, la mesure de la lecture et le déploiement de fonctions. La base du chargement des lecteurs et des traceurs soumis à cette règle est votre consentement.',
          'Le choix est conservé sur cet appareil et réutilisé jusqu’à 180 jours. Vous pouvez refuser ou retirer votre consentement à tout moment dans « Préférences vidéos », en bas de l’accueil. Le retrait arrête et décharge les lecteurs, et bloque les prochains chargements. Les cookies tiers déjà déposés restent gérés par votre navigateur.'
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
          'La case du formulaire atteste la prise de connaissance de cette politique. Si un traitement distinct devait reposer sur le consentement, il ferait l’objet d’une demande séparée et vous pourriez retirer ce consentement à tout moment.'
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
      'Vous pouvez demander l’accès à vos données, leur rectification, leur effacement ou la limitation du traitement dans les conditions prévues par le RGPD. Vous pouvez vous opposer au traitement fondé sur l’intérêt légitime pour des raisons tenant à votre situation particulière. Le droit à l’effacement s’exerce sous réserve des exceptions légales applicables.',
    exercise:
      'Pour exercer vos droits, écrivez à l’adresse de contact ci-dessus en précisant votre demande. Vous pouvez également introduire une réclamation auprès de la CNIL.',
    complaint: 'Adresser une réclamation à la CNIL'
  },
  en: {
    title: 'Privacy Policy',
    back: 'Back to the site',
    draft: 'This policy explains how Android beta applicants’ data is used, retained and deleted.',
    controllerTitle: 'Data controller',
    controller:
      'Stéphane Morel, the independent creator of MOKO - Island Evolution, is the controller for beta applications. He acts in a personal capacity, with no registered company. Contact for privacy questions and exercising your rights',
    sections: [
      {
        title: 'YouTube videos',
        paragraphs: [
          'The three thumbnails are hosted on this site. The YouTube API and players load only after you give consent. Once allowed, videos can start automatically without sound when they come into view.',
          'YouTube (Google) receives technical data when connecting and playback data when videos run. It may use cookies and other storage for purposes including player functionality and security, playback measurement, and feature rollouts. Your consent is the basis for loading the players and for trackers subject to that requirement.',
          'Your preference is stored on this device and reused for up to 180 days. You can decline or withdraw consent at any time under “Video preferences” at the bottom of the home page. Withdrawal stops and unloads the players and prevents future loads. Previously set third-party cookies remain managed by your browser.'
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
          'The checkbox on the form acknowledges that you have read this policy. If a separate activity requires consent, it would be requested separately and you could withdraw it at any time.'
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
      'You can request access to your data, ask for it to be corrected or deleted, or request a restriction on processing under the GDPR. You may object to processing based on legitimate interests on grounds relating to your particular situation. The right to erasure is subject to applicable legal exceptions.',
    exercise:
      'To exercise your rights, email the address above and explain your request. You can also lodge a complaint with the CNIL, the French data protection authority.',
    complaint: 'Lodge a complaint with the CNIL'
  }
} satisfies Record<Language, object>;
