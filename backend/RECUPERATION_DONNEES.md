# Guide de Récupération des Données MySQL

## 🔍 Étape 1 : Diagnostic sur le serveur

Connectez-vous au serveur et exécutez le script de diagnostic :

```bash
ssh root@72.62.29.141
cd /root/clinique-app/backend
chmod +x check_database_data.sh
./check_database_data.sh
```

## 📦 Étape 2 : Vérifier les volumes existants

```bash
# Lister tous les volumes
docker volume ls

# Vérifier les volumes MySQL spécifiques
docker volume ls | grep -E "mysql|facturation"

# Inspecter un volume spécifique
docker volume inspect backend_mysql_data
# ou
docker volume inspect mysql_data
```

## 🔄 Étape 3 : Vérifier si les données existent encore

```bash
# Vérifier le montage du volume actuel
docker inspect facturation_mysql | grep -A 10 Mounts

# Accéder au conteneur MySQL
docker exec -it facturation_mysql bash

# Dans le conteneur, vérifier les bases de données
mysql -u root -p
SHOW DATABASES;
USE facturation_clinique;
SHOW TABLES;
SELECT COUNT(*) FROM api_patient;  # Exemple
```

## 💾 Étape 4 : Vérifier les sauvegardes

```bash
# Chercher des sauvegardes
find /root -name "*backup*" -type f 2>/dev/null
find /root -name "*mysql*" -type f 2>/dev/null
ls -la /root/clinique-app/backend/backups/ 2>/dev/null
```

## 🔧 Étape 5 : Si les données sont dans un autre volume

Si vous trouvez un volume avec des données mais que le conteneur actuel utilise un nouveau volume vide :

```bash
# 1. Arrêter le conteneur actuel
docker compose down

# 2. Modifier docker-compose.yml pour utiliser l'ancien volume
# Dans docker-compose.yml, section db, volumes:
#   - ancien_volume_name:/var/lib/mysql

# 3. Redémarrer
docker compose up -d
```

## ⚠️ Si les données sont vraiment perdues

### Option A : Restaurer depuis une sauvegarde

Si vous avez une sauvegarde SQL :

```bash
# Copier la sauvegarde dans le conteneur
docker cp backup.sql facturation_mysql:/tmp/

# Restaurer
docker exec -it facturation_mysql mysql -u root -p facturation_clinique < /tmp/backup.sql
```

### Option B : Vérifier les volumes orphelins

```bash
# Lister tous les volumes (même non utilisés)
docker volume ls

# Inspecter chaque volume pour trouver celui avec des données
for vol in $(docker volume ls -q); do
  echo "=== Volume: $vol ==="
  docker volume inspect $vol --format '{{.Mountpoint}}' | xargs ls -la 2>/dev/null | head -5
done
```

## 🛡️ Prévention future

Le workflow GitHub Actions a été mis à jour pour :
- ✅ Ne jamais supprimer les volumes (`docker rm -f` sans `-v`)
- ✅ Créer des backups automatiques avant déploiement
- ✅ Vérifier les volumes avant suppression

## 📞 Support

Si les données sont perdues et qu'il n'y a pas de sauvegarde, contactez votre administrateur système pour vérifier les backups système du serveur.

