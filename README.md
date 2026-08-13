# Immo-Express 🏠

**AI-Powered Real Estate Platform** — Buy, Sell & Rent with Confidence

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Tests](https://img.shields.io/badge/tests-12%2F12-brightgreen.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-2496ED.svg)]()

Immo-Express is a modern, full-stack real estate platform that connects buyers and sellers directly — no middlemen, just pure real estate with AI-powered trust scoring. Built with **Node.js**, **Express**, **SQLite**, and vanilla **JavaScript** with a stunning dark-theme UI.

---

## ✨ Key Features

| # | Feature | Description |
|---|---------|-------------|
| 🛡️ | **AI Trust Score** | Every listing scored out of 100: identity, photos, price, quality |
| 📊 | **AI Price Analysis** | Automatic comparison with local market data |
| 📉 | **Price History** | All price drops displayed transparently |
| 🤝 | **Smart Match** | Compatibility score between property and buyer criteria |
| 📅 | **Visit Booking** | Available slots directly in the listing |
| 🎨 | **AI Decoration** | Visualize property furnished in 4 styles |
| 💬 | **AI Assistant** | Chatbot to guide and answer every question |
| 📝 | **Listing Submission** | Complete form in 8 sections |
| ❤️ | **Favorites** | Save properties, stored locally & on server |
| 📋 | **Recently Viewed** | Navigation history |
| 🔗 | **Sharing** | Link, email, WhatsApp |
| 💰 | **Loan Calculator** | Monthly payment simulation |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+
- **Docker** (optional, for containerized deployment)

### 1️⃣ Clone & Install

```bash
git clone https://github.com/your-repo/immo-express.git
cd immo-express

# Install backend dependencies
cd backend
npm install
cp .env.example .env

# Install frontend build tools
cd ..
npm install
```

### 2️⃣ Start the Backend API

```bash
cd backend
node server.js
# 🚀 Serveur ImmoExpress démarré sur http://localhost:8000
```

### 3️⃣ Start the Frontend (Development)

```bash
# In a new terminal, from the project root
npx vite
# Opens at http://localhost:3000
```

### 4️⃣ Run Tests

```bash
cd backend
npm test
# All 12 tests pass ✓
```

### 5️⃣ Deploy with Docker

```bash
docker compose up -d
# Frontend: http://localhost:80
# API:      http://localhost:8000
```

---

## 📁 Project Structure

```
immo-express/
├── public/                    # Web Root & Frontend App
│   ├── *.html                 # Pages (index, scoring, risks, vente, location, etc.)
│   ├── css/                   # Stylesheets (nodus.css, responsive.css, style.css)
│   ├── js/                    # Client scripts (app.js, auth.js, api.js, components.js)
│   ├── assets/                # Images, icons, data
│   ├── manifest.json          # PWA Manifest
│   └── sw.js                  # Service Worker
├── backend/                   # REST API (Node.js + Express + SQLite)
│   ├── routes/                # API endpoints (auth, biens, scoring, contact, admin, favorites, opendata)
│   ├── middleware/            # JWT auth & rate limiter
│   ├── database.js            # SQLite database setup & seeding
│   ├── server.js              # Express entry point
│   ├── tests/                 # Jest test suite
│   └── seed.js                # Standalone seeder
├── config/
│   └── nginx.conf             # Nginx configuration
├── docs/                      # Technical documentation
├── Dockerfile                 # Frontend container
├── docker-compose.yml         # Multi-service deployment
├── vite.config.js             # Vite bundler config
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3, Vanilla JS ES6+, PWA |
| **Backend** | Node.js + Express |
| **Database** | SQLite (better-sqlite3) |
| **Auth** | JWT (JSON Web Tokens) + bcrypt |
| **Build** | Vite |
| **Container** | Docker + Docker Compose |
| **Mobile** | Capacitor (Android/iOS) |
| **Testing** | Jest + Supertest |

---

## 📊 API Overview

The backend provides a full REST API:

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | - | Health check |
| POST | `/api/auth/register` | Rate-limited | Register new user |
| POST | `/api/auth/login` | Rate-limited | Login |
| GET | `/api/auth/me` | JWT | Get current user |
| PUT | `/api/auth/profile` | JWT | Update profile |
| GET | `/api/biens` | - | List all properties (with filters) |
| GET | `/api/biens/:id` | - | Get property details |
| POST | `/api/biens` | JWT | Create listing |
| PUT | `/api/biens/:id` | JWT | Update listing (owner/admin) |
| DELETE | `/api/biens/:id` | JWT | Delete listing (owner/admin) |
| POST | `/api/biens/upload` | JWT | Upload photo |
| POST | `/api/scoring` | - | AI price scoring simulation |
| POST | `/api/contact` | Rate-limited | Submit contact request |
| GET | `/api/favorites` | JWT | List user's favorites |
| POST | `/api/favorites/:bienId` | JWT | Add to favorites |
| DELETE | `/api/favorites/:bienId` | JWT | Remove from favorites |
| GET | `/api/opendata/proxy` | - | Proxy for open data APIs |
| GET | `/api/admin/stats` | Admin | Dashboard statistics |
| GET | `/api/admin/users` | Admin | List all users |

---

## 💡 Business Model

| Source | Detail |
|--------|--------|
| **Individuals** | Free (listings + basic AI tools) |
| **Professionals** | €49–€199/month subscription |
| **Featured Listings** | Sponsored placement |
| **API Access** | Data access for integration |
| **Partnerships** | Brokers, movers, artisans |
| **Advertising** | Non-intrusive display |

---

## 🔐 Security

- **JWT authentication** with configurable expiration
- **bcrypt password hashing** (10 rounds)
- **Rate limiting** on auth & contact endpoints
- **Input sanitization** against XSS
- **SQL injection prevention** via parameterized queries
- **CORS** configuration for production domains
- **Nginx** with security headers (X-Frame-Options, XSS-Protection, etc.)

---

## 🧪 Testing

```bash
cd backend
npm test

# Output:
#  PASS  tests/api.test.js
#  ✓ GET /api/health returns 200 OK
#  ✓ POST /api/auth/register registers a new user
#  ✓ POST /api/auth/register registers second user
#  ✓ POST /api/auth/login authenticates registered user
#  ✓ POST /api/biens creates a property listing
#  ✓ PUT /api/biens/:id denies unauthorized update
#  ✓ DELETE /api/biens/:id denies unauthorized delete
#  ✓ POST /api/favorites/:bienId adds property to favorites
#  ✓ GET /api/favorites lists user favorites
#  ✓ DELETE /api/favorites/:bienId removes from favorites
#  ✓ POST /api/biens/upload uploads base64 photo
#  ✓ DELETE /api/biens/:id allows owner to delete property
```

---

## 📦 Deployment

### Production (Docker)

```bash
# Build and start all services
docker compose up -d --build

# View logs
docker compose logs -f

# Stop
docker compose down
```

### Manual Deployment

```bash
# Build frontend
npm run build

# Start backend
cd backend
NODE_ENV=production JWT_SECRET=your-secret node server.js

# Serve frontend with nginx
# Point nginx to dist/ and proxy /api/ to backend:8000
```

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🏗️ Built With

| | |
|---|-----|
| ![EVA](https://img.shields.io/badge/EVA-NODUS%20SYSTEMS-8B5CF6) | Enterprise AI Framework |
| ![Node](https://img.shields.io/badge/Node.js-22-339933) | Runtime |
| ![Express](https://img.shields.io/badge/Express-4.21-000000) | Web Framework |
| ![SQLite](https://img.shields.io/badge/SQLite-3-003B57) | Database |
| ![Vite](https://img.shields.io/badge/Vite-8-646CFF) | Build Tool |