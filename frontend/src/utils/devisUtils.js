// Fonction utilitaire pour obtenir le numéro de devis formaté
export const getDevisNumero = (devis) => {
  // Si le devis a un champ numero, l'utiliser
  if (devis.numero) {
    // Si c'est déjà au format "YYYY-NNNNN", le retourner tel quel
    if (devis.numero.includes('-')) {
      return devis.numero;
    }
    // Sinon, c'est un ancien format, on le convertit au nouveau format
    const annee = new Date(devis.dateCreation || Date.now()).getFullYear();
    const num = parseInt(devis.numero, 10);
    if (!isNaN(num)) {
      return `${annee}-${num.toString().padStart(5, '0')}`;
    }
    return devis.numero;
  }
  
  // Sinon, extraire depuis l'ID (pour compatibilité avec les anciens devis)
  const numStr = devis.id.slice(-6);
  const num = parseInt(numStr, 10);
  // Si c'est un nombre valide, le formater au nouveau format "YYYY-NNNNN"
  if (!isNaN(num)) {
    const annee = new Date(devis.dateCreation || Date.now()).getFullYear();
    return `${annee}-${num.toString().padStart(5, '0')}`;
  }
  // Fallback : utiliser les 6 derniers caractères avec l'année
  const annee = new Date(devis.dateCreation || Date.now()).getFullYear();
  return `${annee}-${devis.id.slice(-6)}`;
};




