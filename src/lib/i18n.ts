import perches from './scene/tree-perches.json';

export type Language = 'fr' | 'en';
export const languageKey = 'island-evolution:language';

export const translations = {
  fr: {
    language: 'Langue', showMoko: 'Afficher Moko', hideMoko: 'Masquer Moko', skip: 'Passer l’intro',
    intro: "Une île mystérieuse. Une jungle qui évolue. Moko face à l'inconnu.",
    skipToContent: 'Aller au contenu',
    joinBeta: 'Rejoindre la bêta',
    betaShort: 'Bêta',
    betaDetails: '20 places · Android · Google Play',
    betaStatus: 'Inscriptions à venir',
    jungle: 'Sous la canopée',
    canopyIntroStart: 'Découvrez',
    canopyIntroEnd: "un jeu d'action, d'aventure et de plateformes où vous incarnez Moko.",
    canopyAction: 'Explorez, combattez et débloquez de nouvelles capacités',
    canopyEnemies: 'face à des ennemis qui évoluent selon vos performances.',
    canopyChallenge: "Trois difficultés, un endgame évolutif. Jusqu'où survivrez-vous ?",
    jungleAlt: 'Moko explore la jungle du jeu', jungleCaption: 'Exploration de la jungle',
    templeAlt: 'Le temple du jeu au coucher du soleil', templeCaption: 'Le temple au crépuscule',
    gallery: {
      viewer: 'Visionneuse des captures', open: 'Agrandir la capture', close: 'Fermer',
      previous: 'Capture précédente', next: 'Capture suivante'
    },
    adventure: {
      title: "L'aventure commence",
      tagline: 'Tout commence par un naufrage.',
      description: 'Échoué sur une île mystérieuse, Moko doit désormais survivre.',
      play: 'Lire la cinématique', unavailable: 'Le lecteur est indisponible.'
    },
    difficulties: {
      title: 'Trois difficultés. Une seule île.',
      intro: 'Trois difficultés à débloquer. Une jungle toujours plus impitoyable.',
      modes: [
        { name: 'Explorateur', alt: 'Rune Explorateur : spirale verte', description: "L'aventure commence ici. Découvrez l'île et ses premiers dangers." },
        { name: 'Survivant', alt: 'Rune Survivant : soleil jaune', description: 'La jungle se fait plus hostile. Chaque erreur peut coûter cher.' },
        { name: 'Roi de l’île', alt: 'Rune Roi de l’île : couronne rouge', description: "Le défi ultime. Seuls les plus déterminés iront jusqu'au bout." }
      ],
      teaser: 'Teaser des difficultés', play: 'Lire le teaser des difficultés'
    },
    skills: { title: 'Les compétences de Moko', description: "Découvrez quelques-uns des mouvements de Moko !", more: 'Avec plus de 30 animations et bien d’autres compétences à débloquer au fil de l’aventure, Moko vous réserve encore bien des surprises…', jump: 'Saut', shoot: 'Tir Coco' },
    endgame: {
      title: 'Au-delà du défi',
      tagline: "Jusqu'où oserez-vous aller ?",
      description: 'Même après avoir affronté le Roi de l’île, bien des secrets restent à découvrir…',
      play: 'Lire la vidéo « Au-delà du défi »'
    },
    diagnostic: {
      framing: 'Cadrage du décor', settings: 'Réglages', zoom: 'Zoom', offset: 'Décalage horizontal',
      reset: 'Cadrage initial', coordinates: 'Coordonnées comparées, ancien et actuel',
      previous: 'Ancien', current: 'Actuel'
    }
  },
  en: {
    language: 'Language', showMoko: 'Show Moko', hideMoko: 'Hide Moko', skip: 'Skip intro',
    intro: 'A mysterious island. An evolving jungle. Moko faces the unknown.',
    skipToContent: 'Skip to content',
    joinBeta: 'Join the Beta',
    betaShort: 'Beta',
    betaDetails: '20 spots · Android · Google Play',
    betaStatus: 'Registration coming soon',
    jungle: 'Beneath the Canopy',
    canopyIntroStart: 'Discover',
    canopyIntroEnd: 'an action-adventure platformer where you play as Moko.',
    canopyAction: 'Explore, fight, and unlock new abilities',
    canopyEnemies: 'as you face enemies that evolve based on your performance.',
    canopyChallenge: 'Three difficulty levels, an evolving endgame. How long can you survive?',
    jungleAlt: 'Moko explores the jungle in the game', jungleCaption: 'Exploring the jungle',
    templeAlt: 'The temple in the game at sunset', templeCaption: 'The temple at dusk',
    gallery: {
      viewer: 'Screenshot viewer', open: 'Enlarge screenshot', close: 'Close',
      previous: 'Previous screenshot', next: 'Next screenshot'
    },
    adventure: {
      title: 'The Adventure Begins',
      tagline: 'It all begins with a shipwreck.',
      description: 'Stranded on a mysterious island, Moko must now survive.',
      play: 'Play the cinematic', unavailable: 'The video player is unavailable.'
    },
    difficulties: {
      title: 'Three Difficulties. One Island.',
      intro: 'Three difficulty levels to unlock. An increasingly unforgiving jungle.',
      modes: [
        { name: 'Explorer', alt: 'Explorer rune: green spiral', description: 'Your adventure begins here. Discover the island and its first dangers.' },
        { name: 'Survivor', alt: 'Survivor rune: yellow sun', description: 'The jungle grows more hostile. Every mistake could cost you dearly.' },
        { name: 'King', alt: 'King rune: red crown', description: 'The ultimate challenge. Only the most determined will make it to the end.' }
      ],
      teaser: 'Difficulty teaser', play: 'Play the difficulty teaser'
    },
    skills: { title: "Moko's Skills", description: "Discover some of Moko's moves!", more: 'With over 30 animations and many more abilities to unlock throughout the adventure, Moko still has plenty of surprises in store…', jump: 'Jump', shoot: 'Coco Shot' },
    endgame: {
      title: 'Beyond the Challenge',
      tagline: 'How far will you dare to go?',
      description: 'Even after the King challenge, many secrets remain to be discovered…',
      play: 'Play the Beyond the Challenge video'
    },
    diagnostic: {
      framing: 'Scene framing', settings: 'Settings', zoom: 'Zoom', offset: 'Horizontal offset',
      reset: 'Reset framing', coordinates: 'Previous and current coordinates',
      previous: 'Previous', current: 'Current'
    }
  }
};

const englishPerches: Record<string, string> = {
  canopy_branch: 'Large canopy branch', upper_fork: 'Upper fork',
  moss_ledge: 'Mossy ledge', lower_knot: 'Tree knot and lower branch', roots_ground: 'Roots and ground'
};

export function perchLabel(language: Language, point: typeof perches.restPoints[number]) {
  return language === 'en' ? englishPerches[point.id] ?? point.label : point.label;
}
