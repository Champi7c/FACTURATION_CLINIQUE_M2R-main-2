#!/usr/bin/env python
"""
Script pour créer la base de données MySQL
"""
import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

# Paramètres de connexion
config = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'port': int(os.getenv('DB_PORT', 3306)),
    'charset': 'utf8mb4',
}

db_name = os.getenv('DB_NAME', 'facturation_clinique')

try:
    # Se connecter à MySQL (sans spécifier de base de données)
    print(f"Connexion à MySQL sur {config['host']}...")
    connection = pymysql.connect(**config)
    
    cursor = connection.cursor()
    
    # Créer la base de données
    print(f"Création de la base de données '{db_name}'...")
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    
    # Vérifier que la base a été créée
    cursor.execute("SHOW DATABASES LIKE %s", (db_name,))
    result = cursor.fetchone()
    
    if result:
        print(f"✅ Base de données '{db_name}' créée avec succès!")
    else:
        print(f"❌ Erreur lors de la création de la base de données")
    
    cursor.close()
    connection.close()
    
except pymysql.Error as e:
    print(f"❌ Erreur MySQL: {e}")
    print("\n💡 Vérifiez que:")
    print("  1. MySQL est démarré")
    print("  2. Le mot de passe dans .env est correct")
    print("  3. L'utilisateur MySQL a les permissions nécessaires")
except Exception as e:
    print(f"❌ Erreur: {e}")

