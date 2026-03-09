"""
Permissions personnalisées pour différencier les administrateurs et les managers
"""
from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """
    Permission qui permet uniquement aux administrateurs (superusers) d'accéder.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_superuser


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permission qui permet la lecture à tous les utilisateurs authentifiés,
    mais la modification uniquement aux administrateurs.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and request.user.is_superuser


class IsAdminOrManager(permissions.BasePermission):
    """
    Permission qui permet l'accès aux administrateurs et aux managers.
    Les administrateurs ont tous les droits, les managers ont des droits limités.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

