# Immo-Express API · EVA · NODUS SYSTEMS

## API REST — Documentation

**Version**: 2.0.0-eva-nodus  
**Base URL**: `http://localhost:8000`  
**Interactive Docs**: `http://localhost:8000/api/docs` (Swagger) ou `/api/redoc`

## Endpoints

### Health
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/health` | Vérification du service |

### Authentification
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Créer un compte |
| POST | `/api/auth/login` | Se connecter |
| GET | `/api/auth/me` | Profil utilisateur (token) |

**Exemple Login:**
```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "monmotdepasse"
}
```

**Réponse:**
```json
{
  "ok": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 1, "email": "user@example.com", "name": "Jean", "role": "user" }
}
```

### Biens (CRUD)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/biens` | Liste des biens (filtres) |
| GET | `/api/biens/{id}` | Détail d'un bien |
| POST | `/api/biens` | Créer un bien (auth) |
| PUT | `/api/biens/{id}` | Modifier un bien |
| DELETE | `/api/biens/{id}` | Supprimer un bien |

**Filtres disponibles:** `category`, `property_type`, `city`, `min_price`, `max_price`, `min_surface`, `sort` (recent|price_asc|price_desc), `skip`, `limit`

### Scoring
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/scoring` | Analyse multi-critères d'un bien |

**Exemple:**
```json
POST /api/scoring
{
  "city": "Paris 11e",
  "property_type": "appartement",
  "category": "vente",
  "price": 425000,
  "surface": 75,
  "pieces": 3,
  "condition": "bon",
  "dpe": "C",
  "etage": 4,
  "equipments": "haut",
  "transports": "excellent"
}
```

### Contact
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/contact` | Envoyer un message |
| GET | `/api/contact` | Liste des messages (admin) |

### Administration (admin uniquement)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/admin/stats` | Statistiques globales |
| GET | `/api/admin/users` | Liste des utilisateurs |
| GET | `/api/admin/biens` | Tous les biens |
| PUT | `/api/admin/biens/{id}/verify` | Vérifier un bien |

## Authentification

Les endpoints protégés nécessitent un header:
```
Authorization: Bearer <token>
```

## Déploiement

```bash
# Avec Docker Compose
docker compose up -d --build

# Manuellement (dev)
cd backend
uv venv && source .venv/bin/activate
uv pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

---

**⚡ Powered by EVA · NODUS SYSTEMS**