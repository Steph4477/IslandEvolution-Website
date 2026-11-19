import perches from './scene/tree-perches.json';

export type Language = 'fr' | 'en';
export const languageKey = 'island-evolution:language';

export const translations = {
  fr: {
    language: 'Langue',
    showMoko: 'Afficher Moko',
    hideMoko: 'Masquer Moko',
    skip: 'Passer l’intro',
    intro: "Une île mystérieuse. Une jungle qui évolue. Moko face à l'inconnu.",
    skipToContent: 'Aller au contenu',
    joinBeta: 'Rejoindre la bêta',
    betaLaunch: {
      title: "L'aventure commence ici",
      subtitle: "Soyez parmi les premiers à explorer l'île.",
      cardTitle: 'Bêta Android - Google Play',
      places: '20 explorateurs recherchés',
      paragraphs: [
        "La bêta Android de MOKO - Island Evolution n'est pas encore disponible sur Google Play.",
        "Les candidatures permettront de sélectionner 20 joueurs qui découvriront l'île en avant-première.",
        'Les participants retenus seront informés par e-mail dès le lancement de la bêta et recevront les instructions pour y accéder.',
        "Les autres candidats pourront rejoindre la liste d'attente."
      ],
      platforms: [
        { name: 'Google Play', device: 'Android', plan: 'Première plateforme prévue' },
        { name: 'Steam', device: 'PC', plan: 'Sortie envisagée ultérieurement' },
        { name: 'App Store', device: 'iOS', plan: 'Sortie envisagée à terme' }
      ],
      firstStatus: 'Bêta en préparation',
      availability:
        'Ordre de sortie envisagé : Android, PC, puis iOS. Aucune date de lancement annoncée.'
    },
    legalNotice: 'Mentions légales',
    videoConsent: {
      preferences: 'Préférences vidéos',
      title: 'Les aventures de Moko en vidéo !',
      description:
        'Activez les vidéos YouTube pour les découvrir. YouTube peut utiliser des cookies. Votre choix reste modifiable à tout moment.',
      policy: 'Confidentialité Google',
      allow: 'Autoriser YouTube',
      refuse: 'Refuser',
      allowed: 'YouTube autorisé.',
      refused: 'YouTube refusé.',
      undecided: 'Aucun choix enregistré.'
    },
    footerCopyright: '© 2026 MOKO - Island Evolution. Tous droits réservés.',
    socialLinks: {
      label: 'Réseaux sociaux',
      tiktok: 'MOKO - Island Evolution sur TikTok (nouvel onglet)',
      youtube: 'MOKO - Island Evolution sur YouTube (nouvel onglet)'
    },
    betaDetails: '20 places · Android · Google Play',
    betaStatus: 'Candidatures fermées',
    betaOpenStatus: 'Candidatures ouvertes',
    betaApplication: {
      title: 'Rejoindre la bêta Android',
      openIntro: {
        tagline: "Deviens l'un des premiers explorateurs !",
        paragraphs: [
          'Les candidatures pour la bêta Android de MOKO - Island Evolution sont ouvertes.',
          "20 joueurs seront sélectionnés pour découvrir l'île en avant-première.",
          "La bêta n'est pas encore disponible sur Google Play. Les participants retenus seront informés par e-mail dès son lancement et recevront les instructions pour y accéder.",
          "Les autres candidats pourront rejoindre la liste d'attente."
        ]
      },
      intro: "20 explorateurs auront la chance de découvrir l'île en avant-première !",
      places:
        "Places limitées à 20 bêta-testeurs Android. Les autres candidatures pourront rejoindre la liste d'attente.",
      nickname: 'Ton pseudo (facultatif)',
      email: 'Ton adresse Google Play',
      emailHelp:
        "Indique l'adresse du compte Google utilisé sur ton téléphone Android pour télécharger des applications sur Google Play. Pas forcément une adresse Gmail.",
      policyRead: "J'ai pris connaissance de la politique de confidentialité.",
      privacy: 'Politique de confidentialité',
      submit: "Ouvrir l'e-mail de candidature",
      mailHelp:
        "Votre messagerie s'ouvrira avec un e-mail prérempli. Vérifiez-le, puis envoyez-le pour finaliser votre candidature.",
      close: 'Fermer',
      errors: {
        missing: 'Indique ton adresse Google Play.',
        invalid: 'Saisis une adresse e-mail valide.',
        emailFormat: {
          before: 'Saisis une adresse e-mail valide (exemple : ',
          example: 'joueur@gmail.com',
          after: ').'
        },
        androidConfirmed:
          'Confirme que tu disposes d’un appareil Android avec accès à Google Play.',
        policyRead: 'Confirme que tu as lu la politique de confidentialité.'
      }
    },
    jungle: 'Sous la canopée',
    canopyIntroStart: 'Découvrez',
    canopyIntroEnd: "un jeu d'action, d'aventure et de plateformes où vous incarnez Moko.",
    canopyAction: 'Explorez, combattez et débloquez de nouvelles capacités',
    canopyEnemies: 'face à des ennemis qui évoluent selon vos performances.',
    canopyChallenge:
      "Trois niveaux de difficulté, des ennemis qui s'adaptent et un défi qui se prolonge sans limite. Jusqu'où irez-vous ?",
    jungleAlt: 'Moko explore la jungle du jeu',
    jungleCaption: 'Exploration de la jungle',
    templeAlt: 'Le temple du jeu au coucher du soleil',
    templeCaption: 'Le temple au crépuscule',
    gallery: {
      viewer: 'Visionneuse des captures',
      open: 'Agrandir la capture',
      close: 'Fermer',
      previous: 'Capture précédente',
      next: 'Capture suivante'
    },
    adventure: {
      title: "L'aventure commence",
      tagline: 'Tout commence par un naufrage.',
      description: 'Échoué sur une île mystérieuse, Moko doit désormais survivre.',
      play: 'Lire la cinématique',
      unavailable: 'Le lecteur est indisponible.'
    },
    difficulties: {
      title: 'Trois difficultés. Une seule île.',
      intro: 'Trois difficultés à débloquer. Une jungle toujours plus impitoyable.',
      modes: [
        {
          name: 'Explorateur',
          alt: 'Rune Explorateur : spirale verte',
          description: "L'aventure commence ici. Découvrez l'île et ses premiers dangers."
        },
        {
          name: 'Survivant',
          alt: 'Rune Survivant : soleil jaune',
          description: 'La jungle se fait plus hostile. Chaque erreur peut coûter cher.'
        },
        {
          name: 'Roi de l’île',
          alt: 'Rune Roi de l’île : couronne rouge',
          description: "Le défi ultime. Seuls les plus déterminés iront jusqu'au bout."
        }
      ],
      teaser: 'Teaser des difficultés',
      play: 'Lire le teaser des difficultés'
    },
    skills: {
      title: 'Les compétences de Moko',
      description: 'Découvrez quelques-uns des mouvements de Moko !',
      more: 'Avec plus de 30 animations et bien d’autres compétences à débloquer au fil de l’aventure, Moko vous réserve encore bien des surprises…',
      jump: 'Saut',
      shoot: 'Tir Coco'
    },
    beyondDemo: {
      title: 'Au-delà de la démo',
      tagline: 'L’aventure ne fait que commencer…',
      intro:
        'Au-delà de la jungle, l’île révèle de nouveaux territoires, des vestiges oubliés et des dangers encore inconnus.',
      preview:
        'De la mangrove aux profondeurs du temple, entre secrets et nouvelles menaces, découvrez un premier aperçu de ce qui attend Moko après la démo.',
      mangrove: { caption: 'Au cœur de la mangrove', alt: 'Moko explore les eaux de la mangrove.' },
      passage: {
        caption: "L'antichambre de l'arène",
        alt: 'Des ossements bordent le tunnel qui mène à l’arène.'
      },
      temple: {
        caption: 'Dans les profondeurs du temple',
        alt: 'Des plateformes de pierre se succèdent à l’intérieur du temple.'
      },
      arena: { caption: 'Aux portes de l’arène', alt: 'Vue d’ensemble de l’arène tribale.' }
    },
    endgame: {
      title: 'Au-delà du défi',
      tagline: "Jusqu'où oserez-vous aller ?",
      description:
        'Même après avoir affronté le Roi de l’île, bien des secrets restent à découvrir…',
      play: 'Lire la vidéo « Au-delà du défi »'
    },
    diagnostic: {
      framing: 'Cadrage du décor',
      settings: 'Réglages',
      zoom: 'Zoom',
      offset: 'Décalage horizontal',
      reset: 'Cadrage initial',
      coordinates: 'Coordonnées comparées, ancien et actuel',
      previous: 'Ancien',
      current: 'Actuel'
    }
  },
  en: {
    language: 'Language',
    showMoko: 'Show Moko',
    hideMoko: 'Hide Moko',
    skip: 'Skip intro',
    intro: 'A mysterious island. An evolving jungle. Moko faces the unknown.',
    skipToContent: 'Skip to content',
    joinBeta: 'Join the Beta',
    betaLaunch: {
      title: 'The adventure starts here',
      subtitle: 'Be among the first to explore the island.',
      cardTitle: 'Android Beta - Google Play',
      places: '20 explorers wanted',
      paragraphs: [
        'The Android beta of MOKO - Island Evolution is not yet available on Google Play.',
        'Applications will help select 20 players who will get an early look at the island.',
        'Selected participants will be notified by email when the beta launches and will receive instructions on how to access it.',
        'Other applicants may be placed on the waiting list.'
      ],
      platforms: [
        { name: 'Google Play', device: 'Android', plan: 'First planned platform' },
        { name: 'Steam', device: 'PC', plan: 'Planned for a later release' },
        { name: 'App Store', device: 'iOS', plan: 'Planned for a future release' }
      ],
      firstStatus: 'Beta in preparation',
      availability:
        'Planned release order: Android, PC, then iOS. No release date has been announced.'
    },
    legalNotice: 'Legal Notice',
    videoConsent: {
      preferences: 'Video preferences',
      title: "Moko's adventures on video!",
      description:
        'Enable YouTube videos to watch them. YouTube may use cookies. You can change your choice at any time.',
      policy: 'Google Privacy Policy',
      allow: 'Allow YouTube',
      refuse: 'Decline',
      allowed: 'YouTube allowed.',
      refused: 'YouTube declined.',
      undecided: 'No preference saved.'
    },
    footerCopyright: '© 2026 MOKO - Island Evolution. All rights reserved.',
    socialLinks: {
      label: 'Social media',
      tiktok: 'MOKO - Island Evolution on TikTok (new tab)',
      youtube: 'MOKO - Island Evolution on YouTube (new tab)'
    },
    betaDetails: '20 spots · Android · Google Play',
    betaStatus: 'Applications closed',
    betaOpenStatus: 'Applications open',
    betaApplication: {
      title: 'Join the Android Beta',
      openIntro: {
        tagline: 'Become one of the first explorers!',
        paragraphs: [
          'Applications for the Android beta of MOKO - Island Evolution are open.',
          '20 players will be selected to get an early look at the island.',
          'The beta is not yet available on Google Play. Selected participants will be notified by email when it launches and will receive instructions on how to access it.',
          'Other applicants may be placed on the waiting list.'
        ]
      },
      intro: '20 explorers will get the chance to discover the island before everyone else!',
      places:
        'Limited to 20 Android beta testers. Additional applicants may be placed on the waiting list.',
      nickname: 'Your nickname (optional)',
      email: 'Your Google Play email',
      emailHelp:
        "Enter the email address of the Google account you use on your Android phone to download apps from Google Play. It doesn't have to be a Gmail address.",
      policyRead: 'I have read the Privacy Policy.',
      privacy: 'Privacy Policy',
      submit: 'Open application email',
      mailHelp:
        'Your email app will open with a pre-filled message. Review it, then send it to complete your application.',
      close: 'Close',
      errors: {
        missing: 'Enter your Google Play email.',
        invalid: 'Enter a valid email address.',
        emailFormat: {
          before: 'Enter a valid email address (e.g. ',
          example: 'player@gmail.com',
          after: ').'
        },
        androidConfirmed: 'Confirm that you have an Android device with access to Google Play.',
        policyRead: 'Confirm that you have read the Privacy Policy.'
      }
    },
    jungle: 'Beneath the Canopy',
    canopyIntroStart: 'Discover',
    canopyIntroEnd: 'an action-adventure platformer where you play as Moko.',
    canopyAction: 'Explore, fight, and unlock new abilities',
    canopyEnemies: 'as you face enemies that evolve based on how you play.',
    canopyChallenge:
      'Three difficulty levels, enemies that adapt, and a challenge that never ends. How far will you go?',
    jungleAlt: 'Moko explores the jungle in the game',
    jungleCaption: 'Exploring the jungle',
    templeAlt: 'The temple in the game at sunset',
    templeCaption: 'The temple at dusk',
    gallery: {
      viewer: 'Screenshot viewer',
      open: 'Enlarge screenshot',
      close: 'Close',
      previous: 'Previous screenshot',
      next: 'Next screenshot'
    },
    adventure: {
      title: 'The Adventure Begins',
      tagline: 'It all begins with a shipwreck.',
      description: 'Stranded on a mysterious island, Moko must now survive.',
      play: 'Play the cinematic',
      unavailable: 'The video player is unavailable.'
    },
    difficulties: {
      title: 'Three Difficulties. One Island.',
      intro: 'Three difficulty levels to unlock. An increasingly unforgiving jungle.',
      modes: [
        {
          name: 'Explorer',
          alt: 'Explorer rune: green spiral',
          description: 'Your adventure begins here. Discover the island and its first dangers.'
        },
        {
          name: 'Survivor',
          alt: 'Survivor rune: yellow sun',
          description: 'The jungle grows more hostile. Every mistake could cost you dearly.'
        },
        {
          name: 'King',
          alt: 'King rune: red crown',
          description: 'The ultimate challenge. Only the most determined will make it to the end.'
        }
      ],
      teaser: 'Difficulty teaser',
      play: 'Play the difficulty teaser'
    },
    skills: {
      title: "Moko's Skills",
      description: "Discover some of Moko's moves!",
      more: 'With over 30 animations and many more abilities to unlock throughout the adventure, Moko still has plenty of surprises in store…',
      jump: 'Jump',
      shoot: 'Coco Shot'
    },
    beyondDemo: {
      title: 'Beyond the Demo',
      tagline: 'The adventure is only beginning…',
      intro:
        'Beyond the jungle, the island reveals new territories, forgotten ruins, and dangers yet unknown.',
      preview:
        'From the mangrove to the depths of the temple, secrets and new threats await. Get a first glimpse of what lies ahead for Moko beyond the demo.',
      mangrove: { caption: 'Into the Mangrove', alt: 'Moko explores the mangrove waters.' },
      passage: {
        caption: 'The Arena Antechamber',
        alt: 'Bones line the tunnel leading to the arena.'
      },
      temple: {
        caption: 'Deep Inside the Temple',
        alt: 'Stone platforms stretch across the temple interior.'
      },
      arena: { caption: 'At the Arena Gates', alt: 'A wide view of the tribal arena.' }
    },
    endgame: {
      title: 'Beyond the Challenge',
      tagline: 'How far will you dare to go?',
      description: 'Even after the King challenge, many secrets remain to be discovered…',
      play: 'Play the Beyond the Challenge video'
    },
    diagnostic: {
      framing: 'Scene framing',
      settings: 'Settings',
      zoom: 'Zoom',
      offset: 'Horizontal offset',
      reset: 'Reset framing',
      coordinates: 'Previous and current coordinates',
      previous: 'Previous',
      current: 'Current'
    }
  }
};

const englishPerches: Record<string, string> = {
  canopy_branch: 'Large canopy branch',
  upper_fork: 'Upper fork',
  moss_ledge: 'Mossy ledge',
  lower_knot: 'Tree knot and lower branch',
  roots_ground: 'Roots and ground'
};

export function perchLabel(language: Language, point: (typeof perches.restPoints)[number]) {
  return language === 'en' ? (englishPerches[point.id] ?? point.label) : point.label;
}
