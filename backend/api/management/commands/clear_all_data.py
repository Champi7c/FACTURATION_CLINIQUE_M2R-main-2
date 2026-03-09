"""
Commande Django pour supprimer toutes les données de la plateforme.
Utilise le script SQL du dossier backend/sql/ (source unique pour les données).

Supprime : Devis (lignes), Patients, Tarifs, Analyses, IPM, Assurances, Catégories.

Usage: python manage.py clear_all_data
       python manage.py clear_all_data --no-input  (sans confirmation)
"""
from pathlib import Path

from django.core.management.base import BaseCommand
from django.conf import settings
from django.db import connection


SQL_DIR = Path(settings.BASE_DIR) / 'sql'
CLEAR_SCRIPT = SQL_DIR / 'clear_all_data.sql'


class Command(BaseCommand):
    help = 'Supprime toutes les données de la plateforme via backend/sql/clear_all_data.sql'

    def add_arguments(self, parser):
        parser.add_argument(
            '--no-input',
            '--noinput',
            action='store_true',
            dest='no_input',
            help='Ne pas demander de confirmation',
        )

    def handle(self, *args, **options):
        if not options['no_input']:
            confirm = input(
                'Êtes-vous sûr de vouloir supprimer TOUTES les données '
                '(analyses, IPM, assurances, tarifs, patients, devis) ? [y/N] '
            )
            if confirm.lower() not in ('y', 'yes', 'o', 'oui'):
                self.stdout.write(self.style.WARNING('Opération annulée.'))
                return

        if not CLEAR_SCRIPT.exists():
            self.stdout.write(
                self.style.ERROR(f'Script SQL introuvable : {CLEAR_SCRIPT}')
            )
            return

        self.stdout.write(self.style.WARNING('Suppression des données via sql/clear_all_data.sql...'))

        sql = CLEAR_SCRIPT.read_text(encoding='utf-8')
        # Supprimer les lignes de commentaires (-- ...) puis découper par ;
        lines = [line for line in sql.split('\n') if not line.strip().startswith('--')]
        sql_clean = '\n'.join(lines)
        statements = [s.strip() for s in sql_clean.split(';') if s.strip()]

        with connection.cursor() as cursor:
            for stmt in statements:
                if stmt:
                    cursor.execute(stmt)

        self.stdout.write(self.style.SUCCESS('Toutes les données ont été supprimées avec succès.'))
