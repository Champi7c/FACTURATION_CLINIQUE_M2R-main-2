# Configuration Backend pour Docker

## Configuration Django requise

Pour que le frontend Docker puisse accéder au backend Django, assurez-vous que :

### 1. Le backend écoute sur toutes les interfaces

**❌ Mauvaise configuration** :
```bash
python manage.py runserver 127.0.0.1:8000  # Ne fonctionne pas avec Docker
python manage.py runserver localhost:8000   # Ne fonctionne pas avec Docker
```

**✅ Bonne configuration** :
```bash
python manage.py runserver 0.0.0.0:8000
```

Ou dans votre fichier de configuration :
```python
# settings.py ou configuration de serveur
HOST = '0.0.0.0'
PORT = 8000
```

### 2. CORS configuré correctement

Installez django-cors-headers si ce n'est pas déjà fait :
```bash
pip install django-cors-headers
```

Dans `settings.py` :

```python
INSTALLED_APPS = [
    # ...
    'corsheaders',
    # ...
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Doit être en haut
    'django.middleware.common.CommonMiddleware',
    # ...
]

# Configuration CORS
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# En développement uniquement (désactiver en production)
CORS_ALLOW_ALL_ORIGINS = True  # Utilisez uniquement pour les tests

# Autoriser les cookies de session
CORS_ALLOW_CREDENTIALS = True

# Autoriser les headers nécessaires
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
```

### 3. ALLOWED_HOSTS configuré

```python
# settings.py
ALLOWED_HOSTS = ['*']  # En développement uniquement

# En production, spécifiez les domaines exacts :
# ALLOWED_HOSTS = ['votre-domaine.com', 'www.votre-domaine.com']
```

### 4. Vérifier que le backend répond

Testez manuellement :
```bash
# Depuis votre machine
curl http://localhost:8000/api/

# Devrait retourner une réponse (même une erreur 404 est OK, cela signifie que le serveur répond)
```

### 5. Vérifier depuis Docker (si backend est sur l'hôte)

```bash
# Depuis un conteneur Docker
docker run --rm curlimages/curl curl http://host.docker.internal:8000/api/

# Ou avec l'IP du gateway
docker run --rm curlimages/curl curl http://172.17.0.1:8000/api/
```

Si ces commandes échouent, le backend n'est pas accessible depuis Docker.

### Configuration complète recommandée (développement)

```python
# settings.py (fichier de développement)

DEBUG = True

ALLOWED_HOSTS = ['*']

# CORS - Configuration de développement
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# Configuration de session (pour l'authentification)
SESSION_COOKIE_SECURE = False  # True en HTTPS uniquement
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'

CSRF_COOKIE_SECURE = False  # True en HTTPS uniquement
CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_SAMESITE = 'Lax'
```

### Commandes de démarrage

```bash
# Démarrage standard (écoute sur toutes les interfaces)
python manage.py runserver 0.0.0.0:8000

# Ou avec gunicorn (production)
gunicorn --bind 0.0.0.0:8000 votre_projet.wsgi:application
```

### Test rapide

Pour tester rapidement si votre configuration fonctionne :

1. Démarrez le backend : `python manage.py runserver 0.0.0.0:8000`
2. Dans un autre terminal, testez :
   ```bash
   curl http://localhost:8000/api/
   ```
3. Si cela fonctionne, le backend est correctement configuré pour Docker

