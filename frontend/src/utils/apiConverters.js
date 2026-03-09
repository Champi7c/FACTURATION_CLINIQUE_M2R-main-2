// Fonctions utilitaires pour convertir entre le format API (snake_case) et le format frontend (camelCase)

// Convertir de snake_case à camelCase
export const toCamelCase = (str) => {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
};

// Convertir un objet de snake_case à camelCase
export const snakeToCamel = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(snakeToCamel);
  if (typeof obj !== 'object') return obj;

  const camelObj = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = toCamelCase(key);
    camelObj[camelKey] = snakeToCamel(value);
  }
  return camelObj;
};

// Convertir de camelCase à snake_case
export const toSnakeCase = (str) => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

// Convertir un objet de camelCase à snake_case
export const camelToSnake = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(camelToSnake);
  if (typeof obj !== 'object') return obj;

  const snakeObj = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = toSnakeCase(key);
    snakeObj[snakeKey] = camelToSnake(value);
  }
  return snakeObj;
};

// Convertir un patient du format API au format frontend
export const convertPatientFromAPI = (patient) => {
  return {
    id: patient.id,
    nomComplet: patient.nom_complet,
    matricule: patient.matricule,
    typePriseEnCharge: patient.type_prise_en_charge,
    ipmId: patient.ipm,
    assuranceId: patient.assurance,
    createdAt: patient.created_at,
  };
};

// Convertir un patient du format frontend au format API
export const convertPatientToAPI = (patient) => {
  // S'assurer que les valeurs vides sont converties en null
  const ipm = patient.ipmId && patient.ipmId.trim() !== '' ? patient.ipmId : null;
  const assurance = patient.assuranceId && patient.assuranceId.trim() !== '' ? patient.assuranceId : null;
  
  return {
    nom_complet: patient.nomComplet,
    matricule: patient.matricule,
    type_prise_en_charge: patient.typePriseEnCharge,
    ipm: ipm,
    assurance: assurance,
  };
};

// Convertir un devis du format API au format frontend
export const convertDevisFromAPI = (devis) => {
  return {
    id: devis.id,
    numero: devis.numero,
    patientId: devis.patient,
    lignes: (devis.lignes || []).map(ligne => ({
      id: ligne.id,
      analyseId: ligne.analyse || ligne.analyseId,
      nom: ligne.analyse_nom || ligne.nom || 'Analyse inconnue',
      categorie: ligne.analyse_categorie || ligne.categorie,
      prix: parseFloat(ligne.prix),
      quantite: ligne.quantite || 1, // Ajouter la quantité avec valeur par défaut
    })),
    total: parseFloat(devis.total),
    souscripteur: devis.souscripteur || '',
    tauxCouverture: devis.taux_couverture || '',
    dateCreation: devis.date_creation,
    statutPaiement: devis.statut_paiement || devis.statutPaiement || 'NON_REGLÉ',
    datePaiement: devis.date_paiement || devis.datePaiement || null,
    commentairePaiement: devis.commentaire_paiement || devis.commentairePaiement || '',
  };
};

// Convertir un devis du format frontend au format API
export const convertDevisToAPI = (devis) => {
  return {
    patient: devis.patientId,
    souscripteur: devis.souscripteur || '',
    taux_couverture: devis.tauxCouverture || '',
    lignes: devis.lignes.map(ligne => ({
      analyseId: ligne.analyseId,
      prix: ligne.prix.toString(),
      quantite: ligne.quantite || 1, // Ajouter la quantité avec valeur par défaut
    })),
  };
};

// Convertir un tarif du format API au format frontend
export const convertTarifFromAPI = (tarif) => {
  return {
    id: tarif.id,
    analyseId: tarif.analyse,
    typePriseEnCharge: tarif.type_prise_en_charge || null,
    ipmId: tarif.ipm || null,
    assuranceId: tarif.assurance || null,
    prix: parseFloat(tarif.prix),
    createdAt: tarif.created_at,
  };
};

// Convertir un tarif du format frontend au format API
export const convertTarifToAPI = (tarif) => {
  const result = {
    analyse: tarif.analyseId,
    prix: tarif.prix.toString(),
  };
  
  // S'assurer que les valeurs vides sont converties en null
  const ipmId = tarif.ipmId && tarif.ipmId.trim() !== '' ? tarif.ipmId : null;
  const assuranceId = tarif.assuranceId && tarif.assuranceId.trim() !== '' ? tarif.assuranceId : null;
  
  // Si typePriseEnCharge est fourni, l'utiliser (tarif générique)
  if (tarif.typePriseEnCharge) {
    result.type_prise_en_charge = tarif.typePriseEnCharge;
    result.ipm = null;
    result.assurance = null;
  } else {
    // Sinon utiliser ipmId/assuranceId spécifiques
    result.type_prise_en_charge = null;
    result.ipm = ipmId;
    result.assurance = assuranceId;
  }
  
  return result;
};

