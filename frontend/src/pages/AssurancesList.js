import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import './ListPage.css';

const AssurancesList = () => {
  const { assurances, deleteAssurance } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAssurances = assurances.filter(assurance =>
    assurance.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id, nom) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'assurance "${nom}" ?`)) {
      deleteAssurance(id);
    }
  };

  return (
    <div className="list-page">
      <div className="page-header">
        <h1><i className="bi bi-shield-check"></i> Gestion des Assurances</h1>
        <Link to="/assurances/ajouter" className="btn btn-primary">
          <i className="bi bi-plus-circle"></i> Ajouter une assurance
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <h5>Liste des assurances</h5>
        </div>
        <div className="card-body">
          <div className="search-box mb-4">
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher une assurance..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filteredAssurances.length > 0 ? (
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
                  {filteredAssurances.map(assurance => (
                    <tr key={assurance.id}>
                      <td><strong>{assurance.nom}</strong></td>
                      <td>{new Date(assurance.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td>
                        <Link
                          to={`/assurances/${assurance.id}/tarifs`}
                          className="btn btn-sm btn-info"
                        >
                          <i className="bi bi-currency-dollar"></i> Tarifs
                        </Link>
                        <Link
                          to={`/assurances/${assurance.id}/modifier`}
                          className="btn btn-sm btn-warning"
                        >
                          <i className="bi bi-pencil"></i> Modifier
                        </Link>
                        <button
                          onClick={() => handleDelete(assurance.id, assurance.nom)}
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
              <i className="bi bi-info-circle"></i> Aucune assurance enregistrée.
              {searchTerm && ' Aucun résultat pour votre recherche.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssurancesList;







