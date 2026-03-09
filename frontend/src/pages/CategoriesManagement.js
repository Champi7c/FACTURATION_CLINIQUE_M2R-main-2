import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { categoriesAPI } from '../services/api';
import { handleAPIError } from '../services/api';
import { getCategoryName, isCategoryActive } from '../utils/categoryUtils';
import './CategoriesManagement.css';

// Toujours afficher du texte (éviter erreur React #31 si error/success sont des objets)
const toText = (v) => {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'object' && v.message) return String(v.message);
  return String(v);
};

const CategoriesManagement = () => {
  const { user } = useAuth();
  const { categories, reloadCategories, activateCategorie, deactivateCategorie } = useData();
  const [localCategories, setLocalCategories] = useState([]);
  const [newCategorie, setNewCategorie] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingName, setEditingName] = useState('');

  const isAdmin = user?.is_superuser;
  
  // Utiliser les catégories du contexte ou les locales en fallback
  // Normaliser pour toujours avoir des objets {nom, actif} pour cohérence
  const displayCategories = (categories.length > 0 ? categories : localCategories).map(cat => {
    if (typeof cat === 'object' && cat.nom) {
      return cat; // Déjà un objet
    }
    // Si c'est une string, la convertir en objet pour cohérence
    return { nom: cat, actif: true };
  }).filter(cat => {
    // Filtrer les catégories pour s'assurer qu'elles ont bien un nom
    const nom = getCategoryName(cat);
    return nom && nom.trim() !== '';
  });

  useEffect(() => {
    if (isAdmin && categories.length === 0) {
      loadLocalCategories();
    }
  }, [isAdmin]);

  const loadLocalCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoriesAPI.getAll();
      // Normaliser les catégories : extraire le nom si c'est un objet, garder la string sinon
      // Pour CategoriesManagement, on garde les objets pour afficher le statut actif/inactif
      // Mais on s'assure que ce sont bien des objets avec nom et actif
      const categoriesData = (response.data.categories || []).map(cat => {
        if (typeof cat === 'object' && cat.nom) {
          return cat; // Garder l'objet pour afficher actif/inactif
        }
        // Si c'est une string, la convertir en objet pour cohérence
        return { nom: cat, actif: true };
      });
      setLocalCategories(categoriesData);
    } catch (err) {
      console.error('Erreur lors du chargement des catégories:', err);
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategorie = async (e) => {
    e.preventDefault();
    if (!newCategorie.trim()) {
      setError('Le nom de la catégorie ne peut pas être vide');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await categoriesAPI.create(newCategorie.trim());
      setSuccess(`Catégorie "${newCategorie.trim()}" créée avec succès !`);
      setNewCategorie('');
      // Recharger les catégories dans DataContext pour mettre à jour le menu
      setTimeout(async () => {
        await reloadCategories();
        await loadLocalCategories();
      }, 500);
    } catch (err) {
      console.error('Erreur lors de la création de la catégorie:', err);
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (categoryName) => {
    const nom = getCategoryName(categoryName);
    setEditingCategory(nom);
    setEditingName(nom);
    setError(null);
    setSuccess(null);
  };

  const handleSaveEdit = async () => {
    if (!editingName.trim()) {
      setError('Le nom de la catégorie ne peut pas être vide');
      return;
    }

    if (editingName.trim() === editingCategory) {
      setEditingCategory(null);
      setEditingName('');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await categoriesAPI.update(editingCategory, editingName.trim());
      setSuccess(`Catégorie "${editingCategory}" renommée en "${editingName.trim()}" avec succès !`);
      setEditingCategory(null);
      setEditingName('');
      // Recharger les catégories dans DataContext pour mettre à jour le menu
      setTimeout(async () => {
        await reloadCategories();
        await loadLocalCategories();
      }, 500);
    } catch (err) {
      console.error('Erreur lors de la modification de la catégorie:', err);
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditingName('');
    setError(null);
  };

  const handleDeleteCategory = async (categoryName) => {
    const nom = getCategoryName(categoryName);
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${nom}" ?\n\nToutes les analyses avec cette catégorie seront également supprimées.\n\n⚠️ Attention : Si des analyses de cette catégorie sont utilisées dans des devis, la suppression sera impossible.`)) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await categoriesAPI.delete(nom);
      setSuccess(`Catégorie "${nom}" supprimée avec succès !`);
      // Recharger les catégories dans DataContext pour mettre à jour le menu
      setTimeout(async () => {
        await reloadCategories();
        await loadLocalCategories();
      }, 500);
    } catch (err) {
      console.error('Erreur lors de la suppression de la catégorie:', err);
      // Extraire le message d'erreur détaillé si disponible
      const errorMessage = err.response?.data?.error || handleAPIError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Si l'utilisateur n'est pas admin, afficher un message d'erreur
  if (!isAdmin) {
    return (
      <div className="categories-management">
        <div className="card">
          <div className="card-body">
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              <strong>Accès refusé</strong>
              <p>Cette page est réservée aux administrateurs uniquement.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="categories-management">
      <div className="page-header">
        <h1><i className="bi bi-tags"></i> Gestion des catégories</h1>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h5><i className="bi bi-plus-circle"></i> Créer une nouvelle catégorie</h5>
        </div>
        <div className="card-body">
          {error != null && error !== '' && (
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {toText(error)}
            </div>
          )}
          {success != null && success !== '' && (
            <div className="alert alert-success">
              <i className="bi bi-check-circle me-2"></i>
              {toText(success)}
            </div>
          )}
          <form onSubmit={handleCreateCategorie}>
            <div className="row">
              <div className="col-md-8">
                <label className="form-label">Nom de la catégorie</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: analyses, radiographie, hospitalisation, etc."
                  value={newCategorie}
                  onChange={(e) => setNewCategorie(e.target.value)}
                  required
                />
                <small className="form-text text-muted">
                  Le nom doit être en minuscules, sans espaces ni caractères spéciaux.
                </small>
              </div>
              <div className="col-md-4 d-flex align-items-end">
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading || !newCategorie.trim()}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Création...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-plus-circle me-2"></i>
                      Créer la catégorie
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h5><i className="bi bi-list-ul"></i> Catégories existantes</h5>
        </div>
        <div className="card-body">
                {loading && !displayCategories.length ? (
                  <div className="text-center py-4">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Chargement...</span>
                    </div>
                  </div>
                ) : displayCategories.length > 0 ? (
                  <div className="row">
                    {displayCategories.map((categorie, index) => {
                      const categorieObj = typeof categorie === 'object' && categorie != null && categorie.nom != null
                        ? categorie
                        : { nom: typeof categorie === 'string' ? categorie : String(categorie ?? ''), actif: true };
                      const categorieNom = getCategoryName(categorieObj);
                      return (
                <div key={`cat-${index}-${categorieNom}`} className="col-md-4 mb-3">
                  <div className="card border-primary">
                    <div className="card-body">
                      {editingCategory === categorieNom ? (
                        <>
                          <input
                            type="text"
                            className="form-control mb-2"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveEdit();
                              } else if (e.key === 'Escape') {
                                handleCancelEdit();
                              }
                            }}
                            autoFocus
                          />
                          <div className="btn-group w-100" role="group">
                            <button
                              type="button"
                              className="btn btn-sm btn-success"
                              onClick={handleSaveEdit}
                              disabled={loading || !editingName.trim()}
                            >
                              <i className="bi bi-check"></i> Enregistrer
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-secondary"
                              onClick={handleCancelEdit}
                              disabled={loading}
                            >
                              <i className="bi bi-x"></i> Annuler
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <h6 className="card-title">
                            <i className="bi bi-tag me-2"></i>
                            {categorieNom}
                            <span className={`badge ms-2 ${isCategoryActive(categorieObj) ? 'bg-success' : 'bg-danger'}`}>
                              {isCategoryActive(categorieObj) ? 'Actif' : 'Inactif'}
                            </span>
                          </h6>
                          <p className="card-text text-muted small mb-2">
                            Nom: {categorieNom} | Statut: {isCategoryActive(categorieObj) ? 'Actif' : 'Inactif'}
                          </p>
                          <div className="btn-group w-100 mb-2" role="group">
                            <button
                              type="button"
                              className="btn btn-sm btn-warning"
                              onClick={() => handleEditCategory(categorieObj)}
                              disabled={loading}
                            >
                              <i className="bi bi-pencil"></i> Modifier
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteCategory(categorieObj)}
                              disabled={loading}
                            >
                              <i className="bi bi-trash"></i> Supprimer
                            </button>
                          </div>
                          <div className="btn-group w-100" role="group">
                            {isCategoryActive(categorieObj) ? (
                              <button
                                type="button"
                                className="btn btn-sm btn-secondary"
                                onClick={async () => {
                                  try {
                                    setLoading(true);
                                    const nomCategorie = getCategoryName(categorieObj);
                                    await deactivateCategorie(nomCategorie);
                                    setSuccess(`Catégorie "${nomCategorie}" désactivée avec succès !`);
                                    // Recharger les catégories locales pour mettre à jour l'UI
                                    await loadLocalCategories();
                                  } catch (err) {
                                    setError(handleAPIError(err));
                                  } finally {
                                    setLoading(false);
                                  }
                                }}
                                disabled={loading}
                              >
                                <i className="bi bi-toggle-off"></i> Désactiver
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-sm btn-success"
                                onClick={async () => {
                                  try {
                                    setLoading(true);
                                    const nomCategorie = getCategoryName(categorieObj);
                                    await activateCategorie(nomCategorie);
                                    setSuccess(`Catégorie "${nomCategorie}" activée avec succès !`);
                                    // Recharger les catégories locales pour mettre à jour l'UI
                                    await loadLocalCategories();
                                  } catch (err) {
                                    setError(handleAPIError(err));
                                  } finally {
                                    setLoading(false);
                                  }
                                }}
                                disabled={loading}
                              >
                                <i className="bi bi-toggle-on"></i> Activer
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                      );
                    })}
            </div>
          ) : (
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              Aucune catégorie trouvée. Créez-en une pour commencer.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoriesManagement;

