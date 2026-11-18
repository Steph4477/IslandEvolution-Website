# MOKO – ISLAND EVOLUTION
## Roadmap prospective — V1.5 Site officiel & V1.6 Communication

**Mise à jour : 18 novembre 2026**
**Référence de travail :** `C:\Users\zozoe\Documents\IslandEvolution-Website\ISLAND_EVOLUTION_ROADMAP.md`
**Périmètre :** état validé, décisions structurantes et prochaines étapes.
**Budget de référence :** 0 € ; toute dépense doit être validée séparément.

> **Notre vision de l'écosystème**
> **Le site officiel raconte l'aventure. La vitrine technique explique comment elle fonctionne. Les réseaux sociaux montrent les nouveautés. Et le jeu permet de les vivre.**

Quatre piliers interconnectés : **jeu Godot**, **site officiel pour les joueurs**, **vitrine technique**, **réseaux sociaux**. Les passerelles doivent être pertinentes selon les publics, sans transformer le site officiel en portfolio. Google Play, YouTube, la bêta et la communauté complètent cet écosystème. Les connexions favorisent la découverte et la cohérence de marque ; elles ne garantissent pas un meilleur classement Google.

---

# V1.5 — Finaliser le site officiel

## 1. Direction produit et architecture

**Ordre de lecture validé**

1. Introduction.
2. Gameplay.
3. Les trois difficultés (Explorer → Survivor → King).
4. Au-delà du défi / Beyond the Challenge (Endgame).
5. Skills, mini-scène interactive.
6. Sur le fond sombre : Au-delà de la démo → Bêta Android → Contact et pied de page. Politique de confidentialité accessible par une URL dédiée.

- **Construire du haut vers le bas**, une section à la fois : validation contenu → intégration locale → tests PC/mobile/Redmi → validation visuelle.
- **Conserver l'accueil sur une page** et ajouter une route statique dédiée à la Politique de confidentialité.
- **Zone haute immersive** : grand arbre, liane, parallaxes et Moko ; ne pas dénaturer le décor ni l'intro.
- **Transition Skills** : Moko quitte la liane et **saute dans une mini-scène interactive responsive**, où il peut utiliser ses capacités ; c'est la frontière entre les deux styles de présentation.
- **Zone inférieure** : présentation web plus classique et légère, **sans grand arbre, liane ni Moko flottant**, avec galerie après Skills, puis bêta et contact.
Les points ci-dessous décrivent les critères utilisés pour valider la transition immersive.

- **Découpler techniquement le décor immersif de la hauteur du document**, et borner le contrôleur de scroll de Moko à la zone haute : l'ajout de sections ne doit plus agrandir/recadrer l'arbre automatiquement.
- Prévoir une transition fluide entre la jungle et la partie basse ; **ne pas supprimer `ground.webp`** ni recadrer les images sources avant prototype et contrôle visuel. La suppression du calque de sol n'est qu'une hypothèse de design, conditionnée au raccord réussi.
- Mesurer les hauteurs, cadrages, FPS/ressenti et points de transition à 320/360/768/1280 px et sur **Redmi réel**. Prévoir un repli non animé si le matériel ou `prefers-reduced-motion` l'exige.
- Éviter que Moko soit dupliqué à l'écran pendant le transfert liane → mini-scène ; préserver la navigation et le scroll naturels même pendant les animations.

## 2. Fin de la zone immersive et transition Skills — validées

Skills est publié sur GitHub Pages et validé sur PC et Redmi selon le suivi du projet. Moko saute, lance une Coco normale, combine saut et tir avec `jump_shoot` et regagne sa liane. Son arrivée au niveau du sol, à la fin de la jungle, est définitive. Les notes ci-dessous conservent les décisions de conception de la zone terminée.

Préserver la position de Moko, les arbres, les parallaxes, les animations, Skills, la cinématique et le scroll vertical naturel. La partie basse commence sur le fond sombre existant. Toute extension de la jungle, plateforme supplémentaire ou révision du raccord est exclue de la suite V1.5.

