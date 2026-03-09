"""
Commande Django pour peupler la base de données avec des données de test
Usage: python manage.py populate_db
"""
from django.core.management.base import BaseCommand
from api.models import Analyse, IPM, Assurance, Tarif, Patient, Devis, DevisLigne
import uuid
from decimal import Decimal
from datetime import datetime, timedelta
import random


class Command(BaseCommand):
    help = 'Peuple la base de données avec des données de test'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Supprime toutes les données existantes avant de peupler',
        )
        parser.add_argument(
            '--skip-analyses',
            action='store_true',
            dest='skip_analyses',
            help='Ne pas créer les analyses (déjà chargées depuis sql/analyses.sql)',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING('Suppression des données existantes...'))
            DevisLigne.objects.all().delete()
            Devis.objects.all().delete()
            Patient.objects.all().delete()
            Tarif.objects.all().delete()
            Analyse.objects.all().delete()
            IPM.objects.all().delete()
            Assurance.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Données supprimées avec succès'))

        self.stdout.write(self.style.SUCCESS('Début du peuplement de la base de données...'))

        skip_analyses = options.get('skip_analyses', False)

        # 1. Créer des Analyses (sauf si --skip-analyses, ex. après chargement sql/analyses.sql)
        if skip_analyses:
            analyses_created = list(Analyse.objects.all()[:15])
            self.stdout.write(f'  (analyses déjà présentes : {len(analyses_created)} utilisées pour tarifs/devis)')
        else:
            self.stdout.write('Création des analyses...')
            analyses_data = [
            # Analyses de base
            {'id': 'ANAL-001', 'nom': 'Numération Formule Sanguine (NFS)', 'categorie': 'analyses'},
            {'id': 'ANAL-002', 'nom': 'Glycémie à jeun', 'categorie': 'analyses'},
            {'id': 'ANAL-003', 'nom': 'Créatininémie', 'categorie': 'analyses'},
            {'id': 'ANAL-004', 'nom': 'Urée', 'categorie': 'analyses'},
            {'id': 'ANAL-005', 'nom': 'Transaminases (ASAT/ALAT)', 'categorie': 'analyses'},
            {'id': 'ANAL-006', 'nom': 'Bilirubine totale', 'categorie': 'analyses'},
            {'id': 'ANAL-007', 'nom': 'Cholestérol total', 'categorie': 'analyses'},
            {'id': 'ANAL-008', 'nom': 'Triglycérides', 'categorie': 'analyses'},
            {'id': 'ANAL-009', 'nom': 'HDL Cholestérol', 'categorie': 'analyses'},
            {'id': 'ANAL-010', 'nom': 'LDL Cholestérol', 'categorie': 'analyses'},
            {'id': 'ANAL-011', 'nom': 'Hémoglobine glyquée (HbA1c)', 'categorie': 'analyses'},
            {'id': 'ANAL-012', 'nom': 'Vitamine D (25-OH)', 'categorie': 'analyses'},
            {'id': 'ANAL-013', 'nom': 'Ferritine', 'categorie': 'analyses'},
            {'id': 'ANAL-014', 'nom': 'TSH (Thyroïde)', 'categorie': 'analyses'},
            {'id': 'ANAL-015', 'nom': 'T4 libre', 'categorie': 'analyses'},
            {'id': 'ANAL-016', 'nom': 'T3 libre', 'categorie': 'analyses'},
            {'id': 'ANAL-017', 'nom': 'PSA (Antigène Prostatique)', 'categorie': 'analyses'},
            {'id': 'ANAL-018', 'nom': 'Test de grossesse (BHCG)', 'categorie': 'analyses'},
            {'id': 'ANAL-019', 'nom': 'Groupage sanguin ABO-Rhésus', 'categorie': 'analyses'},
            {'id': 'ANAL-020', 'nom': 'Frottis cervico-vaginal', 'categorie': 'analyses'},
            {'id': 'ANAL-021', 'nom': 'ECBU (Examen Cyto-Bactériologique Urines)', 'categorie': 'analyses'},
            {'id': 'ANAL-022', 'nom': 'Coproculture', 'categorie': 'analyses'},
            {'id': 'ANAL-023', 'nom': 'Hémoculture', 'categorie': 'analyses'},
            {'id': 'ANAL-024', 'nom': 'Sérologie VIH', 'categorie': 'analyses'},
            {'id': 'ANAL-025', 'nom': 'Sérologie Hépatite B (HBsAg)', 'categorie': 'analyses'},
            {'id': 'ANAL-026', 'nom': 'Sérologie Hépatite C', 'categorie': 'analyses'},
            {'id': 'ANAL-027', 'nom': 'Fibrinogène', 'categorie': 'analyses'},
            {'id': 'ANAL-028', 'nom': 'Temps de prothrombine (TP)', 'categorie': 'analyses'},
            {'id': 'ANAL-029', 'nom': 'Temps de céphaline activée (TCA)', 'categorie': 'analyses'},
            {'id': 'ANAL-030', 'nom': 'D-Dimères', 'categorie': 'analyses'},
            ]

            analyses_created = []
            for data in analyses_data:
                analyse, created = Analyse.objects.get_or_create(
                    id=data['id'],
                    defaults={'nom': data['nom'], 'categorie': data['categorie']}
                )
                analyses_created.append(analyse)
                if created:
                    self.stdout.write(f'  [OK] Analyse creee: {analyse.nom}')

        # 2. Créer des IPM
        self.stdout.write('Création des IPM...')
        ipms_data = [
            {'id': 'IPM-001', 'nom': 'CNSS (Caisse Nationale de Sécurité Sociale)'},
            {'id': 'IPM-002', 'nom': 'CNPS (Caisse Nationale de Prévoyance Sociale)'},
            {'id': 'IPM-003', 'nom': 'CAMEG (Centrale d\'Achat des Médicaments Essentiels Génériques)'},
            {'id': 'IPM-004', 'nom': 'Ministère de la Santé'},
            {'id': 'IPM-005', 'nom': 'Armée de Terre'},
            {'id': 'IPM-006', 'nom': 'Gendarmerie Nationale'},
            {'id': 'IPM-007', 'nom': 'Police Nationale'},
        ]

        ipms_created = []
        for data in ipms_data:
            ipm, created = IPM.objects.get_or_create(
                id=data['id'],
                defaults={'nom': data['nom']}
            )
            ipms_created.append(ipm)
            if created:
                self.stdout.write(f'  [OK] IPM creee: {ipm.nom}')

        # 3. Créer des Assurances
        self.stdout.write('Création des assurances...')
        assurances_data = [
            {'id': 'ASS-001', 'nom': 'AXA Assurance'},
            {'id': 'ASS-002', 'nom': 'NSIA Assurance'},
            {'id': 'ASS-003', 'nom': 'Allianz Assurance'},
            {'id': 'ASS-004', 'nom': 'Sanlam Assurance'},
            {'id': 'ASS-005', 'nom': 'Atlanta-Sanady Assurance'},
            {'id': 'ASS-006', 'nom': 'Sunu Assurance'},
            {'id': 'ASS-007', 'nom': 'Coris Assurance'},
        ]

        assurances_created = []
        for data in assurances_data:
            assurance, created = Assurance.objects.get_or_create(
                id=data['id'],
                defaults={'nom': data['nom']}
            )
            assurances_created.append(assurance)
            if created:
                self.stdout.write(f'  [OK] Assurance creee: {assurance.nom}')

        # 4. Créer des Tarifs
        self.stdout.write('Création des tarifs...')
        # Tarifs IPM
        for ipm in ipms_created:
            for analyse in analyses_created[:15]:  # Tarifs pour les 15 premières analyses
                prix = Decimal(random.randint(5000, 50000))
                tarif, created = Tarif.objects.get_or_create(
                    id=f'TAR-{ipm.id}-{analyse.id}',
                    defaults={
                        'analyse': analyse,
                        'type_prise_en_charge': 'IPM',
                        'ipm': ipm,
                        'prix': prix
                    }
                )
                if created:
                    self.stdout.write(f'  [OK] Tarif IPM: {analyse.nom} - {ipm.nom} ({prix} FCFA)')

        # Tarifs Assurance
        for assurance in assurances_created:
            for analyse in analyses_created[:15]:  # Tarifs pour les 15 premières analyses
                prix = Decimal(random.randint(3000, 40000))
                tarif, created = Tarif.objects.get_or_create(
                    id=f'TAR-{assurance.id}-{analyse.id}',
                    defaults={
                        'analyse': analyse,
                        'type_prise_en_charge': 'ASSURANCE',
                        'assurance': assurance,
                        'prix': prix
                    }
                )
                if created:
                    self.stdout.write(f'  [OK] Tarif Assurance: {analyse.nom} - {assurance.nom} ({prix} FCFA)')

        # 5. Créer des Patients
        self.stdout.write('Création des patients...')
        patients_data = [
            # Patients IPM
            {'id': 'PAT-001', 'nom_complet': 'Amadou Diallo', 'matricule': 'CNSS-2024-001', 'type_prise_en_charge': 'IPM', 'ipm': ipms_created[0]},
            {'id': 'PAT-002', 'nom_complet': 'Fatou Sall', 'matricule': 'CNSS-2024-002', 'type_prise_en_charge': 'IPM', 'ipm': ipms_created[0]},
            {'id': 'PAT-003', 'nom_complet': 'Ibrahima Ba', 'matricule': 'CNPS-2024-001', 'type_prise_en_charge': 'IPM', 'ipm': ipms_created[1]},
            {'id': 'PAT-004', 'nom_complet': 'Aissatou Ndiaye', 'matricule': 'CNPS-2024-002', 'type_prise_en_charge': 'IPM', 'ipm': ipms_created[1]},
            {'id': 'PAT-005', 'nom_complet': 'Moussa Diop', 'matricule': 'ARM-2024-001', 'type_prise_en_charge': 'IPM', 'ipm': ipms_created[4]},
            {'id': 'PAT-006', 'nom_complet': 'Mariama Sow', 'matricule': 'GEND-2024-001', 'type_prise_en_charge': 'IPM', 'ipm': ipms_created[5]},
            {'id': 'PAT-007', 'nom_complet': 'Ousmane Kane', 'matricule': 'POL-2024-001', 'type_prise_en_charge': 'IPM', 'ipm': ipms_created[6]},
            # Patients Assurance
            {'id': 'PAT-008', 'nom_complet': 'Khadija Traoré', 'matricule': 'AXA-2024-001', 'type_prise_en_charge': 'ASSURANCE', 'assurance': assurances_created[0]},
            {'id': 'PAT-009', 'nom_complet': 'Boubacar Faye', 'matricule': 'NSIA-2024-001', 'type_prise_en_charge': 'ASSURANCE', 'assurance': assurances_created[1]},
            {'id': 'PAT-010', 'nom_complet': 'Aminata Mbaye', 'matricule': 'ALL-2024-001', 'type_prise_en_charge': 'ASSURANCE', 'assurance': assurances_created[2]},
            {'id': 'PAT-011', 'nom_complet': 'Modou Seck', 'matricule': 'SAN-2024-001', 'type_prise_en_charge': 'ASSURANCE', 'assurance': assurances_created[3]},
            {'id': 'PAT-012', 'nom_complet': 'Rokhaya Diouf', 'matricule': 'ATL-2024-001', 'type_prise_en_charge': 'ASSURANCE', 'assurance': assurances_created[4]},
        ]

        patients_created = []
        for data in patients_data:
            patient, created = Patient.objects.get_or_create(
                id=data['id'],
                defaults={
                    'nom_complet': data['nom_complet'],
                    'matricule': data['matricule'],
                    'type_prise_en_charge': data['type_prise_en_charge'],
                    'ipm': data.get('ipm'),
                    'assurance': data.get('assurance')
                }
            )
            patients_created.append(patient)
            if created:
                self.stdout.write(f'  [OK] Patient cree: {patient.nom_complet} ({patient.matricule})')

        # 6. Créer des Devis
        self.stdout.write('Création des devis...')
        annee = datetime.now().year
        taux_couverture_options = ['0', '10', '15', '20', '25', '30', '35', '40', '45', '50', '70', '80', '100']

        for i, patient in enumerate(patients_created[:8], 1):  # Créer des devis pour 8 patients
            # Générer le numéro de devis
            numero = f'{annee}-{str(i).zfill(5)}'
            
            # Sélectionner quelques analyses aléatoires
            analyses_selectionnees = random.sample(analyses_created[:15], random.randint(2, 5))
            
            # Calculer le total
            total = Decimal('0.00')
            lignes_data = []
            
            for analyse in analyses_selectionnees:
                # Trouver le tarif approprié
                if patient.type_prise_en_charge == 'IPM' and patient.ipm:
                    tarif = Tarif.objects.filter(
                        analyse=analyse,
                        type_prise_en_charge='IPM',
                        ipm=patient.ipm
                    ).first()
                elif patient.type_prise_en_charge == 'ASSURANCE' and patient.assurance:
                    tarif = Tarif.objects.filter(
                        analyse=analyse,
                        type_prise_en_charge='ASSURANCE',
                        assurance=patient.assurance
                    ).first()
                else:
                    tarif = None
                
                if tarif:
                    prix = tarif.prix
                else:
                    prix = Decimal(random.randint(5000, 30000))
                
                total += prix
                lignes_data.append({
                    'analyse': analyse,
                    'prix': prix
                })
            
            # Créer le devis
            devis, created = Devis.objects.get_or_create(
                id=f'DEV-{numero}',
                defaults={
                    'numero': numero,
                    'patient': patient,
                    'total': total,
                    'souscripteur': patient.nom_complet if random.choice([True, False]) else None,
                    'taux_couverture': random.choice(taux_couverture_options) if random.choice([True, False]) else None,
                }
            )
            
            if created:
                # Créer les lignes de devis
                for ligne_data in lignes_data:
                    DevisLigne.objects.create(
                        id=str(uuid.uuid4()),
                        devis=devis,
                        analyse=ligne_data['analyse'],
                        prix=ligne_data['prix']
                    )
                
                self.stdout.write(f'  [OK] Devis cree: {devis.numero} - {patient.nom_complet} (Total: {total} FCFA)')

        self.stdout.write(self.style.SUCCESS('\n[OK] Peuplement de la base de donnees termine avec succes!'))
        self.stdout.write(f'\nRésumé:')
        self.stdout.write(f'  - Analyses: {Analyse.objects.count()}')
        self.stdout.write(f'  - IPM: {IPM.objects.count()}')
        self.stdout.write(f'  - Assurances: {Assurance.objects.count()}')
        self.stdout.write(f'  - Tarifs: {Tarif.objects.count()}')
        self.stdout.write(f'  - Patients: {Patient.objects.count()}')
        self.stdout.write(f'  - Devis: {Devis.objects.count()}')
        self.stdout.write(f'  - Lignes de devis: {DevisLigne.objects.count()}')

