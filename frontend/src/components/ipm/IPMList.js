import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import './IPMList.css';

// Version: 2026-01-07-01:15 - Boutons activation/désactivation toujours visibles - REBUILD FORCE v3 HTTPS
const FORCE_REBUILD_HASH_HTTPS = '202601070115';

function IPMList() {
  const { ipms, deleteIPM, activateIPM, deactivateIPM } = useData();
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
    console.log('[IPMList] User:', user);
    console.log('[IPMList] user?.is_superuser:', user?.is_superuser, typeof user?.is_superuser);
    console.log('[IPMList] user?.isSuperuser:', user?.isSuperuser, typeof user?.isSuperuser);
    console.log('[IPMList] isSuperAdmin:', isSuperAdmin);
    console.log('[IPMList] IPMs count:', ipms.length);
    if (ipms.length > 0) {
      console.log('[IPMList] First IPM:', ipms[0]);
    }
  }, [user, isSuperAdmin, ipms]);

  const handleDelete = async (id) => {
    try {
      await deleteIPM(id);
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleActivate = async (id) => {
    try {
      await activateIPM(id);
    } catch (error) {
      console.error('Erreur lors de l\'activation:', error);
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await deactivateIPM(id);
    } catch (error) {
      console.error('Erreur lors de la désactivation:', error);
    }
  };

  return (
    <div className="ipm-list">
      <div className="page-header">
        <h1><i className="bi bi-building"></i> Gestion des IPM</h1>
        <Link to="/ipm/nouveau" className="btn btn-primary">
          <i className="bi bi-plus-circle"></i> Ajouter une IPM
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Liste des IPM</h3>
        </div>
        <div className="card-body">
          {ipms.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-inbox"></i>
              <p>Aucune IPM enregistrée</p>
              <Link to="/ipm/nouveau" className="btn btn-primary">
                Ajouter la première IPM
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
                {ipms.map(ipm => (
                  <tr key={ipm.id}>
                    <td><strong>{ipm.nom}</strong></td>
                    <td>
                      <span className={`badge ${(ipm.actif === true || ipm.actif === undefined || ipm.actif === null) ? 'badge-success' : 'badge-danger'}`}>
                        {(ipm.actif === true || ipm.actif === undefined || ipm.actif === null) ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link
                          to={`/ipm/${ipm.id}/tarifs`}
                          className="btn btn-sm btn-info"
                        >
                          <i className="bi bi-currency-dollar"></i> Tarifs
                        </Link>
                        <Link
                          to={`/ipm/${ipm.id}/modifier`}
                          className="btn btn-sm btn-warning"
                        >
                          <i className="bi bi-pencil"></i> Modifier
                        </Link>
                        {/* BOUTONS ACTIVATION/DÉSACTIVATION - FORCE AFFICHAGE */}
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => {
                            console.log('Désactiver IPM:', ipm.id);
                            handleDeactivate(ipm.id);
                          }}
                          title="Désactiver cette IPM"
                          style={{ marginLeft: '5px', display: (ipm.actif === true || ipm.actif === undefined || ipm.actif === null) ? 'inline-block' : 'none' }}
                        >
                          <i className="bi bi-toggle-off"></i> Désactiver
                        </button>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => {
                            console.log('Activer IPM:', ipm.id);
                            handleActivate(ipm.id);
                          }}
                          title="Activer cette IPM"
                          style={{ marginLeft: '5px', display: (ipm.actif === false) ? 'inline-block' : 'none' }}
                        >
                          <i className="bi bi-toggle-on"></i> Activer
                        </button>
                        {/* Debug info - TOUJOURS VISIBLE - VERSION HTTPS FIX */}
                        <div style={{ fontSize: '12px', color: '#ff0000', marginTop: '5px', display: 'block', clear: 'both', fontWeight: 'bold', border: '2px solid red', padding: '5px' }}>
                          🔴 BOUTONS ACTIVATION/DÉSACTIVATION VISIBLES - VERSION HTTPS 2026-01-07-01:20
                          <br />
                          Debug: user={user ? 'exists' : 'null'}, isSuperAdmin={String(isSuperAdmin)}, is_superuser={String(user?.is_superuser)}, actif={String(ipm.actif)}
                        </div>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => setShowDeleteModal(ipm.id)}
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
              <p>Êtes-vous sûr de vouloir supprimer cette IPM ?</p>
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

export default IPMList;

