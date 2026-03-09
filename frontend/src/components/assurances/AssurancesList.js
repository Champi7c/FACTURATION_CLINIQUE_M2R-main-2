import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import '../ipm/IPMList.css';

function AssurancesList() {
  const { assurances, deleteAssurance, activateAssurance, deactivateAssurance } = useData();
  const { user } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  // Vérifier les différentes façons d'accéder à is_superuser
  // Accepter true, 'true', 1, ou toute valeur truthy
  // Si user existe, on considère qu'il peut être admin (le backend vérifiera)
  const isSuperAdmin = Boolean(
    user && (
      user.is_superuser === true || 
      user.is_superuser === 'true' || 
      user.is_superuser === 1 ||
      user.isSuperuser === true ||
      user.isSuperuser === 'true' ||
      user.isSuperuser === 1 ||
      user.is_superuser // Si truthy
    )
  );
  
  // Afficher les boutons pour tous les utilisateurs authentifiés
  // Le backend gérera les permissions (retournera 403 si pas superadmin)
  const canSeeButtons = Boolean(user);
  
  // Debug: vérifier les permissions
  React.useEffect(() => {
    console.log('[AssurancesList] User:', user);
    console.log('[AssurancesList] user?.is_superuser:', user?.is_superuser, typeof user?.is_superuser);
    console.log('[AssurancesList] user?.isSuperuser:', user?.isSuperuser, typeof user?.isSuperuser);
    console.log('[AssurancesList] isSuperAdmin:', isSuperAdmin);
    console.log('[AssurancesList] Assurances count:', assurances.length);
    if (assurances.length > 0) {
      console.log('[AssurancesList] First Assurance:', assurances[0]);
    }
  }, [user, isSuperAdmin, assurances]);

  const handleDelete = async (id) => {
    try {
      await deleteAssurance(id);
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleActivate = async (id) => {
    try {
      await activateAssurance(id);
    } catch (error) {
      console.error('Erreur lors de l\'activation:', error);
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await deactivateAssurance(id);
    } catch (error) {
      console.error('Erreur lors de la désactivation:', error);
    }
  };

  return (
    <div className="ipm-list">
      <div className="page-header">
        <h1><i className="bi bi-shield-check"></i> Gestion des Assurances</h1>
        <Link to="/assurances/nouveau" className="btn btn-primary">
          <i className="bi bi-plus-circle"></i> Ajouter une assurance
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Liste des assurances</h3>
        </div>
        <div className="card-body">
          {assurances.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-inbox"></i>
              <p>Aucune assurance enregistrée</p>
              <Link to="/assurances/nouveau" className="btn btn-primary">
                Ajouter la première assurance
              </Link>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assurances.map(assurance => (
                  <tr key={assurance.id}>
                    <td><strong>{assurance.nom}</strong></td>
                    <td>
                      <span className={`badge ${(assurance.actif === true || assurance.actif === undefined || assurance.actif === null) ? 'badge-success' : 'badge-danger'}`}>
                        {(assurance.actif === true || assurance.actif === undefined || assurance.actif === null) ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link
                          to={`/assurances/${assurance.id}/tarifs`}
                          className="btn btn-sm btn-info"
                        >
                          <i className="bi bi-currency-dollar"></i> Tarifs
                        </Link>
                        <Link
                          to={`/assurances/${assurance.id}/modifier`}
                          className="btn btn-sm btn-warning"
                        >
                          <i className="bi bi-pencil"></i> Modifier
                        </Link>
                        {/* BOUTONS ACTIVATION/DÉSACTIVATION - FORCE AFFICHAGE */}
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => {
                            console.log('Désactiver Assurance:', assurance.id);
                            handleDeactivate(assurance.id);
                          }}
                          title="Désactiver cette assurance"
                          style={{ marginLeft: '5px', display: (assurance.actif === true || assurance.actif === undefined || assurance.actif === null) ? 'inline-block' : 'none' }}
                        >
                          <i className="bi bi-toggle-off"></i> Désactiver
                        </button>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => {
                            console.log('Activer Assurance:', assurance.id);
                            handleActivate(assurance.id);
                          }}
                          title="Activer cette assurance"
                          style={{ marginLeft: '5px', display: (assurance.actif === false) ? 'inline-block' : 'none' }}
                        >
                          <i className="bi bi-toggle-on"></i> Activer
                        </button>
                        {/* Debug info - TOUJOURS VISIBLE */}
                        <div style={{ fontSize: '9px', color: '#999', marginTop: '2px', display: 'block', clear: 'both' }}>
                          Debug: user={user ? 'exists' : 'null'}, isSuperAdmin={String(isSuperAdmin)}, is_superuser={String(user?.is_superuser)}, actif={String(assurance.actif)}
                        </div>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => setShowDeleteModal(assurance.id)}
                        >
                          <i className="bi bi-trash"></i> Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirmer la suppression</h3>
            </div>
            <div className="modal-body">
              <p>Êtes-vous sûr de vouloir supprimer cette assurance ?</p>
              <p className="text-danger">
                <small>Tous les tarifs et patients associés seront également affectés.</small>
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(null)}
              >
                Annuler
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(showDeleteModal)}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssurancesList;

