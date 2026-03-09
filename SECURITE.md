# Guide de Sécurité - Facturation Clinique

Ce document décrit les mesures de sécurité implémentées dans l'application de facturation clinique et les recommandations pour maintenir un niveau de sécurité élevé.

## 🔒 Mesures de Sécurité Implémentées

### 1. Authentification et Autorisation

#### JWT (JSON Web Tokens)
- **Tokens d'accès** : Durée de vie de 24 heures
- **Tokens de rafraîchissement** : Durée de vie de 7 jours
- **Rotation automatique** : Les refresh tokens sont régénérés à chaque utilisation
- **Blacklist** : Les tokens révoqués sont mis sur liste noire

#### Protection contre les Attaques par Force Brute
- **Rate Limiting** : Maximum 5 tentatives par IP/username
- **Fenêtre de temps** : 5 minutes (300 secondes)
- **Verrouillage** : 15 minutes (900 secondes) après dépassement
- **Messages génériques** : Ne révèle pas si un utilisateur existe ou non

### 2. Headers de Sécurité HTTP

Les headers suivants sont automatiquement ajoutés à toutes les réponses :

- `X-Content-Type-Options: nosniff` - Empêche le MIME-sniffing
- `X-Frame-Options: DENY` - Protection contre le clickjacking
- `X-XSS-Protection: 1; mode=block` - Protection XSS du navigateur
- `Referrer-Policy: strict-origin-when-cross-origin` - Contrôle des référents
- `Cache-Control: no-store, no-cache` - Désactive le cache pour les API

### 3. Validation des Entrées

#### Protection contre les Injections
- **Nettoyage des chaînes** : Suppression des balises HTML/XML
- **Détection SQL** : Patterns suspects d'injection SQL détectés et bloqués
- **Limitation de taille** : Validation de la longueur des entrées
- **Validation des types** : Vérification stricte des types de données

#### Validations Spécifiques
- **UUID** : Validation du format UUID
- **Numériques** : Validation avec min/max
- **Chaînes** : Nettoyage et limitation de longueur

### 4. Configuration de la Base de Données

- **Mode SQL strict** : `STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO`
- **Isolation** : Niveau `read committed` pour éviter les lectures sales
- **Encodage** : UTF-8 (utf8mb4) pour supporter tous les caractères

### 5. Sessions et Cookies

- **HttpOnly** : Les cookies de session ne sont pas accessibles via JavaScript
- **Secure** : Cookies sécurisés en production (HTTPS uniquement)
- **SameSite** : Protection CSRF via SameSite cookies
- **Expiration** : Sessions expirées à la fermeture du navigateur
- **Renouvellement** : Sessions renouvelées à chaque requête

### 6. Logging de Sécurité

Tous les événements de sécurité sont enregistrés dans `backend/security.log` :

- Tentatives de connexion échouées
- Tentatives de force brute
- Activités suspectes
- Erreurs de validation
- Requêtes suspectes

### 7. Middleware de Sécurité

#### InputValidationMiddleware
- Limite la taille des requêtes (max 10MB)
- Valide le format JSON
- Détecte les requêtes malformées

#### SecurityHeadersMiddleware
- Ajoute les headers de sécurité HTTP
- Désactive le cache pour les réponses API

#### DisableCSRFForAuth
- Désactive CSRF uniquement pour les routes API avec JWT
- La sécurité est assurée par JWT, pas par CSRF

## 📋 Recommandations pour la Production

### 1. Variables d'Environnement

**⚠️ CRITIQUE** : Configurez ces variables dans votre fichier `.env` en production :

```env
# SECRET_KEY - Générez une clé aléatoire forte (minimum 50 caractères)
SECRET_KEY=votre-clé-secrète-très-longue-et-aléatoire

# DEBUG - DOIT être False en production
DEBUG=False

# ALLOWED_HOSTS - Liste vos domaines/IP autorisés
ALLOWED_HOSTS=votre-domaine.com,72.62.29.141

# HTTPS - Activez en production
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True

# CORS - Limitez aux origines autorisées
CORS_ALLOWED_ORIGINS=https://votre-domaine.com
CORS_ALLOW_ALL_ORIGINS=False
```

