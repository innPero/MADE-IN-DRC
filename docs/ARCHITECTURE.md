# Architecture et évolution de Made in DRC

## 1. Le prototype livré

Une application statique sans dépendance de fonctionnement. `index.html` charge `data.js` et `app.js`. La navigation repose sur le fragment de l’URL (`#/catalogue`, `#/produit/cafe`, etc.), ce qui évite une configuration de réécriture côté serveur.

L’interface utilise HTML, CSS et JavaScript natifs. Les illustrations sont des SVG originaux intégrés au code. Aucune police distante, bibliothèque externe, mesure d’audience ou requête réseau applicative n’est nécessaire.

Les saisies sont enregistrées sous la clé `made-in-drc.demo.v1` dans `localStorage`. Une copie du nouvel état n’est adoptée qu’après la réussite de l’enregistrement. Les erreurs de quota ou de permission sont affichées à l’utilisateur.

### Modèle local

| Objet | Champs principaux |
| --- | --- |
| Profil vendeur | Identifiant local, nom, activité, ville, présentation, e-mail, téléphone, statut non vérifié |
| Offre | Identifiant, vendeur, nom, catégorie, type, prix USD ou devis, unité, minimum, description, détails, photo, visibilité |
| Demande | Destinataire, offre/service, acheteur de démonstration, destination, quantité, messages, date |
| Partenaire | Nom fictif, service, ville, régions de démonstration, vérification simulée |
| Conversation assistant | Question, réponse guidée, références vers les partenaires fictifs |

Les limites locales sont de 100 offres, 200 demandes, 100 messages par demande et 50 messages conservés pour l’assistant. Elles évitent une croissance illimitée de la démonstration ; la capacité réelle dépend du navigateur et des photos ajoutées.

Il n’y a ni session authentifiée, ni séparation des utilisateurs, ni chiffrement applicatif du stockage local. Toute personne utilisant le même profil de navigateur peut voir les données de démonstration. Les identités et coordonnées saisies doivent rester fictives.

## 2. Comportement de l’assistant

Le prototype reconnaît certains mots et destinations. Il propose des étapes générales et sélectionne uniquement des fiches de démonstration ayant un statut de vérification simulée et une couverture compatible avec les critères repérés. Pour une destination non couverte explicitement reconnue, il indique l’absence de prestataire. Pour une question imprécise, il demande le produit, la destination, le volume et le délai.

Il ne s’agit pas d’un modèle d’intelligence artificielle. L’analyse des négations, les conversations complexes, la couverture complète des pays et les citations de documents ne sont pas implémentées.

## 3. Proposition pour la version connectée

À valider avant de choisir les fournisseurs techniques et les engagements commerciaux.

| Composant | Responsabilité |
| --- | --- |
| Interface web | Recherche, profils, demandes, tableau de bord, interface FR/EN |
| API applicative | Validation serveur, droits d’accès, offres, messages, demandes de devis |
| Base relationnelle | Utilisateurs, entreprises, offres, conversations, prestataires, contrôles |
| Stockage des médias | Photos, formats adaptés, accès privé aux documents justificatifs |
| Authentification | Inscription, connexion, récupération, autorisations selon le rôle |
| Administration | Modération, contrôle documentaire, validation/révocation et suivi des signalements |
| Service d’orientation | Recherche dans le catalogue de prestataires, sources identifiées, IA côté serveur si retenue |
| Notifications | Envoi autorisé, contrôle anti-abus, suivi des erreurs |

### Rôles et règles indispensables

- **Acheteur** : découvrir les offres, envoyer une demande et consulter ses propres échanges.
- **Vendeur** : gérer uniquement ses offres et répondre uniquement aux demandes qui le concernent.
- **Prestataire** : tenir sa fiche et répondre aux demandes logistiques qui lui sont adressées.
- **Administrateur** : examiner les dossiers, modérer et attribuer les statuts de vérification avec date et trace du contrôle.

Un vendeur ou prestataire ne doit jamais pouvoir s’attribuer lui-même un badge de vérification. Le contrôle des droits doit être appliqué sur le serveur, même si l’interface masque certaines actions.

### Ressources API proposées, non implémentées

| Ressource | Exemple d’opération |
| --- | --- |
| `/products` | Consulter les offres publiques, publier avec un compte vendeur |
| `/products/:id` | Lire, modifier ou archiver une offre selon les droits |
| `/sellers/:id` | Consulter la vitrine professionnelle |
| `/inquiries` | Créer une demande avec destinataire validé |
| `/conversations/:id/messages` | Lire et écrire selon l’appartenance à la conversation |
| `/partners` | Filtrer des partenaires réellement contrôlés par service et trajet |
| `/assistant` | Orienter à partir des données autorisées, sans exposer de secret au navigateur |
| `/admin/verifications` | Examiner et documenter une vérification |

## 4. Ordre de réalisation proposé

1. **Valider le prototype** avec des vendeurs, artisans, producteurs et acheteurs potentiels ; tester les sept écrans et les besoins d’information.
2. **Connecter les comptes et les données** : authentification, base, stockage photos, autorisations et validation serveur.
3. **Activer les échanges** : messagerie, demandes de devis, notifications, signalements et modération.
4. **Constituer l’annuaire réel** : critères de contrôle, dossiers des prestataires, services, trajets, date et portée des vérifications.
5. **Connecter l’assistant** au répertoire réel, puis éventuellement à un modèle ; citer ses sources, prévoir l’absence de réponse fiable et le transfert vers un interlocuteur humain.
6. **Préparer le pilote** : sauvegardes, accessibilité, mobile, performances sur faible connexion, confidentialité et essais avec utilisateurs autorisés.

Les paiements intégrés, la garantie des transactions et l’organisation directe du transport ne sont pas inclus dans cette version. Ils nécessitent un cadrage séparé. Le service peut démarrer comme plateforme de visibilité et de mise en relation.
