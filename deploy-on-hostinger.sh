#!/bin/bash
# Script à exécuter SUR le VPS Hostinger (après git clone)
# Usage : ./deploy-on-hostinger.sh

set -e
cd "$(dirname "$0")"

echo "=============================================="
echo "  Facturation Clinique - Déploiement Hostinger"
echo "=============================================="
echo ""

# Vérifier que Docker est disponible
if ! command -v docker &> /dev/null; then
  echo "Erreur : Docker n'est pas installé. Utilisez un VPS Hostinger avec le template Docker."
  exit 1
fi

if docker compose version &> /dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
elif docker-compose version &> /dev/null 2>&1; then
  COMPOSE_CMD="docker-compose"
else
  echo "Erreur : Docker Compose n'est pas installé."
  exit 1
fi

# Créer .env à partir de .env.example si absent
if [ ! -f .env ]; then
  echo "Création du fichier .env depuis .env.example..."
  cp .env.example .env
  echo ""
  echo "⚠️  Le fichier .env a été créé. Éditez-le si besoin (IP du serveur : 72.62.29.141) :"
  echo ""
  echo "   nano .env"
  echo ""
  echo "Vérifiez au minimum :"
  echo "   - ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0,72.62.29.141,backend"
  echo "   - CORS_ALLOWED_ORIGINS=http://72.62.29.141:9000 (et autres origines si besoin)"
  echo "   - REACT_APP_API_BASE_URL=http://72.62.29.141:9001/api"
  echo "   - DB_PASSWORD (mot de passe MySQL)"
  echo ""
  echo "Puis relancez : ./deploy-on-hostinger.sh"
  exit 1
fi

# Récupérer l'IP publique du serveur (pour afficher les URLs)
SERVER_IP=""
if command -v curl &> /dev/null; then
  SERVER_IP=$(curl -s --max-time 3 https://ifconfig.me 2>/dev/null || true)
fi
[ -z "$SERVER_IP" ] && SERVER_IP="72.62.29.141"

echo "Build des images Docker (cela peut prendre plusieurs minutes)..."
$COMPOSE_CMD build --no-cache

echo ""
echo "Démarrage des conteneurs..."
$COMPOSE_CMD up -d

echo ""
echo "=============================================="
echo "  Déploiement terminé"
echo "=============================================="
echo ""
echo "Accédez à l'application :"
echo "   Frontend :    http://${SERVER_IP}:9000"
echo "   Backend API : http://${SERVER_IP}:9001/api/"
echo "   phpMyAdmin :  http://${SERVER_IP}:9002"
echo ""
echo "Conteneurs : $COMPOSE_CMD ps"
echo "Logs :       $COMPOSE_CMD logs -f"
echo ""
