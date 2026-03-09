import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import './AnalysesList.css';

function AnalysesList() {
  const { analyses, deleteAnalyse } = useData();
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  const handleDelete = async (id) => {
    try {
      await deleteAnalyse(id);
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  return (
    <div className="analyses-list">
      <div className="page-header">
        <h1><i className="bi bi-clipboard-pulse"></i> Gestion des Analyses</h1>
        <Link to="/analyses/nouveau" className="btn btn-primary">
          <i className="bi bi-plus-circle"></i> Ajouter une analyse
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Liste des analyses</h3>
        </div>
        <div className="card-body">
          {analyses.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-inbox"></i>
              <p>Aucune analyse enregistrée</p>
              <Link to="/analyses/nouveau" className="btn btn-primary">
                Ajouter la première analyse
              </Link>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {analyses.map(analyse => (
                  <tr key={analyse.id}>
                    <td><strong>{analyse.nom}</strong></td>
                    <td>
                      <div className="action-buttons">
                        <Link
                          to={`/analyses/${analyse.id}/modifier`}
                          className="btn btn-sm btn-warning"
                        >
                          <i className="bi bi-pencil"></i> Modifier
                        </Link>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => setShowDeleteModal(analyse.id)}
                        >
                          <i className="bi bi-trash"></i> Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirmer la suppression</h3>
            </div>
            <div className="modal-body">
              <p>Êtes-vous sûr de vouloir supprimer cette analyse ?</p>
              <p className="text-danger">
                <small>Tous les tarifs associés seront également supprimés.</small>
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(null)}
              >
                Annuler
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(showDeleteModal)}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalysesList;

