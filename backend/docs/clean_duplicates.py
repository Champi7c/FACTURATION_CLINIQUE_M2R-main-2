#!/usr/bin/env python
"""
Script pour nettoyer les doublons dans la base de données
Garde la première occurrence de chaque donnée unique
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'facturation_clinique.settings')
django.setup()

from api.models import Analyse, IPM, Assurance, Tarif, DevisLigne
from django.db.models import Count
from django.db import transaction

print("=" * 60)
print("NETTOYAGE DES DOUBLONS")
print("=" * 60)

with transaction.atomic():
    # Nettoyer les doublons dans Analyses
    print("\n🧹 Nettoyage des Analyses...")
    doublons_analyses = Analyse.objects.values('nom', 'categorie').annotate(count=Count('id')).filter(count__gt=1)
    total_supprime_analyses = 0
    
    for doublon in doublons_analyses:
        analyses = Analyse.objects.filter(nom=doublon['nom'], categorie=doublon['categorie']).order_by('created_at')
        # Garder la première, supprimer les autres
        a_garder = analyses.first()
        a_supprimer = analyses.exclude(id=a_garder.id)
        count = a_supprimer.count()
        
        # Vérifier si des tarifs utilisent ces analyses avant de supprimer
        for analyse in a_supprimer:
            tarifs_count = Tarif.objects.filter(analyse=analyse).count()
            if tarifs_count > 0:
                # Transférer les tarifs vers l'analyse à garder
                Tarif.objects.filter(analyse=analyse).update(analyse=a_garder)
            # Vérifier les DevisLigne
            devis_lignes_count = DevisLigne.objects.filter(analyse=analyse).count()
            if devis_lignes_count > 0:
                # Transférer les lignes de devis vers l'analyse à garder
                DevisLigne.objects.filter(analyse=analyse).update(analyse=a_garder)
            analyse.delete()
            total_supprime_analyses += 1
    
    print(f"   ✅ {total_supprime_analyses} analyses en double supprimées")
    
    # Nettoyer les doublons dans IPMs
    print("\n🧹 Nettoyage des IPMs...")
    doublons_ipms = IPM.objects.values('nom').annotate(count=Count('id')).filter(count__gt=1)
    total_supprime_ipms = 0
    
    for doublon in doublons_ipms:
        ipms = IPM.objects.filter(nom=doublon['nom']).order_by('created_at')
        # Garder la première, supprimer les autres
        ipm_garder = ipms.first()
        ipms_supprimer = ipms.exclude(id=ipm_garder.id)
        
        for ipm in ipms_supprimer:
            # Transférer les tarifs vers l'IPM à garder
            Tarif.objects.filter(ipm=ipm).update(ipm=ipm_garder)
            # Transférer les patients vers l'IPM à garder
            from api.models import Patient
            Patient.objects.filter(ipm=ipm).update(ipm=ipm_garder)
            ipm.delete()
            total_supprime_ipms += 1
    
    print(f"   ✅ {total_supprime_ipms} IPMs en double supprimés")
    
    # Nettoyer les doublons dans Assurances
    print("\n🧹 Nettoyage des Assurances...")
    doublons_assurances = Assurance.objects.values('nom').annotate(count=Count('id')).filter(count__gt=1)
    total_supprime_assurances = 0
    
    for doublon in doublons_assurances:
        assurances = Assurance.objects.filter(nom=doublon['nom']).order_by('created_at')
        # Garder la première, supprimer les autres
        assurance_garder = assurances.first()
        assurances_supprimer = assurances.exclude(id=assurance_garder.id)
        
        for assurance in assurances_supprimer:
            # Transférer les tarifs vers l'assurance à garder
            Tarif.objects.filter(assurance=assurance).update(assurance=assurance_garder)
            # Transférer les patients vers l'assurance à garder
            from api.models import Patient
            Patient.objects.filter(assurance=assurance).update(assurance=assurance_garder)
            assurance.delete()
            total_supprime_assurances += 1
    
    print(f"   ✅ {total_supprime_assurances} assurances en double supprimées")

print("\n" + "=" * 60)
print("RÉSULTAT FINAL:")
print("=" * 60)
print(f"   Analyses: {Analyse.objects.count()}")
print(f"   IPMs: {IPM.objects.count()}")
print(f"   Assurances: {Assurance.objects.count()}")
print(f"   Tarifs: {Tarif.objects.count()}")
print("\n✅ Nettoyage terminé avec succès !")

