# Déploiement Docker – Facturation Clinique

Ce document décrit l’architecture Docker et les étapes pour déployer l’application en production (frontend React, backend Django, MySQL, phpMyAdmin) ainsi que le pipeline CI/CD (GitHub Actions).

**→ Voir [ETAPES_SUITE.md](ETAPES_SUITE.md) pour les prochaines étapes concrètes (serveur actuel + Hostinger).**  
**IP du serveur : 72.62.29.141**

---

## 1. Architecture

- **frontend** : React (build production) servi par Nginx (port **9000**)
- **backend** : Django + Gunicorn (port **9001**)
- **mysql** : MySQL 8, volume persistant (port exposé optionnel **9330**)
- **phpmyadmin** : interface d’administration MySQL (port **9002**)

Réseau interne Docker : `app-network`.  
Ports volontairement en 9000+ pour éviter les conflits avec 3000, 8000, 8080, etc.

---

## 2. Prérequis sur le serveur

- Docker et Docker Compose installés
- Ports **9000**, **9001**, **9002**, **9330** (optionnel) libres
- Accès SSH pour le déploiement automatisé

---

## 3. Déploiement manuel

### 3.1 Cloner le projet

```bash
git clone <url-du-repo> /opt/facturation-clinique
cd /opt/facturation-clinique
```

### 3.2 Fichier d’environnement

```bash
cp .env.example .env
# Éditer .env : SECRET_KEY, DB_PASSWORD, ALLOWED_HOSTS, CORS, REACT_APP_API_BASE_URL
nano .env
```

Variables importantes :

- `SECRET_KEY` : clé Django (générer une valeur forte)
- `DB_PASSWORD` : mot de passe MySQL root
- `ALLOWED_HOSTS` : IP ou domaine du serveur (ex. `72.62.29.141`)
- `CORS_ALLOWED_ORIGINS` : URL du frontend (ex. `http://72.62.29.141:9000`)
- `REACT_APP_API_BASE_URL` : URL de l’API côté navigateur (ex. `http://72.62.29.141:9001/api`)

### 3.3 Build et démarrage

```bash
docker compose build --no-cache
docker compose up -d
```

### 3.4 Vérifications

- Frontend : http://72.62.29.141:9000  
- Backend API : http://72.62.29.141:9001/api/  
- phpMyAdmin : http://72.62.29.141:9002  

```bash
docker compose ps
docker compose logs -f backend
```

---

## 4. Nginx sur l’hôte (reverse proxy)

Si Nginx est déjà installé sur la machine, vous pouvez exposer l’app via des noms ou chemins au lieu des ports directs.

1. Copier la config :

   ```bash
   sudo cp deploy/nginx-facturation.conf /etc/nginx/sites-available/
   sudo ln -s /etc/nginx/sites-available/nginx-facturation.conf /etc/nginx/sites-enabled/
   ```

2. Adapter `server_name` et les ports (9000, 9001, 9002) dans le fichier.

3. Tester et recharger :

   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```

Le fichier contient une variante commentée pour tout exposer sur le même domaine avec des chemins (`/`, `/api/`, `/pma/`).

---

## 5. Déploiement sur Hostinger (VPS Docker)

Hostinger propose des **VPS avec Docker** (Docker et Docker Compose préinstallés). L’hébergement mutualisé ne convient pas ; il faut un **VPS avec le template Docker**.

### Méthode A : SSH (recommandé)

1. Souscrire à un VPS Hostinger avec le template **Docker**.
2. Se connecter en SSH : `ssh root@IP_DU_VPS`.
3. Cloner le dépôt, créer `.env` (comme en §3), puis :
   ```bash
   cd /opt/facturation-clinique
   docker compose build --no-cache && docker compose up -d
   ```
4. Renseigner dans `.env` l’**IP du VPS Hostinger** (ou votre domaine) pour `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `REACT_APP_API_BASE_URL`.

Accès : `http://IP_VPS:9000` (frontend), `http://IP_VPS:9001/api/` (API), `http://IP_VPS:9002` (phpMyAdmin).

### Méthode B : Docker Manager (Compose from URL)

Si les images sont déjà sur Docker Hub (après un push manuel ou via CI/CD) :

1. Dans le panel Hostinger → VPS → **Docker Manager** → **Compose from URL**.
2. Coller l’URL du fichier compose **sans build** (version images uniquement) :
   ```
   https://github.com/Champi7c/FACTURATION_CLINIQUE_M2R-main-2/raw/main/docker-compose.hostinger.yml
   ```
