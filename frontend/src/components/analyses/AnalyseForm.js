import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import './AnalyseForm.css';

function AnalyseForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { analyses, dispatch, actionTypes } = useApp();
  
  const [formData, setFormData] = useState({
    nom: '',
    categorie: 'analyses'
  });

  useEffect(() => {
    if (id) {
      const analyse = analyses.find(a => a.id === id);
      if (analyse) {
        setFormData({
          nom: analyse.nom,
          categorie: analyse.categorie
        });
      }
    }
  }, [id, analyses]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (id) {
        await updateAnalyse(id, { nom: formData.nom, categorie: formData.categorie });
      } else {
        await addAnalyse({ nom: formData.nom, categorie: formData.categorie });
      }
      navigate('/analyses');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  return (
    <div className="analyse-form">
      <div className="page-header">
        <h1>
          <i className="bi bi-clipboard-pulse"></i> 
          {id ? 'Modifier une analyse' : 'Ajouter une analyse'}
        </h1>
        <button className="btn btn-secondary" onClick={() => navigate('/analyses')}>
          <i className="bi bi-arrow-left"></i> Retour
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>{id ? 'Modifier' : 'Nouvelle'} analyse</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nom">Nom de l'analyse <span className="text-danger">*</span></label>
              <input
                type="text"
                id="nom"
                className="form-control"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
                placeholder="Nom de l'analyse"
              />
            </div>

            <div className="form-group">
              <label htmlFor="categorie">Catégorie</label>
              <select
                id="categorie"
                className="form-control"
                value={formData.categorie}
                onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
              >
                <option value="analyses">Analyses</option>
                <option value="radiographie">Radiographie</option>
                <option value="hospitalisation">Hospitalisation</option>
                <option value="maternite">Maternité</option>
                <option value="consultations">Consultations</option>
                <option value="medicament">Médicaments</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                <i className="bi bi-check-circle"></i> Enregistrer
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/analyses')}
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

export default AnalyseForm;

