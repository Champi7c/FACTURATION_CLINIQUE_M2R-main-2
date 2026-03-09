"""
Validateurs de sécurité pour protéger contre les injections et les attaques
"""
import re
import logging
from django.core.exceptions import ValidationError
from django.utils.html import strip_tags

logger = logging.getLogger('api.security')


def sanitize_string(value, max_length=500):
    """
    Nettoie et valide une chaîne de caractères
    
    Args:
        value: Valeur à nettoyer
        max_length: Longueur maximale autorisée
    
    Returns:
        str: Chaîne nettoyée
    
    Raises:
        ValidationError: Si la valeur est invalide
    """
    if not isinstance(value, str):
        value = str(value)
    
    # Supprimer les balises HTML/XML pour éviter XSS
    value = strip_tags(value)
    
    # Supprimer les caractères de contrôle
    value = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', value)
    
    # Limiter la longueur
    if len(value) > max_length:
        logger.warning(f"Chaîne trop longue: {len(value)} caractères (max: {max_length})")
        raise ValidationError(f'La valeur ne peut pas dépasser {max_length} caractères')
    
    # Vérifier les patterns suspects d'injection SQL
    sql_patterns = [
        r'(?i)(union\s+select|select\s+.*\s+from|insert\s+into|delete\s+from|drop\s+table|exec\s+|execute\s+)',
        r'(?i)(--|/\*|\*/|;|xp_|sp_)',
    ]
    
    for pattern in sql_patterns:
        if re.search(pattern, value):
            logger.warning(f"Pattern SQL suspect détecté: {value[:50]}")
            raise ValidationError('Caractères non autorisés détectés')
    
    return value.strip()


def validate_numeric(value, min_value=None, max_value=None):
    """
    Valide une valeur numérique
    
    Args:
        value: Valeur à valider
        min_value: Valeur minimale
        max_value: Valeur maximale
    
    Returns:
        float: Valeur validée
    
    Raises:
        ValidationError: Si la valeur est invalide
    """
    try:
        num_value = float(value)
    except (ValueError, TypeError):
        raise ValidationError('Valeur numérique invalide')
    
    if min_value is not None and num_value < min_value:
        raise ValidationError(f'La valeur doit être supérieure ou égale à {min_value}')
    
    if max_value is not None and num_value > max_value:
        raise ValidationError(f'La valeur doit être inférieure ou égale à {max_value}')
    
    return num_value


def validate_uuid(value):
    """
    Valide un UUID
    
    Args:
        value: UUID à valider
    
    Returns:
        str: UUID validé
    
    Raises:
        ValidationError: Si l'UUID est invalide
    """
    import uuid as uuid_module
    
    if not isinstance(value, str):
        value = str(value)
    
    try:
        uuid_module.UUID(value)
        return value
    except (ValueError, TypeError):
        raise ValidationError('Format UUID invalide')


def sanitize_input(data, field_validators=None):
    """
    Nettoie un dictionnaire de données d'entrée
    
    Args:
        data: Dictionnaire de données
        field_validators: Dictionnaire de validateurs par champ
    
    Returns:
        dict: Données nettoyées
    """
    if field_validators is None:
        field_validators = {}
    
    cleaned_data = {}
    
    for key, value in data.items():
        # Limiter la longueur des clés
        if len(key) > 100:
            logger.warning(f"Clé trop longue: {key[:50]}")
            continue
        
        # Appliquer le validateur spécifique si disponible
        if key in field_validators:
            try:
                cleaned_data[key] = field_validators[key](value)
            except ValidationError as e:
                logger.warning(f"Erreur de validation pour {key}: {e}")
                raise
        elif isinstance(value, str):
            # Nettoyer les chaînes par défaut
            try:
                cleaned_data[key] = sanitize_string(value)
            except ValidationError:
                # Si la validation échoue, ne pas inclure le champ
                logger.warning(f"Champ {key} ignoré après échec de validation")
        else:
            cleaned_data[key] = value
    
    return cleaned_data
