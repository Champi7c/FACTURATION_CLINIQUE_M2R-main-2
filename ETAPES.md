# Étapes de déploiement – Facturation Clinique

**IP du serveur : 72.62.29.141**

**→ Pour tout faire d’un coup sur le serveur : voir [COMMANDES-SERVEUR.txt](COMMANDES-SERVEUR.txt)** (3 commandes à copier-coller.)

---

## Option 1 : Sur le serveur 72.62.29.141 (méthode rapide)

1. Sur votre Mac : `ssh root@72.62.29.141`
2. Sur le serveur :
   ```bash
   git clone https://github.com/Champi7c/FACTURATION_CLINIQUE_M2R-main-2.git /opt/facturation-clinique
   cd /opt/facturation-clinique
   chmod +x install.sh
   ./install.sh
   ```
3. Quand le script a fini : ouvrir http://72.62.29.141:9000 dans le navigateur.

Le script `install.sh` crée le `.env` à partir de `.env.example` puis lance le build et les conteneurs.

---

## Option 1 (détail) : Sur le serveur 72.62.29.141

### Étape 1 – Se connecter au serveur

Sur votre Mac, ouvrez le **Terminal** et tapez :

```bash
ssh root@72.62.29.141
```

(Entrez le mot de passe quand il est demandé.)

### Étape 2 – Cloner le projet

Sur le serveur (dans le terminal SSH), exécutez (remplacez par l’URL de votre dépôt GitHub) :

```bash
git clone https://github.com/Champi7c/FACTURATION_CLINIQUE_M2R-main-2.git /opt/facturation-clinique
cd /opt/facturation-clinique
```

### Étape 3 – Créer le fichier .env

```bash
cp .env.example .env
nano .env
```

Dans l’éditeur, vérifiez ou modifiez au minimum :

- `DB_PASSWORD=...` → mot de passe pour MySQL (ex. `FacturationClinique2025!`)
- `SECRET_KEY=...` → gardez la valeur ou générez une clé aléatoire
- `ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0,72.62.29.141,backend`
- `CORS_ALLOWED_ORIGINS=http://localhost:9000,http://127.0.0.1:9000,http://72.62.29.141:9000,https://72.62.29.141:9000`
- `REACT_APP_API_BASE_URL=http://72.62.29.141:9001/api`

Pour sauvegarder : **Ctrl+O**, **Entrée**, puis **Ctrl+X** pour quitter.

### Étape 4 – Lancer l’application

```bash
docker compose build --no-cache
docker compose up -d
```

### Étape 5 – Vérifier

Ouvrez dans votre navigateur :

- **Application** : http://72.62.29.141:9000  
- **API** : http://72.62.29.141:9001/api/  
- **phpMyAdmin** : http://72.62.29.141:9002  

---

## Option 2 : Sur Hostinger (VPS Docker)

### Étape 1 – Souscrire au VPS

- Allez sur Hostinger et prenez un **VPS** avec le template **Docker**.
- Dans le panel : notez l’**IP du VPS** et les accès **SSH** (utilisateur, mot de passe ou clé).

### Étape 2 – Se connecter au VPS

Sur votre Mac, dans le Terminal :

```bash
ssh root@IP_DU_VPS_HOSTINGER
```

(Remplacez `IP_DU_VPS_HOSTINGER` par l’IP affichée dans Hostinger.)

### Étape 3 – Cloner et lancer le script

Sur le VPS :

```bash
git clone https://github.com/Champi7c/FACTURATION_CLINIQUE_M2R-main-2.git /opt/facturation-clinique
cd /opt/facturation-clinique
chmod +x deploy-on-hostinger.sh
./deploy-on-hostinger.sh
```

### Étape 4 – Éditer le .env si le script le demande

Si le script affiche « Éditez le fichier .env » :

```bash
nano .env
```

Mettez l’**IP du VPS Hostinger** dans :

- `ALLOWED_HOSTS=...,IP_DU_VPS,backend`
- `CORS_ALLOWED_ORIGINS=...,http://IP_DU_VPS:9000`
- `REACT_APP_API_BASE_URL=http://IP_DU_VPS:9001/api`

Sauvegardez (Ctrl+O, Entrée, Ctrl+X), puis relancez :

```bash
./deploy-on-hostinger.sh
```

### Étape 5 – Vérifier

Dans le navigateur (remplacez `IP_DU_VPS` par l’IP de votre VPS) :

- **Application** : http://IP_DU_VPS:9000  
- **API** : http://IP_DU_VPS:9001/api/  
- **phpMyAdmin** : http://IP_DU_VPS:9002  

---

## Option 3 : Tester sur votre Mac (local)

### Étape 1 – Installer Docker

- Téléchargez et installez **Docker Desktop** pour Mac : https://www.docker.com/products/docker-desktop/  
- Lancez Docker et attendez qu’il soit prêt.

### Étape 2 – Préparer le .env

Dans le Terminal :

```bash
cd /Library/AKOA/FACTURATION_CLINIQUE_M2R-main-2
cp .env.example .env
```

(Ou éditez `.env` avec `nano .env` si vous voulez changer le mot de passe MySQL.)

### Étape 3 – Lancer l’application

```bash
./run-docker.sh
```

Ou manuellement :

```bash
docker compose build --no-cache
docker compose up -d
```

### Étape 4 – Vérifier

Dans le navigateur :

- **Application** : http://localhost:9000  
- **API** : http://localhost:9001/api/  
- **phpMyAdmin** : http://localhost:9002  

---

## Mise à jour (après modification du code)

**Sur le serveur 72.62.29.141 ou sur Hostinger**, en SSH :

```bash
cd /opt/facturation-clinique
git pull
docker compose build --no-cache
docker compose up -d
```

---

## Récapitulatif

| Où              | Étapes principales                                      |
|-----------------|---------------------------------------------------------|
| **Serveur 72.62.29.141** | 1) SSH → 2) clone → 3) `.env` → 4) `docker compose up -d` |
| **Hostinger**   | 1) VPS Docker → 2) SSH → 3) clone → 4) `./deploy-on-hostinger.sh` → 5) éditer `.env` si besoin |
| **Mac (local)** | 1) Docker Desktop → 2) `.env` → 3) `./run-docker.sh`   |
