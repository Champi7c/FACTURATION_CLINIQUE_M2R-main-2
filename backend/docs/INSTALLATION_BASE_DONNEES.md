# Installation de la Base de Données MySQL

## Étape 1 : Démarrer MySQL

Assurez-vous que MySQL/MariaDB est démarré sur votre système.

**Sur Windows:**
- Chercher "Services" dans le menu Démarrer
- Trouver "MySQL" ou "MariaDB"
- Clic droit → Démarrer (si arrêté)

**Ou via la ligne de commande:**
```bash
net start MySQL
# ou
net start MariaDB
```

## Étape 2 : Créer la Base de Données

Ouvrir une invite de commande MySQL:

```bash
mysql -u root -p
```

Puis exécuter:

```sql
CREATE DATABASE IF NOT EXISTS facturation_clinique CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

## Étape 3 : Configurer le fichier .env

Dans le dossier `backend/`, créer ou modifier le fichier `.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe_mysql
DB_NAME=facturation_clinique
DB_PORT=3306
SECRET_KEY=django-insecure-change-this-in-production-secret-key
DEBUG=True
```

**⚠️ Important:** Remplacez `votre_mot_de_passe_mysql` par votre mot de passe MySQL réel.

## Étape 4 : Exécuter les Migrations

Une fois MySQL démarré et la base de données créée:

```bash
cd backend
python manage.py migrate
```

## Étape 5 : Créer un Superutilisateur (Optionnel)

Pour accéder à l'interface d'administration Django:

```bash
python manage.py createsuperuser
```

## Étape 6 : Démarrer le Serveur Django

```bash
python manage.py runserver
```

Le serveur sera accessible sur `http://localhost:8000`

## ✅ Vérification

Tester l'API:
- Ouvrir dans le navigateur: `http://localhost:8000/api/test/`
- Devrait afficher: `{"message": "API Backend fonctionne correctement!"}`

## 🐛 Problèmes Courants

### MySQL n'est pas démarré
- Vérifier dans les Services Windows
- Redémarrer le service MySQL

### Erreur d'authentification
- Vérifier le nom d'utilisateur et le mot de passe dans `.env`
- Essayer de se connecter avec: `mysql -u root -p`

### Port déjà utilisé
- Changer le port dans `.env`: `PORT=8001`
- Ou arrêter le service qui utilise le port 8000


