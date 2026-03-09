// Version simplifiée qui s'affiche toujours - TEST
import React from 'react';

const SuiviFacturesSimple = () => {
  return (
    <div className="suivi-factures" style={{ 
      marginTop: '2rem', 
      border: '5px solid #28a745', 
      padding: '20px', 
      backgroundColor: '#d4edda',
      borderRadius: '10px'
    }}>
      <div className="card mb-4" style={{ border: '3px solid #007bff' }}>
        <div className="card-header bg-success text-white" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
          <h4><i className="bi bi-check-circle"></i> ✅ SUIVI DES FACTURES - TEST RÉUSSI !</h4>
        </div>
        <div className="card-body" style={{ backgroundColor: '#fff' }}>
          <div className="alert alert-success" role="alert">
            <h5 className="alert-heading">🎉 Le composant s'affiche correctement !</h5>
            <p>Si vous voyez ce message avec une bordure verte, cela signifie que :</p>
            <ul>
              <li>✅ Le composant est bien importé</li>
              <li>✅ Le composant est bien rendu dans Statistiques.js</li>
              <li>✅ Il n'y a pas d'erreur JavaScript bloquante</li>
            </ul>
            <hr />
            <p className="mb-0">
              <strong>Prochaine étape :</strong> Remplacez <code>SuiviFacturesSimple</code> par <code>SuiviFactures</code> 
              dans Statistiques.js pour utiliser le composant complet.
            </p>
          </div>
          <div className="card" style={{ border: '2px solid #ffc107' }}>
            <div className="card-body">
              <h6>📋 Informations de test :</h6>
              <p><strong>Composant :</strong> SuiviFacturesSimple.js</p>
              <p><strong>Date :</strong> {new Date().toLocaleString('fr-FR')}</p>
              <p><strong>Status :</strong> <span className="badge bg-success">FONCTIONNEL</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuiviFacturesSimple;

