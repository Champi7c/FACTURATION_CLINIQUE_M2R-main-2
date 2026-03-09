import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import './DetailPrestation.css';

// Éviter de rendre un objet { nom, actif } (erreur React #31)
const toCategorieLabel = (c) => {
  if (c == null || c === '') return '';
  if (typeof c === 'object' && c.nom != null) return String(c.nom);
  return String(c);
};

const DetailPrestation = () => {
  console.log('[DetailPrestation] Composant monté');
  const { devis, patients, analyses } = useData();
  console.log('[DetailPrestation] Données du contexte:', {
    devisCount: devis?.length || 0,
    patientsCount: patients?.length || 0,
    analysesCount: analyses?.length || 0,
    devis: devis,
    patients: patients?.slice(0, 2), // Afficher seulement les 2 premiers pour debug
    analyses: analyses?.slice(0, 2)
  });
  
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [filtreMois, setFiltreMois] = useState(''); // Filtre par mois (format: YYYY-MM)
  const [statistiques, setStatistiques] = useState([]);
  const [detailsParPatient, setDetailsParPatient] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialiser avec toutes les dates disponibles dans les devis (toutes les années)
  useEffect(() => {
    // Ne réinitialiser que si les dates ne sont pas déjà définies
    if (dateDebut && dateFin) {
      return; // Les dates sont déjà initialisées
    }
    
    console.log('[DetailPrestation] Initialisation des dates');
    
    if (devis && devis.length > 0) {
      // Trouver la première et dernière date dans les devis
      const dates = devis
        .map(d => new Date(d.dateCreation))
        .filter(d => !isNaN(d.getTime()))
        .sort((a, b) => a - b);
      
      if (dates.length > 0) {
        const premiereDate = dates[0];
        const derniereDate = dates[dates.length - 1];
        const today = new Date();
        
        // Utiliser la date d'aujourd'hui comme date de fin si elle est plus récente que la dernière date
        const dateFin = today > derniereDate ? today : derniereDate;
        
        // Par défaut, afficher TOUTES les données (de la première date à aujourd'hui)
        // Cela permettra de voir toutes les années disponibles
        const dateDebutValue = premiereDate.toISOString().split('T')[0];
        const dateFinValue = dateFin.toISOString().split('T')[0];
        
        const anneesDisponibles = Array.from(new Set(dates.map(d => d.getFullYear()))).sort();
        
        console.log('[DetailPrestation] Dates disponibles:', {
          premiereDate: dateDebutValue,
          derniereDate: derniereDate.toISOString().split('T')[0],
          dateFin: dateFinValue,
          nombreDevis: devis.length,
          anneePremiere: premiereDate.getFullYear(),
          anneeDerniere: derniereDate.getFullYear(),
          anneesDisponibles: anneesDisponibles
        });
        
        setDateDebut(dateDebutValue);
        setDateFin(dateFinValue);
      } else {
        // Si pas de dates valides, utiliser le mois en cours
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        setDateDebut(firstDay.toISOString().split('T')[0]);
        setDateFin(today.toISOString().split('T')[0]);
      }
    } else {
      // Si pas encore de devis chargés, utiliser le mois en cours
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setDateDebut(firstDay.toISOString().split('T')[0]);
    setDateFin(today.toISOString().split('T')[0]);
    }
  }, [devis]);

  // Charger les statistiques au chargement si les dates sont définies
  useEffect(() => {
    // Attendre que les données soient chargées et que les dates soient initialisées
    if (dateDebut && dateFin && devis !== undefined && patients !== undefined && analyses !== undefined && devis.length > 0) {
      chargerStatistiques();
    }
  }, [dateDebut, dateFin, devis, patients, analyses]);

  const chargerStatistiques = async () => {
    if (!dateDebut || !dateFin) {
      return;
    }

    // Vérifier que les données sont chargées
    if (!devis || !patients || !analyses) {
      console.log('[DetailPrestation] Données pas encore chargées:', { devis: devis?.length, patients: patients?.length, analyses: analyses?.length });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Filtrer les devis dans la période
      const devisPeriode = devis.filter(devi => {
        if (!devi.dateCreation) return false;
        const dateDevis = new Date(devi.dateCreation);
        const debut = new Date(dateDebut);
        const fin = new Date(dateFin);
        fin.setHours(23, 59, 59, 999);
        return dateDevis >= debut && dateDevis <= fin;
      });

      console.log('[DetailPrestation] Devis dans la période:', devisPeriode.length);
      console.log('[DetailPrestation] Total devis:', devis.length);
      console.log('[DetailPrestation] Période:', dateDebut, 'à', dateFin);

      // Traiter TOUTES les lignes de prestations (pas seulement les consultations)
      // Structure: prestationsParType[nomService][date] = { patients, prixTotal, nombrePrestations, categorie }
      const prestationsParType = {};
      // Structure pour les détails par patient et par jour
      // detailsParPatientParJour[date][patientId] = { patient, prestations: [], prixTotalJour: 0 }
      const detailsParPatientParJour = {};

      let totalLignesTraitees = 0;
      let totalPrestationsTrouvees = 0;
      const categoriesTrouvees = new Set(); // Pour collecter toutes les catégories trouvées

      devisPeriode.forEach(devi => {
        const dateDevis = new Date(devi.dateCreation);
        const dateKey = dateDevis.toISOString().split('T')[0];
        const patient = patients.find(p => p.id === devi.patientId);

        // Initialiser la structure pour cette date si nécessaire
        if (!detailsParPatientParJour[dateKey]) {
          detailsParPatientParJour[dateKey] = {};
        }

        // Initialiser les détails pour ce patient à cette date
        if (!detailsParPatientParJour[dateKey][devi.patientId]) {
          detailsParPatientParJour[dateKey][devi.patientId] = {
            patient: patient || { nomComplet: 'Patient inconnu', matricule: 'N/A' },
            prestations: [], // Renommer consultations en prestations pour inclure tous les services
            prixTotalJour: 0
          };
        }

        devi.lignes?.forEach(ligne => {
          totalLignesTraitees++;
          const analyse = analyses.find(a => a.id === ligne.analyseId);
          const categorieRaw = ligne.categorie || analyse?.categorie || ligne.analyse_categorie;
          const categorieStr = typeof categorieRaw === 'object' && categorieRaw != null && categorieRaw.nom != null
            ? String(categorieRaw.nom)
            : (categorieRaw != null && categorieRaw !== '' ? String(categorieRaw) : '');
          const categorieNorm = categorieStr.trim().toLowerCase();
          const categorieDisplay = categorieStr.trim();
          
          // Collecter toutes les catégories trouvées pour debug
          if (categorieNorm) {
            categoriesTrouvees.add(categorieNorm);
          } else if (categorieRaw) {
            categoriesTrouvees.add(JSON.stringify(categorieRaw));
          }

          // Traiter TOUTES les prestations (pas seulement les consultations)
          const nomService = ligne.nom || analyse?.nom || 'Service inconnu';
          const nomNormalise = nomService.toString().toLowerCase().trim();
          const quantite = ligne.quantite || 1;
          const prixUnitaire = parseFloat(ligne.prix || 0);
          
          // Ignorer les lignes avec prix invalide (0, NaN, ou négatif)
          if (isNaN(prixUnitaire) || prixUnitaire <= 0) {
            console.warn('[DetailPrestation] Ligne ignorée (prix invalide):', {
              nomService,
              prix: ligne.prix,
              quantite,
              deviId: devi.id,
              date: dateKey
            });
            return; // Ignorer cette ligne
          }
          
          const prixLigne = prixUnitaire * quantite;
          
          // Utiliser le nom du service comme clé (unique par nom, même si catégorie différente)
          const cleService = nomService; // Utiliser le nom exact du service
          
          // Debug: afficher la première ligne de chaque type pour voir le format
          if (totalLignesTraitees <= 5) {
            console.log('[DetailPrestation] Ligne exemple #' + totalLignesTraitees + ':');
            console.log('  - Catégorie ligne:', ligne.categorie);
            console.log('  - Catégorie analyse:', analyse?.categorie);
            console.log('  - Catégorie normalisée:', categorieNorm);
            console.log('  - Nom service:', nomService);
            console.log('  - Catégorie:', categorieDisplay);
          }

          // Traiter TOUTES les lignes (pas seulement les consultations)
          totalPrestationsTrouvees++;
          
          // Ajouter à la structure par type de prestation
          if (!prestationsParType[cleService]) {
            prestationsParType[cleService] = {};
          }

          if (!prestationsParType[cleService][dateKey]) {
            prestationsParType[cleService][dateKey] = {
                date: dateKey,
                patients: new Set(),
                prixTotal: 0,
              nombrePrestations: 0,
              prixUnitaire: parseFloat(ligne.prix || 0),
              categorie: categorieDisplay || categorieNorm
            };
          }

          prestationsParType[cleService][dateKey].patients.add(patient?.id || devi.patientId);
          prestationsParType[cleService][dateKey].prixTotal += prixLigne;
          prestationsParType[cleService][dateKey].nombrePrestations += quantite;

          // Ajouter aux détails par patient (par jour) - TOUTES les prestations
          detailsParPatientParJour[dateKey][devi.patientId].prestations.push({
            nom: nomService,
            categorie: categorieDisplay || categorieNorm,
            quantite: quantite,
            prixUnitaire: parseFloat(ligne.prix || 0),
            prixTotal: prixLigne
          });
          detailsParPatientParJour[dateKey][devi.patientId].prixTotalJour += prixLigne;
        });
      });

      // Afficher les valeurs directement dans la console pour debug
      console.log('[DetailPrestation] ===== RÉSUMÉ DU TRAITEMENT =====');
      console.log('Total devis dans période:', devisPeriode.length);
      console.log('Total lignes traitées:', totalLignesTraitees);
      console.log('Total prestations trouvées:', totalPrestationsTrouvees);
      console.log('Nombre de types de prestations:', Object.keys(prestationsParType).length);
      console.log('Noms des prestations trouvées:', Object.keys(prestationsParType));
      console.log('Toutes les catégories trouvées:', Array.from(categoriesTrouvees));
      console.log('Prestations par type (détaillé):', JSON.stringify(prestationsParType, null, 2));
      console.log('==================================================');

      // Convertir en tableau de prestations avec leurs détails par jour
      const stats = [];
      Object.keys(prestationsParType).forEach(nomService => {
        const detailsParJour = Object.values(prestationsParType[nomService])
          .map(stat => ({
            date: stat.date,
            nombrePatients: stat.patients.size,
            nombrePrestations: stat.nombrePrestations,
            prixTotal: stat.prixTotal,
            prixUnitaire: stat.prixUnitaire,
            categorie: stat.categorie
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        // Calculer les totaux pour cette prestation
        // Compter tous les patients uniques sur toutes les dates pour cette prestation
        const tousPatientsUniques = new Set();
        detailsParJour.forEach(detail => {
          // Récupérer tous les patients de ce jour pour cette prestation
          const patientsJour = prestationsParType[nomService][detail.date]?.patients || new Set();
          patientsJour.forEach(patientId => tousPatientsUniques.add(patientId));
        });
        
        let totalPrestations = 0;
        let totalPrix = 0;
        detailsParJour.forEach(detail => {
          totalPrestations += detail.nombrePrestations;
          totalPrix += detail.prixTotal;
        });

        stats.push({
          nomService, // Renommer pour inclure tous les services
          nomConsultation: nomService, // Garder pour compatibilité avec le rendu
          categorie: detailsParJour.length > 0 ? detailsParJour[0].categorie : '',
          detailsParJour,
          totalPatients: tousPatientsUniques.size,
          totalConsultations: totalPrestations, // Renommer pour compatibilité
          totalPrestations: totalPrestations,
          totalPrix,
          prixUnitaire: detailsParJour.length > 0 ? detailsParJour[0].prixUnitaire : 0
        });
      });

      // Trier par catégorie puis par nom de service pour mieux organiser l'affichage
      stats.sort((a, b) => {
        const categorieA = (a.categorie || '').toLowerCase();
        const categorieB = (b.categorie || '').toLowerCase();
        if (categorieA !== categorieB) {
          return categorieA.localeCompare(categorieB);
        }
        return a.nomService.localeCompare(b.nomService);
      });

      // Convertir les détails par patient et par jour en tableau trié
      const detailsPatients = Object.keys(detailsParPatientParJour)
        .map(dateKey => ({
          date: dateKey,
          mois: `${new Date(dateKey).getFullYear()}-${String(new Date(dateKey).getMonth() + 1).padStart(2, '0')}`,
          patients: Object.values(detailsParPatientParJour[dateKey])
            .map(detail => ({
              patientId: detail.patient.id || detail.patient.nomComplet,
              nomComplet: detail.patient.nomComplet || 'Patient inconnu',
              matricule: detail.patient.matricule || 'N/A',
              prestations: detail.prestations, // Utiliser prestations au lieu de consultations
              consultations: detail.prestations, // Garder pour compatibilité avec le rendu
              prixTotalJour: detail.prixTotalJour
            }))
            .sort((a, b) => a.nomComplet.localeCompare(b.nomComplet))
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      // Calculer le prix total à partir des détails par patient pour comparaison
      const prixTotalParPatients = detailsPatients.reduce((sum, jour) => {
        return sum + jour.patients.reduce((sumPatient, patient) => sumPatient + patient.prixTotalJour, 0);
      }, 0);
      
      const prixTotalStatistiques = stats.reduce((sum, s) => sum + s.totalPrix, 0);
      
      // Calculer aussi le prix total directement depuis les devis de la période (même source que le traitement)
      // Utiliser le même devisPeriode que celui utilisé pour le traitement
      const prixTotalDirectDevis = devisPeriode.reduce((sum, devi) => {
        if (!devi.lignes || !Array.isArray(devi.lignes)) return sum;
        const prixDevis = devi.lignes.reduce((sumLigne, ligne) => {
          // Filtrer les lignes valides (même logique que dans le traitement)
          if (!ligne) return sumLigne;
          const quantite = parseFloat(ligne.quantite) || 1;
          const prixUnitaire = parseFloat(ligne.prix) || 0;
          // Ignorer les lignes avec prix invalide (identique au traitement)
          if (isNaN(prixUnitaire) || prixUnitaire <= 0) return sumLigne;
          return sumLigne + (prixUnitaire * quantite);
        }, 0);
        return sum + prixDevis;
      }, 0);
      
      // Afficher les statistiques directement
      console.log('[DetailPrestation] ===== STATISTIQUES CALCULÉES =====');
      console.log('Nombre de prestations différentes:', stats.length);
      console.log('Nombre de jours avec prestations:', detailsPatients.length);
      console.log('Total prestations (tous types):', stats.reduce((sum, s) => sum + s.totalPrestations, 0));
      console.log('💰 Prix total (statistiques):', prixTotalStatistiques, 'FCFA');
      console.log('💰 Prix total (détails par patient):', prixTotalParPatients, 'FCFA');
      console.log('💰 Prix total (direct devis - même source):', prixTotalDirectDevis, 'FCFA');
      console.log('💰 Différence statistiques vs détails:', Math.abs(prixTotalStatistiques - prixTotalParPatients), 'FCFA');
      console.log('💰 Différence direct devis vs détails:', Math.abs(prixTotalDirectDevis - prixTotalParPatients), 'FCFA');
      
      // Utiliser le prix total des détails par patient comme source de vérité (le plus fiable)
      // Car il correspond exactement à ce qui est affiché dans l'interface
      const prixTotalFinal = prixTotalParPatients > 0 ? prixTotalParPatients : prixTotalStatistiques;
      
      if (Math.abs(prixTotalStatistiques - prixTotalParPatients) > 1) {
        console.warn('⚠️ Incohérence entre statistiques et détails par patient !');
      }
      if (Math.abs(prixTotalDirectDevis - prixTotalParPatients) > 1) {
        console.warn('⚠️ Incohérence entre calcul direct et détails par patient !', {
          difference: Math.abs(prixTotalDirectDevis - prixTotalParPatients),
          directDevis: prixTotalDirectDevis,
          detailsPatients: prixTotalParPatients,
          pourcentage: ((Math.abs(prixTotalDirectDevis - prixTotalParPatients) / Math.max(prixTotalDirectDevis, prixTotalParPatients)) * 100).toFixed(2) + '%'
        });
      }
      console.log('Liste des prestations:', stats.map(s => ({
        nom: s.nomService,
        categorie: s.categorie,
        total: s.totalPrestations,
        prix: s.totalPrix,
        jours: s.detailsParJour.length
      })));
      if (stats.length === 0) {
        console.error('[DetailPrestation] ⚠️ AUCUNE STATISTIQUE CALCULÉE ! Problème dans le traitement des données.');
      }
      console.log('====================================================');

      setStatistiques(stats);
      setDetailsParPatient(detailsPatients);
      
      // Stocker aussi le prix total direct depuis les devis pour comparaison
      // (calculé dans la même fonction avec la même source de données)
      if (prixTotalDirectDevis > 0) {
        // Comparer et utiliser la valeur cohérente
        // Si les deux méthodes donnent des résultats très proches (écart < 1%), utiliser la moyenne
        const ecartRelatif = Math.abs(prixTotalDirectDevis - prixTotalParPatients) / Math.max(prixTotalDirectDevis, prixTotalParPatients);
        if (ecartRelatif < 0.01 && prixTotalParPatients > 0) {
          // Les deux méthodes sont cohérentes, utiliser les détails par patient (plus fiable pour affichage)
          console.log('✅ Calculs cohérents - utilisation des détails par patient');
        } else if (ecartRelatif > 0.01) {
          console.warn('⚠️ IMPORTANTE INCOHÉRENCE DÉTECTÉE:', {
            ecartAbsolu: Math.abs(prixTotalDirectDevis - prixTotalParPatients),
            ecartRelatif: (ecartRelatif * 100).toFixed(2) + '%',
            directDevis: prixTotalDirectDevis,
            detailsPatients: prixTotalParPatients,
            nombreDevis: devisPeriode.length,
            nombreLignes: totalLignesTraitees
          });
        }
      }
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Obtenir la liste des mois disponibles dans les données
  const getMoisDisponibles = () => {
    const moisSet = new Set();
    detailsParPatient.forEach(jour => {
      moisSet.add(jour.mois);
    });
    return Array.from(moisSet).sort().reverse(); // Plus récent en premier
  };

  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(montant);
  };

  // Filtrer les détails par patient selon le mois sélectionné
  const detailsParPatientFiltres = filtreMois
    ? detailsParPatient.filter(jour => jour.mois === filtreMois)
    : detailsParPatient;

  // Calculer les totaux globaux pour la période sélectionnée
  // Utiliser les valeurs calculées dans chargerStatistiques (source de vérité)
  const totalPrixStatistiques = statistiques.reduce((sum, stat) => {
    const prix = parseFloat(stat.totalPrix) || 0;
    return sum + prix;
  }, 0);
  
  const totalPrixDetailsPatients = detailsParPatient.reduce((sum, jour) => {
    const sommeJour = jour.patients.reduce((sumPatient, patient) => {
      const prixJour = parseFloat(patient.prixTotalJour) || 0;
      return sumPatient + prixJour;
    }, 0);
    return sum + sommeJour;
  }, 0);
  
  // Utiliser le prix total des détails par patient (source de vérité la plus fiable)
  // Car il correspond exactement à ce qui est affiché dans l'interface
  // Fallback sur statistiques si détails par patient est vide
  const totalPrix = totalPrixDetailsPatients > 0 ? totalPrixDetailsPatients : totalPrixStatistiques;
  
  // Pour les patients, compter les patients uniques qui ont eu des prestations dans la période
  // Note: Ce n'est pas le même nombre que le total de patients dans la base (Dashboard)
  // car ici on compte seulement ceux qui ont des prestations dans la période sélectionnée
  const totalPatientsUniques = new Set();
  detailsParPatient.forEach(jour => {
    jour.patients.forEach(patient => {
      // Utiliser l'ID du patient comme clé unique, ou le nom complet en fallback
      const patientKey = patient.patientId || patient.nomComplet || 'unknown';
      totalPatientsUniques.add(patientKey);
    });
  });
  const totalPatientsAvecPrestations = totalPatientsUniques.size;
  
  // Pour comparaison : nombre total de patients dans la base de données
  const totalPatientsBase = patients ? patients.length : 0;
  
  const totalPrestations = statistiques.reduce((sum, stat) => sum + (stat.totalPrestations || stat.totalConsultations || 0), 0);
  
  // Log de vérification de cohérence (simplifié)
  console.log('[DetailPrestation] ===== VÉRIFICATION TOTAUX (RENDER) =====');
  console.log('💰 Prix total (statistiques):', formatMontant(totalPrixStatistiques), 'FCFA');
  console.log('💰 Prix total (détails par patient):', formatMontant(totalPrixDetailsPatients), 'FCFA');
  console.log('💰 Prix total utilisé pour affichage:', formatMontant(totalPrix), 'FCFA');
  console.log('👥 Total patients dans la base:', totalPatientsBase);
  console.log('👥 Total patients avec prestations (période):', totalPatientsAvecPrestations);
  console.log('📋 Total prestations:', totalPrestations);
  
  // Vérifier les incohérences entre statistiques et détails par patient
  const ecart = Math.abs(totalPrixStatistiques - totalPrixDetailsPatients);
  if (ecart > 1) {
    console.warn('[DetailPrestation] ⚠️ INCOHÉRENCE DÉTECTÉE:', {
      prixStatistiques: totalPrixStatistiques,
      prixDetailsPatients: totalPrixDetailsPatients,
      ecart: ecart,
      ecartPourcentage: totalPrixDetailsPatients > 0 ? ((ecart / totalPrixDetailsPatients) * 100).toFixed(2) + '%' : 'N/A'
    });
    console.warn('💡 Solution: Utilisation des détails par patient (source la plus fiable)');
  } else {
    console.log('✅ Calculs cohérents entre statistiques et détails par patient');
  }
  console.log('==================================================');

  return (
    <div className="detail-prestation-page">
      <div className="page-header">
        <h1><i className="bi bi-calendar-check"></i> Détail de prestation - Tous les services</h1>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h5>Filtres de période</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-5">
              <label className="form-label">Date de début</label>
              <input
                type="date"
                className="form-control"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
              />
            </div>
            <div className="col-md-5">
              <label className="form-label">Date de fin</label>
              <input
                type="date"
                className="form-control"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
              />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button
                className="btn btn-primary w-100"
                onClick={chargerStatistiques}
                disabled={loading || !dateDebut || !dateFin}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                ) : (
                  <><i className="bi bi-search"></i> Rechercher</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {!devis || !patients || !analyses ? (
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Chargement des données en cours...
          <br />
          <small>
            Devis: {devis?.length || 0} | Patients: {patients?.length || 0} | Analyses: {analyses?.length || 0}
          </small>
        </div>
      ) : loading && statistiques.length === 0 ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3">Calcul des statistiques en cours...</p>
        </div>
      ) : statistiques.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          Aucune prestation trouvée pour la période sélectionnée.
          <br />
          <small>
            Période: {dateDebut} au {dateFin} | Total devis: {devis.length} | 
            Ouvrez la console (F12) pour voir les détails de débogage.
          </small>
        </div>
      ) : (
        <>
          {/* Résumé global */}
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card stat-card stat-card-primary">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="bi bi-people"></i> Patients avec prestations
                  </h5>
                  <h2 className="stat-value">{totalPatientsAvecPrestations}</h2>
                  <p className="stat-period">
                    {dateDebut} au {dateFin}
                  </p>
                  <small className="text-muted">
                    Total dans la base: {totalPatientsBase} patients
                  </small>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card stat-card stat-card-success">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="bi bi-calendar-check"></i> Total Prestations
                  </h5>
                  <h2 className="stat-value">{totalPrestations}</h2>
                  <p className="stat-period">
                    {dateDebut} au {dateFin}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card stat-card stat-card-info">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="bi bi-cash-coin"></i> Prix Total
                  </h5>
                  <h2 className="stat-value">{formatMontant(totalPrix)} FCFA</h2>
                  <p className="stat-period">
                    {dateDebut} au {dateFin}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tableau détaillé par consultation et par jour */}
          <div className="card">
            <div className="card-header">
              <h5>Détail par service et par jour (Toutes les catégories)</h5>
              <small className="text-muted">
                Affichage de tous les services de toutes les catégories : ANESTHÉSISTE, BLOC OPÉRATOIRE, Dermatologie, Diabétologie, GASTROLOGIE, Gynécologie, Infirmerie, ORL, Ophtalmologie, Pneumologie, PÉDIATRIE, Urologie, Analyses, Hospitalisation, Maternité, Médicament, Radiographie
              </small>
            </div>
            <div className="card-body">
              {statistiques.map((consultation, consultationIndex) => (
                <div key={consultationIndex} className="mb-4">
                  <div className="card border-primary">
                    <div className="card-header bg-primary text-white">
                      <h5 className="mb-0">
                        <i className="bi bi-clipboard-pulse me-2"></i>
                        {consultation.nomConsultation}
                        {consultation.categorie && (
                          <span className="badge bg-info ms-2" style={{ fontSize: '0.85em' }}>
                            {toCategorieLabel(consultation.categorie)}
                          </span>
                        )}
                        <span className="badge bg-light text-dark ms-2">
                          Prix unitaire: {formatMontant(consultation.prixUnitaire)} FCFA
                        </span>
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="table-responsive">
                        <table className="table table-striped table-hover table-sm">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th className="text-center">Nombre de patients</th>
                              <th className="text-center">Nombre de prestations</th>
                              <th className="text-end">Prix total (FCFA)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {consultation.detailsParJour.map((detail, detailIndex) => (
                              <tr key={detailIndex}>
                                <td>
                                  <strong>{formatDate(detail.date)}</strong>
                                </td>
                                <td className="text-center">
                                  <span className="badge bg-primary">{detail.nombrePatients}</span>
                                </td>
                                <td className="text-center">
                                  <span className="badge bg-success">{detail.nombrePrestations}</span>
                                </td>
                                <td className="text-end">
                                  <strong>{formatMontant(detail.prixTotal)}</strong>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="table-info">
                              <th>TOTAL pour {consultation.nomConsultation}</th>
                              <th className="text-center">
                                <span className="badge bg-primary">{consultation.totalPatients}</span>
                              </th>
                              <th className="text-center">
                                <span className="badge bg-success">{consultation.totalConsultations}</span>
                              </th>
                              <th className="text-end">
                                <strong>{formatMontant(consultation.totalPrix)} FCFA</strong>
                              </th>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Résumé global */}
              <div className="card border-success mt-4">
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-calculator me-2"></i>
                    RÉSUMÉ GLOBAL
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row text-center">
                    <div className="col-md-4">
                      <h6>Patients avec prestations</h6>
                      <h3 className="text-primary">{totalPatientsAvecPrestations}</h3>
                      <small className="text-muted">Base: {totalPatientsBase} patients</small>
                    </div>
                    <div className="col-md-4">
                      <h6>Total Prestations</h6>
                      <h3 className="text-success">{totalPrestations}</h3>
                    </div>
                    <div className="col-md-4">
                      <h6>Prix Total</h6>
                      <h3 className="text-info">{formatMontant(totalPrix)} FCFA</h3>
                      <small className="text-muted">
                        Période: {dateDebut} au {dateFin}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Détails par patient et par jour */}
          <div className="card mt-4">
            <div className="card-header bg-info text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-person-lines-fill me-2"></i>
                  Détails des consultations par patient et par jour
                </h5>
                {detailsParPatient.length > 0 && (
                  <div className="d-flex align-items-center">
                    <label className="text-white me-2 mb-0">
                      <i className="bi bi-funnel me-1"></i>
                      Filtrer par mois:
                    </label>
                    <select
                      className="form-select form-select-sm"
                      value={filtreMois}
                      onChange={(e) => setFiltreMois(e.target.value)}
                      style={{ width: 'auto', minWidth: '200px' }}
                    >
                      <option value="">Tous les mois</option>
                      {getMoisDisponibles().map((mois) => {
                        const [year, month] = mois.split('-');
                        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
                        const moisLabel = date.toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long'
                        });
                        return (
                          <option key={mois} value={mois}>
                            {moisLabel}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
              </div>
            </div>
            <div className="card-body">
              {detailsParPatient.length === 0 ? (
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  Aucune consultation trouvée pour la période sélectionnée.
                </div>
              ) : detailsParPatientFiltres.length === 0 ? (
                <div className="alert alert-warning">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Aucune consultation trouvée pour le mois sélectionné.
                </div>
              ) : (
                detailsParPatientFiltres.map((jour, jourIndex) => (
                  <div key={jourIndex} className="mb-4">
                    <div className="card border-info">
                      <div className="card-header bg-light">
                        <h6 className="mb-0">
                          <i className="bi bi-calendar-date me-2"></i>
                          <strong>{formatDate(jour.date)}</strong>
                          <span className="badge bg-info ms-2">
                            {jour.patients.length} patient{jour.patients.length > 1 ? 's' : ''}
                          </span>
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="table-responsive">
                          <table className="table table-striped table-hover table-sm">
                            <thead>
                              <tr>
                                <th>Patient</th>
                                <th>Matricule</th>
                                <th>Services (avec catégories)</th>
                                <th className="text-end">Prix total du jour (FCFA)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {jour.patients.map((patientDetail, patientIndex) => (
                                <tr key={patientIndex}>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <i className="bi bi-person-circle text-primary me-2" style={{ fontSize: '1.2rem' }}></i>
                                      <strong className="text-primary" style={{ fontSize: '1rem' }}>{patientDetail.nomComplet}</strong>
                                    </div>
                                  </td>
                                  <td>
                                    <span className="badge bg-secondary">{patientDetail.matricule}</span>
                                  </td>
                                  <td>
                                    <ul className="list-unstyled mb-0">
                                      {patientDetail.consultations.map((consultation, consultIndex) => (
                                        <li key={consultIndex} className="mb-2 p-2 bg-light rounded">
                                          <div className="d-flex align-items-start">
                                            <i className="bi bi-check-circle text-success me-2 mt-1"></i>
                                            <div className="flex-grow-1">
                                              <div className="d-flex align-items-center mb-1 flex-wrap">
                                                {consultation.categorie && (
                                                  <span className="badge bg-warning text-dark me-2" style={{ fontSize: '0.7rem' }}>
                                                    {toCategorieLabel(consultation.categorie)}
                                                  </span>
                                                )}
                                                <span className="badge bg-info me-2" style={{ fontSize: '0.75rem' }}>Service</span>
                                                <strong className="text-dark">{consultation.nom}</strong>
                                                {consultation.quantite > 1 && (
                                                  <span className="badge bg-primary ms-2">x{consultation.quantite}</span>
                                                )}
                                              </div>
                                              <div className="text-muted small">
                                                <i className="bi bi-cash-stack me-1"></i>
                                                Prix unitaire: {formatMontant(consultation.prixUnitaire)} FCFA
                                                {consultation.quantite > 1 && (
                                                  <span className="ms-2">
                                                    × {consultation.quantite} = <strong className="text-success">{formatMontant(consultation.prixTotal)} FCFA</strong>
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </li>
                                      ))}
                                    </ul>
                                  </td>
                                  <td className="text-end">
                                    <strong className="text-success" style={{ fontSize: '1.1rem' }}>{formatMontant(patientDetail.prixTotalJour)}</strong>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="table-info">
                                <th colSpan="3">TOTAL pour {formatDate(jour.date)}</th>
                                <th className="text-end">
                                  <strong>{formatMontant(jour.patients.reduce((sum, p) => sum + p.prixTotalJour, 0))} FCFA</strong>
                                </th>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DetailPrestation;


