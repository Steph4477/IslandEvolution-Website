# Guide de maintenance

## 1. Ouvrir et lancer le projet

Ouvrir le dossier `IslandEvolution-Website` dans VS Code avec **Fichier → Ouvrir le dossier**. Installer les extensions **Svelte for VS Code** et **Prettier - Code formatter**. Les réglages du dépôt choisissent Prettier, deux espaces et des fins de ligne LF. La configuration locale charge `prettier-plugin-svelte`.

Dans le terminal intégré, utiliser Node.js 24.

```powershell
node --version
git status --short --branch
npm ci
npm run dev
```

Ouvrir l’URL affichée par Vite. `Ctrl+C` arrête le serveur. Pour comprendre quel fichier ouvrir, commencer par la [carte des routes et composants](ARCHITECTURE.md).

## 2. Changer un texte et sa traduction

Dans `src/lib/i18n.ts`, rechercher par exemple `joinBeta`. Repérer la même clé dans `translations.fr` et `translations.en`, puis mettre à jour les deux entrées. L’accueil affiche `{copy.joinBeta}` et choisit `copy` à partir de `translations[language]`. La confidentialité est dans `src/lib/privacy.ts` et les mentions légales dans l’objet `notices` de leur route.

Dans le navigateur, basculer avec les boutons **Français** et **English**. Vérifier aussi un lien avec `?lang=en` et un rechargement sans paramètre après sélection. Pour tester le premier passage, ouvrir une fenêtre privée ou effacer uniquement la préférence de langue du site dans les outils de développement.

## 3. Modifier un composant ou un style

1. Partir du fichier qui compose la zone. Par exemple, `src/routes/+page.svelte` instancie `CanopyGallery` avec ses captures et ses libellés.
2. Ouvrir `src/lib/components/CanopyGallery.svelte`. Le bloc `<script>` contient les props, l’index courant et la gestion du clavier. Le balisage contient le `<dialog>` et les boutons.
3. Pour un style, modifier le bloc `<style>` du composant. Le projet utilise du CSS natif, sans préprocesseur SCSS. Les composants voisins gardent leurs styles locaux.
4. Rejouer l’ouverture, les flèches du clavier, `Échap` et le retour de focus. Vérifier une petite largeur dans le mode responsive et un affichage de bureau.

Pour Moko, identifier d’abord si le problème concerne la planche (`src/lib/moko/`), le calcul (`src/lib/scene/`) ou la transition (`MokoLiana.svelte`). Garder le manifeste généré sous le contrôle du script d’export.

## 4. Ajouter une image

Placer l’image dans le sous-dossier adapté de `static/`. Par exemple, les captures de jungle sont dans `static/images/gameplay/`. Dans un composant, passer le chemin relatif `images/gameplay/nom.webp` à `asset` importé de `$app/paths`. Utiliser exactement la casse du nom de fichier, renseigner un texte alternatif si l’image transmet une information et réserver ses dimensions quand elles sont connues. Les visuels sous la ligne de flottaison peuvent utiliser `loading="lazy"`.

## 5. Vérifier et diagnostiquer

```powershell
npm run format
npm run format:check
npm run check
npm test
npm run build
npm run publish:pages -- --check-only
```

`format` réécrit les sources selon la configuration. `format:check` contrôle leur conformité. `check` indique le fichier, la ligne et la nature des erreurs de Svelte ou TypeScript. Commencer par la première erreur, puis relancer la commande. `test` exécute les fichiers `tests/*.test.mjs`. Pour cibler le formulaire, lancer `node --test tests/beta-application.test.mjs`. `build` teste la compilation. Le mode `--check-only` compile pour le domaine de production et vérifie l’artefact local sans publier.

Ouvrir la **Console** et l’onglet **Réseau** du navigateur lorsqu’un problème ne se voit pas dans les tests Node. Pour chaque erreur, noter l’action, la route, la langue et la taille d’écran. Le [guide de dépannage](DEPANNAGE.md) donne les étapes par symptôme.

## 6. Créer un commit local

```powershell
git status --short --branch
git diff --check
git diff
git add -- src/lib/i18n.ts
git diff --cached
git commit -m "docs: update an example"
git status --short --branch
```

Remplacer le chemin et le message par ceux du changement réel. Choisir un préfixe cohérent avec le changement et lire le diff indexé avant le commit. L’action est locale. Pour comprendre les contrôles préalables et les deux pushes d’une publication autorisée, consulter [Déploiement](DEPLOIEMENT.md).

## Parcours d’apprentissage

1. **Les scripts npm**. Exécuter `dev`, puis retrouver chaque commande dans `package.json`.
2. **Les routes**. Relier `/confidentialite/` au dossier correspondant, puis retrouver l’accueil.
3. **Les traductions**. Suivre `joinBeta` du dictionnaire jusqu’au bouton et tester les deux langues.
4. **Les ressources**. Suivre une capture de `static/` jusqu’à son appel `asset(...)` et sa requête réseau.
5. **Le CSS local**. Identifier dans le navigateur la règle d’un bouton, puis trouver la variante responsive.
6. **Les composants Svelte**. Suivre un événement depuis `CanopyGallery` jusqu’à l’état de la visionneuse.
7. **Le formulaire et ses tests**. Lire une erreur, retrouver la règle et vérifier le sujet et le corps du brouillon.
8. **Le consentement vidéo**. Suivre le choix depuis le stockage jusqu’au lecteur dans l’onglet Réseau.
9. **La scène de Moko**. Relier défilement, phase de mouvement et cadre de sprite visible dans `data-clip`.
10. **Le build et GitHub Pages**. Vérifier le build avec `--check-only`, puis lire un historique de déploiement existant et distinguer le commit source du commit de l’artefact.
