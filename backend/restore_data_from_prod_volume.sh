#!/bin/bash
# Script pour restaurer les données depuis le volume PROD

set -e

echo "🔍 Vérification des volumes MySQL..."
echo ""

# Lister les volumes
echo "📦 Volumes disponibles:"
docker volume ls | grep -E "mysql|facturation"
echo ""

# Vérifier la taille de chaque volume
echo "💾 Taille des volumes:"
for VOL in backend_mysql_data clinique-app-backend_mysql_data facturation_mysql_data_prod; do
  if docker volume inspect $VOL &>/dev/null; then
    MOUNTPOINT=$(docker volume inspect $VOL --format '{{.Mountpoint}}')
    SIZE=$(du -sh "$MOUNTPOINT" 2>/dev/null | awk '{print $1}' || echo "N/A")
    FILE_COUNT=$(find "$MOUNTPOINT" -type f 2>/dev/null | wc -l)
    echo "  $VOL: $SIZE ($FILE_COUNT fichiers)"
  fi
done
echo ""

# Vérifier quel volume contient des données
echo "🔍 Recherche du volume avec des données..."
PROD_VOLUME="facturation_mysql_data_prod"
PROD_MOUNTPOINT=$(docker volume inspect $PROD_VOLUME --format '{{.Mountpoint}}' 2>/dev/null || echo "")

if [ -n "$PROD_MOUNTPOINT" ] && [ -d "$PROD_MOUNTPOINT" ]; then
  PROD_SIZE=$(du -sh "$PROD_MOUNTPOINT" 2>/dev/null | awk '{print $1}')
  PROD_FILES=$(find "$PROD_MOUNTPOINT" -type f 2>/dev/null | wc -l)
  echo "✅ Volume PROD trouvé: $PROD_VOLUME"
  echo "   Taille: $PROD_SIZE"
  echo "   Fichiers: $PROD_FILES"
  echo ""
  
  if [ "$PROD_FILES" -gt 0 ]; then
    echo "📋 Le volume PROD contient des données !"
    echo ""
    echo "🔄 Pour restaurer les données:"
    echo "   1. Arrêter les conteneurs: docker compose down"
    echo "   2. Modifier docker-compose.yml:"
    echo "      Remplacer 'mysql_data' par '$PROD_VOLUME' dans la section volumes"
    echo "   3. Redémarrer: docker compose up -d"
    echo ""
    echo "⚠️  OU copier les données du volume PROD vers le volume actuel:"
    echo "   docker run --rm \\"
    echo "     -v $PROD_VOLUME:/source:ro \\"
    echo "     -v backend_mysql_data:/dest \\"
    echo "     alpine sh -c 'cp -a /source/* /dest/'"
  else
    echo "⚠️  Le volume PROD est vide"
  fi
else
  echo "❌ Volume PROD non trouvé"
fi

echo ""
echo "📊 Vérification du volume actuel (backend_mysql_data):"
CURRENT_MOUNTPOINT=$(docker volume inspect backend_mysql_data --format '{{.Mountpoint}}' 2>/dev/null || echo "")
if [ -n "$CURRENT_MOUNTPOINT" ] && [ -d "$CURRENT_MOUNTPOINT" ]; then
  CURRENT_FILES=$(find "$CURRENT_MOUNTPOINT" -type f 2>/dev/null | wc -l)
  echo "   Fichiers: $CURRENT_FILES"
  if [ "$CURRENT_FILES" -eq 0 ]; then
    echo "   ⚠️  Volume actuel est vide"
  else
    echo "   ✅ Volume actuel contient des données"
  fi
fi

