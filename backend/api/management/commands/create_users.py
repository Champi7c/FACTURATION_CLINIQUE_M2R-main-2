"""
Crée les utilisateurs par défaut pour se connecter à l'application.
Usage: python manage.py create_users
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Crée les utilisateurs par défaut (admin et manager) pour la connexion'

    def handle(self, *args, **options):
        # Super admin
        superadmin_username = 'administrateur'
        superadmin_password = 'FACTURATION2025'

        if User.objects.filter(username=superadmin_username).exists():
            u = User.objects.get(username=superadmin_username)
            u.set_password(superadmin_password)
            u.is_superuser = True
            u.is_staff = True
            u.save()
            self.stdout.write(self.style.SUCCESS(f"[OK] Utilisateur '{superadmin_username}' mis a jour"))
        else:
            User.objects.create_superuser(superadmin_username, '', superadmin_password)
            self.stdout.write(self.style.SUCCESS(f"[OK] Super admin cree : {superadmin_username}"))

        # Manager
        manager_username = 'manager'
        manager_password = 'FACTURATION2025'

        if User.objects.filter(username=manager_username).exists():
            u = User.objects.get(username=manager_username)
            u.set_password(manager_password)
            u.save()
            self.stdout.write(self.style.SUCCESS(f"[OK] Utilisateur '{manager_username}' mis a jour"))
        else:
            User.objects.create_user(username=manager_username, password=manager_password)
            self.stdout.write(self.style.SUCCESS(f"[OK] Manager cree : {manager_username}"))

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("=" * 50))
        self.stdout.write(self.style.SUCCESS("COORDONNEES DE CONNEXION"))
        self.stdout.write(self.style.SUCCESS("=" * 50))
        self.stdout.write("")
        self.stdout.write("  Super Admin (tous les droits) :")
        self.stdout.write(f"    Nom d'utilisateur : {superadmin_username}")
        self.stdout.write(f"    Mot de passe      : {superadmin_password}")
        self.stdout.write("")
        self.stdout.write("  Manager :")
        self.stdout.write(f"    Nom d'utilisateur : {manager_username}")
        self.stdout.write(f"    Mot de passe      : {manager_password}")
        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("=" * 50))
