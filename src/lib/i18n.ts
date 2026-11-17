import perches from './scene/tree-perches.json';

export type Language = 'fr' | 'en';
export const languageKey = 'island-evolution:language';

export const translations = {
  fr: {
    language: 'Langue', moko: 'Afficher Moko', skip: 'Passer l’intro',
    intro: 'Un jeu de plateforme 2D. Suivez Moko de la canopée jusqu’au sol de la jungle.',
    descend: 'Descendre dans la jungle',
    jungle: 'Sous la canopée',
    galleryIntro: 'Explorez la jungle avec Moko. Ces captures donnent un aperçu des décors et des rencontres du jeu.',
    jungleAlt: 'Moko explore la jungle du jeu', jungleCaption: 'Exploration de la jungle',
    templeAlt: 'Le temple du jeu au coucher du soleil', templeCaption: 'Le temple au crépuscule',
    videos: 'Vidéos de gameplay à venir.',
    island: 'Au cœur de l’île',
    topics: [
      ['Difficultés', 'Les niveaux de difficulté et leurs différences seront présentés ici.'],
      ['Compétences de Moko', 'Double saut, Coco Fire et attaques Clac et Kick.'],
      ['Évolution', 'Découvrez comment Moko évolue au fil de l’aventure.'],
      ['Mode Endless', 'Les règles et les objectifs du mode seront détaillés ici.']
    ],
    beta: 'Bêta Android', betaInfo: 'Les informations d’accès et de participation seront publiées ici.',
    footer: 'Liens de pied de page', screenshots: 'Captures du jeu', top: 'Retour à la canopée',
    diagnostic: {
      framing: 'Cadrage du décor', settings: 'Réglages', zoom: 'Zoom', offset: 'Décalage horizontal',
      reset: 'Cadrage initial', coordinates: 'Coordonnées comparées, ancien et actuel',
      previous: 'Ancien', current: 'Actuel'
    }
  },
  en: {
    language: 'Language', moko: 'Show Moko', skip: 'Skip intro',
    intro: 'A 2D platformer. Follow Moko from the jungle canopy to the forest floor.',
    descend: 'Head down into the jungle',
    jungle: 'Beneath the canopy',
    galleryIntro: 'Explore the jungle with Moko. These screenshots show some of the places and encounters in the game.',
    jungleAlt: 'Moko explores the jungle in the game', jungleCaption: 'Exploring the jungle',
    templeAlt: 'The temple in the game at sunset', templeCaption: 'The temple at dusk',
    videos: 'Gameplay videos coming soon.',
    island: 'At the heart of the island',
    topics: [
      ['Difficulty', 'Details on the difficulty levels and how they differ will be shared here.'],
      ['Moko’s abilities', 'Double jump, Fire Coco, and the Clac and Kick attacks.'],
      ['Evolution', 'Discover how Moko evolves throughout the adventure.'],
      ['Endless mode', 'Rules and objectives for this mode will be shared here.']
    ],
    beta: 'Android beta', betaInfo: 'Details on how to access and take part in the beta will be posted here.',
    footer: 'Footer links', screenshots: 'Gameplay screenshots', top: 'Back to the canopy',
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