Le logo officiel et le sélecteur FR/EN à drapeaux sont en place. Les nouveaux contenus utiliseront les traductions existantes. Le README public en anglais, ses visuels, l'About GitHub et les topics ont été finalisés manuellement selon le suivi du projet. Le README présent dans cette copie de travail est en français.

### Au-delà du défi / Beyond the Challenge
- Placer cette section après les trois difficultés et avant Skills. Employer les intitulés publics validés et conserver `endgame` comme identifiant technique.
- **FR** · « Jusqu'où oserez-vous aller ? » · « Même après avoir affronté le Roi de l’île, bien des secrets restent à découvrir… »
- **EN** · « How far will you dare to go? » · « Even after the King challenge, many secrets remain to be discovered… »
- Vidéo officielle : https://youtu.be/8Bcc1L_52IE
- Éventuelle capture officielle du boss Pyg uniquement si la communication est validée ; ne pas dévoiler les surprises sans accord.
- Réutiliser le lecteur YouTube déjà présent : miniature locale, iframe lazy-load, lecture automatique muette vers 60 % de visibilité, pause hors champ/onglet, respect du mouvement réduit, lecture manuelle et **une seule vidéo automatique à la fois**.
- Mesurer la sortie d’« Au-delà du défi » sur PC et mobile pour repérer le départ et l’arrivée du saut de Moko, ainsi que son retour en remontant. Conserver la hauteur naturelle des contenus.

### Étape S1 — Entrée de Moko et mini-scène (terminée et validée)
- Positionner Skills à la transition entre le bas de la canopée et la zone légère du site, avec une **fenêtre/scène aux contours intégrés au décor**, non un jeu autonome.
- Sur desktop, prévoir une scène plus large ; sur Redmi, **une zone d'animation compacte et dédiée**, avec commandes séparées et accessibles sans capturer le scroll.
- Réutiliser les **sprites et animations officiels** du jeu ; ne pas substituer d'illustrations générées.
- À l'entrée de Skills : départ depuis la liane → saut vers la mini-scène → atterrissage sur le sol naturel de la jungle → `loot_skill` automatique. Rejouer la collecte après chaque retour effectif à la liane, sans répétition pendant une même visite.
- Organiser le comportement de sortie / retour dans le parcours haut : une seule représentation visible de Moko et état stable au retour.

### Étape S2 — Actions (terminée et validée)
- **Deux commandes visibles seulement :** « Saut » / « Jump » et « Tir Coco » / « Coco Shot ».
- Une pression lance un saut simple. La commande Saut reste indisponible jusqu’au retour au sol.
- Tir Coco joue `shoot` au sol et `jump_shoot` en l’air, avec la trajectoire du saut conservée. La Coco normale part de la main et traverse l’écran vers la droite, devant les contenus, sans effets de feu. En mouvement réduit, elle reste brièvement près de la main.
- Contrôles tactiles d'au moins 44 × 44 px lorsque possible, clavier, focus visible, alternatives réduction du mouvement.
- Assurer bon contraste, cadrage des animations, performances et absence de chevauchement à 320/360 px ; tester physiquement sur Redmi.
- Toute opération Git reste soumise à autorisation explicite.

## 3. Partie basse — contenu additionnel, dans cet ordre de travail

### 3.1 Jalon 1 — Au-delà de la démo

- Insérer une section web classique sous Skills, en dehors de la zone immersive. Présenter les environnements en développement avec des textes courts FR/EN orientés joueurs et sans divulgâcher. Distinguer ce contenu d'« Au-delà du défi » et de la galerie jungle déjà en place.
- Les quatre fichiers WebP originaux existent dans la copie locale d'IslandEvolution-Tech et sont référencés par son HTML. Chemins depuis la racine du site officiel :
  1. Mangrove — `../IslandEvolution-Tech/images/island-evolution/beyond-demo/01-mangrove-exploration.webp`
  2. Tunnel d'ossements menant à l'arène — `../IslandEvolution-Tech/images/island-evolution/beyond-demo/02-temple-bone-tunnel.webp`. Légende validée : « L'antichambre de l'arène » / « The Arena Antechamber ».
  3. Intérieur du temple — `../IslandEvolution-Tech/images/island-evolution/beyond-demo/03-temple-interior-platforming.webp`
  4. Arène — `../IslandEvolution-Tech/images/island-evolution/beyond-demo/04-arena-entrance.webp`
