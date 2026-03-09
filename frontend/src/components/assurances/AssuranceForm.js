import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import '../analyses/AnalyseForm.css';

function AssuranceForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { assurances, dispatch, actionTypes } = useApp();
  
  const [formData, setFormData] = useState({ nom: '' });

  useEffect(() => {
    if (id) {
      const assurance = assurances.find(a => a.id === parseInt(id));
      if (assurance) {
        setFormData({ nom: assurance.nom });
      }
    }
  }, [id, assurances]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (id) {
        await updateAssurance(parseInt(id), { nom: formData.nom });
      } else {
        await addAssurance({ nom: formData.nom });
      }

      navigate('/assurances');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  return (
    <div className="analyse-form">
      <div className="page-header">
        <h1>
          <i className="bi bi-shield-check"></i> 
          {id ? 'Modifier une assurance' : 'Ajouter une assurance'}
        </h1>
        <button className="btn btn-secondary" onClick={() => navigate('/assurances')}>
          <i className="bi bi-arrow-left"></i> Retour
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>{id ? 'Modifier' : 'Nouvelle'} assurance</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nom">Nom de l'assurance <span className="text-danger">*</span></label>
              <input
                type="text"
                id="nom"
                className="form-control"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
                placeholder="Nom de l'assurance"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                <i className="bi bi-check-circle"></i> Enregistrer
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/assurances')}
              >
                <i className="bi bi-x-circle"></i> Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AssuranceForm;

