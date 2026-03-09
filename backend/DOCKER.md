# 🐳 Guide Docker - Facturation Clinique

Ce guide explique comment utiliser Docker et Docker Compose pour déployer l'application backend Django.

## 📋 Prérequis

- Docker (version 20.10 ou supérieure)
- Docker Compose (version 1.29 ou supérieure)

## 🚀 Démarrage rapide

### 1. Configuration des variables d'environnement

Créez un fichier `.env` à la racine du projet en copiant le template :

```bash
# Sur Windows PowerShell
Copy-Item env.template .env

# Sur Linux/Mac
cp env.template .env
```

Puis modifiez le fichier `.env` avec vos valeurs :

```env
SECRET_KEY=votre-secret-key-securisee
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

DB_HOST=db
DB_NAME=facturation_clinique
DB_USER=root
DB_PASSWORD=votre-mot-de-passe-securise
DB_ROOT_PASSWORD=votre-mot-de-passe-root-securise
DB_PORT=3306

PHPMYADMIN_PORT=8080
```

### 2. Construction et démarrage des conteneurs

#### Production (avec Gunicorn)

```bash
# Construire et démarrer les services en production
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Voir les logs d'un service spécifique
docker-compose logs -f web
docker-compose logs -f db
```

#### Développement (avec runserver pour hot reload)

```bash
# Pour le développement avec hot reload, utilisez le fichier de développement
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Ou modifiez directement docker-compose.yml et décommentez la ligne command
```

**Note** : Le Dockerfile utilise un build multi-stage optimisé pour la production avec Gunicorn. En développement, le volume est monté pour permettre le hot reload.

### 3. Exécuter les migrations

Les migrations s'exécutent automatiquement au démarrage. Si vous devez les exécuter manuellement :

```bash
# Exécuter les migrations
docker-compose exec web python manage.py migrate

# Créer un superutilisateur Django
docker-compose exec web python manage.py createsuperuser
```

### 4. Accéder à l'application

- **API Backend** : http://localhost:8000
- **Admin Django** : http://localhost:8000/admin
- **phpMyAdmin** : http://localhost:8080
- **Base de données MySQL** : localhost:3307 (port externe, port interne: 3306)

## 🛠️ Commandes utiles

### Arrêter les services

```bash
# Arrêter les conteneurs
docker-compose stop

# Arrêter et supprimer les conteneurs
docker-compose down

# Arrêter et supprimer les conteneurs + volumes (⚠️ supprime les données)
docker-compose down -v
```

### Gestion de la base de données

```bash
# Accéder au shell MySQL
docker-compose exec db mysql -u root -p

# Créer un dump de la base de données
docker-compose exec db mysqldump -u root -p facturation_clinique > backup.sql

# Restaurer un dump
docker-compose exec -T db mysql -u root -p facturation_clinique < backup.sql
```

### Commandes Django

```bash
# Accéder au shell Django
docker-compose exec web python manage.py shell

# Créer des migrations
docker-compose exec web python manage.py makemigrations

# Exécuter les migrations
docker-compose exec web python manage.py migrate

# Collecter les fichiers statiques
docker-compose exec web python manage.py collectstatic --noinput
```

### Reconstruire les images

```bash
# Reconstruire sans cache
docker-compose build --no-cache

# Reconstruire et redémarrer
docker-compose up -d --build
```

## 📁 Structure des fichiers Docker

- `Dockerfile` : Configuration multi-stage de l'image Docker pour l'application Django (production avec Gunicorn)
- `docker-compose.yml` : Configuration des services (Django + MySQL + phpMyAdmin)
- `docker-compose.dev.yml` : Override pour le développement (utilise runserver)
- `entrypoint.sh` : Script d'initialisation (migrations, collectstatic, démarrage)
- `.dockerignore` : Fichiers à exclure lors de la construction
- `env.template` : Template pour les variables d'environnement
- `.env` : Variables d'environnement (à créer, ne pas commiter)

### Architecture du Dockerfile

Le Dockerfile utilise un build **multi-stage** similaire au frontend :

1. **Stage 1 (build)** : Installe les dépendances système de build et les packages Python
2. **Stage 2 (production)** : Image légère avec uniquement les dépendances runtime et l'application

**Avantages** :
- Image finale plus petite (pas de build tools)
- Build plus rapide grâce au cache Docker
- Production optimisée avec Gunicorn (3 workers)

## 🔧 Configuration avancée

### Modifier le port de l'application

Dans `docker-compose.yml`, modifiez la ligne :

```yaml
ports:
  - "8000:8000"  # Changez le premier port (ex: "8080:8000")
```

### Modifier le port MySQL

Le port MySQL par défaut est maintenant **3307** (au lieu de 3306) pour éviter les conflits avec un MySQL local.

Dans `.env`, vous pouvez modifier si nécessaire :

```env
DB_PORT=3308  # Changez le port si 3307 est déjà utilisé
```

**Note importante** : Le port interne du conteneur reste toujours 3306. Seul le port externe (mappage) change. Les services Docker communiquent entre eux via le port interne 3306.

### Modifier le port phpMyAdmin

Dans `.env`, modifiez :

```env
PHPMYADMIN_PORT=8081  # Changez le port si 8080 est déjà utilisé
```

### Configuration Gunicorn

Par défaut, Gunicorn utilise 3 workers. Pour modifier cette configuration, éditez le `Dockerfile` ou surchargez la commande dans `docker-compose.yml` :

```yaml
command: gunicorn --bind 0.0.0.0:8000 --workers 4 --timeout 120 facturation_clinique.wsgi:application
```

**Recommandations** :
- Workers : `(2 × CPU cores) + 1`
- Timeout : Augmentez si vous avez des requêtes longues

### Accéder à phpMyAdmin

1. Ouvrez votre navigateur et allez sur `http://localhost:8080`
2. Connectez-vous avec :
   - **Serveur** : `db` (ou laissez vide)
   - **Nom d'utilisateur** : `root` (ou la valeur de `DB_USER`)
   - **Mot de passe** : La valeur de `DB_ROOT_PASSWORD` (ou `DB_PASSWORD`)

### Ajouter des volumes pour le développement

Le `docker-compose.yml` monte déjà le code source en volume pour le développement. Les modifications du code sont reflétées immédiatement.

## 🐛 Dépannage

### Les migrations ne s'exécutent pas

```bash
docker-compose exec web python manage.py migrate
```

### La base de données ne démarre pas

Vérifiez les logs :

```bash
docker-compose logs db
```

### Erreur de connexion à la base de données

Assurez-vous que :
1. Le service `db` est démarré et en bonne santé
2. Les variables d'environnement dans `.env` sont correctes
3. Le `DB_HOST` est bien défini sur `db` (nom du service dans docker-compose)

### Réinitialiser complètement

```bash
# Arrêter et supprimer tout
docker-compose down -v

# Supprimer les images
docker-compose rm -f

# Reconstruire et redémarrer
docker-compose up -d --build
```

## 🔒 Sécurité

⚠️ **Important pour la production** :

1. Changez `SECRET_KEY` dans `.env`
2. Définissez `DEBUG=False` en production
3. Utilisez des mots de passe forts pour la base de données
4. Ne commitez jamais le fichier `.env`
5. Configurez `ALLOWED_HOSTS` avec votre domaine

## 📚 Ressources

- [Documentation Docker](https://docs.docker.com/)
- [Documentation Docker Compose](https://docs.docker.com/compose/)
- [Documentation Django](https://docs.djangoproject.com/)

