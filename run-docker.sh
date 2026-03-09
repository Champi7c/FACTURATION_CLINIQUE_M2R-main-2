#!/bin/bash
# Script pour builder et lancer la stack Docker (Facturation Clinique)
set -e
cd "$(dirname "$0")"

echo "=== Vérification du fichier .env ==="
if [ ! -f .env ]; then
  echo "Création de .env depuis .env.example..."
  cp .env.example .env
  echo "⚠️  Éditez .env et renseignez SECRET_KEY et DB_PASSWORD puis relancez ce script."
  exit 1
fi

echo "=== Build des images Docker ==="
docker compose build --no-cache

echo "=== Démarrage des conteneurs ==="
docker compose up -d

echo ""
echo "=== Stack démarrée ==="
docker compose ps
echo ""
echo "Frontend :    http://localhost:9000"
echo "Backend API : http://localhost:9001/api/"
echo "phpMyAdmin :  http://localhost:9002"
echo ""
echo "Logs : docker compose logs -f"
