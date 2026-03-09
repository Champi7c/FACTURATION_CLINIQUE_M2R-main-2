#!/bin/bash
# Script d'initialisation pour créer l'utilisateur MySQL si nécessaire
# Ce script est exécuté automatiquement lors de la première initialisation de MySQL

set -e

# Attendre que MySQL soit prêt
until mysqladmin ping -h localhost --silent; do
    sleep 1
done

# Si DB_USER est défini et n'est pas "root", créer l'utilisateur
if [ -n "$MYSQL_USER" ] && [ "$MYSQL_USER" != "root" ]; then
    echo "Création de l'utilisateur MySQL: $MYSQL_USER"
    mysql -uroot -p"$MYSQL_ROOT_PASSWORD" <<EOF
CREATE USER IF NOT EXISTS '$MYSQL_USER'@'%' IDENTIFIED BY '$MYSQL_PASSWORD';
GRANT ALL PRIVILEGES ON ${MYSQL_DATABASE}.* TO '$MYSQL_USER'@'%';
FLUSH PRIVILEGES;
EOF
    echo "Utilisateur MySQL créé avec succès"
else
    echo "DB_USER=root ou non défini, utilisation du compte root uniquement"
fi

