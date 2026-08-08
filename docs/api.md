# Documentation API REST — Immo-Express

L'API REST d'Immo-Express est développée avec **Node.js, Express et SQLite**. Elle est hébergée par défaut sur `http://localhost:8000`.

---

## 📡 Endpoints publics

### 1. Santé du serveur
- **`GET /api/health`**
- **Description** : Vérifie l'état de fonctionnement de l'API.
- **Réponse (`200 OK`)** :
  ```json
  {
    "status": "ok",
    "timestamp": "2026-08-08T18:00:00.000Z"
  }
  ```

---

### 2. Catalogue des biens immobiliers

#### **`GET /api/biens`**
- **Description** : Récupère la liste des annonces immobilières.
- **Paramètres Query optionnels** :
  - `type` : `appartement`, `villa`, `loft`, `studio`, `maison`
  - `ville` : recherche par nom de ville (ex: `Paris`)
  - `statut` : `disponible`, `vendu`, `loué`
  - `min_prix` / `max_prix` : filtres de budget
  - `min_surface` / `max_surface` : filtres de surface
- **Réponse (`200 OK`)** :
  ```json
  [
    {
      "id": 1,
      "titre": "Appartement d'exception Haussmannien",
      "prix": 685000,
      "priceLabel": "685 000 €",
      "priceSub": "8 058 €/m²",
      "surface": 85,
      "cat": "vente",
      "type": "appartement",
      "location": "Paris 8e (75008)",
      "pieces": 4,
      "chambres": 2,
      "sdb": 1,
      "etage": 3,
      "publisher": "pro",
      "pubName": "Agence Opéra Prestige",
      "trustScore": 94,
      "verified": 1,
      "smartMatch": 96,
      "date": "Aujourd'hui"
    }
  ]
  ```

#### **`GET /api/biens/:id`**
- **Description** : Récupère le détail d'une annonce par son ID.
- **Réponse (`200 OK`)** : Détail complet de l'annonce.
- **Réponse (`404 Not Found`)** : `{ "error": "Bien non trouvé" }`.

---

### 3. Authentification & Comptes

#### **`POST /api/auth/register`**
- **Description** : Inscription d'un nouvel utilisateur.
- **Body (`JSON`)** :
  ```json
  {
    "email": "user@example.com",
    "password": "secretpassword",
    "nom": "Jean Dupont"
  }
  ```
- **Réponse (`201 Created`)** :
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "nom": "Jean Dupont",
      "role": "user"
    }
  }
  ```

#### **`POST /api/auth/login`**
- **Description** : Connexion utilisateur et génération du token JWT.
- **Body (`JSON`)** :
  ```json
  {
    "email": "user@example.com",
    "password": "secretpassword"
  }
  ```

---

### 4. Scoring IA & Estimation

#### **`POST /api/scoring/calculate`**
- **Description** : Calcule le Score de Confiance IA sur 100 points pour un bien.
- **Body (`JSON`)** :
  ```json
  {
    "prix": 450000,
    "surface": 60,
    "ville": "Paris",
    "photos": 8,
    "verifie": true
  }
  ```
- **Réponse (`200 OK`)** :
  ```json
  {
    "score": 92,
    "label": "Excellent",
    "details": {
      "prixCoherence": 28,
      "photoQualite": 25,
      "identiteVerifiee": 20,
      "completude": 19
    }
  }
  ```

---

### 5. Demande de contact & Visites

#### **`POST /api/contact`**
- **Description** : Envoie une demande de contact ou réservation de visite à un propriétaire/pro.
- **Body (`JSON`)** :
  ```json
  {
    "bien_id": 1,
    "nom": "Sophie Martin",
    "email": "sophie@example.com",
    "telephone": "0601020304",
    "message": "Bonjour, je souhaite réserver une visite."
  }
  ```
