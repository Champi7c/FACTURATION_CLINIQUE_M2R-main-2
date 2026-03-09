#!/usr/bin/env python
"""
Script pour tester la création d'un devis
"""
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'facturation_clinique.settings')
django.setup()

from api.models import Patient, Analyse, Devis
from api.serializers import DevisCreateSerializer

print("=" * 60)
print("TEST DE CRÉATION DE DEVIS")
print("=" * 60)

# Vérifier qu'il y a au moins un patient et une analyse
patients = Patient.objects.all()
analyses = Analyse.objects.all()

print(f"\n📊 Données disponibles:")
print(f"   Patients: {patients.count()}")
print(f"   Analyses: {analyses.count()}")

if patients.count() == 0:
    print("\n❌ ERREUR: Aucun patient dans la base de données!")
    print("   Créez d'abord un patient depuis le frontend.")
    exit(1)

if analyses.count() == 0:
    print("\n❌ ERREUR: Aucune analyse dans la base de données!")
    print("   Créez d'abord des analyses depuis le frontend.")
    exit(1)

# Prendre le premier patient et les 3 premières analyses
patient = patients.first()
analyses_test = analyses[:3]

print(f"\n✅ Utilisation du patient: {patient.nom_complet} (ID: {patient.id})")
print(f"✅ Utilisation de {analyses_test.count()} analyses")

# Créer les données du devis au format API
devis_data = {
    'patient': patient.id,
    'souscripteur': 'Test Souscripteur',
    'taux_couverture': '80',
    'lignes': [
        {
            'analyseId': analyse.id,
            'prix': '5000'
        }
        for analyse in analyses_test
    ]
}

print(f"\n📝 Données du devis à créer:")
print(json.dumps(devis_data, indent=2, ensure_ascii=False))

# Tester la création
try:
    serializer = DevisCreateSerializer(data=devis_data)
    if serializer.is_valid():
        devis = serializer.save()
        print(f"\n✅ DEVIS CRÉÉ AVEC SUCCÈS!")
        print(f"   Numéro: {devis.numero}")
        print(f"   Total: {devis.total} FCFA")
        print(f"   Lignes: {devis.lignes.count()}")
        
        # Afficher les lignes
        print(f"\n📋 Lignes du devis:")
        for ligne in devis.lignes.all():
            print(f"   - {ligne.analyse.nom}: {ligne.prix} FCFA")
    else:
        print(f"\n❌ ERREUR DE VALIDATION:")
        print(json.dumps(serializer.errors, indent=2, ensure_ascii=False))
except Exception as e:
    print(f"\n❌ ERREUR LORS DE LA CRÉATION:")
    print(f"   {type(e).__name__}: {str(e)}")
    import traceback
    traceback.print_exc()

