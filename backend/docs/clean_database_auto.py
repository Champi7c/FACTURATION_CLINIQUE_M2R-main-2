"""
Script pour nettoyer automatiquement toutes les données de la base de données
SANS DEMANDER DE CONFIRMATION
"""
import os
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'facturation_clinique.settings')
django.setup()

from api.models import Devis, DevisLigne, Patient, Tarif, Analyse, IPM, Assurance

def clean_database_auto():
    """Supprime automatiquement toutes les données de toutes les tables"""
    print("=" * 60)
    print("NETTOYAGE AUTOMATIQUE DE LA BASE DE DONNÉES")
    print("=" * 60)
    print()
    
    # Compter les données avant suppression
    count_devis = Devis.objects.count()
    count_lignes = DevisLigne.objects.count()
    count_patients = Patient.objects.count()
    count_tarifs = Tarif.objects.count()
    count_analyses = Analyse.objects.count()
    count_ipms = IPM.objects.count()
    count_assurances = Assurance.objects.count()
    
    print(f"Données à supprimer:")
    print(f"  - Devis: {count_devis}")
    print(f"  - Lignes de devis: {count_lignes}")
    print(f"  - Patients: {count_patients}")
    print(f"  - Tarifs: {count_tarifs}")
    print(f"  - Analyses: {count_analyses}")
    print(f"  - IPM: {count_ipms}")
    print(f"  - Assurances: {count_assurances}")
    print()
    
    print("Suppression en cours...")
    print()
    
    # Supprimer dans l'ordre pour respecter les contraintes de clés étrangères
    # 1. Supprimer les lignes de devis (dépendent des devis)
    deleted_lignes = DevisLigne.objects.all().delete()
    print(f"✅ {deleted_lignes[0]} ligne(s) de devis supprimée(s)")
    
    # 2. Supprimer les devis (dépendent des patients)
    deleted_devis = Devis.objects.all().delete()
    print(f"✅ {deleted_devis[0]} devis supprimé(s)")
    
    # 3. Supprimer les tarifs (dépendent des analyses, IPM, assurances)
    deleted_tarifs = Tarif.objects.all().delete()
    print(f"✅ {deleted_tarifs[0]} tarif(s) supprimé(s)")
    
    # 4. Supprimer les patients (dépendent des IPM et assurances)
    deleted_patients = Patient.objects.all().delete()
    print(f"✅ {deleted_patients[0]} patient(s) supprimé(s)")
    
    # 5. Supprimer les analyses
    deleted_analyses = Analyse.objects.all().delete()
    print(f"✅ {deleted_analyses[0]} analyse(s) supprimée(s)")
    
    # 6. Supprimer les IPM
    deleted_ipms = IPM.objects.all().delete()
    print(f"✅ {deleted_ipms[0]} IPM supprimée(s)")
    
    # 7. Supprimer les assurances
    deleted_assurances = Assurance.objects.all().delete()
    print(f"✅ {deleted_assurances[0]} assurance(s) supprimée(s)")
    
    print()
    print("=" * 60)
    print("✅ NETTOYAGE TERMINÉ - Base de données vide")
    print("=" * 60)
    print()
    print("Vous pouvez maintenant redémarrer l'application.")
    print("Les données standard seront automatiquement initialisées au premier démarrage.")

if __name__ == '__main__':
    try:
        clean_database_auto()
    except Exception as e:
        print(f"❌ Erreur lors du nettoyage: {e}")
        import traceback
        traceback.print_exc()

