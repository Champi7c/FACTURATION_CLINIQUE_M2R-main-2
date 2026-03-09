import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import './DevisForm.css';

const DevisForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { 
    patients, 
    analyses, 
    tarifs, 
    devis,
    ipms,
    assurances,
    categories,
    addDevis, 
    updateDevis, 
    getPrixAnalyse,
    addPatient,
    updatePatient
  } = useData();
  
  const isEdit = !!id;
  const devi = isEdit ? devis.find(d => d.id === id) : null;
  const patient = devi ? patients.find(p => p.id === devi.patientId) : null;

  const [patientData, setPatientData] = useState({
    nomComplet: patient ? patient.nomComplet : '',
    matricule: patient ? patient.matricule : '',
    typePriseEnCharge: patient ? patient.typePriseEnCharge : '',
    ipmId: patient ? patient.ipmId : '',
    assuranceId: patient ? patient.assuranceId : ''
  });
  // Initialiser les lignes avec une quantité par défaut de 1 si elle n'existe pas
  const initialiserLignes = (lignesExistantes) => {
    if (!lignesExistantes) return [];
    return lignesExistantes.map(ligne => ({
      ...ligne,
      quantite: ligne.quantite || 1
    }));
  };
  const [lignes, setLignes] = useState(devi ? initialiserLignes(devi.lignes) : []);
  const [searchAnalyse, setSearchAnalyse] = useState('');
  const [filterCategorie, setFilterCategorie] = useState('all'); // Filtre par catégorie
  const [souscripteur, setSouscripteur] = useState(devi ? devi.souscripteur || '' : '');
  const [tauxCouverture, setTauxCouverture] = useState(devi ? devi.tauxCouverture || '' : '');
  const [addedAnalyses, setAddedAnalyses] = useState(new Set()); // Pour afficher la confirmation d'ajout
  
  // Noms des catégories
  const categoryNames = {
    'analyses': 'Analyses',
    'radiographie': 'Radiographie',
    'hospitalisation': 'Hospitalisation',
    'maternite': 'Maternité',
    'consultations': 'Consultations',
    'medicament': 'Médicament'
  };

  // Mettre à jour les données du patient en mode édition
  useEffect(() => {
    if (isEdit && patient) {
      setPatientData({
        nomComplet: patient.nomComplet || '',
        matricule: patient.matricule || '',
        typePriseEnCharge: patient.typePriseEnCharge || '',
        ipmId: patient.ipmId || '',
        assuranceId: patient.assuranceId || ''
      });
    }
    if (isEdit && devi) {
      setSouscripteur(devi.souscripteur || '');
      setTauxCouverture(devi.tauxCouverture || '');
      // S'assurer que les lignes ont une quantité initialisée
      setLignes(initialiserLignes(devi.lignes || []));
    }
  }, [isEdit, patient, devi]);

  // Analyses disponibles selon le patient
  const getAnalysesDisponibles = () => {
    // Filtrer par catégorie d'abord
    let analysesFiltrees = analyses;
    if (filterCategorie !== 'all') {
      analysesFiltrees = analyses.filter(a => a.categorie === filterCategorie);
    }
    
    // Toujours afficher toutes les analyses, avec prix si disponible
    let analysesAvecPrix = analysesFiltrees.map(analyse => {
      let prix = 0;
      // Si une IPM ou Assurance est sélectionnée, essayer de récupérer le prix
      if (patientData.typePriseEnCharge && (patientData.ipmId || patientData.assuranceId)) {
        prix = getPrixAnalyse(
          analyse.id,
          patientData.ipmId,
          patientData.assuranceId
        );
      }
      return { ...analyse, prix };
    });

    // Filtrer par recherche si un terme est saisi
    if (searchAnalyse.trim()) {
      const searchLower = searchAnalyse.toLowerCase();
      analysesAvecPrix = analysesAvecPrix.filter(a => 
        a.nom.toLowerCase().includes(searchLower)
      );
    }

    return analysesAvecPrix;
  };

  const analysesDisponibles = getAnalysesDisponibles();

  const handleAddLigne = (analyseId = null, prixManuel = null) => {
    const analyseIdToAdd = analyseId || document.getElementById('analyse-select')?.value;
    
    if (!analyseIdToAdd) {
      alert('Veuillez sélectionner une analyse');
      return;
    }

    const analyse = analysesDisponibles.find(a => a.id === analyseIdToAdd);
    if (!analyse) return;

    // Utiliser le prix manuel si fourni, sinon utiliser le prix automatique, sinon 0
    const prixFinal = prixManuel !== null ? parseFloat(prixManuel) : (analyse.prix || 0);

    // Permettre d'ajouter la même analyse plusieurs fois avec une quantité par défaut de 1
    // Stocker aussi le nom et la catégorie pour l'affichage
    const nouvelleLigne = {
      analyseId: analyse.id,
      nom: analyse.nom, // Stocker le nom pour l'affichage
      categorie: analyse.categorie, // Stocker la catégorie pour l'affichage
      prix: prixFinal,
      quantite: 1
    };
    
    setLignes([...lignes, nouvelleLigne]);
    
    // Marquer cette analyse comme ajoutée pour afficher la confirmation visuelle
    setAddedAnalyses(prev => new Set([...prev, analyse.id]));
    setTimeout(() => {
      setAddedAnalyses(prev => {
        const newSet = new Set(prev);
        newSet.delete(analyse.id);
        return newSet;
      });
    }, 2000); // Retirer après 2 secondes
    
    // Réinitialiser la sélection
    const select = document.getElementById('analyse-select');
    if (select) select.value = '';
    setSearchAnalyse(''); // Réinitialiser aussi la recherche
  };

  const handleUpdatePrix = (index, nouveauPrix) => {
    const updatedLignes = [...lignes];
    updatedLignes[index].prix = parseFloat(nouveauPrix) || 0;
    setLignes(updatedLignes);
  };

  const handleUpdateQuantite = (index, nouvelleQuantite) => {
    const updatedLignes = [...lignes];
    const quantite = parseInt(nouvelleQuantite) || 1;
    updatedLignes[index].quantite = quantite > 0 ? quantite : 1;
    setLignes(updatedLignes);
  };

  const handleRemoveLigne = (index) => {
    setLignes(lignes.filter((_, i) => i !== index));
  };

  const handlePatientChange = (e) => {
    const { name, value } = e.target;
    setPatientData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Réinitialiser les champs dépendants
      if (name === 'typePriseEnCharge') {
        newData.ipmId = '';
        newData.assuranceId = '';
        setLignes([]); // Réinitialiser les lignes si le type change
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation des champs patient
    if (!patientData.nomComplet.trim() || !patientData.matricule.trim()) {
      alert('Le nom complet et le matricule sont requis');
      return;
    }

    if (!patientData.typePriseEnCharge) {
      alert('Veuillez sélectionner un type de prise en charge');
      return;
    }

    if (patientData.typePriseEnCharge === 'IPM' && !patientData.ipmId) {
      alert('Veuillez sélectionner une IPM');
      return;
    }

    if (patientData.typePriseEnCharge === 'ASSURANCE' && !patientData.assuranceId) {
      alert('Veuillez sélectionner une assurance');
      return;
    }

    if (lignes.length === 0) {
      alert('Veuillez ajouter au moins une analyse');
      return;
    }

    try {
      let patientId;
      
      if (isEdit) {
      // En mode édition, utiliser le patient existant
      patientId = devi.patientId;
      // Mettre à jour les informations du patient si nécessaire
      const existingPatient = patients.find(p => p.id === patientId);
      if (existingPatient) {
        // Mettre à jour le patient si les données ont changé
        if (existingPatient.nomComplet !== patientData.nomComplet ||
            existingPatient.matricule !== patientData.matricule ||
            existingPatient.typePriseEnCharge !== patientData.typePriseEnCharge ||
            existingPatient.ipmId !== patientData.ipmId ||
            existingPatient.assuranceId !== patientData.assuranceId) {
          await updatePatient(patientId, patientData);
        }
      }
      await updateDevis(id, { patientId, lignes, souscripteur, tauxCouverture });
    } else {
      // En mode création, créer ou trouver le patient
      const existingPatient = patients.find(
        p => p.matricule === patientData.matricule && 
             p.nomComplet.toLowerCase() === patientData.nomComplet.toLowerCase()
      );
      
      if (existingPatient) {
        patientId = existingPatient.id;
        // Mettre à jour le patient si nécessaire
        if (existingPatient.typePriseEnCharge !== patientData.typePriseEnCharge ||
            existingPatient.ipmId !== patientData.ipmId ||
            existingPatient.assuranceId !== patientData.assuranceId) {
          await updatePatient(patientId, patientData);
        }
      } else {
        // Créer un nouveau patient
        const newPatient = await addPatient(patientData);
        patientId = newPatient.id;
      }
      
      await addDevis({ patientId, lignes, souscripteur, tauxCouverture });
      }
      
      navigate('/devis');
    } catch (error) {
      // L'erreur est déjà gérée dans DataContext
      console.error('Erreur lors de la création/modification du devis:', error);
    }
  };

  // Calculer le total en prenant en compte la quantité : prix × quantité
  const total = lignes.reduce((sum, ligne) => {
    const prix = ligne.prix || 0;
    const quantite = ligne.quantite || 1;
    return sum + (prix * quantite);
  }, 0);
  
  // Calculs pour la part patients
  const tauxCouvertureNum = tauxCouverture ? parseFloat(tauxCouverture) : 0;
  // Part patients = ce que le patient paie
  const montantAPayer = total * (tauxCouvertureNum / 100);
  // Montant couvert = ce que l'assurance/IPM paie
  const montantCouvert = total - montantAPayer;
  
  // Fonction pour formater les montants en FCFA
  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(montant);
  };

  return (
    <div className="devis-form-page">
      <div className="page-header">
        <h1>
          <i className="bi bi-file-earmark-text"></i> {isEdit ? 'Modifier' : 'Créer'} un devis
        </h1>
        <button onClick={() => navigate('/devis')} className="btn btn-secondary">
          <i className="bi bi-arrow-left"></i> Retour
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card mb-4">
          <div className="card-header">
            <h5>Informations du patient</h5>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">
                Nom complet <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="nomComplet"
                className="form-control"
                value={patientData.nomComplet}
                onChange={handlePatientChange}
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
                value={patientData.matricule}
                onChange={handlePatientChange}
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
                value={patientData.typePriseEnCharge}
                onChange={handlePatientChange}
                required
              >
                <option value="">---------</option>
                <option value="IPM">IPM</option>
                <option value="ASSURANCE">Assurance</option>
              </select>
            </div>

            {patientData.typePriseEnCharge === 'IPM' && (
              <div className="form-group">
                <label className="form-label">
                  IPM <span className="text-danger">*</span>
                </label>
                <select
                  name="ipmId"
                  className="form-control"
                  value={patientData.ipmId}
                  onChange={handlePatientChange}
                  required
                >
                  <option value="">Sélectionner une IPM</option>
                  {ipms.map(ipm => (
                    <option key={ipm.id} value={ipm.id}>{ipm.nom}</option>
                  ))}
                </select>
              </div>
            )}

            {patientData.typePriseEnCharge === 'ASSURANCE' && (
              <div className="form-group">
                <label className="form-label">
                  Assurance <span className="text-danger">*</span>
                </label>
                <select
                  name="assuranceId"
                  className="form-control"
                  value={patientData.assuranceId}
                  onChange={handlePatientChange}
                  required
                >
                  <option value="">Sélectionner une assurance</option>
                  {assurances.map(assurance => (
                    <option key={assurance.id} value={assurance.id}>{assurance.nom}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                Souscripteur
              </label>
              <input
                type="text"
                className="form-control"
                value={souscripteur}
                onChange={(e) => setSouscripteur(e.target.value)}
                placeholder="Nom du souscripteur"
              />
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-header">
            <h5>Sélectionner les analyses</h5>
          </div>
          <div className="card-body">
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">
                  <i className="bi bi-search"></i> Rechercher une analyse
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tapez pour rechercher une analyse..."
                  value={searchAnalyse}
                  onChange={(e) => setSearchAnalyse(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">
                  <i className="bi bi-funnel"></i> Filtrer par catégorie
                </label>
                <select
                  className="form-control"
                  value={filterCategorie}
                  onChange={(e) => setFilterCategorie(e.target.value)}
                >
                  <option value="all">Toutes les catégories</option>
                  {categories.map((categorie) => {
                    const categorieNom = typeof categorie === 'object' && categorie != null && categorie.nom != null
                      ? String(categorie.nom)
                      : String(categorie ?? '');
                    return (
                      <option key={categorieNom} value={categorieNom}>
                        {categoryNames[categorieNom] || categorieNom}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            <div className="alert alert-info mb-3">
              <i className="bi bi-info-circle"></i> {analysesDisponibles.length} analyse(s) disponible(s)
              {filterCategorie !== 'all' && ` dans la catégorie "${categoryNames[filterCategorie]}"`}
            </div>

            <div className="analyses-selection">
              <div className="analyses-list-container">
                {analysesDisponibles.length > 0 ? (
                  <div className="analyses-list">
                    {analysesDisponibles.map(analyse => {
                      return (
                        <div
                          key={analyse.id}
                          className="analyse-item"
                          onClick={() => handleAddLigne(analyse.id)}
                        >
                          <div className="analyse-name">
                            {(() => {
                              const raw = analyse.categorie;
                              const categorieNorm = typeof raw === 'object' && raw != null && raw.nom != null
                                ? String(raw.nom)
                                : (raw != null && raw !== '' ? String(raw) : null);
                              return categorieNorm ? (
                                <span className="badge bg-info me-2" style={{ fontSize: '0.75rem' }}>
                                  {categoryNames[categorieNorm] || categorieNorm}
                                </span>
                              ) : null;
                            })()}
                            {analyse.nom}
                          </div>
                          <div className="analyse-prix">
                            {analyse.prix > 0 ? (
                              <span className="badge badge-success">{analyse.prix} FCFA</span>
                            ) : (
                              <span className="badge badge-secondary">Prix à définir</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle"></i> Aucune analyse trouvée.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {lignes.length > 0 && (
          <div className="card mb-4">
            <div className="card-header">
              <h5>Analyses du devis</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Analyse / Catégorie</th>
                      <th>Quantité</th>
                      <th>Prix unitaire (FCFA)</th>
                      <th>Sous-total (FCFA)</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lignes.map((ligne, index) => {
                      // Utiliser le nom et la catégorie stockés dans la ligne, ou chercher dans analyses
                      const analyse = ligne.nom ? ligne : analyses.find(a => a.id === ligne.analyseId);
                      const nomAnalyse = ligne.nom || analyse?.nom || 'Analyse inconnue';
                      const categorieAnalyseRaw = ligne.categorie || analyse?.categorie;
                      const categorieAnalyse = typeof categorieAnalyseRaw === 'object' && categorieAnalyseRaw != null && categorieAnalyseRaw.nom != null
                        ? String(categorieAnalyseRaw.nom)
                        : (categorieAnalyseRaw != null && categorieAnalyseRaw !== '' ? String(categorieAnalyseRaw) : '');
                      const quantite = ligne.quantite || 1;
                      const prixUnitaire = ligne.prix || 0;
                      const sousTotal = prixUnitaire * quantite;
                      const isJustAdded = addedAnalyses.has(ligne.analyseId);
                      return (
                        <tr key={index} className={isJustAdded ? 'table-success' : ''}>
                          <td>{index + 1}</td>
                          <td>
                            {categorieAnalyse === 'medicament' ? (
                              <>
                                <span className="badge bg-info">
                                  {categoryNames['medicament'] || 'Médicament'}
                                </span>
                                <br />
                                <small className={isJustAdded ? 'text-success fw-bold' : 'text-muted'}>
                                  {nomAnalyse}
                                  {isJustAdded && <i className="bi bi-check-circle ms-1"></i>}
                                </small>
                              </>
                            ) : categorieAnalyse ? (
                              <>
                                <span className="badge bg-info">
                                  {categoryNames[categorieAnalyse] || categorieAnalyse}
                                </span>
                                <br />
                                <small className={isJustAdded ? 'text-success fw-bold' : 'text-muted'}>
                                  {nomAnalyse}
                                  {isJustAdded && <i className="bi bi-check-circle ms-1"></i>}
                                </small>
                              </>
                            ) : (
                              <small className={isJustAdded ? 'text-success fw-bold' : 'text-muted'}>
                                {nomAnalyse}
                                {isJustAdded && <i className="bi bi-check-circle ms-1"></i>}
                              </small>
                            )}
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              style={{ width: '80px', display: 'inline-block' }}
                              value={quantite}
                              onChange={(e) => handleUpdateQuantite(index, e.target.value)}
                              min="1"
                              step="1"
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              style={{ width: '120px', display: 'inline-block' }}
                              value={prixUnitaire}
                              onChange={(e) => handleUpdatePrix(index, e.target.value)}
                              min="0"
                              step="0.01"
                              required
                            />
                          </td>
                          <td>
                            <strong>{formatMontant(sousTotal)} FCFA</strong>
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => handleRemoveLigne(index)}
                              className="btn btn-sm btn-danger"
                            >
                              <i className="bi bi-trash"></i> Supprimer
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="table-total">
                      <th colSpan="4">TOTAL</th>
                      <th><span className="badge badge-primary">{formatMontant(total)} FCFA</span></th>
                      <th></th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {lignes.length > 0 && (
          <div className="card mb-4">
            <div className="card-header">
              <h5>Récapitulatif et part patients</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">
                      <i className="bi bi-percent"></i> Part patients
                    </label>
                    <select
                      className="form-control"
                      value={tauxCouverture}
                      onChange={(e) => setTauxCouverture(e.target.value)}
                    >
                      <option value="">Sélectionner un taux</option>
                      <option value="0">0%</option>
                      <option value="10">10%</option>
                      <option value="15">15%</option>
                      <option value="20">20%</option>
                      <option value="25">25%</option>
                      <option value="30">30%</option>
                      <option value="35">35%</option>
                      <option value="40">40%</option>
                      <option value="45">45%</option>
                      <option value="50">50%</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="recap-summary">
                    <div className="recap-item">
                      <span className="recap-label">Total du devis :</span>
                      <span className="recap-value">{formatMontant(total)} FCFA</span>
                    </div>
                    {tauxCouverture && (
                      <>
                        <div className="recap-item">
                          <span className="recap-label">Part patients :</span>
                          <span className="recap-value">{tauxCouvertureNum}%</span>
                        </div>
                        <div className="recap-item total-net">
                          <span className="recap-label">Montant à payer :</span>
                          <span className="recap-value highlight">{formatMontant(montantAPayer)} FCFA</span>
                        </div>
                        <div className="recap-item">
                          <span className="recap-label">Montant couvert :</span>
                          <span className="recap-value highlight">{formatMontant(montantCouvert)} FCFA</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            <i className="bi bi-check-circle"></i> {isEdit ? 'Modifier' : 'Créer'} le devis
          </button>
          <button
            type="button"
            onClick={() => navigate('/devis')}
            className="btn btn-secondary"
          >
            <i className="bi bi-x-circle"></i> Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default DevisForm;

