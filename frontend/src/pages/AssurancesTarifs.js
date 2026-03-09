import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import './TarifsPage.css';

const AssurancesTarifs = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { assurances, analyses, tarifs, addTarif, deleteTarif, addAnalyse, updateTarif } = useData();
  
  const assurance = assurances.find(a => a.id === id);
  // Toutes les assurances partagent les mêmes tarifs génériques (typePriseEnCharge === 'ASSURANCE')
  const assuranceTarifs = tarifs.filter(t => t.typePriseEnCharge === 'ASSURANCE' || (!t.typePriseEnCharge && t.assuranceId === id));

  const [formData, setFormData] = useState({
    analyseId: '',
    prix: '',
    categorie: 'all' // 'all', 'analyses', 'radiographie', 'hospitalisation', 'maternite'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'with-price', 'without-price'
  const [filterCategorie, setFilterCategorie] = useState('all'); // Filtre par catégorie
  
  // Noms des catégories
  const categoryNames = {
    'analyses': 'Analyses',
    'radiographie': 'Radiographie',
    'hospitalisation': 'Hospitalisation',
    'maternite': 'Maternité',
    'consultations': 'Consultations',
    'medicament': 'Médicament'
  };

  // Liste complète des analyses avec prix pour les assurances
  // Mêmes analyses que pour les IPM, mais avec des prix différents
  // Les prix seront mis à jour lorsque vous fournirez la liste des prix pour les assurances
  const analysesStandard = [
    { nom: 'Numération formule (NFS)', prix: 0 },
    { nom: 'Vitesse de sédimentation (VS)', prix: 0 },
    { nom: 'Test d\'Emmel (TE)', prix: 0 },
    { nom: 'Groupage sanguin (GSRH)', prix: 0 },
    { nom: 'Temps de segment (TS)', prix: 0 },
    { nom: 'Temps de Coagulation ou Temps de Cephalines Koaline ou Active (TC ou TCK ou TCA)', prix: 0 },
    { nom: 'Fibrinémie', prix: 0 },
    { nom: 'Taux de Prothrombine (TP)', prix: 0 },
    { nom: 'Combis direct ou indirect', prix: 0 },
    { nom: 'Recherche Agglutinines Irrégulière (RAI)', prix: 0 },
    { nom: 'Amylasémie', prix: 0 },
    { nom: 'Amylasurie', prix: 0 },
    { nom: 'Alpha-amylase', prix: 0 },
    { nom: 'Fer sérique', prix: 0 },
    { nom: 'Hémoglobine glycosylée ou glyquée', prix: 0 },
    { nom: 'Glycémie a jeun', prix: 0 },
    { nom: 'Azotémie ou urée', prix: 0 },
    { nom: 'Créatinémie ou créatinine', prix: 0 },
    { nom: 'Clairance créatinine', prix: 0 },
    { nom: 'Urines (alb-sucre-cc)', prix: 0 },
    { nom: 'Protéines de 24 heures', prix: 0 },
    { nom: 'Microalbiminurie', prix: 0 },
    { nom: 'Glycosurie des 24 heures', prix: 0 },
    { nom: 'Albuminémie', prix: 0 },
    { nom: 'Protidémie', prix: 0 },
    { nom: 'Magnésium', prix: 0 },
    { nom: 'Ionogramme urinaire', prix: 0 },
    { nom: 'Ionogramme sanguin', prix: 0 },
    { nom: 'Transminases (TGO/TGP ou ASAT/ALAT)', prix: 0 },
    { nom: 'Bilirubine (directe et indirecte ou conjuguée et totale)', prix: 0 },
    { nom: 'Acide urique ou uricémie', prix: 0 },
    { nom: 'Calcium', prix: 0 },
    { nom: 'Phosphore', prix: 0 },
    { nom: 'Cholestérol total', prix: 0 },
    { nom: 'HDL cholestérol', prix: 0 },
    { nom: 'LDL cholestérol', prix: 0 },
    { nom: 'Triglycérides', prix: 0 },
    { nom: 'Lipides totaux', prix: 0 },
    { nom: 'Bilan lipidique (chol. Total, HDL, LDL, TG, Lipides totaux)', prix: 0 },
    { nom: 'Hyperglycémie provoquée par voie orale (HPVO)', prix: 0 },
    { nom: 'Acide vanilmandélique (VMA)', prix: 0 },
    { nom: 'Electrophorèse de l\'hémoglobine', prix: 0 },
    { nom: 'Electrophorèse des protéines', prix: 0 },
    { nom: 'Phospholipase alcaline (PAL)', prix: 0 },
    { nom: 'Phospholipase acide (PAC)', prix: 0 },
    { nom: 'Lactate déshydrogènase (LDH)', prix: 0 },
    { nom: 'Créatinine kinase (CK)', prix: 0 },
    { nom: 'Gammaglutamyltranférase (Gamma GT)', prix: 0 },
    { nom: 'BW ou RPR', prix: 0 },
    { nom: 'TPHA', prix: 0 },
    { nom: 'Sérologie syphilitique (BW + TPHA)', prix: 0 },
    { nom: 'Antistreptolysine O (ASLO)', prix: 0 },
    { nom: 'Protéine C réactive (CRP)', prix: 0 },
    { nom: 'Latex Waler Rose (LWR ou WR)', prix: 0 },
    { nom: 'Sérodiagnostic de Widal et Félix (SWF ou WF)', prix: 0 },
    { nom: 'Test de Wide ou Béta HCG', prix: 0 },
    { nom: 'Mononucléose infectieuse (MNI)', prix: 0 },
    { nom: 'Antistreptodornase B (ASDOR B)', prix: 0 },
    { nom: 'Sérologie amibienne', prix: 0 },
    { nom: 'Alpha-Foeto-Protéine (AFP)', prix: 0 },
    { nom: 'Ferritine', prix: 0 },
    { nom: 'Toxoplasmose (Ig M et Ig G)', prix: 0 },
    { nom: 'Rubéole (Ig M et Ig G)', prix: 0 },
    { nom: 'Chlamydiae', prix: 0 },
    { nom: 'Antigène HBS', prix: 0 },
    { nom: 'Sérologie rétrovirale (HIV ou TME)', prix: 0 },
    { nom: 'Antigène HBE', prix: 0 },
    { nom: 'Anticorps anti-HBC (Ac anti-HBC)', prix: 0 },
    { nom: 'Anticorps anti-HVC (Ac anti-HVC)', prix: 0 },
    { nom: 'Anticorps anti-HBE (Ac anti-HBE)', prix: 0 },
    { nom: 'Anticorps anti-HBS (Ac anti-HBS)', prix: 0 },
    { nom: 'PSA', prix: 0 },
    { nom: 'Progestérone', prix: 0 },
    { nom: 'Prolactine', prix: 0 },
    { nom: 'Œstradiol', prix: 0 },
    { nom: 'FSH', prix: 0 },
    { nom: 'LH', prix: 0 },
    { nom: 'T3 libre', prix: 0 },
    { nom: 'T4 libre', prix: 0 },
    { nom: 'TSH ultra-sensible', prix: 0 },
    { nom: 'T3l-T4l-TSHu', prix: 0 },
    { nom: 'testostérone', prix: 0 },
    { nom: 'Prélèvement Vaginal (P.V.)', prix: 0 },
    { nom: 'ECBU ou Uroculture', prix: 0 },
    { nom: 'Coproculture', prix: 0 },
    { nom: 'Recherche Chlamydia', prix: 0 },
    { nom: 'ECB-LCR', prix: 0 },
    { nom: 'ECB-PUS', prix: 0 },
    { nom: 'ECB-Prélèvement de gorge', prix: 0 },
    { nom: 'ECB-Prélèvement auriculaire', prix: 0 },
    { nom: 'ECB-Prélèvement oculaire', prix: 0 },
    { nom: 'Spermogramme', prix: 0 },
    { nom: 'ECB-Prélèvement de sonde', prix: 0 },
    { nom: 'ECB-Prélèvement urétral', prix: 0 },
    { nom: 'ECB-Liquide d\'ascite', prix: 0 },
    { nom: 'ECB-Liquide pleural', prix: 0 },
    { nom: 'ECB-Liquide de ponction', prix: 0 },
    { nom: 'Mycoplasmes', prix: 0 },
    { nom: 'Recherche de BK', prix: 0 },
    { nom: 'Hémoculture', prix: 0 },
    { nom: 'KAOP ou Selles KAOP', prix: 0 },
    { nom: 'GOUTTE EPAISSE (GE)', prix: 0 },
    { nom: 'CULOT URINAIRE', prix: 0 },
    { nom: 'Recherche de Microfilaires', prix: 0 },
    { nom: 'Compte d\'ADDIS ou HLM', prix: 0 },
    { nom: 'ECC Liquide d\'ascite', prix: 0 },
    { nom: 'ECC-LCR', prix: 0 },
    { nom: 'TROPONINE', prix: 0 },
    { nom: 'DDIMERE', prix: 0 },
    { nom: 'CHARGE VIRALE', prix: 0 },
    { nom: 'ECHOGRAPHIE MAMAIRE', prix: 0 },
    { nom: 'ECHOGRAPHIE THYROIDIENNE', prix: 0 },
    { nom: 'ECHOGRAPHIE DES TISSUS MOUS', prix: 0 },
    { nom: 'ECHOGRAPHIE ABDOMINAL', prix: 0 },
    { nom: 'ECHOGRAPHIE ABDOMINO-PELVIENNE', prix: 0 },
    { nom: 'ECHOGRAPHIE DOPPLER VASCULAIRE', prix: 0 },
    { nom: 'ECHOGRAPHIE CARDIAQUE', prix: 0 },
    { nom: 'ECHOGRAPHIE TESTICULAIRE', prix: 0 },
    { nom: 'ELECTROCARDIOGRAMME', prix: 0 },
    { nom: 'FIBROSCOPIE O.G.D', prix: 0 },
    { nom: 'CHAMBRE à 2 LITS', prix: 0 },
    { nom: 'CHAMBRE INDIVIDUELLE', prix: 0 },
    { nom: 'ACCOUCHEMENT', prix: 0 },
    { nom: 'ACCOUCHEMENT GEMELLAIRE', prix: 0 },
    { nom: 'PERINEORRAPHIE', prix: 0 },
    { nom: 'CONSULTATION SIMPLE', prix: 0 },
    { nom: 'CONSULTATION NUIT', prix: 0 },
    { nom: 'CONSULTATION SPECIALISTE', prix: 0 },
    { nom: 'CONSULTATION SPECIALISTE SAMEDI APRES MIDI ET FERIE', prix: 0 },
    { nom: 'CONSULTATION SAMEDI APRES MIDI ET FERIE', prix: 0 }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.analyseId || !formData.prix) {
      alert('Veuillez sélectionner une analyse et entrer un prix');
      return;
    }

    addTarif({
      analyseId: formData.analyseId,
      typePriseEnCharge: 'ASSURANCE', // Tarif générique pour toutes les assurances
      prix: formData.prix
    });

    setFormData({ analyseId: '', prix: '' });
  };

  const handleImportStandard = () => {
    if (window.confirm('Voulez-vous importer la liste standard des analyses avec leurs prix ? Les tarifs existants seront mis à jour.')) {
      let imported = 0;
      let updated = 0;
      
      analysesStandard.forEach(({ nom, prix }) => {
        // Ignorer les analyses avec prix 0
        if (prix === 0) return;
        
        // Chercher ou créer l'analyse
        let analyse = analyses.find(a => a.nom === nom);
        if (!analyse) {
          // Créer avec la catégorie 'analyses' par défaut (car ce sont les analyses standard)
          analyse = addAnalyse({ nom, categorie: 'analyses' });
        }
        
        // Vérifier si le tarif existe déjà
        const existingTarif = assuranceTarifs.find(t => t.analyseId === analyse.id);
        if (existingTarif) {
          // Mettre à jour le tarif existant
          updateTarif(existingTarif.id, { prix: prix });
          updated++;
        } else {
          // Créer un nouveau tarif
          addTarif({
            analyseId: analyse.id,
            typePriseEnCharge: 'ASSURANCE', // Tarif générique pour toutes les assurances
            prix: prix
          });
          imported++;
        }
      });
      
      alert(`Importation réussie ! ${imported} nouveaux tarifs créés, ${updated} tarifs mis à jour.`);
    }
  };

  // Obtenir toutes les analyses avec leurs tarifs (ou sans)
  const getAnalysesWithTarifs = () => {
    return analyses
      .filter(analyse => {
        // Filtrer par catégorie si sélectionnée
        if (filterCategorie !== 'all') {
          return analyse.categorie === filterCategorie;
        }
        return true;
      })
      .map(analyse => {
        const tarif = assuranceTarifs.find(t => t.analyseId === analyse.id);
        return {
          ...analyse,
          prix: tarif ? tarif.prix : null,
          tarifId: tarif ? tarif.id : null
        };
      });
  };

  // Filtrer les analyses selon les critères
  const filteredAnalyses = getAnalysesWithTarifs().filter(analyse => {
    // Filtre par recherche
    if (searchTerm && !analyse.nom.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filtre par type (avec prix, sans prix, tous)
    if (filterType === 'with-price' && !analyse.prix) {
      return false;
    }
    if (filterType === 'without-price' && analyse.prix) {
      return false;
    }
    
    return true;
  });

  if (!assurance) {
    return <div>Assurance non trouvée</div>;
  }

  return (
    <div className="tarifs-page">
      <div className="page-header">
        <h1><i className="bi bi-currency-dollar"></i> Tarifs Assurance (Partagés par toutes les assurances)</h1>
        <div className="d-flex gap-2">
          <button onClick={handleImportStandard} className="btn btn-success">
            <i className="bi bi-download"></i> Importer la liste standard
          </button>
          <button onClick={() => navigate('/assurances')} className="btn btn-secondary">
            <i className="bi bi-arrow-left"></i> Retour
          </button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h5>Rechercher et filtrer les analyses</h5>
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
                placeholder="Tapez pour rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Filtrer par statut</label>
              <select
                className="form-control"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Toutes les analyses</option>
                <option value="with-price">Avec prix configuré</option>
                <option value="without-price">Sans prix configuré</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Filtrer par catégorie</label>
              <select
                className="form-control"
                value={filterCategorie}
                onChange={(e) => setFilterCategorie(e.target.value)}
              >
                <option value="all">Toutes les catégories</option>
                <option value="analyses">Analyses</option>
                <option value="radiographie">Radiographie</option>
                <option value="hospitalisation">Hospitalisation</option>
                <option value="maternite">Maternité</option>
                <option value="consultations">Consultations</option>
                <option value="medicament">Médicament</option>
              </select>
            </div>
          </div>
          <div className="alert alert-info">
            <i className="bi bi-info-circle"></i> {filteredAnalyses.length} analyse(s) trouvée(s)
            {filterType === 'with-price' && ` (${assuranceTarifs.length} avec prix)`}
            {filterType === 'without-price' && ` (${analyses.length - assuranceTarifs.length} sans prix)`}
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h5>Ajouter/Modifier un tarif manuellement</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-3">
                <label className="form-label">Catégorie</label>
                <select
                  name="categorie"
                  className="form-control"
                  value={formData.categorie}
                  onChange={handleChange}
                >
                  <option value="all">Toutes les catégories</option>
                  <option value="analyses">Analyses</option>
                  <option value="radiographie">Radiographie</option>
                  <option value="hospitalisation">Hospitalisation</option>
                  <option value="maternite">Maternité</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Analyse</label>
                <select
                  name="analyseId"
                  className="form-control"
                  value={formData.analyseId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionner une analyse</option>
                  {analyses
                    .filter(analyse => {
                      // Filtrer par catégorie si sélectionnée
                      if (formData.categorie !== 'all') {
                        return analyse.categorie === formData.categorie;
                      }
                      return true;
                    })
                    .map(analyse => {
                      const raw = analyse.categorie;
                      const categorieNorm = typeof raw === 'object' && raw != null && raw.nom != null
                        ? String(raw.nom)
                        : (raw != null && raw !== '' ? String(raw) : null);
                      return (
                        <option key={analyse.id} value={analyse.id}>
                          {analyse.nom} {categorieNorm && `(${categoryNames[categorieNorm] || categorieNorm})`}
                        </option>
                      );
                    })}
                </select>
              </div>
              <div className="col-md-5">
                <label className="form-label">Prix (FCFA)</label>
                <input
                  type="number"
                  name="prix"
                  className="form-control"
                  value={formData.prix}
                  onChange={handleChange}
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
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5>Liste des analyses et leurs tarifs</h5>
          <span className="badge bg-primary">
            {assuranceTarifs.length} / {analyses.length} analyses avec prix
          </span>
        </div>
        <div className="card-body">
          {filteredAnalyses.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Catégorie</th>
                    <th>Prix (FCFA)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAnalyses.map(analyse => {
                    const raw = analyse.categorie;
                    const categorieNorm = typeof raw === 'object' && raw != null && raw.nom != null
                      ? String(raw.nom)
                      : (raw != null && raw !== '' ? String(raw) : null);
                    return (
                      <tr key={analyse.id}>
                        <td>
                          <span className="badge bg-info">
                            {categoryNames[categorieNorm] || categorieNorm || 'Non catégorisé'}
                          </span>
                          <br />
                          <small className="text-muted">{analyse.nom}</small>
                        </td>
                        <td>
                          {analyse.prix ? (
                            <span className="badge bg-success">{analyse.prix} FCFA</span>
                          ) : (
                            <span className="badge bg-secondary">Non configuré</span>
                          )}
                        </td>
                        <td>
                          {analyse.prix ? (
                            <>
                              <button
                                onClick={() => {
                                  const newPrix = prompt('Nouveau prix (FCFA):', analyse.prix);
                                  if (newPrix && !isNaN(newPrix) && parseFloat(newPrix) > 0) {
                                    updateTarif(analyse.tarifId, { prix: parseFloat(newPrix) });
                                  }
                                }}
                                className="btn btn-sm btn-warning me-2"
                              >
                                <i className="bi bi-pencil"></i> Modifier
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Supprimer ce tarif ?')) {
                                    deleteTarif(analyse.tarifId);
                                  }
                                }}
                                className="btn btn-sm btn-danger"
                              >
                                <i className="bi bi-trash"></i> Supprimer
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                const prix = prompt('Prix (FCFA):');
                                if (prix && !isNaN(prix) && parseFloat(prix) > 0) {
                                  addTarif({
                                    analyseId: analyse.id,
                                    typePriseEnCharge: 'ASSURANCE', // Tarif générique pour toutes les assurances
                                    prix: parseFloat(prix)
                                  });
                                }
                              }}
                              className="btn btn-sm btn-primary"
                            >
                              <i className="bi bi-plus-circle"></i> Ajouter prix
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-info">
              <i className="bi bi-info-circle"></i> Aucune analyse trouvée avec ces critères.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssurancesTarifs;

