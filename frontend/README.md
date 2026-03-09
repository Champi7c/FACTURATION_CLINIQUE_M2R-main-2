# Plateforme de Facturation pour Clinique Médicale

Plateforme web professionnelle de facturation développée avec React, destinée à gérer la facturation des analyses médicales pour les IPM et les Assurances.

## 🚀 Installation

### Prérequis
- Node.js 14+ et npm

### Installation des dépendances

```bash
npm install
```

### Démarrer l'application

```bash
npm start
```

L'application s'ouvrira automatiquement dans votre navigateur à l'adresse `http://localhost:3000`

## 📋 Fonctionnalités

### ✅ Gestion des Analyses
- Ajouter, modifier, supprimer des analyses
- Définir un prix lors de l'ajout (optionnel)

### ✅ Gestion des IPM
- CRUD complet pour les IPM
- Gestion des tarifs par IPM
- Importation de la liste standard des analyses

### ✅ Gestion des Assurances
- CRUD complet pour les assurances
- Gestion des tarifs par assurance
- Importation de la liste standard des analyses

### ✅ Gestion des Patients
- CRUD complet pour les patients
- Association IPM ou Assurance (jamais les deux)

### ✅ Gestion des Devis
- Création de devis par patient
- Sélection automatique des prix selon IPM/Assurance
- Calcul automatique du total
- Impression et export PDF

### ✅ Devis Mensuels
- Génération de devis mensuels par IPM/Assurance
- Regroupement automatique des devis
- Export PDF

## 💾 Stockage des données

Les données sont stockées dans le **localStorage** du navigateur. Toutes les données sont persistantes et disponibles même après fermeture du navigateur.

## 🎨 Technologies utilisées

- **React 19.2.3** - Bibliothèque JavaScript
- **React Router DOM** - Routage
- **jsPDF** - Génération de PDF
- **Bootstrap Icons** - Icônes
- **localStorage** - Persistance des données
- **Electron** - Framework pour applications desktop

## 📁 Structure du projet

```
facturation-clinique/
├── electron/         # Configuration Electron
│   ├── main.js      # Processus principal Electron
│   └── preload.js   # Script de préchargement sécurisé
├── src/
│   ├── components/   # Composants réutilisables
│   │   ├── Layout.js    # Layout principal avec sidebar
│   │   └── Layout.css
│   ├── pages/        # Pages de l'application
│   │   ├── Dashboard.js
│   │   ├── AnalysesList.js
│   │   ├── AnalysesForm.js
│   │   ├── IPMList.js
│   │   ├── IPMForm.js
│   │   ├── IPMTarifs.js
│   │   ├── AssurancesList.js
│   │   ├── AssurancesForm.js
│   │   ├── AssurancesTarifs.js
│   │   ├── PatientsList.js
│   │   ├── PatientsForm.js
│   │   ├── DevisList.js
│   │   ├── DevisForm.js
│   │   ├── DevisDetail.js
│   │   └── DevisMensuel.js
│   ├── context/      # Context API pour la gestion d'état
│   │   └── DataContext.js
│   ├── utils/        # Utilitaires
│   │   └── pdfUtils.js  # Fonctions de génération PDF
│   └── App.js        # Composant principal
├── build/            # Build de production (généré)
├── electron-builder.json  # Configuration pour créer les installateurs
└── package.json
```

## 🔧 Scripts disponibles

### Application Web
- `npm start` - Démarrer le serveur de développement
- `npm run build` - Créer une version de production
- `npm test` - Lancer les tests

### Application Desktop (Electron)
- `npm run electron` - Lancer l'application Electron (nécessite un build préalable)
- `npm run electron-dev` - Lancer Electron en mode développement (avec hot-reload)
- `npm run clean` - Nettoyer les dossiers de build et arrêter les processus Electron
- `npm run kill-electron` - Arrêter tous les processus Electron en cours
- `npm run dist` - Créer un installateur pour toutes les plateformes
- `npm run dist-win` - Créer un installateur Windows (.exe)
- `npm run dist-mac` - Créer un installateur macOS (.dmg)
- `npm run dist-linux` - Créer un installateur Linux (.AppImage, .deb)

## 💻 Déploiement Desktop avec Electron

### Installation des dépendances Electron

Après avoir installé les dépendances principales, Electron sera installé automatiquement :

```bash
npm install
```

### Développement avec Electron

Pour tester l'application en mode desktop pendant le développement :

1. **Terminal 1** - Démarrer le serveur React :
```bash
npm start
```

2. **Terminal 2** - Lancer Electron :
```bash
npm run electron-dev
```

### Créer un installateur

Pour créer un installateur de l'application desktop :

