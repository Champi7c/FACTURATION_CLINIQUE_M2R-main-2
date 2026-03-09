import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import './ListPage.css';

const PatientsList = () => {
  const { patients, ipms, assurances, deletePatient } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = patients.filter(patient =>
    patient.nomComplet.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.matricule.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id, nom) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le patient "${nom}" ?`)) {
      deletePatient(id);
    }
  };

  const getPriseEnCharge = (patient) => {
    if (patient.typePriseEnCharge === 'IPM') {
      const ipm = ipms.find(i => i.id === patient.ipmId);
      return ipm ? `IPM - ${ipm.nom}` : 'IPM';
    } else {
      const assurance = assurances.find(a => a.id === patient.assuranceId);
      return assurance ? `Assurance - ${assurance.nom}` : 'Assurance';
    }
  };

  return (
    <div className="list-page">
      <div className="page-header">
        <h1><i className="bi bi-people"></i> Gestion des Patients</h1>
        <Link to="/patients/ajouter" className="btn btn-primary">
          <i className="bi bi-plus-circle"></i> Ajouter un patient
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <h5>Liste des patients</h5>
        </div>
        <div className="card-body">
          <div className="search-box mb-4">
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher un patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filteredPatients.length > 0 ? (
            <div className="table-responsive">
              <table className="table">
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
                  {filteredPatients.map(patient => (
                    <tr key={patient.id}>
                      <td><strong>{patient.nomComplet}</strong></td>
                      <td><span className="badge badge-info">{patient.matricule}</span></td>
                      <td>
                        {patient.typePriseEnCharge === 'IPM' ? (
                          <span className="badge badge-info">IPM</span>
                        ) : (
                          <span className="badge badge-success">Assurance</span>
                        )}
                      </td>
                      <td>{getPriseEnCharge(patient)}</td>
                      <td>
                        <Link
                          to={`/patients/${patient.id}/modifier`}
                          className="btn btn-sm btn-warning"
                        >
                          <i className="bi bi-pencil"></i> Modifier
                        </Link>
                        <button
                          onClick={() => handleDelete(patient.id, patient.nomComplet)}
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
              <i className="bi bi-info-circle"></i> Aucun patient enregistré.
              {searchTerm && ' Aucun résultat pour votre recherche.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientsList;







