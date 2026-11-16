# Island Evolution — site officiel

Application SvelteKit située à la racine du dépôt. Utiliser Node.js 24.

```sh
npm ci
npm run dev
```

`npm run check` vérifie le code Svelte et TypeScript. `npm test` vérifie les noms des images, les dimensions des planches de Moko et le repère des cinq appuis. `npm run build` compile le site. La configuration SvelteKit 3 se trouve dans `vite.config.ts`.

- `src/lib/components/` contient la cinématique, le décor, la liane et le rendu de Moko.
- `src/lib/moko/` contient le registre des animations et les découpes de sprites.
- `src/lib/scene/` contient les appuis naturels, le suivi du scroll et la chronologie de l’intro.
- `static/images/` contient les images servies par le site.

Le mode `?diagnostic=1` affiche les cinq appuis et le cadrage. Les coordonnées d’appui utilisent le canevas commun 1885 × 2048 px des trois calques. Les positions officielles ont été relevées sur l’illustration de calibration `position_reference.jpg`. Cette illustration est distincte des images du site.

## Export des données de Moko

Le manifeste est versionné. Une installation et un build n’ont besoin d’aucun fichier Godot.
Pour vérifier ou régénérer les définitions `idle` et `climb_liana`, fournir une scène de référence Godot compatible. Elle doit contenir le nœud `Node2D/Sprite`, les atlas et les clés d’animation utilisés pour la calibration d’origine.

```sh
npm run export:moko -- "/chemin/vers/player_reference.tscn" --check
```

Sans `--check`, l’exporteur écrit le manifeste dans `src/lib/moko/`. Il lit la scène fournie et les sprites du site. Les autres clips restent définis dans leurs modules.
