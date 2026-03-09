"""
Restaure les analyses d'origine (liste clinique du frontend DataContext).
Usage: python manage.py restore_analyses_original
       python manage.py restore_analyses_original --clear  (supprime les analyses actuelles puis restaure)
"""
from django.core.management.base import BaseCommand
from api.models import Analyse, Tarif, DevisLigne

# Liste d'origine (nom, categorie) - meme liste que frontend/src/context/DataContext.js
ANALYSES_ORIGINALES = [
    ('Numération formule (NFS)', 'analyses'),
    ('Vitesse de sédimentation (VS)', 'analyses'),
    ("Test d'Emmel (TE)", 'analyses'),
    ('Groupage sanguin (GSRH)', 'analyses'),
    ('Temps de segment (TS)', 'analyses'),
    ('Temps de Coagulation ou Temps de Cephalines Koaline ou Active (TC ou TCK ou TCA)', 'analyses'),
    ('Fibrinémie', 'analyses'),
    ('Taux de Prothrombine (TP)', 'analyses'),
    ('Combis direct ou indirect', 'analyses'),
    ("Recherche Agglutinines Irrégulière (RAI)", 'analyses'),
    ('Amylasémie', 'analyses'),
    ('Amylasurie', 'analyses'),
    ('Alpha-amylase', 'analyses'),
    ('Fer sérique', 'analyses'),
    ('Hémoglobine glycosylée ou glyquée', 'analyses'),
    ('Glycémie a jeun', 'analyses'),
    ('Azotémie ou urée', 'analyses'),
    ('Créatinémie ou créatinine', 'analyses'),
    ('Clairance créatinine', 'analyses'),
    ('Urines (alb-sucre-cc)', 'analyses'),
    ('Protéines de 24 heures', 'analyses'),
    ('Microalbiminurie', 'analyses'),
    ('Glycosurie des 24 heures', 'analyses'),
    ('Albuminémie', 'analyses'),
    ('Protidémie', 'analyses'),
    ('Magnésium', 'analyses'),
    ('Ionogramme urinaire', 'analyses'),
    ('Ionogramme sanguin', 'analyses'),
    ('Transminases (TGO/TGP ou ASAT/ALAT)', 'analyses'),
    ('Bilirubine (directe et indirecte ou conjuguée et totale)', 'analyses'),
    ('Acide urique ou uricémie', 'analyses'),
    ('Calcium', 'analyses'),
    ('Phosphore', 'analyses'),
    ('Cholestérol total', 'analyses'),
    ('HDL cholestérol', 'analyses'),
    ('LDL cholestérol', 'analyses'),
    ('Triglycérides', 'analyses'),
    ('Lipides totaux', 'analyses'),
    ('Bilan lipidique (chol. Total, HDL, LDL, TG, Lipides totaux)', 'analyses'),
    ('Hyperglycémie provoquée par voie orale (HPVO)', 'analyses'),
    ('Acide vanilmandélique (VMA)', 'analyses'),
    ("Electrophorèse de l'hémoglobine", 'analyses'),
    ('Electrophorèse des protéines', 'analyses'),
    ('Phospholipase alcaline (PAL)', 'analyses'),
    ('Phospholipase acide (PAC)', 'analyses'),
    ('Lactate déshydrogènase (LDH)', 'analyses'),
    ('Créatinine kinase (CK)', 'analyses'),
    ('Gammaglutamyltranférase (Gamma GT)', 'analyses'),
    ('BW ou RPR', 'analyses'),
    ('TPHA', 'analyses'),
    ('Sérologie syphilitique (BW + TPHA)', 'analyses'),
    ('Antistreptolysine O (ASLO)', 'analyses'),
    ('Protéine C réactive (CRP)', 'analyses'),
    ('Latex Waler Rose (LWR ou WR)', 'analyses'),
    ('Sérodiagnostic de Widal et Félix (SWF ou WF)', 'analyses'),
    ('Test de Wide ou Béta HCG', 'analyses'),
    ('Mononucléose infectieuse (MNI)', 'analyses'),
    ('Antistreptodornase B (ASDOR B)', 'analyses'),
    ('Sérologie amibienne', 'analyses'),
    ('Alpha-Foeto-Protéine (AFP)', 'analyses'),
    ('Ferritine', 'analyses'),
    ('Toxoplasmose (Ig M et Ig G)', 'analyses'),
    ('Rubéole (Ig M et Ig G)', 'analyses'),
    ('Chlamydiae', 'analyses'),
    ('Antigène HBS', 'analyses'),
    ('Sérologie rétrovirale (HIV ou TME)', 'analyses'),
    ('Antigène HBE', 'analyses'),
    ('Anticorps anti-HBC (Ac anti-HBC)', 'analyses'),
    ('Anticorps anti-HVC (Ac anti-HVC)', 'analyses'),
    ('Anticorps anti-HBE (Ac anti-HBE)', 'analyses'),
    ('Anticorps anti-HBS (Ac anti-HBS)', 'analyses'),
    ('PSA', 'analyses'),
    ('Progestérone', 'analyses'),
    ('Prolactine', 'analyses'),
    ('Œstradiol', 'analyses'),
    ('FSH', 'analyses'),
    ('LH', 'analyses'),
    ('T3 libre', 'analyses'),
    ('T4 libre', 'analyses'),
    ('TSH ultra-sensible', 'analyses'),
    ('T3l-T4l-TSHu', 'analyses'),
    ('testostérone', 'analyses'),
    ('Prélèvement Vaginal (P.V.)', 'analyses'),
    ('ECBU ou Uroculture', 'analyses'),
    ('Coproculture', 'analyses'),
    ('Recherche Chlamydia', 'analyses'),
    ('ECB-LCR', 'analyses'),
    ('ECB-PUS', 'analyses'),
    ('ECB-Prélèvement de gorge', 'analyses'),
    ('ECB-Prélèvement auriculaire', 'analyses'),
    ('ECB-Prélèvement oculaire', 'analyses'),
    ('Spermogramme', 'analyses'),
    ('ECB-Prélèvement de sonde', 'analyses'),
    ('ECB-Prélèvement urétral', 'analyses'),
    ("ECB-Liquide d'ascite", 'analyses'),
    ('ECB-Liquide pleural', 'analyses'),
    ('ECB-Liquide de ponction', 'analyses'),
    ('Mycoplasmes', 'analyses'),
    ('Recherche de BK', 'analyses'),
    ('Hémoculture', 'analyses'),
    ('KAOP ou Selles KAOP', 'analyses'),
    ('GOUTTE EPAISSE (GE)', 'analyses'),
    ('CULOT URINAIRE', 'analyses'),
    ('Recherche de Microfilaires', 'analyses'),
    ("Compte d'ADDIS ou HLM", 'analyses'),
    ("ECC Liquide d'ascite", 'analyses'),
    ('ECC-LCR', 'analyses'),
    ('TROPONINE', 'analyses'),
    ('DDIMERE', 'analyses'),
    ('CHARGE VIRALE', 'analyses'),
    ('ECHOGRAPHIE MAMAIRE', 'radiographie'),
    ('ECHOGRAPHIE THYROIDIENNE', 'radiographie'),
    ('ECHOGRAPHIE DES TISSUS MOUS', 'radiographie'),
    ('ECHOGRAPHIE ABDOMINAL', 'radiographie'),
    ('ECHOGRAPHIE ABDOMINO-PELVIENNE', 'radiographie'),
    ('ECHOGRAPHIE DOPPLER VASCULAIRE', 'radiographie'),
    ('ECHOGRAPHIE CARDIAQUE', 'radiographie'),
    ('ECHOGRAPHIE TESTICULAIRE', 'radiographie'),
    ('ELECTROCARDIOGRAMME', 'radiographie'),
    ('FIBROSCOPIE O.G.D', 'radiographie'),
    ('CHAMBRE à 2 LITS', 'hospitalisation'),
    ('CHAMBRE INDIVIDUELLE', 'hospitalisation'),
    ('ACCOUCHEMENT', 'maternite'),
    ('ACCOUCHEMENT GEMELLAIRE', 'maternite'),
    ('PERINEORRAPHIE', 'maternite'),
    ('CONSULTATION SIMPLE', 'consultations'),
    ('CONSULTATION NUIT', 'consultations'),
    ('CONSULTATION SPECIALISTE', 'consultations'),
    ('CONSULTATION SPECIALISTE SAMEDI APRES MIDI ET FERIE', 'consultations'),
    ('CONSULTATION SAMEDI APRES MIDI ET FERIE', 'consultations'),
]


