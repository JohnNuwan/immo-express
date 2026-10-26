# Immo-Express 🏠 ⬡

**Plateforme immobilière intelligente** — Propulsée par EVA · NODUS SYSTEMS

Immo-Express connecte directement vendeurs et acheteurs, particuliers et professionnels. Architecture IA NODUS — scoring intelligent, annonces vérifiées, mise en relation directe.

---

## ✨ Fonctionnalités NODUS

| # | Fonctionnalité | Description |
|---|----------------|-------------|
| 🛡️ | **Score de confiance IA** | Algorithme NODUS 7 critères (surface, DPE, année, emplacement, équipements, étage, prix/m²) |
| 📊 | **Analyse IA du prix** | Comparaison automatique avec le marché local français |
| 🤖 | **Assistant IA NODUS** | Chatbot intelligent intégré, réponses instantanées |
| 📱 | **Dashboard** | Statistiques temps réel : annonces, vues, contacts, scorings |
| 🔐 | **Authentification JWT** | Connexion sécurisée, profils utilisateurs, rôles (admin, agent, particulier) |
| 📝 | **Dépôt d'annonce** | Formulaire complet en 8 sections avec upload photos |
| 🔍 | **Recherche avancée** | Filtres multiples, tri (prix, score, date), pagination |
| 🐳 | **Docker ready** | Déploiement one-command avec docker-compose |
| 🎨 | **Design NODUS** | Dark mode, #14141a / #e64749 / #00f0ff, Space Grotesk + JetBrains Mono |

---

## 🚀 Déploiement

### Avec Docker (recommandé)

```bash
docker compose up -d
# → http://localhost:3000
```

### Sans Docker

```bash
cd backend
npm install
npm run seed    # Crée les comptes de démo + annonces
npm start
# → http://localhost:3000
```

### Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| 👑 Admin | `admin@nodus.systems` | `admin123` |
| 🤖 Agent | `agent@immo.express` | `agent123` |
| 👤 Utilisateur | `user@test.fr` | `user123` |

---

## 📁 Structure du projet

```
immo-express/
├── index.html            # Page d'accueil — thème NODUS
├── dashboard.html        # Dashboard utilisateur
├── vente.html            # Page achat
├── scoring.html          # Scoring immobilier
├── location.html         # Location
├── pro.html              # Espace professionnel
├── risques.html          # Risques géographiques
│
├── css/
│   └── style.css         # Design System NODUS (41Ko)
│
├── js/
│   ├── app.js            # Application principale
│   └── auth.js           # Module auth (compatibilité)
│
├── backend/              # API REST Node.js
│   ├── package.json
│   ├── src/
│   │   ├── server.js     # Entry point Express
│   │   ├── db.js         # SQLite + queries
│   │   ├── seed.js       # Données de démonstration
│   │   ├── middleware/
│   │   │   └── auth.js   # JWT auth middleware
│   │   └── routes/
│   │       ├── auth.js   # /api/auth (login, register, profile)
│   │       ├── biens.js  # /api/biens (CRUD + filtres)
│   │       ├── scoring.js# /api/scoring (algorithme IA)
│   │       └── contact.js# /api/contact (formulaire)
│   └── data/             # SQLite database (gitignored)
│
├── Dockerfile            # Multi-stage Node.js 22 Alpine
├── docker-compose.yml    # Backend + Nginx
├── nginx.conf            # Proxy inverse + cache + sécurité
│
├── assets/               # Icônes, images
├── docs/                 # Documentation
├── CHANGELOG.md          # Historique des versions
└── README.md             # Ce fichier
```

---

## 🛠️ API REST

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `POST` | `/api/auth/register` | — | Inscription |
| `POST` | `/api/auth/login` | — | Connexion |
| `GET` | `/api/auth/me` | ✅ | Profil utilisateur |
| `PUT` | `/api/auth/profile` | ✅ | Mise à jour profil |
| `GET` | `/api/biens` | — | Liste des biens (filtres) |
| `POST` | `/api/biens` | ✅ | Créer une annonce |
| `GET` | `/api/biens/:id` | — | Détail d'un bien |
| `PUT` | `/api/biens/:id` | ✅ | Modifier un bien |
| `DELETE` | `/api/biens/:id` | ✅ | Supprimer un bien |
| `POST` | `/api/scoring` | ✅ | Calcul score IA |
| `POST` | `/api/scoring/public` | — | Score public simplifié |
| `POST` | `/api/contact` | — | Envoyer un message |
| `GET` | `/api/stats` | — | Statistiques globales |
| `GET` | `/api/health` | — | Health check |

### Exemple de requête

```bash
# Rechercher des appartements à Lyon entre 200k et 500k
curl "http://localhost:3000/api/biens?city=Lyon&type=appartement&minPrice=200000&maxPrice=500000"

# Se connecter
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.fr","password":"user123"}'
```

---

## 🎨 Design System NODUS

| Token | Valeur |
|-------|--------|
| `--nodus-bg` | `#14141a` — Fond sombre profond |
| `--nodus-accent` | `#e64749` — Rouge signature |
| `--nodus-cyan` | `#00f0ff` — Cyan lumineux |
| `--font-display` | `Space Grotesk` — Titres |
| `--font-mono` | `JetBrains Mono` — Données |

---

## 📊 API Overview

| Source | Détail |
|--------|--------|
| Particuliers | Gratuit (annonces + outils IA de base) |
| Pros (abonnement) | 49 € – 199 € / mois selon fonctionnalités |
| Mise en avant | Annonces sponsorisées |
| API | Accès aux données pour intégration |
| Partenariats | Courtiers, déménageurs, artisans |

---

## 💡 Business Model

- **GitHub (original)** : https://github.com/Robrs-superbot/immo-express
- **Fork (développement)** : https://github.com/JohnNuwan/immo-express
- **PR #3** : https://github.com/Robrs-superbot/immo-express/pull/3
- **Site** : https://immoexpress.app

---

## 🔐 Security

Projet privé — Tous droits réservés © 2025

⬡ **Powered by EVA · NODUS SYSTEMS** — v2.0