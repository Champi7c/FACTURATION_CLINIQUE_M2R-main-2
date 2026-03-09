import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { generatePDFDevisMensuel } from '../utils/pdfUtils';
import { facturesMensuellesAPI } from '../services/api';
import { CLINIQUE, CLINIQUE_TELEPHONE_STR } from '../config/clinique';
import './DevisMensuel.css';

const DevisMensuel = () => {
  const navigate = useNavigate();
  const { ipms, assurances, getDevisMensuels, patients, analyses } = useData();

  const [formData, setFormData] = useState({
    mois: new Date().toISOString().slice(0, 7),
    typePriseEnCharge: '',
    ipmId: '',
    assuranceId: ''
  });

  const [resultats, setResultats] = useState(null);
  const [numeroFacture, setNumeroFacture] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'typePriseEnCharge') {
        newData.ipmId = '';
        newData.assuranceId = '';
      }
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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

    const mois = new Date(formData.mois + '-01');
    const devis = getDevisMensuels(
      mois,
      formData.typePriseEnCharge,
      formData.ipmId,
      formData.assuranceId
    );

    const entite = formData.typePriseEnCharge === 'IPM'
      ? ipms.find(i => i.id === formData.ipmId)
      : assurances.find(a => a.id === formData.assuranceId);

    // Générer le numéro de facture mensuelle
    try {
      const moisInt = mois.getMonth() + 1;
      const anneeInt = mois.getFullYear();
      const entiteId = formData.typePriseEnCharge === 'IPM' ? formData.ipmId : formData.assuranceId;
      
      const response = await facturesMensuellesAPI.genererNumero(
        moisInt,
        anneeInt,
        formData.typePriseEnCharge,
        entiteId
      );
      
      setNumeroFacture(response.data.numero_facture);
    } catch (error) {
      console.error('Erreur lors de la génération du numéro de facture:', error);
      // Générer un numéro par défaut si l'API échoue
      const moisInt = mois.getMonth() + 1;
      const anneeInt = mois.getFullYear();
      setNumeroFacture(`FACT-${anneeInt}-${String(moisInt).padStart(2, '0')}-001`);
    }

    setResultats({
      devis,
      entite,
      mois,
      typePriseEnCharge: formData.typePriseEnCharge
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePDF = async () => {
    if (!resultats) return;
    await generatePDFDevisMensuel(
      resultats.devis,
      resultats.entite,
      resultats.mois,
      resultats.typePriseEnCharge,
      patients,
      analyses,
      ipms,
      assurances,
      numeroFacture
    );
  };

  return (
    <div className="devis-mensuel-page">
      <div className="page-header">
        <h1><i className="bi bi-calendar-month"></i> Générer une facture mensuelle</h1>
        <button onClick={() => navigate('/devis')} className="btn btn-secondary">
          <i className="bi bi-arrow-left"></i> Retour
        </button>
      </div>

      {!resultats ? (
        <div className="card">
          <div className="card-header">
            <h5>Sélectionner les critères</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Mois</label>
                <input
                  type="month"
                  name="mois"
                  className="form-control"
                  value={formData.mois}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Type de prise en charge</label>
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
                  <label className="form-label">IPM</label>
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
                  <label className="form-label">Assurance</label>
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
                  <i className="bi bi-search"></i> Générer la facture mensuelle
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header no-print">
            <h5>
              <i className="bi bi-calendar-month"></i> Facture Mensuelle - {resultats.entite.nom}
            </h5>
            <div className="d-flex gap-2">
              <button onClick={handlePrint} className="btn btn-info">
                <i className="bi bi-printer"></i> Imprimer
              </button>
              <button onClick={handlePDF} className="btn btn-danger">
                <i className="bi bi-file-pdf"></i> PDF
              </button>
              <button onClick={() => {
                setResultats(null);
                setNumeroFacture('');
              }} className="btn btn-secondary">
                <i className="bi bi-arrow-left"></i> Nouvelle recherche
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="devis-mensuel-header">
              <div className="devis-logo-container">
                <img src={window.location.protocol === 'file:' ? './NABY.jpg' : '/NABY.jpg'} alt={`Logo ${CLINIQUE.nom}`} className="devis-logo" />
                <div>
                  <h3>{CLINIQUE.nom}</h3>
                  <p>{CLINIQUE.adresse}</p>
                  <p>Tél: {CLINIQUE_TELEPHONE_STR}</p>
                  {CLINIQUE.email && <p>Email: {CLINIQUE.email}</p>}
                </div>
              </div>
              <div>
                <h4>FACTURE MENSUELLE - {resultats.entite.nom}</h4>
                {numeroFacture && (
                  <p><strong>N° Facture:</strong> {numeroFacture}</p>
                )}
                <p><strong>Période:</strong> {
                  new Date(resultats.mois.getFullYear(), resultats.mois.getMonth(), 1)
                    .toLocaleDateString('fr-FR')
                } au {
                  new Date(resultats.mois.getFullYear(), resultats.mois.getMonth() + 1, 0)
                    .toLocaleDateString('fr-FR')
                }</p>
                <p><strong>Type:</strong> {resultats.typePriseEnCharge}</p>
                <p><strong>Nombre de devis:</strong> {resultats.devis.length}</p>
              </div>
            </div>

            <div className="devis-mensuel-content">
              <table className="table table-striped table-bordered" style={{ width: '100%', fontSize: '14px' }}>
                <thead style={{ backgroundColor: '#343a40', color: 'white', fontSize: '14px' }}>
                  <tr>
                    <th style={{ padding: '12px', fontWeight: 'bold' }}>PARTICIPANT</th>
                    <th style={{ padding: '12px', fontWeight: 'bold' }}>MATRICULE</th>
                    <th style={{ padding: '12px', fontWeight: 'bold' }}>PATIENTS</th>
                    <th className="text-end" style={{ padding: '12px', fontWeight: 'bold' }}>MONTANT</th>
                  </tr>
                </thead>
                <tbody>
                  {resultats.devis.map((devi, index) => {
                    const patient = patients.find(p => p.id === devi.patientId);
                    // Calculer le montant couvert basé sur le taux de couverture
                    // Si tauxCouverture = 10%, alors montant couvert = 90% du total
                    const tauxCouvertureNum = devi.tauxCouverture ? parseFloat(devi.tauxCouverture) : 0;
                    const montantCouvert = devi.total * (1 - tauxCouvertureNum / 100);
                    
                    return (
                      <tr key={devi.id} style={{ fontSize: '14px' }}>
                        <td style={{ padding: '10px' }}>{devi.souscripteur || '-'}</td>
                        <td style={{ padding: '10px' }}>{patient?.matricule || 'N/A'}</td>
                        <td style={{ padding: '10px' }}>{patient?.nomComplet || 'Patient supprimé'}</td>
                        <td className="text-end" style={{ padding: '10px' }}>
                          {new Intl.NumberFormat('fr-FR', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(montantCouvert)} CFA
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold', fontSize: '14px' }}>
                  <tr>
                    <th colSpan="3" className="text-end" style={{ padding: '12px' }}>TOTAL GÉNÉRAL</th>
                    <th className="text-end" style={{ padding: '12px' }}>
                      {new Intl.NumberFormat('fr-FR', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(
                        resultats.devis.reduce((sum, devi) => {
                          const tauxCouvertureNum = devi.tauxCouverture ? parseFloat(devi.tauxCouverture) : 0;
                          const montantCouvert = devi.total * (1 - tauxCouvertureNum / 100);
                          return sum + montantCouvert;
                        }, 0)
                      )} CFA
                    </th>
                  </tr>
                </tfoot>
              </table>

              <div className="devis-signature">
                <p>Signature</p>
                <div className="signature-line"></div>
                <p className="signature-name">La comptabilité</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevisMensuel;