### 2. Génération d'une SECRET_KEY Sécurisée

```python
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

Ou utilisez :
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 3. Base de Données

- **Utilisez un utilisateur dédié** avec des permissions limitées
- **Ne jamais utiliser `root`** en production
- **Activez le chiffrement** des connexions (SSL/TLS)
- **Sauvegardes régulières** avec chiffrement

### 4. Serveur Web

Si vous exposez l’application via un serveur web (Apache, Nginx, etc.), activez HTTPS, des en-têtes de sécurité (X-Frame-Options, X-Content-Type-Options, etc.) et limitez la taille des requêtes.

### 5. Monitoring et Alertes

- **Surveillez les logs de sécurité** : `backend/security.log`
- **Configurez des alertes** pour les tentatives de force brute
- **Surveillez les erreurs 429** (Too Many Requests)
- **Vérifiez régulièrement** les tentatives d'intrusion

### 6. Mises à Jour

- **Mettez à jour Django** et les dépendances régulièrement
- **Surveillez les CVE** (Common Vulnerabilities and Exposures)
- **Testez les mises à jour** en environnement de staging

### 7. Gestion des Utilisateurs

- **Mots de passe forts** : Minimum 8 caractères, mixte alphanumérique
- **Rotation des mots de passe** : Tous les 90 jours
- **Comptes inactifs** : Désactiver après 90 jours d'inactivité
- **Audit régulier** : Vérifier les comptes et permissions

### 8. Sauvegardes

- **Sauvegardes quotidiennes** de la base de données
- **Chiffrement des sauvegardes**
- **Test de restauration** régulier
- **Stockage hors site** des sauvegardes

## 🚨 Réponse aux Incidents

### En cas de Tentative d'Intrusion

1. **Vérifier les logs** : `backend/security.log`
2. **Identifier l'IP source** : Chercher dans les logs
3. **Bloquer l'IP** : Via le firewall ou le serveur web
4. **Changer les credentials** : Si compromis
5. **Analyser l'impact** : Vérifier les données accessibles

### En cas de Compromission

1. **Isoler le système** : Déconnecter du réseau
2. **Changer tous les mots de passe** : Base de données, utilisateurs, etc.
3. **Révoquer tous les tokens JWT** : Vider la blacklist et forcer la reconnexion
4. **Analyser les logs** : Identifier l'étendue de la compromission
5. **Restauration** : Restaurer depuis une sauvegarde propre
6. **Notification** : Informer les utilisateurs si nécessaire

## 📊 Checklist de Sécurité

Avant de déployer en production, vérifiez :

- [ ] `SECRET_KEY` est défini et unique
- [ ] `DEBUG=False` en production
- [ ] `ALLOWED_HOSTS` est configuré correctement
- [ ] HTTPS est activé et fonctionnel
- [ ] Les cookies sont sécurisés (`Secure`, `HttpOnly`)
- [ ] CORS est limité aux origines autorisées
- [ ] La base de données utilise un utilisateur dédié (pas `root`)
- [ ] Les sauvegardes sont configurées et testées
- [ ] Les logs de sécurité sont surveillés
- [ ] Le firewall est configuré correctement
- [ ] Les mises à jour de sécurité sont appliquées
- [ ] Les mots de passe sont forts
- [ ] Les tokens JWT ont des durées de vie appropriées

## 🔍 Tests de Sécurité

### Tests à Effectuer Régulièrement

1. **Test de force brute** : Vérifier que le rate limiting fonctionne
2. **Test XSS** : Tenter des injections XSS dans les formulaires
3. **Test SQL injection** : Vérifier que les entrées sont validées
4. **Test CSRF** : Vérifier la protection CSRF
5. **Test d'autorisation** : Vérifier que les permissions sont respectées
6. **Test de session** : Vérifier l'expiration et le renouvellement

## 📞 Support

Pour toute question de sécurité, contactez l'équipe de développement.

**⚠️ IMPORTANT** : Ne jamais commiter de fichiers `.env` ou de secrets dans le dépôt Git !
