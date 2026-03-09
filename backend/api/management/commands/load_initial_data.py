"""
Commande pour recharger les données initiales : vide la base puis repopule.
- Analyses : chargées depuis backend/sql/analyses.sql
- IPM, assurances, tarifs, patients, devis : créés par populate_db

Usage: python manage.py load_initial_data
       python manage.py load_initial_data --no-input  (sans confirmation)
"""
from pathlib import Path

from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.conf import settings
from django.db import connection


SQL_DIR = Path(settings.BASE_DIR) / 'sql'
ANALYSES_SCRIPT = SQL_DIR / 'analyses.sql'


def load_analyses_from_sql(stdout, style):
    """Exécute l'INSERT INTO analyses du fichier sql/analyses.sql."""
    if not ANALYSES_SCRIPT.exists():
        stdout.write(style.WARNING(f'Fichier introuvable : {ANALYSES_SCRIPT} — analyses non chargées.'))
        return 0
    sql = ANALYSES_SCRIPT.read_text(encoding='utf-8')
    # Extraire uniquement l'instruction INSERT INTO `analyses` ... (jusqu'au );)
    start = sql.find('INSERT INTO `analyses`')
    if start == -1:
        start = sql.find('INSERT INTO analyses')
    if start == -1:
        stdout.write(style.WARNING('Aucun INSERT INTO analyses trouvé dans le fichier.'))
        return 0
    end = sql.find(');', start) + 2
    insert_sql = sql[start:end]
    # Compatibilité SQLite : MySQL échappe les apostrophes avec \', SQLite attend ''
    insert_sql = insert_sql.replace("\\'", "''")
    with connection.cursor() as cursor:
        cursor.execute(insert_sql)
        count = getattr(cursor, 'rowcount', -1) or -1
    stdout.write(style.SUCCESS(f'  — {count if count >= 0 else "?"} analyse(s) chargée(s) depuis sql/analyses.sql'))
    return count


class Command(BaseCommand):
    help = 'Vide la base puis recharge les données (analyses depuis sql/analyses.sql + IPM, assurances, etc.)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--no-input',
            '--noinput',
            action='store_true',
            dest='no_input',
            help='Ne pas demander de confirmation',
        )

    def handle(self, *args, **options):
        no_input = options['no_input']

        if not no_input:
            confirm = input(
                'Vider toutes les données puis recharger les données initiales ? [y/N] '
            )
            if confirm.lower() not in ('y', 'yes', 'o', 'oui'):
                self.stdout.write(self.style.WARNING('Opération annulée.'))
                return

        self.stdout.write(self.style.WARNING('1/3 — Vidage des données...'))
        call_command('clear_all_data', no_input=True)
        self.stdout.write('')

        self.stdout.write(self.style.WARNING('2/3 — Chargement des analyses depuis sql/analyses.sql...'))
        load_analyses_from_sql(self.stdout, self.style)
        self.stdout.write('')

        self.stdout.write(self.style.WARNING('3/3 — Chargement IPM, assurances, tarifs, patients, devis...'))
        call_command('populate_db', skip_analyses=True)
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('Données rechargées avec succès.'))
