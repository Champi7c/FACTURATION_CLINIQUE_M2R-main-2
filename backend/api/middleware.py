"""
Middleware personnalisé pour la sécurité de l'API
"""
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from django.core.exceptions import SuspiciousOperation
from django.middleware.csrf import CsrfViewMiddleware
import logging
import json

logger = logging.getLogger('api.security')


class DisableCSRFForAuth(MiddlewareMixin):
    """
    Désactive la vérification CSRF pour toute l'API (REST + JWT).
    Le frontend React est sur un autre port/origine ; la sécurité est assurée par JWT.
    """
    def process_request(self, request):
        if request.path.startswith('/api/'):
            setattr(request, '_dont_enforce_csrf_checks', True)
            setattr(request, 'csrf_processing_done', True)
        return None


class CsrfExemptApiMiddleware(CsrfViewMiddleware):
    """
    Même que CsrfViewMiddleware mais n'applique pas la vérification CSRF pour /api/.
    Placé à la place de CsrfViewMiddleware dans MIDDLEWARE.
    """
    def process_view(self, request, callback, callback_args, callback_kwargs):
        if request.path.startswith('/api/'):
            return None  # Ne pas vérifier le CSRF pour l'API
        return super().process_view(request, callback, callback_args, callback_kwargs)


class SecurityHeadersMiddleware(MiddlewareMixin):
    """
    Ajoute des headers de sécurité supplémentaires aux réponses
    """
    def process_response(self, request, response):
        # Headers de sécurité supplémentaires
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # Désactiver la mise en cache pour les réponses sensibles
        if request.path.startswith('/api/'):
            response['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
            response['Pragma'] = 'no-cache'
            response['Expires'] = '0'
        
        return response


class InputValidationMiddleware(MiddlewareMixin):
    """
    Valide et nettoie les entrées pour protéger contre les injections
    """
    def process_request(self, request):
        # Vérifier la taille des requêtes pour éviter les attaques DoS
        if request.method in ['POST', 'PUT', 'PATCH']:
            content_length = request.META.get('CONTENT_LENGTH', 0)
            try:
                content_length = int(content_length)
                # Limiter à 10MB
                if content_length > 10 * 1024 * 1024:
                    logger.warning(f"Requête trop volumineuse: {content_length} bytes depuis {request.META.get('REMOTE_ADDR')}")
                    return JsonResponse(
                        {'error': 'Requête trop volumineuse'},
                        status=413
                    )
            except (ValueError, TypeError):
                pass
            
            # Valider le Content-Type pour les requêtes JSON
            if request.content_type and 'application/json' in request.content_type:
                try:
                    # Tenter de parser le JSON pour détecter les malformations
                    if hasattr(request, 'body') and request.body:
                        json.loads(request.body)
                except json.JSONDecodeError:
                    logger.warning(f"JSON invalide depuis {request.META.get('REMOTE_ADDR')}")
                    return JsonResponse(
                        {'error': 'Format JSON invalide'},
                        status=400
                    )
        
        return None

