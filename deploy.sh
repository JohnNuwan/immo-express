#!/bin/bash
# ==========================================
# EVA · NODUS SYSTEMS — Deploy Script
# Immo-Express — v2.0.0-eva-nodus
# ==========================================
set -e

APP_NAME="immo-express"
BRANCH="eva-nodus"
DOCKER_COMPOSE="docker compose"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "╔══════════════════════════════════════════╗"
echo "║   Immo-Express — EVA · NODUS SYSTEMS    ║"
echo "║   Déploiement v2.0.0-eva-nodus          ║"
echo "╚══════════════════════════════════════════╝"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

log() { echo -e "${CYAN}[$(date +%H:%M:%S)]${NC} $1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; exit 1; }

# Check requirements
log "🔍 Vérification des prérequis..."
command -v docker >/dev/null 2>&1 || error "Docker n'est pas installé"
command -v git >/dev/null 2>&1 || error "Git n'est pas installé"

# Pull latest
log "📥 Récupération de la branche $BRANCH..."
git fetch origin
git checkout $BRANCH 2>/dev/null || git checkout -b $BRANCH origin/$BRANCH 2>/dev/null || error "Branche $BRANCH introuvable"
git pull origin $BRANCH 2>/dev/null || log "⚠️  Pull ignoré (premier déploiement)"

# Backup SQLite DB if exists
if [ -f "./backend/immo_express.db" ]; then
    mkdir -p $BACKUP_DIR
    cp ./backend/immo_express.db "$BACKUP_DIR/immo_express_$TIMESTAMP.db"
    log "💾 Base de données sauvegardée → backups/immo_express_$TIMESTAMP.db"
fi

# Build and deploy
log "🐳 Construction des containers Node.js..."
$DOCKER_COMPOSE build

log "🚀 Démarrage des services..."
$DOCKER_COMPOSE up -d

# Wait for health check
log "⏳ Vérification de l'API..."
sleep 3
if curl -sf http://localhost:8000/api/health > /dev/null 2>&1; then
    success "API opérationnelle → http://localhost:8000/api/health"
else
    error "L'API ne répond pas. Vérifiez avec: docker compose logs"
fi

# Test frontend
if curl -sf http://localhost:80 > /dev/null 2>&1; then
    success "Frontend opérationnel → http://localhost:80"
else
    error "Le frontend ne répond pas"
fi

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   ✅  Déploiement réussi !               ║"
echo "║                                          ║"
echo "║   🌐 Frontend : http://localhost:80      ║"
echo "║   🔧 API      : http://localhost:8000    ║"
echo "║   📚 Docs     : http://localhost:8000/api/docs  ║"
echo "║                                          ║"
echo "║   ⚡ Powered by EVA · NODUS SYSTEMS      ║"
echo "╚══════════════════════════════════════════╝"