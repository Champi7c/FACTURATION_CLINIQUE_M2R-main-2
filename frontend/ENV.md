# Variables d'environnement

## REACT_APP_API_BASE_URL

URL de base pour l'API backend.

**Valeur par défaut** : `http://72.62.29.141:8000/api` (IP de l'hôte)

**Exemples** :
- Backend sur l'hôte (IP: 72.62.29.141) : `http://72.62.29.141:8000/api`
- Backend sur l'hôte (local) : `http://localhost:8000/api`
- Backend sur l'hôte accessible depuis Docker : `http://host.docker.internal:8000/api`
- Backend dans Docker Compose (même réseau) : `http://backend:8000/api` (remplacez `backend` par le nom de votre service)
- Backend en production : `https://api.votredomaine.com/api`

## Utilisation

### En développement local (sans Docker)

Créez un fichier `.env` à la racine du projet :

```env
REACT_APP_API_BASE_URL=http://localhost:8000/api
```

### Avec Docker

Créez un fichier `.env` à la racine du projet (utilisé par docker-compose) :

```env
REACT_APP_API_BASE_URL=http://72.62.29.141:8000/api
```

**Note** : L'IP `72.62.29.141` est déjà configurée par défaut dans `docker-compose.yml`. Vous n'avez besoin de créer un fichier `.env` que si vous voulez utiliser une autre adresse.

**Important** : Les variables d'environnement React sont intégrées au moment du build. Si vous modifiez cette variable, vous devez reconstruire l'image Docker :

```bash
docker-compose build --no-cache
docker-compose up -d
```