1. **Nettoyer les anciens builds (recommandé)** :
```bash
npm run clean
```
Ce script arrête automatiquement tous les processus Electron et nettoie les dossiers de build.

2. **Créer l'installateur** :
```bash
# Pour Windows
npm run dist-win

# Pour macOS
npm run dist-mac

# Pour Linux
npm run dist-linux

# Pour toutes les plateformes
npm run dist
```

Les installateurs seront générés dans le dossier `dist/`.

**Note importante** : Si vous rencontrez une erreur "Access is denied" lors de la création de l'installateur, cela signifie qu'un processus Electron est encore en cours d'exécution. Exécutez `npm run clean` ou `npm run kill-electron` pour arrêter tous les processus Electron.

### Notes sur Electron

- Les données stockées dans `localStorage` fonctionnent parfaitement avec Electron
- L'application fonctionne hors ligne une fois installée
- Les fichiers PDF générés fonctionnent normalement
- L'application conserve toutes les fonctionnalités de la version web

## 🐳 Déploiement avec Docker

### Prérequis
- Docker et Docker Compose installés
- Backend Django démarré (par défaut sur http://localhost:8000)

### Configuration des variables d'environnement

L'IP du backend est configurée par défaut dans `docker-compose.yml` : `http://72.62.29.141:8000/api`

Pour modifier cette configuration, créez un fichier `.env` à la racine du projet :

```env
REACT_APP_API_BASE_URL=http://72.62.29.141:8000/api
```

**Note importante** : 
- Si vous modifiez cette variable, vous **devez reconstruire l'image Docker** avec `docker-compose build --no-cache`

### 🔧 Dépannage des erreurs de connexion

Si vous rencontrez `ERR_CONNECTION_TIMED_OUT`, suivez ces étapes :

1. **Vérifier que le backend est démarré** :
   ```bash
   # Testez dans votre navigateur
   http://localhost:8000/api/
   ```

2. **Trouver la bonne configuration sur Windows** :
   ```powershell
   # Exécutez le script de diagnostic
   .\test-connection.ps1
   ```

3. **Tester différentes options dans `.env`** :
   - Option A: `REACT_APP_API_BASE_URL=http://172.17.0.1:8000/api`
   - Option B: `REACT_APP_API_BASE_URL=http://host.docker.internal:8000/api`
   - Option C: Utilisez l'IP de votre machine Windows (obtenue avec `ipconfig`)

4. **Vérifier que le backend accepte les connexions** :
   - Le backend Django doit écouter sur `0.0.0.0:8000` et non `127.0.0.1:8000`
   - Vérifiez les paramètres CORS du backend pour autoriser les requêtes depuis le frontend

5. **Reconstruire après chaque modification** :
   ```bash
   docker-compose build --no-cache
   docker-compose up -d
   ```

### Construction et démarrage

```bash
# Construire et démarrer le conteneur
docker-compose up -d --build

# Voir les logs
docker-compose logs -f

# Arrêter le conteneur
docker-compose down
```

L'application sera accessible sur `http://localhost:3000`

### Commandes Docker utiles

```bash
# Reconstruire l'image (nécessaire si vous modifiez REACT_APP_API_BASE_URL)
docker-compose build --no-cache

# Redémarrer le conteneur
docker-compose restart

# Accéder au shell du conteneur
docker exec -it facturation-frontend sh
```

### 🌐 Exécution en production

En production, vous pouvez servir l’application avec le serveur intégré (`npm start` / conteneur) ou construire les fichiers statiques (`npm run build`) et les servir avec le serveur de votre choix.

Dans ce cas, vous devrez reconstruire l'application localement ou dans un conteneur séparé pour générer le dossier `build`.

## 📝 Notes importantes

- Les données sont stockées localement dans le navigateur (ou dans Electron)
- Pour partager les données entre navigateurs/appareils, vous devrez exporter/importer les données
- Les prix sont automatiquement récupérés selon l'IPM ou l'Assurance du patient
- Un patient ne peut avoir qu'une IPM OU une Assurance (jamais les deux)

## 🎯 Utilisation

1. **Configurer les analyses** : Allez dans "Analyses" et ajoutez les analyses médicales
2. **Configurer les IPM/Assurances** : Créez les IPM et Assurances
3. **Configurer les tarifs** : Pour chaque IPM/Assurance, configurez les tarifs ou importez la liste standard
4. **Ajouter des patients** : Créez les patients avec leur IPM ou Assurance
5. **Créer des devis** : Créez des devis pour les patients, les prix s'affichent automatiquement
6. **Générer des devis mensuels** : À la fin du mois, générez les devis mensuels par IPM/Assurance
