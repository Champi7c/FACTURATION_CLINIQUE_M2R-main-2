import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

// Fonction pour obtenir le token depuis localStorage
const getToken = () => {
  return localStorage.getItem('access_token');
};

// Fonction pour obtenir le refresh token depuis localStorage
const getRefreshToken = () => {
  return localStorage.getItem('refresh_token');
};

// Configuration axios pour inclure le token JWT dans les headers
axios.interceptors.request.use(
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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour rafraîchir automatiquement le token (pour axios utilisé directement dans AuthContext)
axios.interceptors.response.use(
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
    
    // Si erreur 401, pas déjà en train de rafraîchir, et pas un endpoint d'authentification
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          // Réessayer la requête originale avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return axios(originalRequest);
        } catch (refreshError) {
          // Si le refresh échoue, nettoyer et rediriger
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          // Utiliser hash pour React Router HashRouter
          if (!window.location.hash.includes('/login')) {
            window.location.hash = '/login';
          }
          return Promise.reject(refreshError);
        }
      } else {
        // Pas de refresh token, nettoyer et rediriger
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        if (!window.location.hash.includes('/login')) {
          window.location.hash = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  // Fonction pour vérifier l'authentification
  const checkAuth = async () => {
    setLoading(true);
    const token = getToken();
    
    if (!token) {
      setUser(null);
      setAuthenticated(false);
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/check/`);
      if (response.data && response.data.authenticated) {
        setUser(response.data.user);
        setAuthenticated(true);
      } else {
        setUser(null);
        setAuthenticated(false);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    } catch (error) {
      // Si erreur (401, 403, etc.), l'utilisateur n'est pas authentifié
      setUser(null);
      setAuthenticated(false);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setLoading(false);
    }
  };

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (token) {
        // Si un token existe, vérifier s'il est valide
        await checkAuth();
      } else {
        // Pas de token, utilisateur non authentifié
        setLoading(false);
        setAuthenticated(false);
        setUser(null);
      }
    };
    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login/`, {
        username,
        password,
      });
      
      if (response.data.success) {
        // Stocker les tokens JWT
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        
        setUser(response.data.user);
        setAuthenticated(true);
        return { success: true, user: response.data.user };
      } else {
        return { success: false, error: response.data.error || 'Erreur de connexion' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erreur de connexion';
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    // Déconnecter côté client même si la requête échoue
    setUser(null);
    setAuthenticated(false);
    
    // Supprimer les tokens du localStorage
    const refreshToken = getRefreshToken();
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    try {
      // Blacklist le refresh token côté serveur
      if (refreshToken) {
        await axios.post(`${API_BASE_URL}/auth/logout/`, {
          refresh: refreshToken
        });
      }
    } catch (error) {
      // Ignorer silencieusement l'erreur - la déconnexion côté client est déjà effectuée
    }
  };

  const value = {
    user,
    authenticated,
    loading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

