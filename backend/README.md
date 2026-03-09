# Backend Django - Facturation Clinique

<!-- Test déploiement automatique -->

API REST complète développée avec Django et Django REST Framework pour connecter le frontend React à la base de données MySQL.

## 🚀 Installation

### Prérequis
- Python 3.8+
- MySQL/MariaDB
- pip (gestionnaire de paquets Python)

### Installation

1. **Créer un environnement virtuel** (recommandé):

```bash
cd backend
python -m venv venv

# Activer l'environnement virtuel
# Sur Windows:
venv\Scripts\activate
# Sur Linux/Mac:
source venv/bin/activate
```

2. **Installer les dépendances**:

```bash
pip install -r requirements.txt
```

**Note:** Si `mysqlclient` pose problème, installez d'abord les dépendances système:
- **Windows:** Télécharger le wheel depuis https://www.lfd.uci.edu/~gohlke/pythonlibs/#mysqlclient
- **Linux:** `sudo apt-get install python3-dev default-libmysqlclient-dev build-essential`
- **Mac:** `brew install mysql-client pkg-config`

Alternative: Utiliser `pymysql` au lieu de `mysqlclient`:
```bash
pip install pymysql
```
Et ajouter dans `facturation_clinique/__init__.py`:
```python
import pymysql
pymysql.install_as_MySQLdb()
```

3. **Configurer la base de données**:

Copier le fichier `.env.example` vers `.env`:
```bash
cp .env.example .env
```

Modifier `.env` avec vos paramètres:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=facturation_clinique
DB_PORT=3306
SECRET_KEY=django-insecure-change-this-in-production
DEBUG=True
```

4. **Créer la base de données**:

```bash
mysql -u root -p
CREATE DATABASE facturation_clinique CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

5. **Exécuter les migrations**:

```bash
python manage.py makemigrations
python manage.py migrate
```

6. **Créer un superutilisateur** (optionnel, pour l'admin Django):

```bash
python manage.py createsuperuser
```

## 🏃 Démarrage

```bash
python manage.py runserver
```

Le serveur sera accessible sur `http://localhost:8000`

- API: `http://localhost:8000/api/`
- Admin Django: `http://localhost:8000/admin/`

## 📡 Endpoints API

### Analyses
- `GET /api/analyses/` - Liste toutes les analyses
- `GET /api/analyses/{id}/` - Récupère une analyse
- `POST /api/analyses/` - Crée une analyse
- `PUT /api/analyses/{id}/` - Met à jour une analyse
- `DELETE /api/analyses/{id}/` - Supprime une analyse

### IPM
- `GET /api/ipms/` - Liste toutes les IPM
- `GET /api/ipms/{id}/` - Récupère une IPM
- `POST /api/ipms/` - Crée une IPM
- `PUT /api/ipms/{id}/` - Met à jour une IPM
- `DELETE /api/ipms/{id}/` - Supprime une IPM

### Assurances
- `GET /api/assurances/` - Liste toutes les assurances
- `GET /api/assurances/{id}/` - Récupère une assurance
- `POST /api/assurances/` - Crée une assurance
- `PUT /api/assurances/{id}/` - Met à jour une assurance
- `DELETE /api/assurances/{id}/` - Supprime une assurance

### Tarifs
- `GET /api/tarifs/` - Liste tous les tarifs
- `POST /api/tarifs/` - Crée un tarif
- `PUT /api/tarifs/{id}/` - Met à jour un tarif
- `DELETE /api/tarifs/{id}/` - Supprime un tarif

### Patients
- `GET /api/patients/` - Liste tous les patients
- `GET /api/patients/{id}/` - Récupère un patient
- `POST /api/patients/` - Crée un patient
- `PUT /api/patients/{id}/` - Met à jour un patient
- `DELETE /api/patients/{id}/` - Supprime un patient

### Devis
- `GET /api/devis/` - Liste tous les devis
- `GET /api/devis/{id}/` - Récupère un devis
- `POST /api/devis/` - Crée un devis
- `PUT /api/devis/{id}/` - Met à jour un devis
- `DELETE /api/devis/{id}/` - Supprime un devis

## 🔧 Structure du projet

```
backend/
├── facturation_clinique/    # Configuration du projet Django
│   ├── settings.py          # Paramètres Django
│   ├── urls.py              # URLs principales
│   └── wsgi.py              # Configuration WSGI
├── api/                     # Application API
│   ├── models.py            # Modèles de données
│   ├── serializers.py       # Sérialiseurs DRF
│   ├── views.py             # Vues (ViewSets)
│   ├── urls.py              # URLs de l'API
│   └── admin.py             # Configuration admin Django
├── manage.py                # Script de gestion Django
├── requirements.txt         # Dépendances Python
└── .env                     # Variables d'environnement
```

## 📝 Format des données

### Créer un devis

```json
POST /api/devis/
{
  "patient": "patient_id",
  "souscripteur": "Nom du souscripteur",
  "tauxCouverture": "30",
  "lignes": [
    {
      "analyseId": "analyse_id",
      "prix": 10000
    }
  ]
}
```

## 🔍 Test de l'API

```bash
# Tester l'endpoint de test
curl http://localhost:8000/api/test/

# Récupérer toutes les analyses
curl http://localhost:8000/api/analyses/

# Créer une analyse
curl -X POST http://localhost:8000/api/analyses/ \
  -H "Content-Type: application/json" \
  -d '{"nom": "Test Analyse", "categorie": "analyses"}'
```

## 📚 Documentation

- Django: https://docs.djangoproject.com/
- Django REST Framework: https://www.django-rest-framework.org/
- CORS Headers: https://github.com/adamchainz/django-cors-headers


