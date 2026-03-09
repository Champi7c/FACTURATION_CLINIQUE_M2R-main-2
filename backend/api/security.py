"""
Module de sécurité pour protéger l'application contre les attaques
"""
import time
import logging
from django.core.cache import cache
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger('api.security')


class RateLimiter:
    """
    Système de limitation de débit pour protéger contre les attaques par force brute
    """
    
    def __init__(self, max_attempts=5, window_seconds=300, lockout_duration=900):
        """
        Args:
            max_attempts: Nombre maximum de tentatives autorisées
            window_seconds: Fenêtre de temps en secondes pour compter les tentatives
            lockout_duration: Durée du verrouillage en secondes après dépassement
        """
        self.max_attempts = max_attempts
        self.window_seconds = window_seconds
        self.lockout_duration = lockout_duration
    
    def is_allowed(self, identifier):
        """
        Vérifie si une tentative est autorisée pour un identifiant donné
        
        Args:
            identifier: Identifiant unique (IP, username, etc.)
        
        Returns:
            tuple: (is_allowed: bool, remaining_attempts: int, lockout_until: datetime or None)
        """
        cache_key_attempts = f'rate_limit_attempts_{identifier}'
        cache_key_lockout = f'rate_limit_lockout_{identifier}'
        
        # Vérifier si l'identifiant est verrouillé
        lockout_until = cache.get(cache_key_lockout)
        if lockout_until:
            if timezone.now() < lockout_until:
                remaining_seconds = (lockout_until - timezone.now()).total_seconds()
                logger.warning(f"Tentative bloquée pour {identifier} - Verrouillé jusqu'à {lockout_until}")
                return False, 0, lockout_until
            else:
                # Le verrouillage a expiré, le supprimer
                cache.delete(cache_key_lockout)
        
        # Récupérer le nombre de tentatives
        attempts_data = cache.get(cache_key_attempts, {'count': 0, 'first_attempt': timezone.now()})
        
        # Vérifier si la fenêtre de temps a expiré
        time_since_first = (timezone.now() - attempts_data['first_attempt']).total_seconds()
        if time_since_first > self.window_seconds:
            # Réinitialiser le compteur
            attempts_data = {'count': 0, 'first_attempt': timezone.now()}
        
        # Vérifier si le maximum est atteint
        if attempts_data['count'] >= self.max_attempts:
            # Verrouiller l'identifiant
            lockout_until = timezone.now() + timedelta(seconds=self.lockout_duration)
            cache.set(cache_key_lockout, lockout_until, self.lockout_duration)
            cache.delete(cache_key_attempts)
            logger.warning(f"Verrouillage activé pour {identifier} jusqu'à {lockout_until}")
            return False, 0, lockout_until
        
        remaining_attempts = self.max_attempts - attempts_data['count']
        return True, remaining_attempts, None
    
    def record_attempt(self, identifier, success=False):
        """
        Enregistre une tentative (réussie ou échouée)
        
        Args:
            identifier: Identifiant unique
            success: True si la tentative a réussi
        """
        if success:
            # En cas de succès, réinitialiser le compteur
            cache_key_attempts = f'rate_limit_attempts_{identifier}'
            cache.delete(cache_key_attempts)
            cache_key_lockout = f'rate_limit_lockout_{identifier}'
            cache.delete(cache_key_lockout)
            logger.info(f"Tentative réussie pour {identifier} - Compteur réinitialisé")
        else:
            # En cas d'échec, incrémenter le compteur
            cache_key = f'rate_limit_attempts_{identifier}'
            attempts_data = cache.get(cache_key, {'count': 0, 'first_attempt': timezone.now()})
            
            # Vérifier si la fenêtre de temps a expiré
            time_since_first = (timezone.now() - attempts_data['first_attempt']).total_seconds()
            if time_since_first > self.window_seconds:
                attempts_data = {'count': 0, 'first_attempt': timezone.now()}
            
            attempts_data['count'] += 1
            cache.set(cache_key, attempts_data, self.window_seconds)
            logger.warning(f"Tentative échouée pour {identifier} - Compteur: {attempts_data['count']}/{self.max_attempts}")


def get_client_ip(request):
    """
    Récupère l'adresse IP réelle du client
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR', 'unknown')
    return ip


def log_security_event(event_type, request, details=None, user=None):
    """
    Enregistre un événement de sécurité dans les logs
    
    Args:
        event_type: Type d'événement (ex: 'failed_login', 'suspicious_activity')
        request: Objet request Django
        details: Détails supplémentaires
        user: Utilisateur concerné (si applicable)
    """
    ip = get_client_ip(request)
    user_agent = request.META.get('HTTP_USER_AGENT', 'unknown')
    
    log_message = f"{event_type} - IP: {ip}, User: {user.username if user else 'anonymous'}, Details: {details}"
    
    if event_type in ['failed_login', 'brute_force_attempt', 'suspicious_activity']:
        logger.warning(log_message)
    else:
        logger.info(log_message)


# Instance globale du rate limiter pour l'authentification
login_rate_limiter = RateLimiter(max_attempts=5, window_seconds=300, lockout_duration=900)
