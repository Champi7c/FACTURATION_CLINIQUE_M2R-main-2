import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { getDevisNumero } from '../utils/devisUtils';
import './ListPage.css';

const DevisList = () => {
  const { devis, patients, deleteDevis } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const isAdmin = user?.is_superuser;

  const filteredDevis = devis.filter(devi => {
    const patient = patients.find(p => p.id === devi.patientId);
    if (!patient) return false;
    return (
      patient.nomComplet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.matricule.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getPatient = (patientId) => {
    return patients.find(p => p.id === patientId);
  };

  return (
    <div className="list-page">
      <div className="page-header">
        <h1><i className="bi bi-file-earmark-text"></i> Gestion des Devis</h1>
        <Link to="/devis/creer" className="btn btn-primary">
          <i className="bi bi-plus-circle"></i> Créer un devis
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <h5>Liste des devis</h5>
        </div>
        <div className="card-body">
          <div className="search-box mb-4">
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher un devis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filteredDevis.length > 0 ? (
            <div className="table-responsive">
              <table className="table">
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
                  {filteredDevis.map(devi => {
                    const patient = getPatient(devi.patientId);
                    return (
                      <tr key={devi.id}>
                        <td><strong>#{getDevisNumero(devi)}</strong></td>
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
                        <td>{new Date(devi.dateCreation).toLocaleDateString('fr-FR')}</td>
                        <td><span className="badge badge-success">{devi.total} FCFA</span></td>
                        <td>
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
                          {/* Bouton supprimer réservé aux administrateurs */}
                          {isAdmin && (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={async (e) => {
                                e.preventDefault();
                                if (window.confirm(`Êtes-vous sûr de vouloir supprimer le devis ${getDevisNumero(devi)} ?`)) {
                                  try {
                                    await deleteDevis(devi.id);
                                    alert('Devis supprimé avec succès');
                                  } catch (error) {
                                    alert(`Erreur lors de la suppression: ${error.message}`);
                                  }
                                }
                              }}
                            >
                              <i className="bi bi-trash"></i> Supprimer
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-info">
              <i className="bi bi-info-circle"></i> Aucun devis enregistré.
              {searchTerm && ' Aucun résultat pour votre recherche.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DevisList;


