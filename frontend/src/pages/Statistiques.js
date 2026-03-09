import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import SuiviFactures from '../components/SuiviFactures';
import './Statistiques.css';

const Statistiques = () => {
  const { devis, patients, ipms, assurances } = useData();
  const { user } = useAuth();
  
  // Tous les hooks doivent être appelés AVANT tout return conditionnel
  const now = new Date();
  const [periodeType, setPeriodeType] = useState('mois'); // 'mois' ou 'annee'
  const [periode, setPeriode] = useState(now.toISOString().slice(0, 7));
  
  // Mettre à jour la période quand le type change (doit être avant le return conditionnel)
  useEffect(() => {
    const now = new Date();
    if (periodeType === 'mois' && !periode.includes('-')) {
      setPeriode(now.toISOString().slice(0, 7));
    } else if (periodeType === 'annee' && periode.includes('-')) {
      setPeriode(now.getFullYear().toString());
    }
  }, [periodeType, periode]);
  
  const isAdmin = user?.is_superuser;

  // Si l'utilisateur n'est pas admin, afficher un message d'erreur
  if (!isAdmin) {
    return (
      <div className="statistiques-page">
        <div className="card">
          <div className="card-body">
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              <strong>Accès refusé</strong>
              <p>Cette page est réservée aux administrateurs uniquement.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fonction pour obtenir les devis d'une période
  const getDevisByPeriode = (typePriseEnCharge, periodeValue) => {
    return devis.filter(devi => {
      const patient = patients.find(p => p.id === devi.patientId);
      if (!patient || patient.typePriseEnCharge !== typePriseEnCharge) return false;
      
      const dateDevis = new Date(devi.dateCreation);
      
      if (periodeType === 'mois') {
        const [annee, mois] = periodeValue.split('-');
        return dateDevis.getFullYear() === parseInt(annee) && 
               dateDevis.getMonth() === parseInt(mois) - 1;
      } else {
        return dateDevis.getFullYear() === parseInt(periodeValue);
      }
    });
  };

  // Fonction helper pour calculer le montant couvert
  const calculerMontantCouvert = (devi) => {
    const tauxCouvertureStr = devi.tauxCouverture || '0';
    const tauxCouvertureNum = tauxCouvertureStr ? parseFloat(tauxCouvertureStr) : 0;
    const montantCouvert = (devi.total || 0) * (1 - tauxCouvertureNum / 100);
    return montantCouvert;
  };

  // Calculer les totaux pour tous les IPM (montant couvert)
  const getTotalIPM = () => {
    const devisIPM = getDevisByPeriode('IPM', periode);
    return devisIPM.reduce((sum, devi) => sum + calculerMontantCouvert(devi), 0);
  };

  // Calculer les totaux pour toutes les Assurances (montant couvert)
  const getTotalAssurances = () => {
    const devisAssurances = getDevisByPeriode('ASSURANCE', periode);
    return devisAssurances.reduce((sum, devi) => sum + calculerMontantCouvert(devi), 0);
  };

  // Calculer les totaux par IPM (montant couvert)
  const getTotalParIPM = () => {
    const devisIPM = getDevisByPeriode('IPM', periode);
    const totals = {};
    
    devisIPM.forEach(devi => {
      const patient = patients.find(p => p.id === devi.patientId);
      if (patient && patient.ipmId) {
        const ipm = ipms.find(i => i.id === patient.ipmId);
        const ipmNom = ipm ? ipm.nom : patient.ipmId;
        const montantCouvert = calculerMontantCouvert(devi);
        totals[ipmNom] = (totals[ipmNom] || 0) + montantCouvert;
      }
    });
    
    return totals;
  };

  // Calculer les totaux par Assurance (montant couvert)
  const getTotalParAssurance = () => {
    const devisAssurances = getDevisByPeriode('ASSURANCE', periode);
    const totals = {};
    
    devisAssurances.forEach(devi => {
      const patient = patients.find(p => p.id === devi.patientId);
      if (patient && patient.assuranceId) {
        const assurance = assurances.find(a => a.id === patient.assuranceId);
        const assuranceNom = assurance ? assurance.nom : patient.assuranceId;
        const montantCouvert = calculerMontantCouvert(devi);
        totals[assuranceNom] = (totals[assuranceNom] || 0) + montantCouvert;
      }
    });
    
    return totals;
  };

  const totalIPM = getTotalIPM();
  const totalAssurances = getTotalAssurances();
  const totalGeneral = totalIPM + totalAssurances;
  const totalParIPM = getTotalParIPM();
  const totalParAssurance = getTotalParAssurance();

  const handlePeriodeTypeChange = (e) => {
    const newType = e.target.value;
    setPeriodeType(newType);
    
    const now = new Date();
    if (newType === 'mois') {
      setPeriode(now.toISOString().slice(0, 7));
    } else {
      setPeriode(now.getFullYear().toString());
    }
  };

  return (
    <div className="statistiques-page">
      <div className="page-header">
        <h1><i className="bi bi-bar-chart"></i> Statistiques</h1>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h5>Filtres</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <label className="form-label">Type de période</label>
              <select
                className="form-control"
                value={periodeType}
                onChange={handlePeriodeTypeChange}
              >
                <option value="mois">Par mois</option>
                <option value="annee">Par année</option>
              </select>
            </div>
            <div className="col-md-8">
              <label className="form-label">
                {periodeType === 'mois' ? 'Mois' : 'Année'}
              </label>
              {periodeType === 'mois' ? (
                <input
                  type="month"
                  className="form-control"
                  value={periode}
                  onChange={(e) => setPeriode(e.target.value)}
                />
              ) : (
                <input
                  type="number"
                  className="form-control"
                  value={periode}
                  onChange={(e) => setPeriode(e.target.value)}
                  min="2000"
                  max="2100"
                  placeholder="Année (ex: 2024)"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Totaux généraux */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card stat-card stat-card-ipm">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-building"></i> Total IPM
              </h5>
              <h2 className="stat-value">{totalIPM.toLocaleString('fr-FR')} FCFA</h2>
              <p className="stat-period">
                {periodeType === 'mois' 
                  ? new Date(periode + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                  : `Année ${periode}`
                }
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card stat-card stat-card-assurance">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-shield-check"></i> Total Assurances
              </h5>
              <h2 className="stat-value">{totalAssurances.toLocaleString('fr-FR')} FCFA</h2>
              <p className="stat-period">
                {periodeType === 'mois' 
                  ? new Date(periode + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                  : `Année ${periode}`
                }
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card stat-card stat-card-total">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-calculator"></i> Total Général
              </h5>
              <h2 className="stat-value">{totalGeneral.toLocaleString('fr-FR')} FCFA</h2>
              <p className="stat-period">
                {periodeType === 'mois' 
                  ? new Date(periode + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                  : `Année ${periode}`
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Détail par IPM */}
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5><i className="bi bi-building"></i> Détail par IPM</h5>
            </div>
            <div className="card-body">
              {Object.keys(totalParIPM).length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>IPM</th>
                        <th className="text-end">Montant (FCFA)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(totalParIPM)
                        .sort((a, b) => b[1] - a[1])
                        .map(([ipmNom, montant]) => (
                          <tr key={ipmNom}>
                            <td><strong>{ipmNom}</strong></td>
                            <td className="text-end">{montant.toLocaleString('fr-FR')}</td>
                          </tr>
                        ))}
                    </tbody>
                    <tfoot>
                      <tr className="table-total">
                        <th>Total IPM</th>
                        <th className="text-end">{totalIPM.toLocaleString('fr-FR')}</th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <p className="text-muted">Aucun devis IPM pour cette période</p>
              )}
            </div>
          </div>
        </div>

        {/* Détail par Assurance */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5><i className="bi bi-shield-check"></i> Détail par Assurance</h5>
            </div>
            <div className="card-body">
              {Object.keys(totalParAssurance).length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Assurance</th>
                        <th className="text-end">Montant (FCFA)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(totalParAssurance)
                        .sort((a, b) => b[1] - a[1])
                        .map(([assuranceNom, montant]) => (
                          <tr key={assuranceNom}>
                            <td><strong>{assuranceNom}</strong></td>
                            <td className="text-end">{montant.toLocaleString('fr-FR')}</td>
                          </tr>
                        ))}
                    </tbody>
                    <tfoot>
                      <tr className="table-total">
                        <th>Total Assurances</th>
                        <th className="text-end">{totalAssurances.toLocaleString('fr-FR')}</th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <p className="text-muted">Aucun devis Assurance pour cette période</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Suivi des factures */}
      <div className="mt-4" style={{ clear: 'both' }}>
        <SuiviFactures />
      </div>
    </div>
  );
};

export default Statistiques;

