# Instructions Rapides - Backend Django

## ✅ Ce qui est déjà fait:
- ✅ Dépendances installées
- ✅ Migrations créées
- ✅ Configuration Django prête

## 📋 À faire maintenant:

### 1. Démarrer MySQL
```bash
net start MySQL
# ou vérifier dans Services Windows
```

### 2. Créer la base de données
```bash
mysql -u root -p
```
Puis dans MySQL:
```sql
CREATE DATABASE facturation_clinique CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 3. Vérifier/Modifier le fichier .env
Le fichier `.env` doit contenir:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=VOTRE_MOT_DE_PASSE
DB_NAME=facturation_clinique
DB_PORT=3306
SECRET_KEY=django-insecure-change-this-in-production-secret-key
DEBUG=True
```

### 4. Exécuter les migrations
```bash
python manage.py migrate
```

### 5. Démarrer le serveur
```bash
python manage.py runserver
```

Le serveur sera sur: `http://localhost:8000`
L'API sera sur: `http://localhost:8000/api/`

### 6. Tester l'API
Ouvrir dans le navigateur: `http://localhost:8000/api/test/`


