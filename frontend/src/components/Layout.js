import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, authenticated } = useAuth();
  const { categories } = useData();
  
  // Noms d'affichage pour les catégories
  const categoryNames = {
    'analyses': 'Analyses',
    'radiographie': 'Radiographie',
    'hospitalisation': 'Hospitalisation',
    'maternite': 'Maternité',
    'consultations': 'Consultations',
    'medicament': 'Médicament'
  };
  
  // Icônes pour les catégories
  const categoryIcons = {
    'analyses': 'bi-clipboard-pulse',
    'radiographie': 'bi-camera',
    'hospitalisation': 'bi-hospital',
    'maternite': 'bi-heart-pulse',
    'consultations': 'bi-person-check',
    'medicament': 'bi-capsule'
  };
  
  // Vérifier si une des routes de base de données est active
  const isBaseDonneesActive = location.pathname.startsWith('/base-de-donnees') || location.pathname.startsWith('/analyses');
  const [baseDonneesOpen, setBaseDonneesOpen] = useState(isBaseDonneesActive);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };
  
  // Ouvrir automatiquement le menu si on est sur une route de base de données
  React.useEffect(() => {
    if (isBaseDonneesActive) {
      setBaseDonneesOpen(true);
    }
  }, [isBaseDonneesActive]);

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="header-logo-container">
            <img src="/logo-facturation.png" alt="Logo Facturation" className="header-logo" />
            <h2>Clinique</h2>
          </div>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') || (location.pathname === '/' && authenticated) ? 'active' : ''}`}>
            <i className="bi bi-speedometer2"></i> Dashboard
          </Link>
          
          <div className="nav-section">
            <h6>GESTION</h6>
            {/* Gestion des catégories réservée aux administrateurs */}
            {user?.is_superuser && (
              <Link to="/categories" className={`nav-link ${isActive('/categories') ? 'active' : ''}`}>
                <i className="bi bi-tags"></i> Catégories
              </Link>
            )}
            <div className="nav-dropdown">
              <div 
                className={`nav-link ${isBaseDonneesActive ? 'active' : ''}`}
                onClick={() => setBaseDonneesOpen(!baseDonneesOpen)}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-database"></i> Base de données
                <i className={`bi ${baseDonneesOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`} style={{ marginLeft: 'auto' }}></i>
              </div>
              {baseDonneesOpen && (
                <div className="nav-submenu">
                  {categories.length > 0 ? (
                    categories.map((categorie) => {
                      const categorieNom = typeof categorie === 'object' && categorie != null && categorie.nom != null
                        ? String(categorie.nom)
                        : String(categorie ?? '');
                      const label = String(categoryNames[categorieNom] || categorieNom);
                      return (
                        <Link
                          key={categorieNom}
                          to={`/base-de-donnees/${categorieNom}`}
                          className={`nav-sub-link ${isActive(`/base-de-donnees/${categorieNom}`) ? 'active' : ''}`}
                          onClick={() => setBaseDonneesOpen(false)}
                        >
                          <i className={`bi ${categoryIcons[categorieNom] || 'bi-tag'}`}></i> {label}
                        </Link>
                      );
                    })
                  ) : (
                    // Afficher les catégories par défaut si aucune n'est chargée
                    <>
                      <Link 
                        to="/base-de-donnees/analyses" 
                        className={`nav-sub-link ${isActive('/base-de-donnees/analyses') ? 'active' : ''}`}
                        onClick={() => setBaseDonneesOpen(false)}
                      >
                        <i className="bi bi-clipboard-pulse"></i> Analyses
                      </Link>
                      <Link 
                        to="/base-de-donnees/radiographie" 
                        className={`nav-sub-link ${isActive('/base-de-donnees/radiographie') ? 'active' : ''}`}
                        onClick={() => setBaseDonneesOpen(false)}
                      >
                        <i className="bi bi-camera"></i> Radiographie
                      </Link>
                      <Link 
                        to="/base-de-donnees/hospitalisation" 
                        className={`nav-sub-link ${isActive('/base-de-donnees/hospitalisation') ? 'active' : ''}`}
                        onClick={() => setBaseDonneesOpen(false)}
                      >
                        <i className="bi bi-hospital"></i> Hospitalisation
                      </Link>
                      <Link 
                        to="/base-de-donnees/maternite" 
                        className={`nav-sub-link ${isActive('/base-de-donnees/maternite') ? 'active' : ''}`}
                        onClick={() => setBaseDonneesOpen(false)}
                      >
                        <i className="bi bi-heart-pulse"></i> Maternité
                      </Link>
                      <Link 
                        to="/base-de-donnees/consultations" 
                        className={`nav-sub-link ${isActive('/base-de-donnees/consultations') ? 'active' : ''}`}
                        onClick={() => setBaseDonneesOpen(false)}
                      >
                        <i className="bi bi-person-check"></i> Consultations
                      </Link>
                      <Link 
                        to="/base-de-donnees/medicament" 
                        className={`nav-sub-link ${isActive('/base-de-donnees/medicament') ? 'active' : ''}`}
                        onClick={() => setBaseDonneesOpen(false)}
                      >
                        <i className="bi bi-capsule"></i> Médicament
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
            <Link to="/ipm" className={`nav-link ${isActive('/ipm') ? 'active' : ''}`}>
              <i className="bi bi-building"></i> IPM
            </Link>
            <Link to="/assurances" className={`nav-link ${isActive('/assurances') ? 'active' : ''}`}>
              <i className="bi bi-shield-check"></i> Assurances
            </Link>
            <Link to="/patients" className={`nav-link ${isActive('/patients') ? 'active' : ''}`}>
              <i className="bi bi-people"></i> Patients
            </Link>
          </div>

          <div className="nav-section">
            <h6>FACTURATION</h6>
            <Link to="/devis" className={`nav-link ${isActive('/devis') ? 'active' : ''}`}>
              <i className="bi bi-file-earmark-text"></i> Devis
            </Link>
            <Link to="/devis/mensuel" className={`nav-link ${isActive('/devis/mensuel') ? 'active' : ''}`}>
              <i className="bi bi-calendar-month"></i> Factures Mensuelles
            </Link>
            {/* Détail de prestation réservé aux administrateurs */}
            {user?.is_superuser && (
              <Link to="/detail-prestation" className={`nav-link ${isActive('/detail-prestation') ? 'active' : ''}`}>
                <i className="bi bi-calendar-check"></i> Détail de prestation
              </Link>
            )}
            {/* Statistiques réservées aux administrateurs */}
            {user?.is_superuser && (
              <Link to="/statistiques" className={`nav-link ${isActive('/statistiques') ? 'active' : ''}`}>
                <i className="bi bi-bar-chart"></i> Statistiques
              </Link>
            )}
          </div>
        </nav>

        {/* Informations utilisateur et déconnexion */}
        <div className="sidebar-footer">
          <div className="user-info">
            <i className="bi bi-person-circle"></i>
            <div>
              <div className="user-name">{user?.username || 'Utilisateur'}</div>
              <div className="user-role">{user?.is_superuser ? 'Super Admin' : 'Manager'}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            <i className="bi bi-box-arrow-right"></i> Déconnexion
          </button>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
