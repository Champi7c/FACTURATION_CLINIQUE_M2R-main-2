"""
Script pour créer les utilisateurs initiaux :
- Super admin : administrateur / FACTURATION2025
- Manager : Clinique naby / FACTURATION2025
"""
import os
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'facturation_clinique.settings')
django.setup()

from django.contrib.auth.models import User

def create_users():
    """Créer les utilisateurs initiaux"""
    
    # Super admin
    superadmin_username = 'administrateur'
    superadmin_password = 'FACTURATION2025'
    
    if User.objects.filter(username=superadmin_username).exists():
        print(f"✅ L'utilisateur '{superadmin_username}' existe déjà")
        superadmin = User.objects.get(username=superadmin_username)
        superadmin.set_password(superadmin_password)
        superadmin.is_superuser = True
        superadmin.is_staff = True
        superadmin.save()
        print(f"   Mot de passe mis à jour")
    else:
        superadmin = User.objects.create_user(
            username=superadmin_username,
            password=superadmin_password,
            is_superuser=True,
            is_staff=True
        )
        print(f"✅ Super admin créé : {superadmin_username}")
    
    # Manager
    manager_username = 'Clinique naby'
    manager_password = 'FACTURATION2025'
    
    if User.objects.filter(username=manager_username).exists():
        print(f"✅ L'utilisateur '{manager_username}' existe déjà")
        manager = User.objects.get(username=manager_username)
        manager.set_password(manager_password)
        manager.is_superuser = False
        manager.is_staff = False
        manager.save()
        print(f"   Mot de passe mis à jour")
    else:
        manager = User.objects.create_user(
            username=manager_username,
            password=manager_password,
            is_superuser=False,
            is_staff=False
        )
        print(f"✅ Manager créé : {manager_username}")
    
    print("\n" + "="*50)
    print("UTILISATEURS CRÉÉS/MIS À JOUR :")
    print("="*50)
    print(f"Super Admin:")
    print(f"  Nom d'utilisateur: {superadmin_username}")
    print(f"  Mot de passe: {superadmin_password}")
    print(f"  Super utilisateur: Oui")
    print()
    print(f"Manager:")
    print(f"  Nom d'utilisateur: {manager_username}")
    print(f"  Mot de passe: {manager_password}")
    print(f"  Super utilisateur: Non")
    print("="*50)

if __name__ == '__main__':
    create_users()

