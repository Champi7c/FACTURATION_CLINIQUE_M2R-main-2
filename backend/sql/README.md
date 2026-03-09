# Scripts SQL – Données de la plateforme

Ce dossier contient les scripts SQL pour gérer les données (vidage, chargement des analyses, réinitialisation).

## clear_all_data.sql

Supprime **toutes** les données métier :

- Lignes de devis (`devis_lignes`)
- Devis (`devis`)
- Patients (`patients`)
- Tarifs (`tarifs`)
- Analyses (`analyses`)
- IPM (`ipms`)
- Assurances (`assurances`)
- Catégories (`categories`)

**Les utilisateurs (auth_user, etc.) ne sont pas supprimés.**

### Utilisation

Depuis la racine du projet `backend` :

**MySQL :**
```bash
mysql -u root -p facturation_clinique < sql/clear_all_data.sql
```

**SQLite :**
```bash
sqlite3 db.sqlite3 < sql/clear_all_data.sql
```

**Avec Django (exécute le script selon la base configurée) :**
```bash
python manage.py clear_all_data --no-input
```

---

## Recharger toutes les données en une commande

Pour **vider puis recharger** les données initiales (analyses, IPM, assurances, tarifs, patients, devis de démo) en une seule fois :

```bash
python manage.py load_initial_data
```

Sans demande de confirmation :
```bash
python manage.py load_initial_data --no-input
```

---

## analyses.sql

Contient les **analyses** (prestations) à charger dans la plateforme (export phpMyAdmin).

- Utilisé automatiquement par `load_initial_data` : les analyses sont chargées depuis ce fichier, puis IPM, assurances, tarifs, patients et devis sont créés par `populate_db`.
- Pour recharger tout (analyses + reste) : `python manage.py load_initial_data --no-input`
