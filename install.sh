#!/bin/bash
# Script d'installation à lancer SUR LE SERVEUR (72.62.29.141 ou Hostinger)
# Après avoir cloné le dépôt : chmod +x install.sh && ./install.sh

set -e
cd "$(dirname "$0")"

echo "=============================================="
echo "  Facturation Clinique - Installation"
echo "=============================================="
echo ""

# Vérifier Docker
if ! command -v docker &> /dev/null; then
  echo "Erreur : Docker n'est pas installé sur ce serveur."
  exit 1
fi

if docker compose version &> /dev/null 2>&1; then
  COMPOSE="docker compose"
elif docker-compose version &> /dev/null 2>&1; then
  COMPOSE="docker-compose"
else
  echo "Erreur : Docker Compose n'est pas installé."
  exit 1
fi

# Créer .env si absent
if [ ! -f .env ]; then
  echo "Création du fichier .env..."
  cp .env.example .env
  echo "  → .env créé avec les valeurs par défaut (IP 72.62.29.141)."
  echo "  → Vous pouvez éditer .env (nano .env) pour changer DB_PASSWORD ou SECRET_KEY."
  echo ""
else
  echo "Fichier .env déjà présent."
  echo ""
fi

# Build et démarrage
echo "Build des images Docker (plusieurs minutes)..."
$COMPOSE build --no-cache

echo ""
echo "Démarrage des conteneurs..."
$COMPOSE up -d

echo ""
echo "=============================================="
echo "  Installation terminée"
echo "=============================================="
echo ""
echo "Accès à l'application :"
echo "   Frontend :    http://72.62.29.141:9000"
echo "   Backend API : http://72.62.29.141:9001/api/"
echo "   phpMyAdmin :  http://72.62.29.141:9002"
echo ""
echo "Commandes utiles :"
echo "   Conteneurs : $COMPOSE ps"
echo "   Logs :       $COMPOSE logs -f"
echo "   Arrêter :    $COMPOSE down"
echo ""