- Après validation, copier les quatre fichiers originaux à l'identique sous `static/images/beyond-demo/`, utiliser `asset()` pour les URLs GitHub Pages et renseigner les dimensions, légendes et alternatives FR/EN. Préserver les images originales, sans retouche ni remplacement. Prévoir le chargement différé.
- Examiner la réutilisation de `CanopyGallery` pour quatre images avec une grille responsive. Réutiliser sa visionneuse si elle convient sans changer le rendu de la galerie existante. Vérifier clavier, tactile, Échap, retour du focus, lisibilité, scroll et raccord à Skills sur PC, petits écrans et Redmi. Exécuter les vérifications et le build du projet.

### 3.2 Jalon 2 — Bêta Android

- Conserver le site statique SvelteKit sur GitHub Pages et la modale FR/EN existante, accessible depuis les deux boutons « Rejoindre la bêta ». En état **À venir**, la modale reste consultable et l'envoi est désactivé (`betaApplicationsOpen = false`). Préserver les états de recrutement **Ouvertes** et **Liste d'attente**, gérés manuellement.
- Garder le pseudo facultatif, l'adresse du compte utilisé sur Google Play (Gmail ou autre) et la case de consentement non précochée. Conserver les validations du formulaire, dont le format de l'adresse, les limites de 254 caractères pour l'adresse et 64 unités UTF-16 pour le pseudo, ainsi que le rejet des caractères de contrôle et des chaînes Unicode mal formées. Une adresse syntaxiquement valide doit encore être confirmée manuellement.
- Préremplir un brouillon `mailto:` vers **moko.islandevolution@outlook.com**, avec objet et corps dans la langue active. Le joueur vérifie et envoie lui-même le message. L'ouverture du brouillon ne constitue pas une réception.
- Utiliser les filtres antispam d'Outlook. Aucun CAPTCHA à ce stade, aucun backend, aucune base de données, aucune API d'envoi ni service externe de formulaire. Aucun stockage côté site ou navigateur, compteur automatique ou accès automatique à Google Play Console. Garder les adresses hors Git et des événements de mesure d'audience. Envisager un service externe avec confirmation automatique uniquement si les fausses candidatures deviennent réellement problématiques.
- Conserver le dialogue accessible et responsive. Recetter le clavier, Échap, le retour du focus et le scroll sur PC et Redmi. Raccorder et tester le lien de confidentialité de la modale avant l'ouverture publique.

**Traitement manuel des candidatures**

1. Recevoir la candidature dans Outlook.
2. L'enregistrer manuellement dans Excel local hors Git avec le statut **À vérifier**.
3. Confirmer manuellement auprès du candidat l'adresse du compte utilisé sur Google Play. Maintenir le statut **À vérifier** tant que l'adresse n'est pas confirmée.
4. Valider la candidature après confirmation de l'adresse, puis sélectionner jusqu'à 20 bêta-testeurs. La réception ou la validation d'une candidature ne garantit pas une place.
5. Ajouter manuellement les participants retenus dans Google Play Console.
6. Gérer manuellement la liste d'attente pour les autres candidats.

Le recrutement peut ouvrir avant que la bêta soit disponible sur Google Play, une fois le verrou ci-dessous levé. Les participants retenus seront contactés au lancement.

