# Changelog

## [2.1.0] — 2026-08-13

### Added
- Footer "⚡ Powered by EVA · NODUS SYSTEMS" sur TOUTES les pages (login, register, profil inclus)
- Signature NODUS complète avec logo SVG sur les pages auth

### Changed
- Thème NODUS : palette exacte `#14141a` / `#e64749` / `#00f0ff`
- Typographie : **Space Grotesk** (remplace Plus Jakarta Sans) + JetBrains Mono
- Gradients et icônes SVG mis à jour avec la nouvelle palette

## [2.0.0] — 2025-08-10

### Added
- MIT License file
- CONTRIBUTING.md with contribution guidelines
- Comprehensive English README with API documentation
- Backend `.gitignore` for node_modules, .env, db files
- `package.json` scripts: `seed`, `docker:up`, `docker:down`
- Keywords and author metadata in package.json

### Fixed
- Backend package.json with proper `cors` dependency (already installed)
- `.env.example` with clear JWT_SECRET warning
- All 12 API tests passing

### Documentation
- Full API reference in README
- Business model description
- Security features documented
- Docker deployment guide

## [1.0.0] — 2025-08-09

### Initial Release
- Full-stack real estate platform with Node.js/Express backend
- SQLite database with auto-seeding (5 sample properties)
- JWT authentication with bcrypt password hashing
- Rate limiting on auth and contact endpoints
- REST API: auth, biens, scoring, contact, admin, favorites, opendata
- Frontend: index, scoring, risks, vente, location, dashboard, profil, pro, recherche
- Dark theme design system (NODUS CSS)
- AI Trust Score, Smart Match, Price History features
- PWA support with manifest.json and service worker
- Docker Compose deployment (frontend + backend)
- Vite build tooling
- Capacitor mobile support
- Nginx configuration with security headers
- Jest + Supertest test suite (12 tests)