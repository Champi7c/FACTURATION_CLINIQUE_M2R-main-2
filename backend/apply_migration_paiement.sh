#!/bin/bash

# Script pour appliquer la migration de statut de paiement sur le serveur

echo "🔧 Application de la migration de statut de paiement..."

# Se placer dans le répertoire du backend
cd /root/clinique-app/clinique-app-backend || {
    echo "❌ Erreur: Impossible de se placer dans /root/clinique-app/clinique-app-backend"
    exit 1
}

# Vérifier que Docker Compose est disponible
if ! command -v docker compose &> /dev/null; then
    echo "❌ Erreur: docker compose n'est pas installé"
    exit 1
fi

# Vérifier que le conteneur est en cours d'exécution
if ! docker compose ps | grep -q "facturation_backend.*Up"; then
    echo "⚠️  Le conteneur backend n'est pas en cours d'exécution. Démarrage..."
    docker compose up -d
    sleep 5
fi

# Appliquer la migration
echo "📦 Application de la migration 0003_devis_statut_paiement..."
docker compose exec -T web python manage.py migrate api 0003_devis_statut_paiement --noinput

if [ $? -eq 0 ]; then
    echo "✅ Migration appliquée avec succès!"
    
    # Afficher le statut des migrations
    echo ""
    echo "📊 Statut des migrations:"
    docker compose exec -T web python manage.py showmigrations api
    
    echo ""
    echo "✅ Terminé!"
else
    echo "❌ Erreur lors de l'application de la migration"
    exit 1
fi

