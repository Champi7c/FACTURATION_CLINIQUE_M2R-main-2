#!/bin/bash
# Script de restauration automatique des anciennes données MySQL

set -e

echo "🔍 Recherche des volumes MySQL avec des données..."
echo ""

# Liste des volumes à vérifier
VOLUMES=(
  "facturation_mysql_data_prod"
  "clinique-app-backend_mysql_data"
  "backend_mysql_data"
  "deploy-html-nodejs_mysql_data"
)

VOLUME_WITH_DATA=""
MAX_SIZE=0

# Vérifier chaque volume
for VOL in "${VOLUMES[@]}"; do
  if docker volume inspect "$VOL" &>/dev/null; then
    MOUNTPOINT=$(docker volume inspect "$VOL" --format '{{.Mountpoint}}')
    if [ -d "$MOUNTPOINT" ]; then
      SIZE_BYTES=$(du -sb "$MOUNTPOINT" 2>/dev/null | awk '{print $1}' || echo "0")
      FILE_COUNT=$(find "$MOUNTPOINT" -type f 2>/dev/null | wc -l)
      SIZE_HUMAN=$(du -sh "$MOUNTPOINT" 2>/dev/null | awk '{print $1}' || echo "0")
      
      echo "📦 Volume: $VOL"
      echo "   Taille: $SIZE_HUMAN ($SIZE_BYTES bytes)"
      echo "   Fichiers: $FILE_COUNT"
      
      # Si ce volume a plus de données que les précédents
      if [ "$SIZE_BYTES" -gt "$MAX_SIZE" ] && [ "$FILE_COUNT" -gt 10 ]; then
        MAX_SIZE=$SIZE_BYTES
        VOLUME_WITH_DATA="$VOL"
        echo "   ✅ Ce volume semble contenir des données"
      else
        echo "   ⚠️  Volume vide ou peu de données"
      fi
      echo ""
    fi
  fi
done

if [ -z "$VOLUME_WITH_DATA" ]; then
  echo "❌ Aucun volume avec des données trouvé"
  exit 1
fi

echo "✅ Volume avec données identifié: $VOLUME_WITH_DATA"
echo ""

# Vérifier le volume actuel
CURRENT_VOLUME="backend_mysql_data"
echo "📊 Volume actuellement utilisé: $CURRENT_VOLUME"
CURRENT_MOUNTPOINT=$(docker volume inspect "$CURRENT_VOLUME" --format '{{.Mountpoint}}' 2>/dev/null || echo "")
if [ -n "$CURRENT_MOUNTPOINT" ] && [ -d "$CURRENT_MOUNTPOINT" ]; then
  CURRENT_FILES=$(find "$CURRENT_MOUNTPOINT" -type f 2>/dev/null | wc -l)
  echo "   Fichiers actuels: $CURRENT_FILES"
fi
echo ""

# Demander confirmation
read -p "🔄 Restaurer les données depuis $VOLUME_WITH_DATA vers $CURRENT_VOLUME ? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Restauration annulée"
  exit 1
fi

echo "🛑 Arrêt des conteneurs..."
cd /root/clinique-app/backend
docker compose down

echo "💾 Copie des données depuis $VOLUME_WITH_DATA vers $CURRENT_VOLUME..."
docker run --rm \
  -v "$VOLUME_WITH_DATA":/source:ro \
  -v "$CURRENT_VOLUME":/dest \
  alpine sh -c "
    echo 'Nettoyage du volume de destination...'
    rm -rf /dest/*
    echo 'Copie des données...'
    cp -a /source/* /dest/ 2>/dev/null || true
    echo 'Ajustement des permissions...'
    chown -R 999:999 /dest 2>/dev/null || true
    echo '✅ Copie terminée'
  "

echo ""
echo "📊 Vérification après copie:"
DEST_FILES=$(docker run --rm -v "$CURRENT_VOLUME":/data alpine sh -c "find /data -type f | wc -l")
echo "   Fichiers copiés: $DEST_FILES"

if [ "$DEST_FILES" -gt 10 ]; then
  echo "✅ Données restaurées avec succès !"
  echo ""
  echo "🚀 Redémarrage des conteneurs..."
  docker compose up -d
  
  echo ""
  echo "⏳ Attente du démarrage de MySQL (30 secondes)..."
  sleep 30
  
  echo ""
  echo "🔍 Vérification de l'accès à la base de données..."
  DB_PASSWORD=$(grep DB_ROOT_PASSWORD .env | cut -d'=' -f2 | tr -d '"' || echo "rootpassword")
  
  if docker exec facturation_mysql mysqladmin ping -h localhost -u root -p"$DB_PASSWORD" &>/dev/null; then
    echo "✅ MySQL est accessible"
    echo ""
    echo "📋 Bases de données disponibles:"
    docker exec facturation_mysql mysql -u root -p"$DB_PASSWORD" -e "SHOW DATABASES;" 2>/dev/null || echo "⚠️ Impossible d'afficher les bases"
    echo ""
    echo "📊 Tables dans facturation_clinique:"
    docker exec facturation_mysql mysql -u root -p"$DB_PASSWORD" -e "USE facturation_clinique; SHOW TABLES;" 2>/dev/null || echo "⚠️ Impossible d'afficher les tables"
  else
    echo "⚠️ MySQL n'est pas encore prêt, attendez quelques secondes"
  fi
  
  echo ""
  echo "✅ Restauration terminée !"
else
  echo "❌ Erreur lors de la copie des données"
  exit 1
fi

