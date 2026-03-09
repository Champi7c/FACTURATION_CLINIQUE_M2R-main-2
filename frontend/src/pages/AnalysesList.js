import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import './ListPage.css';
import './AnalysesList.css';

const AnalysesList = ({ category: categoryProp }) => {
  // Obtenir la catégorie depuis les paramètres d'URL ou depuis la prop
  const { category: categoryParam } = useParams();
  const category = categoryParam || categoryProp || 'analyses';
  
  const { analyses, deleteAnalyse, tarifs, ipms, assurances, categories } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'ipm', 'assurance'
  
  // Noms des catégories (avec support pour les catégories dynamiques)
  const categoryNames = {
    'analyses': 'Analyses',
    'radiographie': 'Radiographie',
    'hospitalisation': 'Hospitalisation',
    'maternite': 'Maternité',
    'consultations': 'Consultations',
    'medicament': 'Médicament'
  };
  
  // Fonction pour obtenir le nom d'affichage d'une catégorie
  const getCategoryName = (cat) => {
    if (categoryNames[cat]) {
      return categoryNames[cat];
    }
    // Pour les nouvelles catégories, capitaliser la première lettre
    return cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : 'Analyses';
  };

  // Obtenir les analyses avec leurs informations de tarification
  const getAnalysesWithTarifs = () => {
    return analyses
      .filter(analyse => analyse.categorie === category) // Filtrer par catégorie
      .map(analyse => {
      const tarifsAnalyse = tarifs.filter(t => t.analyseId === analyse.id);
      const hasIPM = tarifsAnalyse.some(t => t.ipmId);
      const hasAssurance = tarifsAnalyse.some(t => t.assuranceId);
      
      // Compter les IPM et Assurances associées
      const ipmIds = [...new Set(tarifsAnalyse.filter(t => t.ipmId).map(t => t.ipmId))];
      const assuranceIds = [...new Set(tarifsAnalyse.filter(t => t.assuranceId).map(t => t.assuranceId))];
      
      const ipmNames = ipmIds.map(id => ipms.find(i => i.id === id)?.nom).filter(Boolean);
      const assuranceNames = assuranceIds.map(id => assurances.find(a => a.id === id)?.nom).filter(Boolean);
      
      return {
        ...analyse,
        hasIPM,
        hasAssurance,
        ipmNames,
        assuranceNames,
        tarifCount: tarifsAnalyse.length
      };
    });
  };

  const analysesWithTarifs = getAnalysesWithTarifs();

  // Filtrer selon l'onglet actif et la recherche
  const filteredAnalyses = analysesWithTarifs.filter(analyse => {
    // Filtre par recherche
    if (searchTerm && !analyse.nom.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filtre par onglet
    if (activeTab === 'ipm' && !analyse.hasIPM) {
      return false;
    }
    if (activeTab === 'assurance' && !analyse.hasAssurance) {
      return false;
    }
    
    return true;
  });

  const handleDelete = (id, nom) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'analyse "${nom}" ?`)) {
      deleteAnalyse(id);
    }
  };

  return (
    <div className="list-page">
      <div className="page-header">
        <h1><i className="bi bi-clipboard-pulse"></i> Gestion des {getCategoryName(category)}</h1>
        <Link to={`/base-de-donnees/${category}/ajouter`} className="btn btn-primary">
          <i className="bi bi-plus-circle"></i> Ajouter
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <h5>Liste des {getCategoryName(category).toLowerCase()}</h5>
        </div>
        <div className="card-body">
          <div className="search-box mb-4">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-search" style={{ fontSize: '1.2rem', color: 'var(--bleu-nuit)' }}></i>
              <input
                type="text"
                className="form-control"
                placeholder="Rechercher une analyse (tapez pour filtrer)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ flex: 1 }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="btn btn-sm btn-secondary"
                  title="Effacer la recherche"
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
            {searchTerm && (
              <small className="text-muted mt-2 d-block">
                {filteredAnalyses.length} résultat(s) trouvé(s)
              </small>
            )}
          </div>

          {filteredAnalyses.length > 0 ? (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Date de création</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAnalyses.map(analyse => (
                    <tr key={analyse.id}>
                      <td><strong>{analyse.nom}</strong></td>
                      <td>{new Date(analyse.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td>
                        <Link
                          to={`/base-de-donnees/${category}/${analyse.id}/modifier`}
                          className="btn btn-sm btn-warning"
                        >
                          <i className="bi bi-pencil"></i> Modifier
                        </Link>
                        <button
                          onClick={() => handleDelete(analyse.id, analyse.nom)}
                          className="btn btn-sm btn-danger"
                        >
                          <i className="bi bi-trash"></i> Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-info">
              <i className="bi bi-info-circle"></i> Aucune {getCategoryName(category).toLowerCase()} enregistrée.
              {searchTerm && ' Aucun résultat pour votre recherche.'}
              {!searchTerm && (
                <div className="mt-2">
                  <Link to={`/base-de-donnees/${category}/ajouter`} className="btn btn-sm btn-primary">
                    <i className="bi bi-plus-circle"></i> Ajouter la première
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysesList;

