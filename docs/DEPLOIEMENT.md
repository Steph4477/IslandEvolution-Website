# Déploiement GitHub Pages

Le [site officiel](https://steph4477.github.io/IslandEvolution-Website/) est publié depuis la racine de `origin/gh-pages`. `main` contient les sources, les tests et les guides. `gh-pages` contient le site statique prêt à servir. Le workflow GitHub Pages intégré déploie les nouveaux commits de cette branche. Le workflow personnalisé `.github/workflows/pages.yml` existe encore sur `main`. Il ne correspond pas au chemin de publication éprouvé depuis la migration.

## Construire et contrôler en local

```powershell
npm ci
npm run format:check
npm run publish:pages -- --check-only
```

`scripts/publish-pages.mjs` impose `VITE_SITE_URL=https://steph4477.github.io/IslandEvolution-Website/` pour les commandes qu’il lance. `vite.config.ts` en déduit le préfixe `/IslandEvolution-Website`. `src/lib/seo.ts` s’en sert pour les métadonnées de production. `adapter-static` écrit les routes et ressources dans `build/`. La commande exécute `check`, `test`, puis `build`, et exige `index.html`, `_app/`, `sitemap.xml` et `.nojekyll`. Ce dernier permet à Pages de servir le répertoire `_app/` tel quel. `--check-only` s’arrête après ces vérifications locales.

`npm run build` est aussi utile seul. Sans `VITE_SITE_URL`, il produit un build local et le sitemap n’est pas attendu. Le contrôle Pages vérifie la configuration destinée à GitHub.

## Publier une version autorisée

1. Contrôler la branche `main`, le diff, les fichiers inclus, l’identité Git des commits et l’absence de données privées. Exécuter les vérifications locales ci-dessus.
2. Pousser les sources, puis le build, depuis `IslandEvolution-Website`.

   ```powershell
   git push --no-follow-tags origin main:main
   npm run publish:pages
   ```

3. Vérifier la référence publiée avec `git ls-remote origin refs/heads/gh-pages`. Dans **Actions**, ouvrir le run **pages build and deployment** du même commit, puis charger le site public. Contrôler l’accueil, une image, une page légale, les deux langues et la fonctionnalité livrée. En cas de doute sur le cache, recharger sans cache et comparer les ressources dans l’onglet **Réseau**.

Le script clone uniquement la branche Pages distante dans un dossier temporaire. Il prépare l’arbre complet à partir de `build/` et crée, si nécessaire, un commit qui cite le hash source et a le dernier commit de `gh-pages` pour parent. Le push vise uniquement `gh-pages` et le clone est retiré après l’opération. La publication repose sur les identifiants Git déjà configurés pour `origin` et sur l’identité Git du dépôt. Le dossier permanent est `IslandEvolution-Website`.

## Échec et retour arrière

- **Échec avant le push Pages**. Lire le premier statut en erreur. Corriger le build, l’accès Git ou l’identité de commit, puis réessayer en commençant par `--check-only`.
- **Push refusé car `gh-pages` a avancé**. Inspecter le nouveau commit distant et vérifier qu’il peut être remplacé par la version préparée. Relancer la commande normale. Elle repart du dernier état distant.
- **Push accepté et Pages en échec**. Relever le hash et ouvrir le job Pages correspondant. Le message final du script confirme le push de l’artefact. Le site est confirmé seulement après le succès du job et la vérification HTTP.
- **Retour arrière des sources**. Sur `main`, annuler le changement identifié avec `git revert`, valider la version corrigée, puis publier normalement après autorisation.
- **Retour arrière de l’artefact seul**. Si le dernier commit de `gh-pages` est précisément la publication à annuler, cloner temporairement cette branche, exécuter `git revert <commit-de-publication>` puis pousser normalement `gh-pages`. Cette méthode remet les fichiers de son parent en ajoutant un commit. Contrôler la branche et le contenu du revert avant de pousser. Si d’autres publications suivent déjà le commit en cause, reconstruire depuis la version source approuvée avant de choisir le retour arrière.
