-- =============================================================================
-- Suppression de toutes les données de la plateforme
-- (analyses, IPM, assurances, tarifs, patients, devis, catégories)
-- =============================================================================
-- Usage MySQL : mysql -u root -p facturation_clinique < sql/clear_all_data.sql
-- Usage SQLite: sqlite3 db.sqlite3 < sql/clear_all_data.sql
-- =============================================================================

-- Ordre de suppression respectant les clés étrangères (enfants avant parents)

DELETE FROM devis_lignes;
DELETE FROM devis;
DELETE FROM patients;
DELETE FROM tarifs;
DELETE FROM analyses;
DELETE FROM ipms;
DELETE FROM assurances;
DELETE FROM categories;
