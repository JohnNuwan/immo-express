# Architecture de la Base de Données (SQLite)

Le backend d'Immo-Express utilise **SQLite3** (`better-sqlite3` en mode WAL) pour assurer d'excellentes performances locales avec un faible overhead de maintenance.

Le fichier de base de données physique se trouve par défaut dans `backend/data/database.sqlite` (ou selon la configuration).

---

## Modèle de Données (Schéma)

### 1. Table `users`
Stocke les profils des utilisateurs (propriétaires, locataires, agences).

| Colonne      | Type    | Description                           |
|--------------|---------|---------------------------------------|
| `id`         | INTEGER | Clé primaire (Auto-increment)         |
| `email`      | TEXT    | Identifiant unique de connexion       |
| `password`   | TEXT    | Hash du mot de passe                  |
| `nom`        | TEXT    | Nom de famille                        |
| `prenom`     | TEXT    | Prénom                                |
| `telephone`  | TEXT    | Numéro de contact                     |
| `role`       | TEXT    | 'user' ou 'admin'                     |
| `created_at` | TEXT    | Date d'inscription                    |

---

### 2. Table `biens`
Stocke les annonces immobilières (Vente ou Location).

| Colonne        | Type    | Description                                      |
|----------------|---------|--------------------------------------------------|
| `id`           | INTEGER | Clé primaire                                     |
| `titre`        | TEXT    | Titre de l'annonce                               |
| `description`  | TEXT    | Description détaillée                            |
| `prix`         | REAL    | Valeur numérique du prix                         |
| `cat`          | TEXT    | 'vente' ou 'location'                            |
| `type`         | TEXT    | 'appartement', 'maison', 'villa', 'loft'...      |
| `surface`      | REAL    | Surface en m²                                    |
| `pieces`       | INTEGER | Nombre total de pièces                           |
| `chambres`     | INTEGER | Nombre de chambres                               |
| `location`     | TEXT    | Code Postal + Ville condensée (ex: Paris 75008)  |
| `ville`        | TEXT    | Ville                                            |
| `code_postal`  | TEXT    | Code INSEE ou Postal                             |
| `trustScore`   | INTEGER | Score de confiance / de vérification du bien     |
| `smartMatch`   | INTEGER | % de match avec les critères de marché locaux    |
| `user_id`      | INTEGER | Foreign Key vers la table `users`                |

---

### 3. Table `contacts`
Stocke les messages de prospection et leads générés par le formulaire de contact des annonces.

| Colonne      | Type    | Description                           |
|--------------|---------|---------------------------------------|
| `id`         | INTEGER | Clé primaire                          |
| `bien_id`    | INTEGER | FK vers le bien ciblé par le lead     |
| `nom`        | TEXT    | Nom du prospect                       |
| `email`      | TEXT    | Email de contact                      |
| `telephone`  | TEXT    | Téléphone de contact                  |
| `message`    | TEXT    | Contenu du message                    |
| `lu`         | INTEGER | 0 = non lu, 1 = lu (Dashboard Pro)    |
| `created_at` | TEXT    | Horodatage                            |

---

### 4. Table `api_cache`
Système de proxy pour les requêtes OpenData (Géorisques & API Adresse) pour de hautes performances.

| Colonne         | Type    | Description                                      |
|-----------------|---------|--------------------------------------------------|
| `id`            | INTEGER | Clé primaire                                     |
| `endpoint`      | TEXT    | URL complète exacte appelée                      |
| `response_data` | TEXT    | Payload JSON brut de l'API Gouvernementale       |
| `created_at`    | TEXT    | Date d'insertion                                 |
| `updated_at`    | TEXT    | Dernière mise à jour du cache                    |

> **Mécanisme de Cache** : La table `api_cache` agit comme un middleware ultra-rapide. Si le champ `updated_at` date de moins de 30 jours, l'API renvoie la donnée mise en cache (Cache HIT) sans jamais contacter les serveurs de l'État, garantissant un SLA de 99.9%.
