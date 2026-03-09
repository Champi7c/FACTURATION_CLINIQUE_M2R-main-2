# Déployer Facturation Clinique sur Hostinger (VPS Docker)

Guide pour mettre l’application en ligne sur un **VPS Hostinger avec Docker**.

**IP du serveur : 72.62.29.141**

---

## Prérequis

- Un **VPS Hostinger** avec le template **Docker** (Docker et Docker Compose préinstallés).
- L’URL de votre dépôt Git (GitHub, GitLab, etc.).
- 5 à 10 minutes.

---

## Méthode 1 : Déploiement en SSH (recommandé)

À faire **une seule fois** sur le VPS Hostinger.

### Étape 1 : Accéder au VPS

1. Dans le **panel Hostinger** : VPS → votre serveur → **SSH** (ou **Accès root**).
2. Notez : **IP du VPS**, **utilisateur** (souvent `root`), **mot de passe** (ou importez votre clé SSH).
3. Sur votre Mac, ouvrez un terminal et connectez-vous :
   ```bash
   ssh root@72.62.29.141
   ```
   (Ou utilisez l’IP affichée dans le panel Hostinger si différente.)

### Étape 2 : Cloner le projet et lancer le script

Sur le VPS (dans le terminal SSH), exécutez :

```bash
# Créer le dossier et cloner le dépôt
git clone https://github.com/Champi7c/FACTURATION_CLINIQUE_M2R-main-2.git /opt/facturation-clinique
cd /opt/facturation-clinique

# Lancer le script de déploiement (crée .env si besoin, build + démarrage)
chmod +x deploy-on-hostinger.sh
./deploy-on-hostinger.sh
```

Si le script vous demande de **créer ou modifier le `.env`** :

```bash
nano .env
```

Adaptez au minimum (IP du serveur : **72.62.29.141**) :

- `ALLOWED_HOSTS` → `localhost,127.0.0.1,0.0.0.0,72.62.29.141,backend`
- `CORS_ALLOWED_ORIGINS` → `http://localhost:9000,http://127.0.0.1:9000,http://72.62.29.141:9000,https://72.62.29.141:9000`
- `REACT_APP_API_BASE_URL` → `http://72.62.29.141:9001/api`
- `DB_PASSWORD` → gardez ou changez le mot de passe MySQL.
- `SECRET_KEY` → gardez ou générez une nouvelle clé.

Sauvegardez (Ctrl+O, Entrée, Ctrl+X), puis relancez :

```bash
./deploy-on-hostinger.sh
```

### Étape 3 : Vérifier

Une fois le script terminé, ouvrez dans un navigateur :

- **Application (frontend)** : http://72.62.29.141:9000
- **API (backend)** : http://72.62.29.141:9001/api/
- **phpMyAdmin** : http://72.62.29.141:9002

---

## Méthode 2 : Docker Manager (Compose from URL)

À utiliser **après** avoir poussé les images sur Docker Hub (via le CI/CD ou un build manuel).

1. Dans Hostinger : **VPS** → **Docker Manager** → **Compose from URL**.
2. Collez l’URL du fichier compose :
   ```
   https://github.com/Champi7c/FACTURATION_CLINIQUE_M2R-main-2/raw/main/docker-compose.hostinger.yml
   ```
3. Dans le Docker Manager, ajoutez les **variables d’environnement** (équivalent du `.env`) :
   - `DB_PASSWORD`, `SECRET_KEY`
- `ALLOWED_HOSTS` = `localhost,127.0.0.1,0.0.0.0,72.62.29.141,backend`
  - `CORS_ALLOWED_ORIGINS` = `http://72.62.29.141:9000`
4. Lancez le déploiement.

---

## Mises à jour sur Hostinger (après le premier déploiement)

En SSH sur le VPS :

```bash
cd /opt/facturation-clinique
git pull
docker compose build --no-cache
docker compose up -d
```

---

## Récapitulatif

| Où | Action |
|----|--------|
| **Sur votre Mac** | Rien d’obligatoire pour Hostinger. Vous pouvez tester en local avec `./run-docker.sh` si Docker est installé. |
| **Sur Hostinger (SSH)** | Clone du repo → `./deploy-on-hostinger.sh` → éditer `.env` si demandé → relancer le script. |
| **URLs** | Frontend : http://72.62.29.141:9000 — API : http://72.62.29.141:9001/api/ — phpMyAdmin : http://72.62.29.141:9002 |
