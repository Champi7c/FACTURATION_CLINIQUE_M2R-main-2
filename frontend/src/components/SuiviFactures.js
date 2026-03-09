import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { devisAPI, statistiquesPaiementAPI } from '../services/api';
import { handleAPIError } from '../services/api';
import './SuiviFactures.css';

const SuiviFactures = () => {
  // Toujours appeler les hooks de manière inconditionnelle
  const { devis = [], patients = [] } = useData() || {};
  const now = new Date();
  const [mois, setMois] = useState(now.getMonth() + 1);
  const [annee, setAnnee] = useState(now.getFullYear());
  const [facturesFiltrees, setFacturesFiltrees] = useState([]);
  const [statistiques, setStatistiques] = useState({
    nonRegles: 0,
    partiellementRegles: 0,
    regles: 0,
    montantTotal: 0
  });
  const [modifications, setModifications] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Charger les devis et statistiques du mois sélectionné
  useEffect(() => {
    chargerDonnees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mois, annee]);

  const chargerDonnees = async () => {
    setLoading(true);
    try {
      // Charger les statistiques depuis l'API
      const statsResponse = await statistiquesPaiementAPI.getStatistiques(mois, annee);
      const statsData = statsResponse.data;
      
      // Vérifier que les données sont valides
      if (!statsData || !statsData.statistiques) {
        console.warn('Données de statistiques invalides:', statsData);
        setStatistiques({
          nonRegles: 0,
          partiellementRegles: 0,
          regles: 0,
          montantTotal: 0
        });
        setFacturesFiltrees([]);
        setLoading(false);
        return;
      }
      
      setStatistiques(statsData.statistiques || {
        nonRegles: 0,
        partiellementRegles: 0,
        regles: 0,
        montantTotal: 0
      });
      
      // Utiliser les factures mensuelles groupées par IPM/Assurance
      const factures = (statsData.factures || []).map(facture => ({
        ...facture,
        montantCouvert: parseFloat(facture.montantCouvert || 0)
      }));
      
      setFacturesFiltrees(factures);
      setModifications({});
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      // Ne pas afficher d'alerte si c'est juste une erreur 404 ou si l'API n'est pas encore déployée
      if (error.response?.status === 404) {
        console.warn('Endpoint de statistiques non trouvé. La migration doit être appliquée sur le serveur.');
        setError('L\'endpoint de statistiques n\'est pas disponible. Veuillez appliquer la migration sur le serveur.');
      } else {
        console.warn('Erreur API:', handleAPIError(error));
        setError(handleAPIError(error));
      }
      // Initialiser avec des valeurs par défaut
      setStatistiques({
        nonRegles: 0,
        partiellementRegles: 0,
        regles: 0,
        montantTotal: 0
      });
      setFacturesFiltrees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatutChange = (devisId, newStatut) => {
    setModifications(prev => ({
      ...prev,
      [devisId]: {
        ...prev[devisId],
        statutPaiement: newStatut
      }
    }));
  };

  const handleDatePaiementChange = (devisId, newDate) => {
    setModifications(prev => ({
      ...prev,
      [devisId]: {
        ...prev[devisId],
        datePaiement: newDate || null
      }
    }));
  };

  const handleCommentaireChange = (devisId, newCommentaire) => {
    setModifications(prev => ({
      ...prev,
      [devisId]: {
        ...prev[devisId],
        commentairePaiement: newCommentaire
      }
    }));
  };

  const handleEnregistrer = async () => {
    setSaving(true);
    const updates = Object.keys(modifications);
    
    if (updates.length === 0) {
      alert('Aucune modification à enregistrer');
      setSaving(false);
      return;
    }

    try {
      // Pour chaque facture modifiée, mettre à jour tous les devis associés
      const promises = [];
      
      for (const factureId of updates) {
        const modif = modifications[factureId];
        const facture = facturesFiltrees.find(f => f.id === factureId);
        
        if (facture && facture.devis_ids) {
          // Mettre à jour tous les devis de cette facture mensuelle
          for (const devisId of facture.devis_ids) {
            promises.push(
              devisAPI.updatePaiement(devisId, {
                statutPaiement: modif.statutPaiement,
                datePaiement: modif.datePaiement || null,
                commentairePaiement: modif.commentairePaiement || ''
              })
            );
          }
        }
      }

      await Promise.all(promises);
      
      // Recharger les données
      await chargerDonnees();
      alert('Modifications enregistrées avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      alert(`Erreur lors de l'enregistrement: ${handleAPIError(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const getStatutDisplay = (statut) => {
    const statuts = {
      'NON_REGLÉ': { label: 'Non réglé', class: 'badge-danger' },
      'PARTIELLEMENT_REGLÉ': { label: 'Partiellement réglé', class: 'badge-warning' },
      'REGLÉ': { label: 'Réglé', class: 'badge-success' }
    };
    return statuts[statut] || statuts['NON_REGLÉ'];
  };

  // Afficher un message d'erreur si nécessaire (mais toujours afficher le composant)
  // Ne pas retourner early, afficher l'erreur dans le composant principal

  return (
    <div className="suivi-factures" style={{ marginTop: '2rem', clear: 'both' }}>
      <div className="card mb-4" style={{ border: '2px solid #007bff' }}>
        <div className="card-header bg-primary text-white">
          <h5><i className="bi bi-receipt"></i> Suivi des factures</h5>
        </div>
        <div className="card-body">
          {/* Message d'erreur si présent */}
          {error && (
            <div className="alert alert-warning mb-3">
              <i className="bi bi-exclamation-triangle me-2"></i>
              <strong>Attention :</strong> {error}
              <br />
              <small>Le composant fonctionne mais l'API n'est pas disponible. Vérifiez que la migration a été appliquée sur le serveur.</small>
            </div>
          )}
          
          {/* Filtres */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Mois</label>
              <select
                className="form-control"
                value={mois}
                onChange={(e) => setMois(parseInt(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                  <option key={m} value={m}>
                    {new Date(annee, m - 1).toLocaleDateString('fr-FR', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Année</label>
              <input
                type="number"
                className="form-control"
                value={annee}
                onChange={(e) => setAnnee(parseInt(e.target.value))}
                min="2000"
                max="2100"
              />
            </div>
          </div>

          {/* Statistiques */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="stat-card stat-card-danger">
                <div className="stat-content">
                  <div>
                    <h6>Non réglés</h6>
                    <h2>{statistiques.nonRegles}</h2>
                  </div>
                  <i className="bi bi-x-circle stat-icon"></i>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stat-card stat-card-warning">
                <div className="stat-content">
                  <div>
                    <h6>Partiellement réglés</h6>
                    <h2>{statistiques.partiellementRegles}</h2>
                  </div>
                  <i className="bi bi-clock-history stat-icon"></i>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stat-card stat-card-success">
                <div className="stat-content">
                  <div>
                    <h6>Réglés</h6>
                    <h2>{statistiques.regles}</h2>
                  </div>
                  <i className="bi bi-check-circle stat-icon"></i>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stat-card stat-card-info">
                <div className="stat-content">
                  <div>
                    <h6>Montant total</h6>
                    <h2>{statistiques.montantTotal.toLocaleString('fr-FR')} CFA</h2>
                  </div>
                  <i className="bi bi-cash-coin stat-icon"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Tableau des devis */}
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-striped table-bordered">
                  <thead>
                    <tr>
                      <th>Numéro facture</th>
                      <th>IPM/Assurance</th>
                      <th>Montant couvert</th>
                      <th>Statut de paiement</th>
                      <th>Date de paiement</th>
                      <th>Commentaire</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facturesFiltrees.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center text-muted">
                          Aucune facture mensuelle pour cette période
                        </td>
                      </tr>
                    ) : (
                      facturesFiltrees.map(facture => {
                        const modif = modifications[facture.id] || {};
                        const statutActuel = modif.statutPaiement !== undefined 
                          ? modif.statutPaiement 
                          : facture.statutPaiement || 'NON_REGLÉ';
                        const datePaiementActuelle = modif.datePaiement !== undefined
                          ? modif.datePaiement
                          : facture.datePaiement;
                        const commentaireActuel = modif.commentairePaiement !== undefined
                          ? modif.commentairePaiement
                          : facture.commentairePaiement || '';
                        const statutDisplay = getStatutDisplay(statutActuel);
                        const isModified = modifications[facture.id] !== undefined;

                        return (
                          <tr key={facture.id} className={isModified ? 'table-warning' : ''}>
                            <td><strong>{facture.numeroFacture}</strong></td>
                            <td>{facture.entiteNom || 'N/A'}</td>
                            <td className="text-end">
                              {new Intl.NumberFormat('fr-FR', {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                              }).format(facture.montantCouvert)} CFA
                            </td>
                            <td>
                              <select
                                className={`form-control form-control-sm ${statutDisplay.class}`}
                                value={statutActuel}
                                onChange={(e) => handleStatutChange(facture.id, e.target.value)}
                              >
                                <option value="NON_REGLÉ">Non réglé</option>
                                <option value="PARTIELLEMENT_REGLÉ">Partiellement réglé</option>
                                <option value="REGLÉ">Réglé</option>
                              </select>
                            </td>
                            <td>
                              <input
                                type="date"
                                className="form-control form-control-sm"
                                value={datePaiementActuelle || ''}
                                onChange={(e) => handleDatePaiementChange(facture.id, e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Commentaire optionnel"
                                value={commentaireActuel}
                                onChange={(e) => handleCommentaireChange(facture.id, e.target.value)}
                              />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bouton Enregistrer */}
              {Object.keys(modifications).length > 0 && (
                <div className="mt-3 text-end">
                  <button
                    className="btn btn-primary"
                    onClick={handleEnregistrer}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-save me-2"></i>
                        Enregistrer les modifications
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuiviFactures;

