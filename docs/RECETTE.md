# Recette du prototype

## Vérifications exécutées

Les commandes `node --check app.js`, `node --check data.js` et `node --test tests/prototype.test.cjs` ont réussi.

**9 tests de logique réussis :**

1. Navigation, recherche sans accents, catégories et page introuvable.
2. Filtre par ville, tri des prix et indication des frais à préciser.
3. Création du profil, publication, modification, persistance et masquage d’une offre.
4. Demande d’acheteur, historique local et réponse vendeur.
5. Filtrage des prestataires par destination et vérification simulée.
6. Orientation de l’assistant : avion vers la Belgique, absence de couverture vers l’Australie et service numérique.
7. Affichage des textes saisis comme texte, sans transformer une saisie en HTML actif.
8. Reprise après un stockage corrompu et indication explicite d’un échec de sauvegarde.
9. Suppression d’une offre locale et remise à zéro sans suppression des données d’exemple.

## Limite de cette validation

Le banc de tests exécute le JavaScript avec un DOM minimal simulé. Ce ne sont pas des tests de bout en bout dans Chrome ou Firefox. Le navigateur distant de test n’a pas pu ouvrir l’aperçu local et un navigateur local n’a pas pu être installé dans l’environnement. Aucun résultat de contrôle visuel ou mobile n’est donc revendiqué.

## Recette manuelle à effectuer

| Contrôle | Résultat attendu | Statut |
| --- | --- | --- |
| Ouvrir `index.html` après extraction | Accueil, illustration et navigation visibles | À confirmer |
| Largeur 390 px | Aucun débordement global, menu mobile utilisable, formulaires lisibles | À confirmer |
| Largeur 1440 px | Grilles lisibles, aucun texte coupé ou superposé | À confirmer |
| Clavier uniquement | Focus visible, liens et boutons accessibles, fermeture de la fenêtre par Échap | À confirmer |
| Formulaire incomplet ou e-mail invalide | Enregistrement empêché avec indication du champ | À confirmer |
| Photo JPG/PNG/WebP valide | Aperçu de la photo dans l’offre enregistrée | À confirmer |
| Fichier invalide ou supérieur à 500 Ko | Message d’erreur sans fausse confirmation | À confirmer |
| Rechargement du même navigateur | Profil, offres et messages locaux conservés | À confirmer dans un navigateur réel |
| Navigation privée ou stockage bloqué | Message d’échec, pas de promesse de persistance | À confirmer dans un navigateur réel |
| Téléchargement JSON | Fichier lisible contenant uniquement les données locales | À confirmer |
| Appareil distinct | Aucune synchronisation attendue ; données fictives initiales seulement | Comportement voulu |

La suppression des données locales est irréversible depuis le prototype. Un export JSON est proposé avant remise à zéro ; sa réimportation n’est pas encore implémentée.
