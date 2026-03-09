import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import './ListPage.css';

const IPMList = () => {
  const { ipms, deleteIPM } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIPMs = ipms.filter(ipm =>
    ipm.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id, nom) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'IPM "${nom}" ?`)) {
      deleteIPM(id);
    }
  };

  return (
    <div className="list-page">
      <div className="page-header">
        <h1><i className="bi bi-building"></i> Gestion des IPM</h1>
        <Link to="/ipm/ajouter" className="btn btn-primary">
          <i className="bi bi-plus-circle"></i> Ajouter une IPM
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <h5>Liste des IPM</h5>
        </div>
        <div className="card-body">
          <div className="search-box mb-4">
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher une IPM..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filteredIPMs.length > 0 ? (
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
                  {filteredIPMs.map(ipm => (
                    <tr key={ipm.id}>
                      <td><strong>{ipm.nom}</strong></td>
                      <td>{new Date(ipm.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td>
                        <Link
                          to={`/ipm/${ipm.id}/tarifs`}
                          className="btn btn-sm btn-info"
                        >
                          <i className="bi bi-currency-dollar"></i> Tarifs
                        </Link>
                        <Link
                          to={`/ipm/${ipm.id}/modifier`}
                          className="btn btn-sm btn-warning"
                        >
                          <i className="bi bi-pencil"></i> Modifier
                        </Link>
                        <button
                          onClick={() => handleDelete(ipm.id, ipm.nom)}
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
              <i className="bi bi-info-circle"></i> Aucune IPM enregistrée.
              {searchTerm && ' Aucun résultat pour votre recherche.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IPMList;







