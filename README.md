# MADE IN DRC

**La marketplace numérique qui connecte la production congolaise au marché international.**

> Le Congo crée. Le monde découvre.

Ce dépôt contient un **prototype interactif**, en français, du parcours de découverte, de mise en relation et d’orientation logistique décrit dans le projet Made in DRC.

**Statut : démonstration locale, pas une marketplace en production.** Les entreprises, partenaires, offres, prix et vérifications fournis sont fictifs. Les illustrations ne sont pas des photographies de produits réels.

## Ouvrir le prototype

1. Sur GitHub, cliquez sur **Code → Download ZIP**.
2. Extrayez entièrement le dossier ZIP.
3. Ouvrez **index.html** dans un navigateur récent.

Pas d’installation, pas d’abonnement et pas de clé API nécessaires. Les fichiers doivent rester dans le même dossier. Après téléchargement, le prototype peut fonctionner sans connexion Internet.

Pour un stockage plus prévisible pendant le développement, ouvrez un terminal dans le dossier du projet et lancez :

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Ouvrez ensuite `http://127.0.0.1:8000`. Gardez le même navigateur et la même adresse pour retrouver les données enregistrées. Certains navigateurs limitent le stockage des pages ouvertes directement comme fichiers ; l’application affiche une erreur si elle ne peut pas enregistrer.

## Les sept écrans

| Écran | Ce que vous pouvez tester |
| --- | --- |
| Accueil | Recherche, catégories, sélection d’offres, entrée vendeur |
| Marketplace | Recherche sans accents, filtres par catégorie, ville et type, tri par prix ou nom |
| Produit | Illustration ou photo ajoutée, description, prix, commande minimale, contact et aide logistique |
| Profil vendeur | Présentation, ville, coordonnées de démonstration, statut et offres |
| Annuaire des partenaires | Filtres par service, destination et ville ; statut de vérification simulé |
| Assistant | Orientation locale vers des étapes et des fiches fictives selon le besoin |
| Espace vendeur | Création du profil local, ajout/modification/masquage/suppression d’offres, demandes et réponses |

Un historique complémentaire conserve les demandes préparées dans le navigateur, y compris celles adressées aux fiches d’exemple.

## Démonstration en cinq minutes

1. Sur l’accueil, recherchez **cafe** : l’offre « Café arabica » doit apparaître.
2. Consultez le produit puis **Contacter le vendeur**. Utilisez `acheteur@example.com` et une demande fictive. Consultez ensuite l’historique. Aucun message n’est envoyé.
3. Ouvrez l’assistant et demandez : **Je souhaite envoyer un échantillon par avion en Belgique.** L’assistant propose la fiche aérienne fictive.
4. Dans **Espace vendeur**, créez un profil avec `vendeur@example.com`, puis ajoutez une offre. Une image PNG, JPG ou WebP de 500 Ko maximum peut être choisie ; sinon une illustration s’affiche.
5. Retrouvez votre offre dans le catalogue, préparez une demande sur celle-ci, puis ouvrez **Espace vendeur → Demandes & conversations** pour enregistrer une réponse locale.
6. Rechargez la page : vos données doivent rester présentes. Vous pouvez les exporter au format JSON depuis l’espace vendeur. Il n’existe pas encore d’import de cet export.

## Périmètre réel

| Disponible dans ce dépôt | À développer pour le service réel |
| --- | --- |
| Interface responsive en HTML/CSS/JavaScript | Validation visuelle complète sur appareils réels |
| Profil enregistré sur un appareil | Comptes, connexion et récupération de mot de passe |
| Catalogue local et photos locales | Base de données et stockage partagé des photos |
| Messages enregistrés dans le navigateur | Messagerie entre utilisateurs et notifications |
| Assistant déterministe à règles locales | IA connectée au catalogue, avec sources et contrôle des réponses |
| Vérifications explicitement simulées | Contrôle documentaire et validation par l’équipe |
| Demandes de devis fictives | Partenaires réels et confirmation de leur couverture |
| Aucun paiement | Modalités transactionnelles à définir ; l’intermédiation reste le cœur du projet |

Le prototype ne garantit ni transaction, ni qualité, ni livraison. Il ne calcule pas de taxes ou tarifs douaniers. L’équipe devra faire confirmer les exigences applicables au produit et à sa destination par les interlocuteurs compétents.

## Structure des fichiers

| Fichier | Rôle |
| --- | --- |
| `index.html` | Structure commune, navigation et fenêtre de prise de contact |
| `styles.css` | Identité graphique et adaptations de mise en page |
| `data.js` | Catalogue, vendeurs et prestataires fictifs |
| `app.js` | Routes, écrans, formulaires, stockage, assistant et illustrations vectorielles |
| `assets/mark.svg` | Signe graphique du prototype |
| `tests/prototype.test.cjs` | Tests de logique avec un environnement DOM minimal simulé |
| `docs/ARCHITECTURE.md` | Architecture actuelle et étapes vers le service réel |
| `docs/RECETTE.md` | Résultats des tests et contrôles manuels à effectuer |
| `package.json` | Commandes facultatives de vérification ; aucune dépendance |
| `.nojekyll` | Compatibilité avec un hébergement statique GitHub Pages |

## Tests

Avec Node.js 20 ou ultérieur :

```bash
npm run check
npm test
```

`npm install` n’est pas nécessaire : les tests utilisent uniquement les modules natifs de Node.js. **9 tests de logique passent.** Ils couvrent notamment recherche, filtres, création et modification d’offres, persistance, demandes/réponses, orientation, échappement HTML et échec du stockage.

Ces tests utilisent un DOM minimal simulé : ils ne valident pas le rendu, l’accessibilité complète ni l’import d’images dans un véritable navigateur. Le navigateur de test disponible n’a pas pu accéder à l’aperçu local. La recette visuelle sur ordinateur et téléphone reste donc à effectuer ; voir `docs/RECETTE.md`.

## Mise en ligne

Le dépôt inclut un workflow GitHub Actions (`.github/workflows/deploy-pages.yml`) qui publie automatiquement le prototype sur GitHub Pages à chaque push sur `main`, et peut aussi être lancé manuellement.

Pour activer la publication :

1. Ouvrez **Settings → Pages** dans GitHub.
2. Dans **Build and deployment**, choisissez **Source: GitHub Actions**.
3. Poussez sur `main` (ou lancez le workflow manuellement) puis récupérez l’URL publiée sur la page **Actions** ou **Pages**.

Ne placez jamais de clés privées, mots de passe ou documents professionnels confidentiels dans ce dépôt ou dans le JavaScript envoyé au navigateur.

## Principe central

**Découverte → Mise en relation → Assistance → Logistique.**

Made in DRC crée le pont numérique permettant aux acheteurs internationaux de découvrir la production congolaise, de contacter ses acteurs et de préparer leurs échanges.
