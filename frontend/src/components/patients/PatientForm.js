import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import '../analyses/AnalyseForm.css';

function PatientForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { patients, ipms, assurances, dispatch, actionTypes } = useApp();
  
  const [formData, setFormData] = useState({
    nomComplet: '',
    matricule: '',
    typePriseEnCharge: '',
    entityId: null
  });

  useEffect(() => {
    if (id) {
      const patient = patients.find(p => p.id === parseInt(id));
      if (patient) {
        setFormData({
          nomComplet: patient.nomComplet,
          matricule: patient.matricule,
          typePriseEnCharge: patient.typePriseEnCharge,
          entityId: patient.entityId
        });
      }
    }
  }, [id, patients]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (id) {
      dispatch({
        type: actionTypes.UPDATE_PATIENT,
        payload: {
          id: parseInt(id),
          ...formData,
          entityId: formData.entityId ? parseInt(formData.entityId) : null
        }
      });
    } else {
      dispatch({
        type: actionTypes.ADD_PATIENT,
        payload: {
          ...formData,
          entityId: formData.entityId ? parseInt(formData.entityId) : null
        }
      });
    }
    
    navigate('/patients');
  };

  return (
    <div className="analyse-form">
      <div className="page-header">
        <h1>
          <i className="bi bi-people"></i> 
          {id ? 'Modifier un patient' : 'Ajouter un patient'}
        </h1>
        <button className="btn btn-secondary" onClick={() => navigate('/patients')}>
          <i className="bi bi-arrow-left"></i> Retour
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>{id ? 'Modifier' : 'Nouveau'} patient</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nomComplet">Nom complet <span className="text-danger">*</span></label>
              <input
                type="text"
                id="nomComplet"
                className="form-control"
                value={formData.nomComplet}
                onChange={(e) => setFormData({ ...formData, nomComplet: e.target.value })}
                required
                placeholder="Nom complet"
              />
            </div>

            <div className="form-group">
              <label htmlFor="matricule">Matricule <span className="text-danger">*</span></label>
              <input
                type="text"
                id="matricule"
                className="form-control"
                value={formData.matricule}
                onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                required
                placeholder="Matricule"
              />
            </div>

            <div className="form-group">
              <label htmlFor="typePriseEnCharge">Type de prise en charge <span className="text-danger">*</span></label>
              <select
                id="typePriseEnCharge"
                className="form-control"
                value={formData.typePriseEnCharge}
                onChange={(e) => setFormData({ ...formData, typePriseEnCharge: e.target.value, entityId: null })}
                required
              >
                <option value="">---------</option>
                <option value="IPM">IPM</option>
                <option value="ASSURANCE">Assurance</option>
              </select>
            </div>

            {formData.typePriseEnCharge === 'IPM' && (
              <div className="form-group">
                <label htmlFor="ipm">IPM <span className="text-danger">*</span></label>
                <select
                  id="ipm"
                  className="form-control"
                  value={formData.entityId || ''}
                  onChange={(e) => setFormData({ ...formData, entityId: e.target.value ? parseInt(e.target.value) : null })}
                  required
                >
                  <option value="">Sélectionner une IPM</option>
                  {ipms.map(ipm => (
                    <option key={ipm.id} value={ipm.id}>{ipm.nom}</option>
                  ))}
                </select>
              </div>
            )}

            {formData.typePriseEnCharge === 'ASSURANCE' && (
              <div className="form-group">
                <label htmlFor="assurance">Assurance <span className="text-danger">*</span></label>
                <select
                  id="assurance"
                  className="form-control"
                  value={formData.entityId || ''}
                  onChange={(e) => setFormData({ ...formData, entityId: e.target.value ? parseInt(e.target.value) : null })}
                  required
                >
                  <option value="">Sélectionner une assurance</option>
                  {assurances.map(assurance => (
                    <option key={assurance.id} value={assurance.id}>{assurance.nom}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                <i className="bi bi-check-circle"></i> Enregistrer
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/patients')}
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

export default PatientForm;

