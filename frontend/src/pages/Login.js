import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CLINIQUE } from '../config/clinique';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, authenticated } = useAuth();
  const navigate = useNavigate();

  // Rediriger si déjà authentifié (seulement après le chargement)
  useEffect(() => {
    if (!loading && authenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [authenticated, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Erreur de connexion');
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <div className="login-logo">
            <i className="bi bi-hospital"></i>
          </div>
          <h1>{CLINIQUE.nom}</h1>
          <p>Système de Facturation</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-triangle"></i> {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">
              <i className="bi bi-person"></i> Nom d'utilisateur
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Entrez votre nom d'utilisateur"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <i className="bi bi-lock"></i> Mot de passe
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Entrez votre mot de passe"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-login"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span> Connexion...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right"></i> Se connecter
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="text-muted">
            <small>Veuillez vous connecter pour accéder à la plateforme</small>
          </p>
        </div>
      </div>
      <footer className="login-page-footer">
        Conçu par{' '}
        <a href="https://momarbossndoye.onrender.com/" target="_blank" rel="noopener noreferrer">MBN</a>
        {' '}et{' '}
        <a href="https://portfolio-oumardiallo.netlify.app" target="_blank" rel="noopener noreferrer">ODM</a>
      </footer>
    </div>
  );
};

export default Login;