**Verrou avant ouverture.** Maintenir « À venir » tant que la politique de confidentialité FR/EN, les informations RGPD requises et les modalités de collecte n'ont pas été validées et publiées. Le passage à « Ouvertes » ou « Liste d'attente » exige en plus une autorisation explicite du responsable du projet. Au jalon 4 RGPD, définir les durées de conservation et les règles de suppression des candidatures dans Outlook et Excel local, y compris pour les dossiers à vérifier, les personnes retenues et la liste d'attente.

### 3.3 Jalon 3 — Contact et Politique de confidentialité

- Sur le fond sombre, proposer **moko.islandevolution@outlook.com**, la [vitrine technique IslandEvolution-Tech](https://steph4477.github.io/IslandEvolution-Tech/) comme lien secondaire, les réseaux officiels confirmés et la politique de confidentialité. Prévoir le lien Confidentialité dans le pied de page et dans la modale.
- Boîte officielle **Moko Island Evolution**, opérationnelle selon le test aller-retour Outlook ↔ Gmail du 18 novembre 2026. Elle remplace définitivement l'adresse Gmail précédemment envisagée et sert de contact officiel pour la bêta, la section Contact et la politique de confidentialité. Le candidat fournit l'adresse du compte utilisé sur Google Play.
- La vitrine technique SvelteKit a migré vers IslandEvolution-Tech et a été reconstruite et publiée selon le suivi du projet. La recherche ciblée dans les sources locales du site officiel n'a repéré aucun lien exact vers l'ancienne racine à remplacer. Le README pointe vers le site officiel.
- Prévoir une route prérendue (proposition : `/confidentialite/`), accessible directement sous le chemin de publication GitHub Pages, avec fond sombre, navigation de retour et système FR/EN existant. Utiliser une mise en page web classique.
- Avant publication de la notice, confirmer l'identité juridique et les coordonnées du responsable du traitement, les données strictement nécessaires, la base légale et la formulation de la case, les destinataires et accès effectifs, les durées de conservation pour candidatures retenues et liste d'attente, ainsi que les conditions de traitement et de transfert via Outlook, Excel local et Google Play Console. Décrire les finalités (candidatures, sélection des 20 testeurs, attente), les droits, leur exercice et le droit de réclamation auprès de la CNIL. Rédiger en langage clair FR/EN sans inventer de faits ou d'engagements.
- Vérifier les réseaux officiels et leurs URLs avec le responsable avant de les afficher. Confirmer la disponibilité et l'acquisition du domaine envisagé `moko-islandevolution.com` si le sujet est repris. Budget 0 € par défaut. En cas d'achat autorisé, planifier DNS, HTTPS, canoniques, sitemap, cartes sociales et redirections.

### Sujet conservé hors des trois jalons — La jungle s'adapte

- Revoir après les jalons l'intérêt d'un court contenu FR/EN sur l'évolution des ennemis selon les performances, déjà évoquée dans la page et le README. Si un complément distinct est validé, réutiliser la capture officielle correspondante et préserver les secrets de progression.


## 4. Mesure d'audience privée — Umami & RGPD
- Préparer **Umami Analytics avec tableau de bord privé**, sans compteur public de visiteurs.
- Évaluer coût réel, hébergement, transferts, fonctionnalités et conformité avant installation ; vérifier la nécessité d'un consentement selon le paramétrage effectif et les règles applicables.
- Si activé : visites, visiteurs, provenance, appareils, pays et **clics CTA bêta**, selon ce qui est disponible et licite ; **jamais d'e-mail dans les événements**.
- Le suivi doit être facultatif pour le fonctionnement du site, sans bloquer contenu ni inscription en cas de script refusé.
- Informer les visiteurs des mesures pertinentes et permettre les contrôles requis.
- Tester sur le site publié après validation ; ne pas exposer le tableau de bord ou des clés.

## 5. SEO, accessibilité, UX et performances — exigences continues

**SEO / découverte**
- Conserver une excellente indexabilité : HTML prérendu utile, titres et meta descriptions, H1/H2/H3, liens internes, canoniques, sitemap, robots, JSON-LD `VideoGame`/`WebSite` pertinents et cartes Open Graph/Twitter avec **visuel officiel**.
- Maintenir la stratégie linguistique réelle : pour deux versions indexables, prévoir URL FR/EN stables et `hreflang` réciproques ; ne pas déclarer de fausses URLs alternatives si le site reste une URL multilingue côté client.
- Ajouter chaque nouvelle route au sitemap et à la stratégie canonique ; contrôler les URLs après éventuel changement de domaine.
- Cohérence du nom **MOKO – ISLAND EVOLUTION** et des liens entre les quatre piliers ; pas de mots-clés forcés ou promesses de classement.

**Accessibilité et composition**
- Viser **WCAG 2.2 AA** avec audit manuel complémentaire (clavier, focus, zoom, écran tactile, lecteur d'écran lorsque possible). Ne pas confondre conformité WCAG et score SEO.
- **Un même axe horizontal de référence** pour les contenus centraux ; blocs élargis quand pertinent, marges symétriques, textes lisibles, pas de grand espace perdu.
- Dégradés sombres translucides cohérents pour les blocs de lecture, contrastes suffisants sur les fonds animés (4,5:1 pour texte normal et 3:1 pour grands textes), sans gros panneaux opaques.
- Préserver les décors, les ratios des médias, les zones tactiles et le scroll. Respecter `prefers-reduced-motion`.

**Performance**
- Prioriser ressources visibles ; lazy-load captures/vidéos hors écran ; surveiller poids, LCP, CLS, INP et scripts.
- Vérifier que la scène immersive ne calcule ni n'anime inutilement hors champ ; ne pas sacrifier les fonctionnalités ni prétendre à une conformité sur la seule base de tests ponctuels.
- Tests PC, tablette, petits mobiles et **Redmi physique** à chaque jalon majeur.

## 6. Documentation publique et recette finale V1.5
- README public et visuels traités. Toute mise à jour du README requiert une validation explicite.
- Recette de bout en bout : parcours immersif → Skills → Au-delà de la démo → Bêta Android → Contact et Confidentialité ; FR/EN, SEO, accessibilité, performances, liens, visionneuses, lecteurs, formulaires et RGPD.
- `npm run check`, tests existants, `npm run build` ; contrôles visuels PC/mobile/Redmi et inspection des ressources réellement publiées.
- Valider les aperçus de partage sociaux après mise en ligne.
- **Proposer** les commits par lots majeurs ; **aucun commit, push ou déploiement sans autorisation explicite**.

---

# V1.6 — Visibilité, communication et recrutement

## 7. Message et identité de l'écosystème
> **Le site officiel raconte l'aventure. La vitrine technique explique comment elle fonctionne. Les réseaux sociaux montrent les nouveautés. Et le jeu permet de les vivre.**

- Définir des renvois cohérents entre jeu, site officiel, portfolio et plateformes sociales, avec des **CTA adaptés à chaque public**.
- Utiliser une identité éditoriale cohérente (nom, visuels, logo, descriptions FR/EN, liens à jour), sans publier les secrets de gameplay.
- Faire de chaque nouveauté significative un point de contact possible : extrait du jeu → contexte sur site officiel → explication technique au portfolio si pertinente → annonce sociale → retour vers la démo.
- Prioriser la qualité et la constance sur quelques canaux adaptés plutôt qu'une multiplication de comptes inactifs.

## 8. Teasers et supports médias — avant ouverture de la bêta
- **Refaire le teaser promotionnel existant** pour présenter le jeu et recruter les joueurs.
- Produire **un teaser du jeu complet destiné à la fin de la démo**, distinct du teaser public.
- Préparer déclinaisons courtes **15 s / 30 s**, formats **verticaux 9:16**, et versions horizontales selon plateforme et besoins.
- Réutiliser captures et séquences fidèles au jeu ; vérifier droits musicaux et visuels ; éviter spoilers et HUD lorsque cela nuit à la promotion.
- Garder les trois vidéos éditoriales officielles associées à leurs sections : intro bateau, difficultés, Au-delà du défi / Beyond the Challenge ; ne pas les confondre avec les nouveaux teasers à produire.

## 9. Press kit FR/EN et matériel de diffusion
- Press kit téléchargeable : logo, visuel officiel, captures de jeu, teasers, descriptions courte et longue, genres, plateformes, état du développement, coordonnées et liens de l'écosystème.
- Préparer des présentations adaptées **joueurs / médias / créateurs / recruteurs techniques**, sans mélanger les messages.
- Vérifier l'uniformité des informations entre site officiel, portfolio, GitHub, YouTube, Google Play et réseaux sociaux.

## 10. Campagne organique et recrutement
- Constituer une liste ciblée de **médias indépendants, créateurs, communautés Godot et communautés de joueurs**, en France et à l'international.
- Préparer des messages FR/EN personnalisés ; candidater aux présentations/annuaires gratuits pertinents.
- Planifier des publications : découverte du jeu, comportement évolutif des ennemis, coulisses techniques, teaser, ouverture bêta, retours des testeurs, progrès du jeu.
- Recruter **20 bêta-testeurs Google Play** et gérer manuellement la liste d'attente selon le processus V1.5 ; suivre la provenance des candidatures dans Excel local et les clics de navigation dans Umami si activé légalement.
- Évaluer trafic, provenance, inscriptions confirmées, participation réelle et retours pour adapter les canaux.
- Pistes facultatives : Shorts/Reels/TikTok, mini-devlogs, défi King sans spoiler, collaborations et relais communautaires ; **pas de publicité payante sans accord**.

## 11. Préparer et exploiter la bêta Google Play
- Vérifier les conditions de test en vigueur dans Google Play Console et finaliser la piste Android appropriée.
- Finaliser APK/AAB et fiche Play : captures officielles, textes FR/EN, visuels, classification, données/confidentialité et déclarations requises.
- Préparer invitation, installation, retour de bugs, consentements et demandes de retrait.
- Pendant le test : suivre les participants, appareils, crashs, commandes, sauvegardes, progression, difficultés, performances et satisfaction ; prioriser corrections vérifiées.
- Synthétiser les résultats avant diffusion élargie ; mettre à jour les contenus publics seulement avec informations confirmées.

---

# Règles opérationnelles pour Astra — économie de tokens et maîtrise Git

1. **Petite correction UI/CSS :** ne pas relire la roadmap ; prompt ciblé, tests adaptés, modifications locales.
2. **Nouvelle section ou fonctionnalité :** lire seulement les passages concernés de ce fichier, puis les composants existants nécessaires.
3. **Nouveau chat Astra / changement de phase / refonte d'architecture :** lecture complète autorisée et pertinente.
4. **Chaque intervention :** périmètre explicite, préservation des changements locaux, contrôles et rapport concis ; pas de travaux additionnels non sollicités.
5. **Git :** ne jamais créer de commit, push ou déploiement par défaut. Je propose un jalon majeur cohérent, puis l'utilisateur l'autorise explicitement.
6. **Avant tout changement structurel majeur** (bornage du décor, transfert de Moko, deuxième page), produire un diagnostic/prototype réversible et obtenir validation.
7. Tenir à jour les décisions validées et les travaux restants dans cette roadmap.

## Ordre immédiat d'exécution

1. Faire valider le plan « Au-delà de la démo » et les quatre légendes FR/EN. Intégrer puis recetter ce jalon indépendamment.
2. Recetter la modale Bêta Android et le verrou d'envoi en état « À venir ». Valider le processus manuel avant toute ouverture.
3. Intégrer Contact, le pied de page et la Politique de confidentialité. Valider les informations juridiques et les liens officiels avant publication.
4. Effectuer la recette finale V1.5, puis poursuivre les travaux de visibilité et de recrutement V1.6. Garder Umami et les compléments éditoriaux dans leurs périmètres respectifs.
