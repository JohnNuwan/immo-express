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
- **Description** : Envoie une demande de contact ou réservation de visite à un propriétaire/pro (soumis au Rate Limiter anti-spam).
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

---

### 6. Upload de Photos & Favoris (Authentifié)

#### **`POST /api/biens/upload`**
- **Description** : Téléverse une photo de bien immobilier au format base64.
- **En-têtes** : `Authorization: Bearer <token>`
- **Body (`JSON`)** :
  ```json
  {
    "image": "data:image/png;base64,iVBORw0KGgoAAAAN..."
  }
  ```
- **Réponse (`201 Created`)** :
  ```json
  {
    "message": "Photo téléversée avec succès",
    "url": "/uploads/1723180000_a1b2c3.png"
  }
  ```

#### **`GET /api/favorites`**
- **Description** : Récupère la liste des biens mis en favoris par l'utilisateur connecté.
- **En-têtes** : `Authorization: Bearer <token>`
- **Réponse (`200 OK`)** : Tableau des biens favoris.

#### **`POST /api/favorites/:bienId`**
- **Description** : Ajoute un bien aux favoris de l'utilisateur connecté.
- **En-têtes** : `Authorization: Bearer <token>`

#### **`DELETE /api/favorites/:bienId`**
- **Description** : Retire un bien des favoris de l'utilisateur connecté.
- **En-têtes** : `Authorization: Bearer <token>`

---

### 7. Sécurité & En-têtes Rate Limiting

Les routes sensibles (`/api/auth/login`, `/api/auth/register`, `/api/contact`) retournent les en-têtes suivants :
- `X-RateLimit-Limit` : Nombre maximal de requêtes par fenêtre (ex: `15`)
- `X-RateLimit-Remaining` : Requêtes restantes dans la fenêtre
- `X-RateLimit-Reset` : Timestamp Unix de réinitialisation
- **Code `429 Too Many Requests`** en cas de dépassement de la limite.
