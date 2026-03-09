import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import '../analyses/AnalysesList.css';

function DevisList() {
  const { devis, patients, dispatch, actionTypes } = useApp();
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  const handleDelete = async (id) => {
    try {
      await deleteDevis(id);
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const getPatient = (patientId) => {
    return patients.find(p => p.id === patientId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="analyses-list">
      <div className="page-header">
        <h1><i className="bi bi-file-earmark-text"></i> Gestion des Devis</h1>
        <Link to="/devis/nouveau" className="btn btn-primary">
          <i className="bi bi-plus-circle"></i> Créer un devis
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Liste des devis</h3>
        </div>
        <div className="card-body">
          {devis.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-inbox"></i>
              <p>Aucun devis enregistré</p>
              <Link to="/devis/nouveau" className="btn btn-primary">
                Créer le premier devis
              </Link>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Patient</th>
                  <th>Date</th>
                  <th>Total (FCFA)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {devis.map(devi => {
                  const patient = getPatient(devi.patientId);
                  return (
                    <tr key={devi.id}>
                      <td><strong>#{devi.id}</strong></td>
                      <td>
                        {patient ? (
                          <>
                            {patient.nomComplet}
                            <br />
                            <small className="text-muted">{patient.matricule}</small>
                          </>
                        ) : (
                          'Patient supprimé'
                        )}
                      </td>
                      <td>{formatDate(devi.dateCreation)}</td>
                      <td><span className="badge bg-success">{devi.total || 0} FCFA</span></td>
                      <td>
                        <div className="action-buttons">
                          <Link
                            to={`/devis/${devi.id}`}
                            className="btn btn-sm btn-info"
                          >
                            <i className="bi bi-eye"></i> Voir
                          </Link>
                          <Link
                            to={`/devis/${devi.id}/modifier`}
                            className="btn btn-sm btn-warning"
                          >
                            <i className="bi bi-pencil"></i> Modifier
                          </Link>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => setShowDeleteModal(devi.id)}
                          >
                            <i className="bi bi-trash"></i> Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
              <p>Êtes-vous sûr de vouloir supprimer ce devis ?</p>
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

export default DevisList;

