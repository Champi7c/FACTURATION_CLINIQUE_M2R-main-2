#!/usr/bin/env python
"""
Script interactif pour créer la base de données MySQL
"""
import pymysql
import getpass
import sys

print("=" * 50)
print("Création de la base de données MySQL")
print("=" * 50)
print()

# Demander les informations de connexion
host = input("Host MySQL [localhost]: ").strip() or "localhost"
user = input("Utilisateur MySQL [root]: ").strip() or "root"
password = getpass.getpass("Mot de passe MySQL: ")
port = input("Port MySQL [3306]: ").strip() or "3306"

try:
    port = int(port)
except ValueError:
    port = 3306

db_name = "facturation_clinique"

try:
    print()
    print(f"Tentative de connexion à MySQL sur {host}:{port}...")
    
    # Se connecter à MySQL
    connection = pymysql.connect(
        host=host,
        user=user,
        password=password,
        port=port,
        charset='utf8mb4'
    )
    
    print("✅ Connexion réussie!")
    print()
    
    cursor = connection.cursor()
    
    # Vérifier si la base existe déjà
    cursor.execute("SHOW DATABASES LIKE %s", (db_name,))
    exists = cursor.fetchone()
    
    if exists:
        print(f"⚠️  La base de données '{db_name}' existe déjà.")
        response = input("Voulez-vous la recréer? (o/N): ").strip().lower()
        if response == 'o':
            cursor.execute(f"DROP DATABASE {db_name}")
            print(f"✅ Base de données '{db_name}' supprimée.")
        else:
            print("Opération annulée.")
            cursor.close()
            connection.close()
            sys.exit(0)
    
    # Créer la base de données
    print(f"Création de la base de données '{db_name}'...")
    cursor.execute(f"CREATE DATABASE {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    
    # Vérifier que la base a été créée
    cursor.execute("SHOW DATABASES LIKE %s", (db_name,))
    result = cursor.fetchone()
    
    if result:
        print(f"✅ Base de données '{db_name}' créée avec succès!")
        print()
        print("📝 Mettez à jour votre fichier .env avec:")
        print(f"   DB_USER={user}")
        if password:
            print(f"   DB_PASSWORD={password}")
        print(f"   DB_PORT={port}")
    else:
        print(f"❌ Erreur lors de la création de la base de données")
    
    cursor.close()
    connection.close()
    
except pymysql.Error as e:
    print(f"❌ Erreur MySQL: {e}")
    print()
    if "Access denied" in str(e):
        print("💡 Le mot de passe ou l'utilisateur est incorrect.")
    elif "Can't connect" in str(e):
        print("💡 Impossible de se connecter au serveur MySQL.")
        print("   Vérifiez que MySQL est démarré et que le port est correct.")
    sys.exit(1)
except Exception as e:
    print(f"❌ Erreur: {e}")
    sys.exit(1)

print()
print("✅ Terminé! Vous pouvez maintenant exécuter: python manage.py migrate")