class Command(BaseCommand):
    help = 'Restaure les analyses d\'origine (liste clinique avant suppression)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Supprimer toutes les analyses existantes avant de restaurer',
        )

    def handle(self, *args, **options):
        if options['clear']:
            n_lignes = DevisLigne.objects.count()
            n_tarifs = Tarif.objects.count()
            n_analyses = Analyse.objects.count()
            DevisLigne.objects.all().delete()
            Tarif.objects.all().delete()
            Analyse.objects.all().delete()
            self.stdout.write(self.style.WARNING(
                f'Supprime {n_lignes} lignes de devis, {n_tarifs} tarifs, {n_analyses} analyses.'))

        self.stdout.write('Restauration des analyses d\'origine...')
        created = 0
        for i, (nom, categorie) in enumerate(ANALYSES_ORIGINALES, 1):
            anal_id = f'ANAL-ORIG-{i:03d}'
            obj, created_flag = Analyse.objects.get_or_create(
                id=anal_id,
                defaults={'nom': nom, 'categorie': categorie}
            )
            if created_flag:
                created += 1
            else:
                obj.nom = nom
                obj.categorie = categorie
                obj.save()

        self.stdout.write(self.style.SUCCESS(f'[OK] {len(ANALYSES_ORIGINALES)} analyses (dont {created} nouvelles).'))
        self.stdout.write(f'Total en base: {Analyse.objects.count()}')
