import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import './FormPage.css';

const AnalysesForm = ({ category: categoryProp }) => {
  const navigate = useNavigate();
  // Obtenir la catégorie depuis les paramètres d'URL ou depuis la prop
  const { category: categoryParam, id } = useParams();
  const category = categoryParam || categoryProp || 'analyses';
  
  const { analyses, addAnalyse, updateAnalyse } = useData();
  
  const isEdit = !!id;
  const analyse = isEdit ? analyses.find(a => a.id === id) : null;
  
  // Noms des catégories (avec support pour les catégories dynamiques)
  const categoryNames = {
    'analyses': 'Analyse',
    'radiographie': 'Radiographie',
    'hospitalisation': 'Hospitalisation',
    'maternite': 'Maternité',
    'consultations': 'Consultations',
    'medicament': 'Médicament'
  };
  
  // Fonction pour obtenir le nom d'affichage d'une catégorie
  const getCategoryName = (cat) => {
    if (categoryNames[cat]) {
      return categoryNames[cat];
    }
    // Pour les nouvelles catégories, capitaliser la première lettre
    return cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : 'Analyse';
  };

  const [formData, setFormData] = useState({
    nom: '',
    typePriseEnCharge: '',
    ipmId: '',
    assuranceId: '',
    prix: ''
  });

  const { ipms, assurances, addTarif } = useData();

  useEffect(() => {
    if (isEdit && analyse) {
      setFormData({
        nom: analyse.nom || '',
        typePriseEnCharge: '',
        ipmId: '',
        assuranceId: '',
        prix: ''
      });
    }
  }, [isEdit, analyse]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Réinitialiser les champs dépendants
    if (name === 'typePriseEnCharge') {
      setFormData(prev => ({
        ...prev,
        ipmId: '',
        assuranceId: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nom.trim()) {
      alert('Le nom de l\'analyse est requis');
      return;
    }

    try {
      if (isEdit) {
        await updateAnalyse(id, { nom: formData.nom, categorie: category });
      } else {
        const newAnalyse = await addAnalyse({ nom: formData.nom, categorie: category });
        
        // Si un prix est fourni, créer le tarif
        if (formData.prix && formData.typePriseEnCharge) {
          await addTarif({
            analyseId: newAnalyse.id,
            typePriseEnCharge: formData.typePriseEnCharge,
            ipmId: formData.typePriseEnCharge === 'IPM' ? formData.ipmId : null,
            assuranceId: formData.typePriseEnCharge === 'ASSURANCE' ? formData.assuranceId : null,
            prix: formData.prix
          });
        }
      }
      navigate(`/base-de-donnees/${category}`);
    } catch (error) {
      // L'erreur est déjà gérée dans DataContext
    }
  };

  return (
    <div className="form-page">
      <div className="page-header">
        <h1>
          <i className="bi bi-clipboard-pulse"></i> {isEdit ? 'Modifier' : 'Ajouter'} une {getCategoryName(category).toLowerCase()}
        </h1>
        <button onClick={() => navigate(`/base-de-donnees/${category}`)} className="btn btn-secondary">
          <i className="bi bi-arrow-left"></i> Retour
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h5>{isEdit ? `Modifier la ${getCategoryName(category).toLowerCase()}` : `Nouvelle ${getCategoryName(category).toLowerCase()}`}</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="alert alert-info mb-3">
              <i className="bi bi-info-circle"></i> Catégorie : <strong>{getCategoryName(category)}</strong>
            </div>
            <div className="form-group">
              <label className="form-label">
                Nom de la {getCategoryName(category).toLowerCase()} <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="nom"
                className="form-control"
                value={formData.nom}
                onChange={handleChange}
                placeholder={`Nom de la ${getCategoryName(category).toLowerCase()}`}
                required
              />
            </div>

            {!isEdit && (
              <>
                <hr className="my-4" />
                <h6 className="mb-3">
                  <i className="bi bi-info-circle"></i> Optionnel : Définir un prix maintenant
                </h6>
                <p className="text-muted small mb-4">
                  Vous pouvez définir un prix pour une IPM ou une Assurance maintenant, ou le faire plus tard.
                </p>

                <div className="form-group">
                  <label className="form-label">Type de prise en charge</label>
                  <select
                    name="typePriseEnCharge"
                    className="form-control"
                    value={formData.typePriseEnCharge}
                    onChange={handleChange}
                  >
                    <option value="">---------</option>
                    <option value="IPM">IPM</option>
                    <option value="ASSURANCE">Assurance</option>
                  </select>
                </div>

                {formData.typePriseEnCharge === 'IPM' && (
                  <div className="form-group">
                    <label className="form-label">IPM</label>
                    <select
                      name="ipmId"
                      className="form-control"
                      value={formData.ipmId}
                      onChange={handleChange}
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
                    <label className="form-label">Assurance</label>
                    <select
                      name="assuranceId"
                      className="form-control"
                      value={formData.assuranceId}
                      onChange={handleChange}
                    >
                      <option value="">Sélectionner une assurance</option>
                      {assurances.map(assurance => (
                        <option key={assurance.id} value={assurance.id}>{assurance.nom}</option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.typePriseEnCharge && (
                  <div className="form-group">
                    <label className="form-label">Prix (FCFA)</label>
                    <input
                      type="number"
                      name="prix"
                      className="form-control"
                      value={formData.prix}
                      onChange={handleChange}
                      placeholder="Prix en FCFA"
                      step="0.01"
                      min="0.01"
                    />
                    <small className="form-text text-muted">
                      Le prix sera associé à l'IPM ou l'Assurance sélectionnée
                    </small>
                  </div>
                )}
              </>
            )}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                <i className="bi bi-check-circle"></i> Enregistrer
              </button>
              <button
                type="button"
                onClick={() => navigate(`/base-de-donnees/${category}`)}
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

export default AnalysesForm;





