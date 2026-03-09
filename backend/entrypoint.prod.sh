#!/bin/bash
# =============================================================================
# ENTRYPOINT PRODUCTION - Backend Django
# =============================================================================
# Ce script s'exécute au démarrage du conteneur en production
# Il attend que la base de données soit prête, applique les migrations
# et collecte les fichiers statiques avant de démarrer Gunicorn
# =============================================================================

set -e

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# -----------------------------------------------------------------------------
# Afficher la version du déploiement
# -----------------------------------------------------------------------------
log_info "=== Démarrage Facturation Clinique Backend ==="
log_info "Version: ${VERSION:-unknown}"
log_info "Date de build: $(date)"
log_info "Environnement: PRODUCTION"

# -----------------------------------------------------------------------------
# Attendre que la base de données soit prête
# -----------------------------------------------------------------------------
log_info "Vérification de la connexion à la base de données..."

MAX_RETRIES=30
RETRY_COUNT=0

until python -c "
import os
import sys
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'facturation_clinique.settings')
django.setup()
from django.db import connection
try:
    with connection.cursor() as cursor:
        cursor.execute('SELECT 1')
    print('Connexion réussie')
except Exception as e:
    print(f'Erreur: {e}')
    sys.exit(1)
" 2>/dev/null; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        log_error "Impossible de se connecter à la base de données après $MAX_RETRIES tentatives"
        exit 1
    fi
    log_warn "Base de données indisponible - tentative $RETRY_COUNT/$MAX_RETRIES - attente 2s..."
    sleep 2
done

log_info "Connexion à la base de données établie!"

# -----------------------------------------------------------------------------
# Appliquer les migrations
# -----------------------------------------------------------------------------
log_info "Application des migrations..."
python manage.py migrate --noinput

if [ $? -eq 0 ]; then
    log_info "Migrations appliquées avec succès"
else
    log_error "Erreur lors de l'application des migrations"
    exit 1
fi

# -----------------------------------------------------------------------------
# Collecter les fichiers statiques
# -----------------------------------------------------------------------------
log_info "Collecte des fichiers statiques..."
python manage.py collectstatic --noinput --clear

if [ $? -eq 0 ]; then
    log_info "Fichiers statiques collectés avec succès"
else
    log_warn "Avertissement lors de la collecte des fichiers statiques"
fi

# -----------------------------------------------------------------------------
# Afficher les informations de configuration
# -----------------------------------------------------------------------------
log_info "Configuration:"
log_info "  - DB_HOST: ${DB_HOST:-non défini}"
log_info "  - DB_NAME: ${DB_NAME:-non défini}"
log_info "  - DEBUG: ${DEBUG:-False}"
log_info "  - ALLOWED_HOSTS: ${ALLOWED_HOSTS:-non défini}"

# -----------------------------------------------------------------------------
# Démarrer le serveur
# -----------------------------------------------------------------------------
log_info "Démarrage de Gunicorn..."
log_info "=== Serveur prêt ==="

exec "$@"

