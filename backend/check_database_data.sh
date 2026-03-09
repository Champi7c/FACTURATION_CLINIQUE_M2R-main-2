#!/bin/bash
# Script de diagnostic et récupération des données MySQL

echo "🔍 Diagnostic des volumes et données MySQL..."
echo ""

echo "📦 Volumes Docker existants:"
docker volume ls | grep -E "mysql|facturation" || echo "⚠️ Aucun volume trouvé"
echo ""

echo "📊 Conteneurs MySQL (arrêtés et en cours):"
docker ps -a | grep -E "mysql|facturation" || echo "⚠️ Aucun conteneur trouvé"
echo ""

echo "💾 Vérification des volumes MySQL:"
for VOL in $(docker volume ls -q | grep -E "mysql|facturation"); do
  echo "  Volume: $VOL"
  SIZE=$(docker volume inspect $VOL --format '{{.Mountpoint}}' | xargs du -sh 2>/dev/null | awk '{print $1}' || echo "N/A")
  echo "    Taille: $SIZE"
  MOUNTPOINT=$(docker volume inspect $VOL --format '{{.Mountpoint}}')
  if [ -d "$MOUNTPOINT" ]; then
    FILE_COUNT=$(find "$MOUNTPOINT" -type f 2>/dev/null | wc -l)
    echo "    Fichiers: $FILE_COUNT"
    if [ "$FILE_COUNT" -gt 0 ]; then
      echo "    ✅ Volume contient des données"
      echo "    📁 Répertoire: $MOUNTPOINT"
    else
      echo "    ⚠️ Volume vide"
    fi
  fi
  echo ""
done

echo "🔍 Recherche de sauvegardes:"
if [ -d "backups" ]; then
  echo "  Sauvegardes trouvées:"
  ls -lh backups/ | tail -10
else
  echo "  ⚠️ Aucun dossier backups trouvé"
fi

echo ""
echo "📋 Conteneur MySQL actuel:"
CURRENT_MYSQL=$(docker ps -a --filter "name=facturation_mysql" --format "{{.Names}}" | head -1)
if [ -n "$CURRENT_MYSQL" ]; then
  echo "  Nom: $CURRENT_MYSQL"
  VOLUMES=$(docker inspect $CURRENT_MYSQL --format '{{range .Mounts}}{{.Name}} {{end}}' 2>/dev/null)
  echo "  Volumes attachés: $VOLUMES"
else
  echo "  ⚠️ Aucun conteneur MySQL trouvé"
fi

echo ""
echo "✅ Diagnostic terminé"

