import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { generatePDFDevis } from '../utils/pdfUtils';
import { getDevisNumero } from '../utils/devisUtils';
import { CLINIQUE, CLINIQUE_TELEPHONE_STR } from '../config/clinique';
import './DevisDetail.css';

// Noms des catégories
const categoryNames = {
  'analyses': 'Analyses',
  'radiographie': 'Radiographie',
  'hospitalisation': 'Hospitalisation',
  'maternite': 'Maternité',
  'consultations': 'Consultations',
  'medicament': 'Médicament'
};

const DevisDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { devis, patients, analyses, ipms, assurances } = useData();
  
  const devi = devis.find(d => d.id === id);
  const patient = devi ? patients.find(p => p.id === devi.patientId) : null;

  if (!devi || !patient) {
    return <div>Devis non trouvé</div>;
  }

  const handlePrint = () => {
    window.print();
  };

  const handlePDF = async () => {
    await generatePDFDevis(devi, patient, analyses, devi.lignes, ipms, assurances);
  };

  const ipm = patient.ipmId ? ipms.find(i => i.id === patient.ipmId) : null;
  const assurance = patient.assuranceId ? assurances.find(a => a.id === patient.assuranceId) : null;

  // Calculs pour la part patients
  const tauxCouverture = devi.tauxCouverture || '';
  const tauxCouvertureNum = tauxCouverture ? parseFloat(tauxCouverture) : 0;
  // Part patients = ce que le patient paie
  const montantAPayer = devi.total * (tauxCouvertureNum / 100);
  // Montant couvert = ce que l'assurance/IPM paie
  const montantCouvert = devi.total - montantAPayer;
  
  // Fonction pour formater les montants en FCFA
  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(montant);
  };

  return (
    <div className="devis-detail-page">
      <div className="page-header no-print">
        <h1><i className="bi bi-file-earmark-text"></i> Devis #{getDevisNumero(devi)}</h1>
        <div className="d-flex gap-2">
          <button onClick={handlePrint} className="btn btn-info">
            <i className="bi bi-printer"></i> Imprimer
          </button>
          <button onClick={handlePDF} className="btn btn-danger">
            <i className="bi bi-file-pdf"></i> PDF
          </button>
          <button onClick={() => navigate(`/devis/${id}/modifier`)} className="btn btn-warning">
            <i className="bi bi-pencil"></i> Modifier
          </button>
          <button onClick={() => navigate('/devis')} className="btn btn-secondary">
            <i className="bi bi-arrow-left"></i> Retour
          </button>
        </div>
      </div>

      <div className="card devis-card">
        <div className="card-body">
          <div className="devis-header">
            <div className="devis-clinique">
              <div className="devis-logo-container">
                <img src={window.location.protocol === 'file:' ? './NABY.jpg' : '/NABY.jpg'} alt={`Logo ${CLINIQUE.nom}`} className="devis-logo" />
                <div className="devis-clinique-info">
                  <h3>{CLINIQUE.nom}</h3>
                  <p>{CLINIQUE.adresse}</p>
                  <p>Tél: {CLINIQUE_TELEPHONE_STR}</p>
                  {CLINIQUE.email && <p>Email: {CLINIQUE.email}</p>}
                </div>
              </div>
            </div>
            <div className="devis-info">
              <h4>FACTURE N° {getDevisNumero(devi)}</h4>
              <p><strong>Date:</strong> {new Date(devi.dateCreation).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          <div className="devis-patient">
            <h5>Informations du patient</h5>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0 }}><strong>Nom:</strong> {patient.nomComplet}</p>
              {devi.souscripteur && (
                <p style={{ margin: 0, textAlign: 'right' }}><strong>Souscripteur:</strong> {devi.souscripteur}</p>
              )}
            </div>
            <p><strong>Matricule:</strong> {patient.matricule}</p>
            <p><strong>Type:</strong> {
              patient.typePriseEnCharge === 'IPM' 
                ? `IPM - ${ipm?.nom || ''}` 
                : `Assurance - ${assurance?.nom || ''}`
            }</p>
            <p><strong>Date:</strong> {new Date(devi.dateCreation).toLocaleDateString('fr-FR')}</p>
          </div>

          <div className="devis-table">
            <table className="table">
                <thead>
                <tr>
                  <th>#</th>
                  <th>Catégorie</th>
                  <th className="text-end">Prix (FCFA)</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  // Grouper les lignes par catégorie
                  const lignesParCategorie = {};
                  let globalIndex = 0;
                  
                  devi.lignes.forEach((ligne) => {
                    // Utiliser le nom et la catégorie stockés dans la ligne en priorité
                    const nomAnalyse = ligne.nom || (analyses.find(a => a.id === ligne.analyseId)?.nom) || 'Analyse inconnue';
                    const categorieAnalyseRaw = ligne.categorie || (analyses.find(a => a.id === ligne.analyseId)?.categorie) || 'non-categorise';
                    const analyse = analyses.find(a => a.id === ligne.analyseId);
                    const categorie = typeof categorieAnalyseRaw === 'object' && categorieAnalyseRaw != null && categorieAnalyseRaw.nom != null
                      ? String(categorieAnalyseRaw.nom)
                      : String(categorieAnalyseRaw ?? 'non-categorise');
                    if (!lignesParCategorie[categorie]) {
                      lignesParCategorie[categorie] = [];
                    }
                    lignesParCategorie[categorie].push({ ligne, analyse, nomAnalyse, index: globalIndex++ });
                  });
                  
                  // Trier les catégories selon l'ordre souhaité
                  const ordreCategories = ['analyses', 'radiographie', 'hospitalisation', 'maternite', 'consultations', 'medicament', 'non-categorise'];
                  const categoriesTriees = Object.keys(lignesParCategorie).sort((a, b) => {
                    const indexA = ordreCategories.indexOf(a);
                    const indexB = ordreCategories.indexOf(b);
                    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
                  });
                  
                  // Afficher les lignes groupées par catégorie
                  let ligneIndex = 0;
                  return categoriesTriees.map((categorie, catIndex) => {
                    const categorieNom = typeof categorie === 'object' && categorie != null && categorie.nom != null
                      ? String(categorie.nom)
                      : String(categorie ?? '');
                    const lignesCategorie = lignesParCategorie[categorieNom] || lignesParCategorie[categorie];
                    const categorieName = categoryNames[categorieNom] || categoryNames[categorie] || categorieNom;
                    return (
                      <React.Fragment key={categorieNom}>
                        {catIndex > 0 && (
                          <tr className="table-category-separator">
                            <td colSpan="3" style={{ 
                              borderTop: '3px solid #000000', 
                              padding: '10px 0',
                              backgroundColor: '#f8f9fa'
                            }}></td>
                          </tr>
                        )}
                        {/* Afficher le nom de la catégorie une seule fois */}
                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                          <td colSpan="3" style={{ 
                            fontWeight: 'bold',
                            padding: '8px',
                            fontSize: '1rem'
                          }}>
                            {categorieName}
                          </td>
                        </tr>
                        {lignesCategorie.map(({ ligne, analyse, nomAnalyse }, idx) => {
                          ligneIndex++;
                          const isLastInCategory = idx === lignesCategorie.length - 1;
                          // Utiliser le nom de la ligne ou de l'analyse
                          const nomBase = nomAnalyse || ligne.nom || analyse?.nom || 'Analyse inconnue';
                          const quantite = ligne.quantite || 1;
                          // Ajouter la quantité au nom si > 1
                          const nomAAfficher = quantite > 1 ? `${nomBase} x${quantite}` : nomBase;
                          return (
                            <React.Fragment key={`${categorieNom}-${ligneIndex}`}>
                              <tr>
                                <td style={{ verticalAlign: 'middle' }}>{ligneIndex}</td>
                                <td>
                                  <span style={{ fontSize: '0.9rem' }}>
                                    {nomAAfficher}
                                  </span>
                                </td>
                                <td className="text-end" style={{ verticalAlign: 'middle' }}>{formatMontant(ligne.prix * quantite)}</td>
                              </tr>
                              {isLastInCategory && catIndex < categoriesTriees.length - 1 && (
                                <tr className="table-category-separator">
                                  <td colSpan="3" style={{ 
                                    borderBottom: '3px solid #000000', 
                                    padding: '10px 0',
                                    backgroundColor: '#f8f9fa'
                                  }}></td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </React.Fragment>
                    );
                  });
                })()}
              </tbody>
              <tfoot>
                <tr className="table-total">
                  <th colSpan="2">TOTAL</th>
                  <th className="text-end">{formatMontant(devi.total)} FCFA</th>
                </tr>
                {tauxCouverture && (
                  <>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <td colSpan="2"><strong>Part patients</strong></td>
                      <td className="text-end"><strong>{tauxCouvertureNum}%</strong></td>
                    </tr>
                    <tr style={{ backgroundColor: '#d4edda', borderTop: '2px solid #28a745' }}>
                      <td colSpan="2"><strong style={{ fontSize: '1.1em', color: '#155724' }}>Montant à payer</strong></td>
                      <td className="text-end"><strong style={{ fontSize: '1.1em', color: '#155724' }}>{formatMontant(montantAPayer)} FCFA</strong></td>
                    </tr>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <td colSpan="2"><strong>Montant couvert</strong></td>
                      <td className="text-end"><strong>{formatMontant(montantCouvert)} FCFA</strong></td>
                    </tr>
                  </>
                )}
              </tfoot>
            </table>
          </div>

          <div className="devis-signature">
            <p>Signature</p>
            <div className="signature-line"></div>
            <p className="signature-name">La comptabilité</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevisDetail;


