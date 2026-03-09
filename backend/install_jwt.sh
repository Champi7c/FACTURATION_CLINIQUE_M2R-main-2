#!/bin/bash
# Script pour installer JWT et appliquer les migrations sur Hostinger

echo "🚀 Installation de JWT et application des migrations..."
echo ""

# Aller dans le dossier backend
cd /root/clinique-app/clinique-app-backend || {
    echo "❌ Erreur: Impossible de trouver le dossier backend"
    exit 1
}

# Vérifier le nom du conteneur
echo "📋 Vérification des conteneurs Docker..."
CONTAINER_NAME=$(docker compose ps --format json | grep -o '"Name":"[^"]*"' | head -1 | cut -d'"' -f4 | grep -E 'web|backend' | head -1)

if [ -z "$CONTAINER_NAME" ]; then
    # Essayer avec le nom par défaut
    CONTAINER_NAME="web"
    echo "⚠️  Nom de conteneur non trouvé, utilisation de 'web' par défaut"
else
    echo "✅ Conteneur trouvé: $CONTAINER_NAME"
fi

# Vérifier si le conteneur est en cours d'exécution
if ! docker compose ps | grep -q "Up"; then
    echo "⚠️  Le conteneur n'est pas en cours d'exécution. Démarrage..."
    docker compose up -d
    sleep 5
fi

echo ""
echo "📦 Étape 1: Installation de djangorestframework-simplejwt..."
docker compose exec -T $CONTAINER_NAME pip install djangorestframework-simplejwt==5.3.0
if [ $? -eq 0 ]; then
    echo "✅ Dépendance installée avec succès"
else
    echo "⚠️  Erreur lors de l'installation (peut-être déjà installée)"
fi

echo ""
echo "🔄 Étape 2: Application des migrations..."
docker compose exec -T $CONTAINER_NAME python manage.py migrate --noinput
if [ $? -eq 0 ]; then
    echo "✅ Migrations appliquées avec succès"
else
    echo "❌ Erreur lors de l'application des migrations"
    exit 1
fi

echo ""
echo "🔍 Étape 3: Vérification des migrations..."
docker compose exec -T $CONTAINER_NAME python manage.py showmigrations | grep -E "token_blacklist|\[X\]"

echo ""
echo "🔄 Étape 4: Redémarrage du conteneur..."
docker compose restart $CONTAINER_NAME

echo ""
echo "✅ Installation terminée avec succès!"
echo ""
echo "📝 Vérification finale..."
sleep 3
docker compose ps

echo ""
echo "🎉 Tout est prêt! JWT est maintenant configuré."

