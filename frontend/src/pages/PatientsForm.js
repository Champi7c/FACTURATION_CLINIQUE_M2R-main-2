import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import './FormPage.css';

const PatientsForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { patients, ipms, assurances, addPatient, updatePatient } = useData();
  
  const isEdit = !!id;
  const patient = isEdit ? patients.find(p => p.id === id) : null;

  const [formData, setFormData] = useState({
    nomComplet: '',
    matricule: '',
    typePriseEnCharge: '',
    ipmId: '',
    assuranceId: ''
  });

  useEffect(() => {
    if (isEdit && patient) {
      setFormData({
        nomComplet: patient.nomComplet || '',
        matricule: patient.matricule || '',
        typePriseEnCharge: patient.typePriseEnCharge || '',
        ipmId: patient.ipmId || '',
        assuranceId: patient.assuranceId || ''
      });
    }
  }, [isEdit, patient]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Réinitialiser les champs dépendants
      if (name === 'typePriseEnCharge') {
        newData.ipmId = '';
        newData.assuranceId = '';
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nomComplet.trim() || !formData.matricule.trim()) {
      alert('Le nom complet et le matricule sont requis');
      return;
    }

    if (!formData.typePriseEnCharge) {
      alert('Veuillez sélectionner un type de prise en charge');
      return;
    }

    if (formData.typePriseEnCharge === 'IPM' && !formData.ipmId) {
      alert('Veuillez sélectionner une IPM');
      return;
    }

    if (formData.typePriseEnCharge === 'ASSURANCE' && !formData.assuranceId) {
      alert('Veuillez sélectionner une assurance');
      return;
    }

    try {
      if (isEdit) {
        await updatePatient(id, formData);
      } else {
        await addPatient(formData);
      }
      navigate('/patients');
    } catch (error) {
      // L'erreur est déjà gérée dans DataContext
    }
  };

  return (
    <div className="form-page">
      <div className="page-header">
        <h1>
          <i className="bi bi-people"></i> {isEdit ? 'Modifier' : 'Ajouter'} un patient
        </h1>
        <button onClick={() => navigate('/patients')} className="btn btn-secondary">
          <i className="bi bi-arrow-left"></i> Retour
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h5>{isEdit ? 'Modifier le patient' : 'Nouveau patient'}</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Nom complet <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="nomComplet"
                className="form-control"
                value={formData.nomComplet}
                onChange={handleChange}
                placeholder="Nom complet"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Matricule <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="matricule"
                className="form-control"
                value={formData.matricule}
                onChange={handleChange}
                placeholder="Matricule"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Type de prise en charge <span className="text-danger">*</span>
              </label>
              <select
                name="typePriseEnCharge"
                className="form-control"
                value={formData.typePriseEnCharge}
                onChange={handleChange}
                required
              >
                <option value="">---------</option>
                <option value="IPM">IPM</option>
                <option value="ASSURANCE">Assurance</option>
              </select>
            </div>

            {formData.typePriseEnCharge === 'IPM' && (
              <div className="form-group">
                <label className="form-label">
                  IPM <span className="text-danger">*</span>
                </label>
                <select
                  name="ipmId"
                  className="form-control"
                  value={formData.ipmId}
                  onChange={handleChange}
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
                <label className="form-label">
                  Assurance <span className="text-danger">*</span>
                </label>
                <select
                  name="assuranceId"
                  className="form-control"
                  value={formData.assuranceId}
                  onChange={handleChange}
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
                onClick={() => navigate('/patients')}
                className="btn btn-secondary"
              >
                <i className="bi bi-x-circle"></i> Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PatientsForm;






