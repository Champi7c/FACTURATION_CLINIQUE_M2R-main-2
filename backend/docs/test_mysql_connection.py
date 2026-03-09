#!/usr/bin/env python
"""
Script pour tester la connexion MySQL et trouver le bon port
"""
import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

# Essayer différents ports
ports = [3306, 3307, 3308, 1433]
host = os.getenv('DB_HOST', 'localhost')
user = os.getenv('DB_USER', 'root')
password = os.getenv('DB_PASSWORD', '')

print("Test de connexion à MySQL...")
print(f"Utilisateur: {user}")
print(f"Host: {host}")
print("")

found = False
for port in ports:
    try:
        print(f"Essai du port {port}...", end=" ")
        connection = pymysql.connect(
            host=host,
            user=user,
            password=password,
            port=port
        )
        print("✅ Connexion réussie!")
        found = True
        
        # Tester la création de la base
        cursor = connection.cursor()
        db_name = os.getenv('DB_NAME', 'facturation_clinique')
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        print(f"✅ Base de données '{db_name}' créée avec succès!")
        
        cursor.close()
        connection.close()
        break
    except pymysql.Error as e:
        print(f"❌ Erreur: {e.args[1]}")
    except Exception as e:
        print(f"❌ Erreur: {e}")

if not found:
    print("\n❌ Impossible de se connecter à MySQL sur aucun port.")
    print("\n💡 Solutions possibles:")
    print("  1. Vérifier que MySQL est bien démarré")
    print("  2. Vérifier le mot de passe dans le fichier .env")
    print("  3. Essayer de vous connecter manuellement avec MySQL Workbench ou phpMyAdmin")
    print("  4. Vérifier le fichier my.ini ou my.cnf pour le port MySQL")


