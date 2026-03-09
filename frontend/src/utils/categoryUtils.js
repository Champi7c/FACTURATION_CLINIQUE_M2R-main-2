/**
 * Utilitaires pour formater les objets catégories { nom, actif }
 */

/**
 * Formate un objet catégorie { nom, actif } en texte lisible
 * @param {Object|string} categorie - L'objet catégorie ou une string
 * @returns {string} - Le texte formaté "Nom (Actif/Inactif)"
 */
export const formatCategoryObject = (categorie) => {
  if (!categorie) {
    return '';
  }
  
  // Si c'est déjà une string, la retourner telle quelle
  if (typeof categorie === 'string') {
    return categorie;
  }
  
  // Si c'est un objet avec nom et actif
  if (typeof categorie === 'object' && categorie.nom) {
    const statut = categorie.actif ? 'Actif' : 'Inactif';
    return `${categorie.nom} (${statut})`;
  }
  
  // Si c'est un objet sans structure attendue, convertir en string
  try {
    return JSON.stringify(categorie);
  } catch (e) {
    return String(categorie);
  }
};

/**
 * Formate un tableau d'objets catégories en liste lisible
 * @param {Array} categories - Le tableau d'objets ou strings
 * @returns {Array} - Le tableau de strings formatés
 */
export const formatCategoriesList = (categories) => {
  if (!Array.isArray(categories)) {
    return [];
  }
  
  return categories.map(categorie => formatCategoryObject(categorie));
};

/**
 * Extrait le nom d'une catégorie (objet ou string)
 * @param {Object|string} categorie - L'objet catégorie ou une string
 * @returns {string} - Le nom de la catégorie
 */
export const getCategoryName = (categorie) => {
  if (!categorie) {
    return '';
  }
  
  if (typeof categorie === 'string') {
    return categorie;
  }
  
  if (typeof categorie === 'object' && categorie != null && categorie.nom != null) {
    return typeof categorie.nom === 'string' ? categorie.nom : String(categorie.nom);
  }
  
  return String(categorie);
};

/**
 * Vérifie si une catégorie est active
 * @param {Object|string} categorie - L'objet catégorie ou une string
 * @returns {boolean} - true si active, false sinon (par défaut true pour les strings)
 */
export const isCategoryActive = (categorie) => {
  if (!categorie) {
    return false;
  }
  
  if (typeof categorie === 'string') {
    return true; // Par défaut, les strings sont considérées comme actives
  }
  
  if (typeof categorie === 'object' && 'actif' in categorie) {
    return categorie.actif !== false;
  }
  
  return true; // Par défaut, considérer comme actif
};