3. Dans le Docker Manager, définir les **variables d’environnement** (équivalent du `.env`) :
   - `DOCKER_REGISTRY` (ex. votre compte Docker Hub)
   - `DB_PASSWORD`, `SECRET_KEY`
   - `ALLOWED_HOSTS` (IP ou domaine du VPS)
   - `CORS_ALLOWED_ORIGINS` (ex. `http://IP_VPS:9000`)
4. Lancer le déploiement. Les ports 9000, 9001, 9002 seront exposés.

---

## 6. CI/CD – GitHub Actions

Le workflow `.github/workflows/deploy.yml` :

1. Au **push sur `main`** : build des images frontend et backend.
2. **Push** des images vers Docker Hub.
3. **Connexion SSH** au serveur, `docker compose pull` puis `docker compose up -d`.

### 5.1 Secrets à configurer (GitHub → Settings → Secrets and variables → Actions)

| Secret            | Description                          |
|-------------------|--------------------------------------|
| `DOCKERHUB_USERNAME` | Compte Docker Hub                    |
| `DOCKERHUB_TOKEN`    | Token (ou mot de passe) Docker Hub   |
| `SSH_PRIVATE_KEY`   | Clé privée SSH pour le serveur       |
| `SSH_HOST`          | IP du serveur (ex. `72.62.29.141`)  |
| `SSH_USER`          | Utilisateur SSH (ex. `root`)         |
| `DEPLOY_PATH`       | (Optionnel) Répertoire du projet sur le serveur (ex. `/opt/facturation-clinique`) |

Sans `DEPLOY_PATH`, le script utilise `/opt/facturation-clinique`.

### 5.2 Variable optionnelle

- **`REACT_APP_API_BASE_URL`** (Variables de dépôt) : URL de l’API utilisée au **build** du frontend (ex. `http://72.62.29.141:9001/api`). Si non définie, la valeur par défaut du workflow est utilisée.

### 5.3 Premier déploiement côté serveur

Une fois les secrets en place, le pipeline pourra :

1. Builder et pousser les images.
2. Se connecter en SSH et exécuter `docker compose pull` et `docker compose up -d`.

Il faut que le projet soit déjà cloné sur le serveur avec un `.env` valide, par exemple :

```bash
# Sur le serveur, une seule fois
git clone <url> /opt/facturation-clinique
cd /opt/facturation-clinique
cp .env.example .env
# Éditer .env puis :
docker compose up -d
```

Ensuite, chaque push sur `main` mettra à jour les images et redémarrera les services.

---

## 7. Fichiers principaux

| Fichier                     | Rôle                                      |
|----------------------------|-------------------------------------------|
| `docker-compose.yml`       | Stack complète (frontend, backend, mysql, phpmyadmin) |
| `frontend/Dockerfile`      | Build React + Nginx                       |
| `frontend/nginx.conf`      | Config Nginx dans le container frontend    |
| `backend/Dockerfile`       | Django + Gunicorn, migrations, collectstatic |
| `backend/entrypoint.sh`    | Attente MySQL, migrations, collectstatic  |
| `.env.example`             | Modèle de variables d’environnement        |
| `deploy/nginx-facturation.conf` | Nginx hôte (reverse proxy)            |
| `.github/workflows/deploy.yml` | Pipeline CI/CD                        |
| `docker-compose.hostinger.yml` | Version sans build pour Hostinger (Docker Manager) |
| `ETAPES_SUITE.md`              | Prochaines étapes (serveur + Hostinger)           |

---

## 8. Volumes et données

- **mysql_data** : données MySQL (persistantes).
- **static_files** : fichiers statiques Django (collectstatic).
- **media_files** : médias Django (si utilisé plus tard).

Sauvegarde MySQL (exemple) :

```bash
docker compose exec mysql mysqldump -u root -p${DB_PASSWORD} facturation_clinique > backup.sql
```

---

## 9. Dépannage

- **Conflit de ports** : modifier dans `.env` les variables `FRONTEND_PORT`, `BACKEND_PORT`, `PHPMYADMIN_PORT`, `MYSQL_PORT`.
- **Backend ne démarre pas** : vérifier les logs (`docker compose logs backend`) et que MySQL est healthy (`docker compose ps`). Vérifier `DB_PASSWORD`, `USE_SQLITE=False` et `DB_HOST=mysql`.
- **CORS** : s’assurer que `CORS_ALLOWED_ORIGINS` contient l’URL exacte du frontend (schéma, domaine, port).
- **Frontend ne joint pas l’API** : vérifier que `REACT_APP_API_BASE_URL` est l’URL utilisée par le **navigateur** pour appeler l’API (même domaine/IP que l’affichage de l’app).
