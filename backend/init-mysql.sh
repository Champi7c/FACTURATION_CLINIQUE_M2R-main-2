#!/bin/bash
# Script d'initialisation MySQL pour gérer le cas DB_USER=root
# Ce script crée l'utilisateur seulement si DB_USER n'est pas "root"

set -e

if [ "$MYSQL_USER" != "root" ] && [ -n "$MYSQL_USER" ]; then
    echo "Création de l'utilisateur MySQL: $MYSQL_USER"
    mysql -uroot -p"$MYSQL_ROOT_PASSWORD" <<EOF
CREATE USER IF NOT EXISTS '$MYSQL_USER'@'%' IDENTIFIED BY '$MYSQL_PASSWORD';
GRANT ALL PRIVILEGES ON ${MYSQL_DATABASE}.* TO '$MYSQL_USER'@'%';
FLUSH PRIVILEGES;
EOF
    echo "Utilisateur MySQL créé avec succès"
else
    echo "DB_USER=root détecté, utilisation du compte root uniquement"
fi

