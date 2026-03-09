import axios from 'axios';

// Fonction pour obtenir le token depuis localStorage
const getToken = () => {
  return localStorage.getItem('access_token');
};

// Configuration de base pour axios
// baseURL : REACT_APP_API_BASE_URL ou /api en relatif
export const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT à chaque requête
api.interceptors.request.use(
  (config) => {
    // Ne pas ajouter le token pour les endpoints de login/logout
    // Vérifier à la fois l'URL complète et l'URL relative
    const url = config.url || '';
    const fullUrl = (config.baseURL || '') + url;
    const isAuthEndpoint = (
      url.includes('/auth/login') ||
      url.includes('/auth/logout') ||
      url.includes('/auth/token/refresh') ||
      fullUrl.includes('/auth/login') ||
      fullUrl.includes('/auth/logout') ||
      fullUrl.includes('/auth/token/refresh')
    );
    
    const token = getToken();
    if (token && !isAuthEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Ne pas logger pour les endpoints d'authentification pour éviter le spam
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs 401 et rafraîchir le token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Ne pas essayer de rafraîchir le token pour les endpoints de login/logout
    const url = originalRequest.url || '';
    const fullUrl = (originalRequest.baseURL || '') + url;
    const isAuthEndpoint = (
      url.includes('/auth/login') ||
      url.includes('/auth/logout') ||
      url.includes('/auth/token/refresh') ||
      fullUrl.includes('/auth/login') ||
      fullUrl.includes('/auth/logout') ||
      fullUrl.includes('/auth/token/refresh')
    );
    
    // Logger les erreurs 401/403 seulement si on a un token (sinon c'est normal)
    const token = localStorage.getItem('access_token');
    if ((error.response?.status === 401 || error.response?.status === 403) && token) {
      console.warn(`[API] Erreur ${error.response?.status} sur: ${originalRequest.url}`, {
        isAuthEndpoint,
        hasRetry: originalRequest._retry,
        errorDetail: error.response?.data
      });
    }
    
    // Si erreur 401 ou 403, pas déjà en train de rafraîchir, et pas un endpoint d'authentification
    // Pour 403, on essaie aussi de rafraîchir le token car cela peut être dû à un token expiré
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      const accessToken = localStorage.getItem('access_token');
      
      // Si pas de token du tout, rediriger immédiatement vers login
      if (!accessToken && !refreshToken) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        if (!window.location.hash.includes('/login')) {
          window.location.hash = '/login';
        }
        return Promise.reject(error);
      }
      
      if (refreshToken) {
        try {
          const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL || '/api'}/auth/token/refresh/`, {
            refresh: refreshToken
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Token invalide ou expiré, nettoyer et rediriger
          console.warn('[API] Échec du rafraîchissement du token, redirection vers login');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          // Utiliser window.location pour forcer un rechargement complet
          if (!window.location.hash.includes('/login')) {
            window.location.hash = '/login';
          }
          return Promise.reject(refreshError);
        }
      } else {
        // Pas de refresh token, nettoyer et rediriger
        console.warn('[API] Pas de refresh token, redirection vers login');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        if (!window.location.hash.includes('/login')) {
          window.location.hash = '/login';
        }
        return Promise.reject(error);
      }
    }
    
    // Si erreur 401 sans token, rediriger vers login
    if (error.response?.status === 401 && !localStorage.getItem('access_token') && !isAuthEndpoint) {
      if (!window.location.hash.includes('/login')) {
        window.location.hash = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Gestion des erreurs API
export const handleAPIError = (error) => {
  if (error.response) {
    // Le serveur a répondu avec un code d'erreur
    const status = error.response.status;
    const data = error.response.data;
    
    console.error('[API Error]', { status, data, error });
    
    if (status === 400) {
      // Erreur de validation
      if (data && typeof data === 'object') {
        // Si c'est un message d'erreur simple
        if (data.error) {
          return data.error;
        }
        // Si c'est un objet avec plusieurs erreurs
        if (typeof data === 'object' && !Array.isArray(data)) {
          const errors = Object.entries(data)
            .map(([key, value]) => {
              if (Array.isArray(value)) {
                return `${key}: ${value.join(', ')}`;
              }
              return `${key}: ${value}`;
            })
            .join('; ');
          return errors || 'Erreur de validation';
        }
      }
      return data?.error || data?.detail || 'Données invalides';
    } else if (status === 401) {
      return 'Authentification requise. Veuillez vous reconnecter.';
    } else if (status === 403) {
      return data?.error || 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
    } else if (status === 404) {
      return 'Ressource non trouvée';
    } else if (status === 500) {
      return 'Erreur serveur';
    }
    return data?.error || data?.detail || `Erreur ${status}`;
  } else if (error.request) {
    // La requête a été faite mais aucune réponse n'a été reçue
    return 'Impossible de contacter le serveur. Vérifiez que le backend Django est démarré.';
  } else {
    // Une erreur s'est produite lors de la configuration de la requête
    return error.message || 'Une erreur inattendue s\'est produite';
  }
};

// API pour les analyses
export const analysesAPI = {
  getAll: () => api.get('/analyses/?page_size=1000'),
  getById: (id) => api.get(`/analyses/${id}/`),
  create: (data) => api.post('/analyses/', data),
  update: (id, data) => api.put(`/analyses/${id}/`, data),
  delete: (id) => api.delete(`/analyses/${id}/`),
};

// API pour les IPM
export const ipmsAPI = {
  getAll: () => api.get('/ipms/?page_size=1000'),
  getById: (id) => api.get(`/ipms/${id}/`),
  create: (data) => api.post('/ipms/', data),
  update: (id, data) => api.put(`/ipms/${id}/`, data),
  delete: (id) => api.delete(`/ipms/${id}/`),
  activate: (id) => api.post(`/ipms/${id}/activate/`),
  deactivate: (id) => api.post(`/ipms/${id}/deactivate/`),
};

// API pour les assurances
export const assurancesAPI = {
  getAll: () => api.get('/assurances/?page_size=1000'),
  getById: (id) => api.get(`/assurances/${id}/`),
  create: (data) => api.post('/assurances/', data),
  update: (id, data) => api.put(`/assurances/${id}/`, data),
  delete: (id) => api.delete(`/assurances/${id}/`),
  activate: (id) => api.post(`/assurances/${id}/activate/`),
  deactivate: (id) => api.post(`/assurances/${id}/deactivate/`),
};

// API pour les tarifs
export const tarifsAPI = {
  getAll: () => api.get('/tarifs/?page_size=1000'),
  getById: (id) => api.get(`/tarifs/${id}/`),
  create: (data) => api.post('/tarifs/', data),
  update: (id, data) => api.put(`/tarifs/${id}/`, data),
  delete: (id) => api.delete(`/tarifs/${id}/`),
};

// API pour les patients
export const patientsAPI = {
  getAll: () => api.get('/patients/?page_size=1000000'), // Limite à 1 000 000 pour le dashboard et les listes
  getById: (id) => api.get(`/patients/${id}/`),
  create: (data) => api.post('/patients/', data),
  update: (id, data) => api.put(`/patients/${id}/`, data),
  delete: (id) => api.delete(`/patients/${id}/`),
};

// API pour les devis
export const devisAPI = {
  getAll: () => api.get('/devis/?page_size=10000'), // Augmenté à 10000 pour récupérer tous les devis
  getById: (id) => api.get(`/devis/${id}/`),
  create: (data) => api.post('/devis/', data),
  update: (id, data) => api.put(`/devis/${id}/`, data),
  delete: (id) => api.delete(`/devis/${id}/`),
  updatePaiement: (id, data) => api.patch(`/devis/${id}/update-paiement/`, data),
};

// API pour les statistiques de paiement
export const statistiquesPaiementAPI = {
  getStatistiques: (mois, annee) => api.get(`/statistiques/paiement/?mois=${mois}&annee=${annee}`),
};

// API pour les stats du dashboard (totaux réels sans pagination)
export const dashboardStatsAPI = {
  getStats: () => api.get('/dashboard-stats/'),
};

// API pour les catégories (admin seulement)
export const categoriesAPI = {
  getAll: () => api.get('/categories/'),
  create: (categorie) => api.post('/categories/', { categorie }),
  update: (oldName, newName) => api.patch(`/categories/${oldName}/`, { old_name: oldName, new_name: newName }),
  // Pour DELETE, le nom de la catégorie doit être dans l'URL : /categories/{nom}/
  delete: (categorie) => {
    // Encoder le nom de la catégorie pour l'URL (gérer les caractères spéciaux)
    const encodedCategorie = encodeURIComponent(categorie);
    return api.delete(`/categories/${encodedCategorie}/`);
  },
  activate: (categorie) => {
    const encodedCategorie = encodeURIComponent(categorie);
    return api.post(`/categories/${encodedCategorie}/activate/`);
  },
  deactivate: (categorie) => {
    const encodedCategorie = encodeURIComponent(categorie);
    return api.post(`/categories/${encodedCategorie}/deactivate/`);
  },
};

// API pour les factures mensuelles
export const facturesMensuellesAPI = {
  genererNumero: (mois, annee, typePriseEnCharge, entiteId) => 
    api.get(`/factures-mensuelles/numero/?mois=${mois}&annee=${annee}&type_prise_en_charge=${typePriseEnCharge}&entite_id=${entiteId || ''}`),
};
