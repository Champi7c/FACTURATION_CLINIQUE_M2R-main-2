// Composant de test minimal pour isoler le problème
// À utiliser temporairement dans Statistiques.js pour vérifier que le problème vient du composant

import React from 'react';

const SuiviFacturesTest = () => {
  return (
    <div className="suivi-factures">
      <div className="card mb-4">
        <div className="card-header">
          <h5><i className="bi bi-receipt"></i> Suivi des factures - TEST</h5>
        </div>
        <div className="card-body">
          <h1>Suivi des factures OK</h1>
          <p>Si vous voyez ce message, le composant s'affiche correctement.</p>
          <p>Le problème vient probablement de l'API ou de la logique du composant principal.</p>
        </div>
      </div>
    </div>
  );
};

export default SuiviFacturesTest;

