import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import '../analyses/AnalysesList.css';

function IPMTarifs() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ipms, analyses, tarifs, addTarif, updateTarif, deleteTarif } = useData();

  const ipm = ipms.find(i => i.id === parseInt(id));
  // Filtrer les tarifs IPM (tous les IPM utilisent les mêmes tarifs génériques)
  const tarifsIPM = tarifs.filter(t => t.typePriseEnCharge === 'IPM');
  
  const [formData, setFormData] = useState({
    analyseId: '',
    prix: ''
  });
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  if (!ipm) {
    return <div>IPM non trouvée</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const existingTarif = tarifs.find(
        t => t.analyseId === parseInt(formData.analyseId) &&
             t.typePriseEnCharge === 'IPM'
      );

      if (existingTarif) {
        await updateTarif(existingTarif.id, {
          ...existingTarif,
          prix: parseFloat(formData.prix)
        });
      } else {
        await addTarif({
          analyseId: parseInt(formData.analyseId),
          typePriseEnCharge: 'IPM',
          prix: parseFloat(formData.prix)
        });
      }

      setFormData({ analyseId: '', prix: '' });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du tarif:', error);
    }
  };

  const handleDelete = (tarifId) => {
    dispatch({ type: actionTypes.DELETE_TARIF, payload: tarifId });
    setShowDeleteModal(null);
  };

  return (
    <div className="analyses-list">
      <div className="page-header">
        <h1><i className="bi bi-currency-dollar"></i> Tarifs pour {ipm.nom}</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/ipm')}>
          <i className="bi bi-arrow-left"></i> Retour
        </button>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h3>Ajouter/Modifier un tarif</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-5">
              <label className="form-label">Analyse</label>
              <select
                className="form-control"
                value={formData.analyseId}
                onChange={(e) => setFormData({ ...formData, analyseId: e.target.value })}
                required
              >
                <option value="">Sélectionner une analyse</option>
                {analyses.map(analyse => (
                  <option key={analyse.id} value={analyse.id}>{analyse.nom}</option>
                ))}
              </select>
            </div>
            <div className="col-md-5">
              <label className="form-label">Prix (FCFA)</label>
              <input
                type="number"
                className="form-control"
                value={formData.prix}
                onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                step="0.01"
                min="0.01"
                required
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">&nbsp;</label>
              <button type="submit" className="btn btn-primary w-100">
                <i className="bi bi-plus-circle"></i> Ajouter
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Tarifs configurés</h3>
        </div>
        <div className="card-body">
          {tarifsIPM.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-inbox"></i>
              <p>Aucun tarif configuré pour cette IPM</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Analyse</th>
                  <th>Prix (FCFA)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tarifsIPM.map(tarif => {
                  const analyse = analyses.find(a => a.id === tarif.analyseId);
                  return (
                    <tr key={tarif.id}>
                      <td><strong>{analyse ? analyse.nom : 'Analyse inconnue'}</strong></td>
                      <td><span className="badge bg-success">{tarif.prix} FCFA</span></td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => setShowDeleteModal(tarif.id)}
                        >
                          <i className="bi bi-trash"></i> Supprimer
                        </button>
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
              <p>Êtes-vous sûr de vouloir supprimer ce tarif ?</p>
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

export default IPMTarifs;

