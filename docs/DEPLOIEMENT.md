# Déploiement GitHub Pages

Le [site actuellement en ligne](https://steph4477.github.io/IslandEvolution-Website/) est servi depuis la racine de `origin/gh-pages`. `main` contient les sources, les tests et les guides. L’adresse de production préparée est `https://moko-islandevolution.com/`.

Le workflow intégré **pages build and deployment** publie les nouveaux commits de `gh-pages`. Le workflow personnalisé `.github/workflows/pages.yml` sur `main` était redondant et son dernier run a échoué. La préparation locale le retire et conserve dans `.github/workflows/check.yml` les vérifications des pull requests, des pushes sur `main` et des lancements manuels. Ces vérifications s’arrêtent au build local.

## Construire et contrôler en local

Avec Node.js 24, lancer les vérifications suivantes.

```powershell
npm ci
npm run format:check
npm run check
npm test
npm run build
npm run publish:pages -- --check-only
```

Le script de publication fixe `VITE_SITE_URL` à `https://moko-islandevolution.com/`. `vite.config.ts` en déduit une base vide et `src/lib/seo.ts` utilise cette adresse pour la canonique, les métadonnées de partage, le sitemap et les données structurées. `adapter-static` écrit les routes et les ressources dans `build/`. Sans `VITE_SITE_URL`, `npm run build` seul produit un build local sans sitemap.

`--check-only` exécute `check`, `test` et `build`, puis contrôle l’artefact local sans lancer de commande Git. `static/CNAME` est recopié dans `build/CNAME` et doit contenir une seule ligne `moko-islandevolution.com`. Le script exige aussi `index.html`, `_app/`, `sitemap.xml` et `.nojekyll`. Ce dernier permet à Pages de servir `_app/`. Pour une recette locale après ce build, lancer `npm run preview` avec la même valeur de `VITE_SITE_URL`.

## Configuration DNS cible

Dans la zone DNS OVHcloud, préparer les entrées suivantes. La racine correspond à un champ **Sous-domaine** vide.

| Hôte                                | Type              | Cible                                                                                                       |
| ----------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------- |
| Racine                              | `A`               | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` — quatre entrées                 |
| Racine                              | `AAAA` facultatif | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` — quatre entrées |
| `www`                               | `CNAME`           | `steph4477.github.io.`                                                                                      |
| `_github-pages-challenge-steph4477` | `TXT`             | Valeur affichée par GitHub lors de la vérification du domaine                                               |

La vérification du compte utilise le TXT et précède la bascule web. Conserver ce TXT après confirmation. GitHub Pages gère la redirection de `www` vers le domaine racine.

Lors de la bascule web, remplacer le `A` racine actuel vers `213.186.33.5` et retirer son TXT de redirection `1|www.moko-islandevolution.com`. Sur `www`, retirer le `A` vers `213.186.33.5` et le TXT de parking `3|welcome` pour rendre le nom disponible pour le `CNAME`. Vérifier les valeurs dans la console avant de les retirer. Conserver les NS, les MX, le SPF, le DNSSEC, les éventuels DKIM et DMARC et les autres entrées de messagerie. L’alias `ftp` est distinct de `www` et pointe vers le domaine racine. Sa résolution suivra donc la nouvelle adresse de la racine.

[Configurer le domaine dans GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) · [Éditer la zone DNS OVHcloud](https://docs.ovhcloud.com/fr/guides/web-cloud/domains/dns-zone-edit)

## Bascule du domaine après autorisation

1. Relire le diff local, vérifier l’exclusion d’`AGENTS.md`, relever les anciennes URL diffusées et conserver le hash du dernier artefact fonctionnel sur `gh-pages`. Exporter la zone OVHcloud avant intervention.
2. Valider les cinq contrôles V1.7 et le build à la racine. Vérifier ses métadonnées, les pages légales, les ressources locales et le contenu de `build/CNAME`.
3. Après autorisation explicite, commiter et pousser les sources vers `main`. La mise à jour de `main` exécute des vérifications. La publication de l’artefact intervient à l’étape 7.
4. Dans les réglages **Pages** du compte `Steph4477`, ajouter le domaine et récupérer le jeton TXT. Ajouter ce TXT dans OVHcloud, attendre sa résolution et cliquer sur **Verify**. [Vérifier un domaine GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)
5. Dans **Settings → Pages** du dépôt, confirmer la source **Deploy from a branch**, branche `gh-pages`, dossier `/ (root)`. Enregistrer `moko-islandevolution.com` dans **Custom domain**. GitHub ajoute le `CNAME` à la racine de la branche publiée.
6. Appliquer aussitôt les changements DNS web de la section précédente dans OVHcloud.
7. Vérifier que le commit GitHub avec le `CNAME` est visible sur `gh-pages`, puis publier selon la procédure ci-dessous.
8. Attendre le succès de **pages build and deployment**, la propagation des `A` et du `CNAME`, puis la disponibilité du certificat TLS pour les deux hôtes. Les DNS et le certificat peuvent prendre du temps. [Sécuriser GitHub Pages avec HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)
9. Activer **Enforce HTTPS**, puis vérifier HTTP → HTTPS et `www` → domaine racine.
10. Exécuter la recette du nouveau domaine sur desktop et mobile Redmi.
11. Valider les anciennes URL. Mettre à jour les liens publics et ceux du README après cette validation.

L’ancienne adresse peut rediriger dès l’étape 5, alors que le DNS, le certificat ou l’artefact sont encore en cours de mise à jour. Préparer tous les changements avant de démarrer ces étapes limite cette fenêtre. La conservation des chemins, des paramètres et des fragments doit être vérifiée après la bascule.

## Publier une version autorisée

Contrôler la branche `main`, le diff, le contenu autorisé, l’identité Git et l’absence de données privées. Les sources de la version à publier doivent déjà être validées et poussées. Le script requiert un mode explicite. Pour publier après autorisation, utiliser la commande suivante.

```powershell
npm run publish:pages -- --publish
```

Le script reconstruit et contrôle l’artefact, clone uniquement la branche Pages dans un dossier temporaire et vérifie que son `CNAME` cible le domaine. Il prépare l’arbre complet à partir de `build/`, avec `CNAME` et `.nojekyll`. Si l’arbre a changé, le nouveau commit cite le hash des sources et descend du dernier commit de `gh-pages`. Le push vise cette seule branche. Le clone temporaire est retiré à la fin.

Vérifier la référence publiée avec `git ls-remote origin refs/heads/gh-pages`, ouvrir le run **pages build and deployment** du même commit et effectuer les contrôles HTTP et navigateur. Si un push est refusé parce que la branche a avancé, examiner le nouveau commit distant avant de relancer.

## Recette après publication

- **Anciennes URL**. À partir de `https://steph4477.github.io/IslandEvolution-Website`, essayer l’accueil avec et sans barre finale, `/confidentialite/?lang=en`, `/mentions-legales/?lang=fr` et `/?lang=en#aventure`. Contrôler les statuts et les destinations de chaque redirection, le HTTP 200 final, la langue affichée et l’arrivée à l’ancre dans le navigateur. Rejouer les autres liens réellement diffusés.
- **Nouveau domaine**. Vérifier le certificat du domaine racine et de `www`, les redirections HTTP, l’accès direct et le rechargement des pages légales, la navigation FR/EN, la canonique, l’image de partage, `robots.txt` et `sitemap.xml`.
- **Interface**. Sur desktop et Redmi, contrôler le chargement des images, affiches et sprites, les animations Moko, la parallaxe, les galeries, les ancres et la navigation au clavier. Examiner les erreurs de ressources dans l’onglet **Réseau**.
- **Bêta**. Ouvrir la modale, contrôler les validations et le lien de confidentialité, puis tester les brouillons `mailto:` en FR et EN avec des données fictives. S’arrêter au brouillon.
- **YouTube**. Sur une nouvelle session, vérifier l’absence de requêtes YouTube avant consentement. Tester le refus, l’acceptation, la lecture et le retrait du consentement. Les préférences enregistrées sur l’ancien domaine appartiennent à une autre origine.

## Échec et retour arrière

- **Échec avant publication**. Corriger le premier contrôle en erreur et reprendre avec `--check-only`. Après un push accepté, examiner le workflow intégré correspondant au hash publié en cas d’échec.
- **Régression après une publication ordinaire**. En conservant le domaine, restaurer sur `gh-pages` un artefact compatible déjà validé, avec son `CNAME`, par un nouveau commit autorisé. Si nécessaire, annuler le changement source par un commit de réversion.
- **Échec de la bascule du domaine**. Avec autorisation, rétablir les seules entrées web OVHcloud sauvegardées, retirer le domaine personnalisé dans **Settings → Pages**, puis restaurer l’arbre de l’artefact antérieur dans un clone propre de `gh-pages` par un nouveau commit. Cet arbre doit utiliser la base `/IslandEvolution-Website` et être dépourvu du `CNAME` personnalisé. Publier sur `gh-pages` sans forcer le push, attendre le succès du workflow intégré et vérifier l’ancienne adresse avec des URL profondes. Le cache DNS et les redirections permanentes déjà mises en cache peuvent retarder le retour pour certains visiteurs.
