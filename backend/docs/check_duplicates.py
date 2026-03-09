#!/usr/bin/env python
"""
Script pour vérifier et nettoyer les doublons dans la base de données
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'facturation_clinique.settings')
django.setup()

from api.models import Analyse, IPM, Assurance, Tarif
from django.db.models import Count

print("=" * 60)
print("VÉRIFICATION DES DOUBLONS")
print("=" * 60)

# Vérifier les doublons dans Analyses
print("\n📊 ANALYSES:")
doublons_analyses = Analyse.objects.values('nom', 'categorie').annotate(count=Count('id')).filter(count__gt=1)
print(f"   Nombre de groupes avec doublons: {doublons_analyses.count()}")
if doublons_analyses.count() > 0:
    for d in doublons_analyses[:10]:
        print(f"   - {d['nom']} ({d['categorie']}): {d['count']} occurrences")

# Vérifier les doublons dans IPMs
print("\n📊 IPMs:")
doublons_ipms = IPM.objects.values('nom').annotate(count=Count('id')).filter(count__gt=1)
print(f"   Nombre de groupes avec doublons: {doublons_ipms.count()}")
if doublons_ipms.count() > 0:
    for d in doublons_ipms[:10]:
        print(f"   - {d['nom']}: {d['count']} occurrences")

# Vérifier les doublons dans Assurances
print("\n📊 ASSURANCES:")
doublons_assurances = Assurance.objects.values('nom').annotate(count=Count('id')).filter(count__gt=1)
print(f"   Nombre de groupes avec doublons: {doublons_assurances.count()}")
if doublons_assurances.count() > 0:
    for d in doublons_assurances[:10]:
        print(f"   - {d['nom']}: {d['count']} occurrences")

print("\n" + "=" * 60)
print("TOTAUX:")
print("=" * 60)
print(f"   Analyses: {Analyse.objects.count()}")
print(f"   IPMs: {IPM.objects.count()}")
print(f"   Assurances: {Assurance.objects.count()}")
print(f"   Tarifs: {Tarif.objects.count()}")

