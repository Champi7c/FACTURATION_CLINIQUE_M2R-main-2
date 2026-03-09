/**
 * Informations de la clinique - à modifier pour une nouvelle clinique
 */
export const CLINIQUE = {
  nom: 'CLINIQUE M2R MOHAMED RASSOUL RUFISQUE',
  adresse: 'Route de Layouse Tally Diop Boucky',
  telephone: ['+221 77 560 28 56', '+221 33 871 56 52'],
  email: '', // optionnel : ex. contact@cliniquem2r.sn
};

/** Texte téléphone pour affichage (une ligne) */
export const CLINIQUE_TELEPHONE_STR = CLINIQUE.telephone.join(' / ');
