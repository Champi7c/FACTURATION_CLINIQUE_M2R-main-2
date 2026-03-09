# Prochaines étapes – Déploiement (serveur actuel + Hostinger)

**IP du serveur : 72.62.29.141**

Voici quoi faire pour que l’app tourne sur votre serveur actuel **et/ou** sur Hostinger.

---

## Option A : Déployer sur votre serveur actuel (72.62.29.141)

### 1. Sur le serveur 72.62.29.141 (première fois)

1. **Se connecter en SSH** :
   ```bash
   ssh root@72.62.29.141
   ```

2. **Cloner le projet** (remplacer par l’URL de votre dépôt) :
   ```bash
   git clone https://github.com/Champi7c/FACTURATION_CLINIQUE_M2R-main-2.git /opt/facturation-clinique
   cd /opt/facturation-clinique
   ```

3. **Créer le `.env`** sur le serveur (même contenu que sur votre machine, avec l’IP ou le domaine du serveur) :
   ```bash
   cp .env.example .env
   nano .env
   ```

4. **Lancer la stack** :
   ```bash
   docker compose up -d
   ```

5. **Vérifier** :
   - Frontend : http://72.62.29.141:9000  
   - Backend : http://72.62.29.141:9001/api/  
   - phpMyAdmin : http://72.62.29.141:9002  

### 2. CI/CD (après la première mise en place)

Une fois les **secrets GitHub** configurés (voir `DEPLOYMENT.md`), chaque **push sur `main`** :

- build et push des images sur Docker Hub  
- déploiement automatique sur le serveur (pull + redémarrage)

Vous n’avez plus qu’à pousser le code ; le serveur se met à jour tout seul.

---

## Option B : Déployer sur Hostinger (VPS Docker)

**→ Guide dédié : [HOSTINGER.md](HOSTINGER.md)**

En résumé :

1. Prendre un **VPS Hostinger** avec le template **Docker**.
2. Se connecter en **SSH** au VPS.
3. Cloner le dépôt dans `/opt/facturation-clinique`, puis lancer le script :
   ```bash
   chmod +x deploy-on-hostinger.sh
   ./deploy-on-hostinger.sh
   ```
4. Si demandé, éditer le fichier `.env` (IP du VPS, mots de passe), puis relancer le script.

L’application sera accessible sur `http://IP_DU_VPS:9000` (frontend), `http://IP_DU_VPS:9001/api/` (API), `http://IP_DU_VPS:9002` (phpMyAdmin).

---

## Option C : Tester en local sur votre Mac (optionnel)

Si Docker est installé sur votre Mac, vous pouvez lancer l’app localement :

```bash
cd /Library/AKOA/FACTURATION_CLINIQUE_M2R-main-2
./run-docker.sh
```

Ou manuellement : `docker compose build --no-cache` puis `docker compose up -d`.  
Puis ouvrir http://localhost:9000 et http://localhost:9001/api/

---

## Récapitulatif

| Où déployer           | Action principale |
|-----------------------|-------------------|
| **Serveur 72.62.29.141** | Cloner le repo, créer `.env`, lancer `docker compose up -d`. Puis configurer les secrets GitHub pour le CI/CD. |
| **Hostinger VPS**     | Voir **[HOSTINGER.md](HOSTINGER.md)** : clone + `./deploy-on-hostinger.sh` (+ éditer `.env` si demandé). |
| **Mac (test local)**  | `./run-docker.sh` (Docker installé). |

Dans tous les cas : **sans fichier `.env` correct (SECRET_KEY, DB_PASSWORD, URLs avec la bonne IP/domaine), l’application ne fonctionnera pas.** Le script Hostinger crée le `.env` depuis `.env.example` et vous indique quoi modifier.
