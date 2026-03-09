import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import '../analyses/AnalysesList.css';

function PatientsList() {
  const { patients, ipms, assurances, dispatch, actionTypes } = useApp();
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  const handleDelete = (id) => {
    dispatch({ type: actionTypes.DELETE_PATIENT, payload: id });
    setShowDeleteModal(null);
  };

  const getEntityName = (patient) => {
    if (patient.typePriseEnCharge === 'IPM') {
      const ipm = ipms.find(i => i.id === patient.entityId);
      return ipm ? ipm.nom : 'N/A';
    } else {
      const assurance = assurances.find(a => a.id === patient.entityId);
      return assurance ? assurance.nom : 'N/A';
    }
  };

  return (
    <div className="analyses-list">
      <div className="page-header">
        <h1><i className="bi bi-people"></i> Gestion des Patients</h1>
        <Link to="/patients/nouveau" className="btn btn-primary">
          <i className="bi bi-plus-circle"></i> Ajouter un patient
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Liste des patients</h3>
        </div>
        <div className="card-body">
          {patients.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-inbox"></i>
              <p>Aucun patient enregistré</p>
              <Link to="/patients/nouveau" className="btn btn-primary">
                Ajouter le premier patient
              </Link>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nom complet</th>
                  <th>Matricule</th>
                  <th>Type de prise en charge</th>
                  <th>IPM/Assurance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map(patient => (
                  <tr key={patient.id}>
                    <td><strong>{patient.nomComplet}</strong></td>
                    <td><span className="badge bg-secondary">{patient.matricule}</span></td>
                    <td>
                      {patient.typePriseEnCharge === 'IPM' ? (
                        <span className="badge bg-info">IPM</span>
                      ) : (
                        <span className="badge bg-success">Assurance</span>
                      )}
                    </td>
                    <td>{getEntityName(patient)}</td>
                    <td>
                      <div className="action-buttons">
                        <Link
                          to={`/patients/${patient.id}/modifier`}
                          className="btn btn-sm btn-warning"
                        >
                          <i className="bi bi-pencil"></i> Modifier
                        </Link>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => setShowDeleteModal(patient.id)}
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
              <p>Êtes-vous sûr de vouloir supprimer ce patient ?</p>
              <p className="text-danger">
                <small>Tous les devis associés seront également supprimés.</small>
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

export default PatientsList;

