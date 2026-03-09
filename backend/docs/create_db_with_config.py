#!/usr/bin/env python
"""
Script pour créer la base de données avec la configuration fournie
"""
import pymysql

# Configuration MySQL
config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'Oumou@245',
    'port': 3306,
    'charset': 'utf8mb4'
}

db_name = 'facturation_clinique'

try:
    print("Connexion à MySQL...")
    connection = pymysql.connect(**config)
    print("✅ Connexion réussie!")
    
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
            print("Base de données déjà existante, opération annulée.")
            cursor.close()
            connection.close()
            exit(0)
    
    # Créer la base de données
    print(f"Création de la base de données '{db_name}'...")
    cursor.execute(f"CREATE DATABASE {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    
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
    if "Access denied" in str(e):
        print("💡 Vérifiez le mot de passe MySQL.")
    elif "Can't connect" in str(e):
        print("💡 Vérifiez que MySQL est démarré.")
except Exception as e:
    print(f"❌ Erreur: {e}")


