import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Éviter l'overlay d'erreur pour les 401/403 : rediriger vers login sans afficher l'erreur
window.addEventListener('unhandledrejection', (event) => {
  const status = event.reason?.response?.status;
  if (status === 401 || status === 403) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    if (!window.location.hash.includes('/login')) {
      window.location.hash = '#/login';
    }
    event.preventDefault();
    event.stopPropagation();
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
