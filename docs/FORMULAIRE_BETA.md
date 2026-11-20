# Formulaire bêta Android

L’accueil ouvre `BetaApplicationDialog.svelte` depuis l’en-tête, le visuel d’accueil ou `BetaLaunchSection.svelte`. `betaApplicationsOpen` dans `src/lib/beta-application.ts` détermine l’état des candidatures. Le formulaire explique que 20 joueurs sont sélectionnés et que les autres peuvent rejoindre la liste d’attente.

## Entrées et états

| Entrée                                     | Validation                                                                                                                                                                |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pseudo                                     | Facultatif, 64 caractères au plus, rejet des caractères de contrôle et autres caractères non admis.                                                                       |
| E-mail Google Play                         | Obligatoire, 254 caractères au plus et domaine complet avec une extension. Le champ natif `type="email"` aide à la saisie. `trimBetaEmail` retire les espaces en bordure. |
| Appareil Android avec Google Play          | Confirmation obligatoire.                                                                                                                                                 |
| Lecture de la politique de confidentialité | Confirmation obligatoire et lien vers la page dans la langue sélectionnée.                                                                                                |

Une adresse comme `demo@example.org` peut être acceptée. `test@example`, `test@` et une adresse avec des espaces internes sont invalides. Les formats non-Gmail sont autorisés. Les niveaux de validation sont l’interface dans le composant et les règles communes dans `validateBetaApplication`. Les erreurs sont associées au champ avec `aria-describedby` et signalées avec `aria-invalid`. L’erreur e-mail utilise une zone d’annonce polie. À la validation, le focus va au premier champ ou à la première case en erreur. Fermer la modale réinitialise les entrées et rend le focus au bouton d’ouverture.

## Brouillon dans la messagerie

`betaApplicationDestination` vérifie l’ouverture des candidatures. `buildBetaMailto` revalide les données et encode le sujet et le corps en FR ou EN. Le brouillon vise `moko.islandevolution@outlook.com` et contient le pseudo ou sa valeur de remplacement, l’adresse Google Play et les deux confirmations. En cas d’erreur la destination est absente. Le bouton transmet l’URL `mailto:` à la messagerie configurée dans l’appareil. L’utilisateur relit et envoie lui-même le brouillon.

Les textes de la modale sont dans `translations.fr.betaApplication` et `translations.en.betaApplication` dans `src/lib/i18n.ts`. La confirmation Android et le contenu du brouillon sont dans `src/lib/beta-application.ts`. Les messages d’erreur affichent des exemples sur le domaine réservé `example.org` en texte simple.

## Refaire les contrôles

```powershell
node --test tests/beta-application.test.mjs
```

La suite vérifie les domaines, les limites, les espaces, les deux cases, les caractères interdits, le destinataire et le texte exact des brouillons des deux langues. Dans le navigateur, essayer `test@example`, vérifier l’annonce d’erreur et le focus, puis changer de langue et répéter. Un test d’ouverture native s’effectue avec une adresse de démonstration et s’arrête au brouillon.

Si aucune application ne répond à `mailto:`, vérifier l’application de messagerie par défaut et les erreurs du formulaire. Une candidature est ensuite suivie manuellement dans un outil de suivi interne. Le site et ce guide n’intègrent aucune donnée réelle de candidature.
