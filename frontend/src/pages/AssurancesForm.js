import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import './FormPage.css';

const AssurancesForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { assurances, addAssurance, updateAssurance } = useData();
  
  const isEdit = !!id;
  const assurance = isEdit ? assurances.find(a => a.id === id) : null;

  const [formData, setFormData] = useState({
    nom: ''
  });

  useEffect(() => {
    if (isEdit && assurance) {
      setFormData({
        nom: assurance.nom || ''
      });
    }
  }, [isEdit, assurance]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nom.trim()) {
      alert('Le nom de l\'assurance est requis');
      return;
    }

    try {
      if (isEdit) {
        await updateAssurance(id, formData);
      } else {
        await addAssurance(formData);
      }
      navigate('/assurances');
    } catch (error) {
      // L'erreur est déjà gérée dans DataContext
    }
  };

  return (
    <div className="form-page">
      <div className="page-header">
        <h1>
          <i className="bi bi-shield-check"></i> {isEdit ? 'Modifier' : 'Ajouter'} une assurance
        </h1>
        <button onClick={() => navigate('/assurances')} className="btn btn-secondary">
          <i className="bi bi-arrow-left"></i> Retour
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h5>{isEdit ? 'Modifier l\'assurance' : 'Nouvelle assurance'}</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Nom de l'assurance <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="nom"
                className="form-control"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Nom de l'assurance"
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                <i className="bi bi-check-circle"></i> Enregistrer
              </button>
              <button
                type="button"
                onClick={() => navigate('/assurances')}
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

export default AssurancesForm;






