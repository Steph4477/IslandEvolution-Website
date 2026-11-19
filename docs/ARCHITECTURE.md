# Architecture du site

Le site est une application SvelteKit 3 et TypeScript, compilée par Vite en fichiers statiques. GitHub Pages sert le résultat. L’interactivité s’exécute dans le navigateur à partir des pages HTML prérendues.

## Repères dans le dépôt

| Emplacement           | Responsabilité                                                                                              |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `src/app.html`        | Structure HTML commune, langue initiale française et secours CSS pour l’accueil sans JavaScript.            |
| `src/routes/`         | Routes, composition des pages, métadonnées et points d’entrée prérendus.                                    |
| `src/lib/components/` | Composants Svelte, avec leur logique et leur CSS local.                                                     |
| `src/lib/scene/`      | Progression du défilement, calendrier de l’intro, géométrie, seuils et trajectoire de la Coco.              |
| `src/lib/moko/`       | Descriptions des planches de sprites, cadres, clés temporelles et choix de l’image affichée.                |
| `src/lib/video/`      | Validité du consentement, chargement de l’API YouTube et coordination des lecteurs.                         |
| `static/`             | Images, affiches, icônes et `.nojekyll`, copiés dans le résultat statique. Les chemins respectent la casse. |
| `scripts/`            | Vérification et publication Pages, export du manifeste Godot.                                               |
| `tests/`              | Tests Node des règles et des ressources.                                                                    |
| `docs/`               | Guides de maintenance et illustrations du README.                                                           |

`node_modules/`, `.svelte-kit/` et `build/` contiennent des dépendances ou sorties locales. Le manifeste `src/lib/moko/moko-manifest.ts` est une exception versionnée et générée par `scripts/export-moko.mjs` depuis une scène de référence. Les autres modules `moko-*.ts` définissent les clips complémentaires.

## Routes

| Route                           | Entrée                                  | Ce qu’elle produit                                                                                                                         |
| ------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `/`                             | `src/routes/+page.svelte` et `+page.ts` | Les sections de l’accueil et les interactions. Le composant compose le site et coordonne l’intro, la langue, le consentement et la modale. |
| `/confidentialite/`             | `src/routes/confidentialite/`           | Page bilingue alimentée par `src/lib/privacy.ts`.                                                                                          |
| `/mentions-legales/`            | `src/routes/mentions-legales/`          | Page bilingue avec son propre objet `notices`.                                                                                             |
| `/robots.txt` et `/sitemap.xml` | `+server.ts` de chaque route            | Fichiers statiques pour l’indexation. Le sitemap de production utilise `VITE_SITE_URL`.                                                    |

Les mises en page légales gardent la barre oblique finale afin de produire un `index.html` dans chaque dossier. `vite.config.ts` configure `adapter-static` et le préfixe de chemin Pages. `src/lib/seo.ts` fournit les descriptions, le partage social et les données structurées. La page d’accueil fixe l’URL canonique de production. Les pages légales demandent `noindex`.

## Interactions principales

```text
Accueil
├── CinematicIntro → temps écoulé, fin et bouton Passer l’intro
├── JungleBackdrop → caméra et repères du décor
├── MokoLiana → phases de mouvement, liane, perches et commandes de capacités
│   └── Moko → cadre de sprite et orientation à afficher
├── CanopyGallery → visionneuse modale et navigation des captures
├── AdventureVideo → affiche locale puis lecteur autorisé
└── BetaLaunchSection → ouverture de BetaApplicationDialog
    └── beta-application.ts → validation et construction du brouillon
```

`observeScroll` mutualise le calcul de progression et de direction du défilement. `MokoLiana.svelte` possède les états de mouvement. `advanceIntro` gère les images de l’intro et `advanceNavigationFlight` suit les sauts vers et depuis les perches. Les modules `skills-actions.ts`, `skills-transfer.ts` et `coco-trajectory.ts` isolent les règles et calculs couverts par les tests. Les commandes visibles dans la section Compétences sont **Saut** et **Tir Coco**. Une impulsion ramène à la position de départ. Un tir peut accompagner le saut.

`i18n.ts` contient les textes de l’accueil en français et en anglais. `page-language.ts` lit la préférence du navigateur en l’absence de paramètre applicable et enregistre les sélections. `LanguageSwitcher.svelte` expose deux boutons accessibles. Une valeur `lang` inconnue revient à la préférence sur l’accueil et au français sur les pages légales.

Les vidéos commencent avec une affiche locale. L’accueil stocke le consentement et transmet `allowed` à `AdventureVideo.svelte`. Le composant décide ensuite quand charger un lecteur selon la visibilité, la préférence de mouvement et les actions de lecture. Le retrait démonte les lecteurs et recharge la page. `youtube.ts` arbitre les demandes simultanées.

## Styles et ressources

Les blocs `<style>` des composants utilisent le CSS natif. Svelte limite la portée des styles locaux. Les blocs `:global(...)` sont réservés aux sélecteurs qui touchent un élément extérieur à cette portée, comme l’iframe créée par l’API vidéo ou les boutons enfants de l’en-tête. Les requêtes `@media` définissent les variantes mobile et mouvement réduit. Les variables CSS transportent des positions calculées. Utiliser `asset(...)` de `$app/paths` pour référencer une ressource publique avec le préfixe Pages.

Voir le [guide de maintenance](GUIDE_MAINTENANCE.md) pour les modifications courantes, le [guide du formulaire](FORMULAIRE_BETA.md) pour les validations et le [guide de déploiement](DEPLOIEMENT.md) pour le build de production.
