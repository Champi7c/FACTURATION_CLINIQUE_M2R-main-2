#!/usr/bin/env python
"""
Script pour vérifier la connexion à la base de données et voir les données
"""
import os
import sys
import django

# Configuration Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'facturation_clinique.settings')
django.setup()

from api.models import IPM, Analyse, Assurance, Tarif, Patient, Devis

print("=" * 60)
print("VÉRIFICATION DE LA BASE DE DONNÉES")
print("=" * 60)

# Vérifier les IPM
print("\n📋 IPM dans la base de données:")
ipms = IPM.objects.all()
print(f"Nombre d'IPM: {ipms.count()}")
for ipm in ipms:
    print(f"  - ID: {ipm.id} | Nom: {ipm.nom} | Créé le: {ipm.created_at}")

# Vérifier les Analyses
print("\n📋 Analyses dans la base de données:")
analyses = Analyse.objects.all()
print(f"Nombre d'analyses: {analyses.count()}")
for analyse in analyses[:5]:  # Afficher les 5 premières
    print(f"  - ID: {analyse.id} | Nom: {analyse.nom} | Catégorie: {analyse.categorie}")

# Vérifier les Assurances
print("\n📋 Assurances dans la base de données:")
assurances = Assurance.objects.all()
print(f"Nombre d'assurances: {assurances.count()}")
for assurance in assurances:
    print(f"  - ID: {assurance.id} | Nom: {assurance.nom}")

# Vérifier les Patients
print("\n📋 Patients dans la base de données:")
patients = Patient.objects.all()
print(f"Nombre de patients: {patients.count()}")

# Vérifier les Devis
print("\n📋 Devis dans la base de données:")
devis = Devis.objects.all()
print(f"Nombre de devis: {devis.count()}")

# Vérifier les Tarifs
print("\n📋 Tarifs dans la base de données:")
tarifs = Tarif.objects.all()
print(f"Nombre de tarifs: {tarifs.count()}")

print("\n" + "=" * 60)
print("Vérification terminée!")
print("=" * 60)


