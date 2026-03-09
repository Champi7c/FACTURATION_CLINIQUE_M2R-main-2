from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.middleware.csrf import get_token
from functools import wraps
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from .models import Categorie, Analyse, IPM, Assurance, Tarif, Patient, Devis, DevisLigne
from .serializers import (
    AnalyseSerializer, IPMSerializer, AssuranceSerializer,
    TarifSerializer, PatientSerializer, DevisSerializer, DevisCreateSerializer
)
from .permissions import IsAdminUser, IsAdminOrReadOnly, IsAdminOrManager
import uuid


class AnalyseViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les analyses.
    Toutes les données sont partagées entre tous les utilisateurs authentifiés
    (Super Admin et Manager voient les mêmes données).
    """
    queryset = Analyse.objects.all()
    serializer_class = AnalyseSerializer
    permission_classes = [IsAdminOrManager]
    
    def create(self, request, *args, **kwargs):
        # Générer un ID si non fourni
        if 'id' not in request.data or not request.data['id']:
            request.data['id'] = str(uuid.uuid4())
        return super().create(request, *args, **kwargs)


class IPMViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les IPM.
    Toutes les données sont partagées entre tous les utilisateurs authentifiés.
    """
    queryset = IPM.objects.all()
    serializer_class = IPMSerializer
    permission_classes = [IsAdminOrManager]
    
    def create(self, request, *args, **kwargs):
        # Générer un ID si non fourni
        if 'id' not in request.data or not request.data['id']:
            request.data['id'] = str(uuid.uuid4())
        return super().create(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def activate(self, request, pk=None):
        """Activer une IPM (superadmin uniquement)"""
        ipm = self.get_object()
        ipm.actif = True
        ipm.save()
        serializer = self.get_serializer(ipm)
        return Response({
            'message': f'IPM "{ipm.nom}" activée avec succès',
            'ipm': serializer.data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def deactivate(self, request, pk=None):
        """Désactiver une IPM (superadmin uniquement)"""
        ipm = self.get_object()
        ipm.actif = False
        ipm.save()
        serializer = self.get_serializer(ipm)
        return Response({
            'message': f'IPM "{ipm.nom}" désactivée avec succès',
            'ipm': serializer.data
        })


class AssuranceViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les assurances.
    Toutes les données sont partagées entre tous les utilisateurs authentifiés.
    """
    queryset = Assurance.objects.all()
    serializer_class = AssuranceSerializer
    permission_classes = [IsAdminOrManager]
    
    def create(self, request, *args, **kwargs):
        # Générer un ID si non fourni
        if 'id' not in request.data or not request.data['id']:
            request.data['id'] = str(uuid.uuid4())
        return super().create(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def activate(self, request, pk=None):
        """Activer une assurance (superadmin uniquement)"""
        assurance = self.get_object()
        assurance.actif = True
        assurance.save()
        serializer = self.get_serializer(assurance)
        return Response({
            'message': f'Assurance "{assurance.nom}" activée avec succès',
            'assurance': serializer.data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def deactivate(self, request, pk=None):
        """Désactiver une assurance (superadmin uniquement)"""
        assurance = self.get_object()
        assurance.actif = False
        assurance.save()
        serializer = self.get_serializer(assurance)
        return Response({
            'message': f'Assurance "{assurance.nom}" désactivée avec succès',
            'assurance': serializer.data
        })


class TarifViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les tarifs.
    Toutes les données sont partagées entre tous les utilisateurs authentifiés.
    """
    queryset = Tarif.objects.all()
    serializer_class = TarifSerializer
    permission_classes = [IsAdminOrManager]
    
    def create(self, request, *args, **kwargs):
        # Générer un ID si non fourni
        if 'id' not in request.data or not request.data['id']:
            request.data['id'] = str(uuid.uuid4())
        return super().create(request, *args, **kwargs)


class PatientViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les patients.
    Toutes les données sont partagées entre tous les utilisateurs authentifiés.
    """
    serializer_class = PatientSerializer
    permission_classes = [IsAdminOrManager]
    
    def get_queryset(self):
        # Optimiser les requêtes avec select_related pour éviter les requêtes N+1
        return Patient.objects.select_related('ipm', 'assurance').all()
    
    def create(self, request, *args, **kwargs):
        # Générer un ID si non fourni
        if 'id' not in request.data or not request.data['id']:
            request.data['id'] = str(uuid.uuid4())
        
        # S'assurer que ipm et assurance sont None si vides
        if 'ipm' in request.data and (request.data['ipm'] == '' or request.data['ipm'] is None):
            request.data['ipm'] = None
        if 'assurance' in request.data and (request.data['assurance'] == '' or request.data['assurance'] is None):
            request.data['assurance'] = None
        
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        # S'assurer que ipm et assurance sont None si vides
        if 'ipm' in request.data and (request.data['ipm'] == '' or request.data['ipm'] is None):
            request.data['ipm'] = None
        if 'assurance' in request.data and (request.data['assurance'] == '' or request.data['assurance'] is None):
            request.data['assurance'] = None
        
        return super().update(request, *args, **kwargs)


class DevisViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les devis.
    Toutes les données sont partagées entre tous les utilisateurs authentifiés.
    La suppression est réservée aux administrateurs uniquement.
    """
    permission_classes = [IsAdminOrManager]
    
    def get_queryset(self):
        # Optimiser les requêtes avec select_related et prefetch_related pour éviter les requêtes N+1
        from django.db.models import Prefetch
        return Devis.objects.select_related(
            'patient', 
            'patient__ipm', 
            'patient__assurance'
        ).prefetch_related(
            Prefetch('lignes', queryset=DevisLigne.objects.select_related('analyse'))
        ).order_by('-date_creation')
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return DevisCreateSerializer
        return DevisSerializer
    
    def get_permissions(self):
        """
        Instancier et retourner la liste des permissions que cette vue requiert.
        La suppression est réservée aux administrateurs.
        """
        if self.action == 'destroy':
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [IsAdminOrManager]
        return [permission() for permission in permission_classes]
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = DevisSerializer(page, many=True)
            # Convertir en format camelCase pour le frontend avec les noms d'analyses
            data = []
            for devis in serializer.data:
                lignes_response = []
                for ligne_data in devis.get('lignes', []):
                    analyse_nom = ligne_data.get('analyse_nom', '') or ligne_data.get('nom', '')
                    analyse_categorie = ligne_data.get('analyse_categorie', '') or ligne_data.get('categorie', '')
                    
                    # Les données analyse_nom et analyse_categorie sont déjà dans le serializer
                    # grâce à DevisLigneSerializer qui utilise source='analyse.nom'
                    # Pas besoin de requête supplémentaire
                    
                    lignes_response.append({
                        'id': ligne_data.get('id', ''),
                        'analyseId': ligne_data.get('analyseId', '') or ligne_data.get('analyse', ''),
                        'nom': analyse_nom or 'Analyse inconnue',
                        'categorie': analyse_categorie or 'non-categorise',
                        'prix': float(ligne_data.get('prix', 0)),
                        'quantite': ligne_data.get('quantite', 1)
                    })
                
                devis_data = {
                    'id': devis['id'],
                    'numero': devis['numero'],
                    'patientId': devis['patient'],
                    'lignes': lignes_response,
                    'total': float(devis['total']),
                    'souscripteur': devis.get('souscripteur', ''),
                    'tauxCouverture': devis.get('taux_couverture', ''),
                    'dateCreation': devis['date_creation'],
                    'statutPaiement': devis.get('statut_paiement', 'NON_REGLÉ'),
                    'datePaiement': devis.get('date_paiement'),
                    'commentairePaiement': devis.get('commentaire_paiement', '')
                }
                data.append(devis_data)
            
            return self.get_paginated_response(data)
        
        serializer = DevisSerializer(queryset, many=True)
        # Convertir en format camelCase pour le frontend
        data = []
        for devis in serializer.data:
            # Construire les lignes avec les noms d'analyses depuis la base de données
            lignes_response = []
            for ligne_data in devis.get('lignes', []):
                # Si analyse_nom n'est pas dans les données, récupérer depuis la relation
                analyse_nom = ligne_data.get('analyse_nom', '') or ligne_data.get('nom', '')
                analyse_categorie = ligne_data.get('analyse_categorie', '') or ligne_data.get('categorie', '')
                
                # Les données analyse_nom et analyse_categorie sont déjà dans le serializer
                # grâce à DevisLigneSerializer qui utilise source='analyse.nom'
                # Pas besoin de requête supplémentaire
                
                lignes_response.append({
                    'id': ligne_data.get('id', ''),
                    'analyseId': ligne_data.get('analyseId', '') or ligne_data.get('analyse', ''),
                    'nom': analyse_nom or 'Analyse inconnue',
                    'categorie': analyse_categorie or 'non-categorise',
                    'prix': float(ligne_data.get('prix', 0)),
                    'quantite': ligne_data.get('quantite', 1)
                })
            
            devis_data = {
                'id': devis['id'],
                'numero': devis['numero'],
                'patientId': devis['patient'],
                'lignes': lignes_response,
                'total': float(devis['total']),
                'souscripteur': devis.get('souscripteur', ''),
                'tauxCouverture': devis.get('taux_couverture', ''),
                'dateCreation': devis['date_creation']
            }
            data.append(devis_data)
        
        return Response(data)
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = DevisSerializer(instance)
        # Convertir en format camelCase pour le frontend
        devis = serializer.data
        
        # Construire les lignes avec les noms d'analyses depuis la base de données
        lignes_response = []
        for ligne_data in devis.get('lignes', []):
            # Si analyse_nom n'est pas dans les données, récupérer depuis la relation
            analyse_nom = ligne_data.get('analyse_nom', '') or ligne_data.get('nom', '')
            analyse_categorie = ligne_data.get('analyse_categorie', '') or ligne_data.get('categorie', '')
            
            # Si les noms ne sont pas disponibles, essayer de les récupérer depuis l'objet DevisLigne
            if not analyse_nom:
                try:
                    from .models import DevisLigne
                    ligne_obj = DevisLigne.objects.get(id=ligne_data.get('id', ''))
                    if ligne_obj.analyse:
                        analyse_nom = ligne_obj.analyse.nom
                        analyse_categorie = ligne_obj.analyse.categorie
                except:
                    pass
            
            lignes_response.append({
                'id': ligne_data.get('id', ''),
                'analyseId': ligne_data.get('analyseId', '') or ligne_data.get('analyse', ''),
                'nom': analyse_nom or 'Analyse inconnue',
                'categorie': analyse_categorie or 'non-categorise',
                'prix': float(ligne_data.get('prix', 0)),
                'quantite': ligne_data.get('quantite', 1)
            })
        
        devis_data = {
            'id': devis['id'],
            'numero': devis['numero'],
            'patientId': devis['patient'],
            'lignes': lignes_response,
            'total': float(devis['total']),
            'souscripteur': devis.get('souscripteur', ''),
            'tauxCouverture': devis.get('taux_couverture', ''),
            'dateCreation': devis['date_creation'],
            'statutPaiement': devis.get('statut_paiement', 'NON_REGLÉ'),
            'datePaiement': devis.get('date_paiement'),
            'commentairePaiement': devis.get('commentaire_paiement', '')
        }
        return Response(devis_data)
    
    def create(self, request, *args, **kwargs):
        try:
            # Générer un ID si non fourni
            if 'id' not in request.data or not request.data['id']:
                request.data['id'] = str(uuid.uuid4())
            
            serializer = DevisCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            devis = serializer.save()
            
            # Retourner au format camelCase
            response_serializer = DevisSerializer(devis)
            devis_data = response_serializer.data
            
            # Construire la réponse avec gestion sécurisée des lignes
            lignes_response = []
            for ligne in devis_data.get('lignes', []):
                try:
                    analyse_nom = ligne.get('analyse_nom', '') or ligne.get('nom', '')
                    analyse_categorie = ligne.get('analyse_categorie', '') or ligne.get('categorie', '')
                    
                    # Si les noms ne sont pas disponibles, récupérer depuis la base de données
                    if not analyse_nom:
                        try:
                            from .models import DevisLigne
                            ligne_obj = DevisLigne.objects.get(id=ligne.get('id', ''))
                            if ligne_obj.analyse:
                                analyse_nom = ligne_obj.analyse.nom
                                analyse_categorie = ligne_obj.analyse.categorie
                        except:
                            pass
                    
                    lignes_response.append({
                        'id': ligne.get('id', ''),
                        'analyseId': ligne.get('analyse', '') or ligne.get('analyseId', ''),
                        'nom': analyse_nom or 'Analyse inconnue',
                        'categorie': analyse_categorie or 'non-categorise',
                        'prix': float(ligne.get('prix', 0)),
                        'quantite': ligne.get('quantite', 1)
                    })
                except (KeyError, ValueError, TypeError) as e:
                    # Si une ligne pose problème, logger mais continuer
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f"Erreur lors de la construction de la ligne: {e}, ligne data: {ligne}")
            
            return Response({
                'id': devis_data.get('id', ''),
                'numero': devis_data.get('numero', ''),
                'patientId': devis_data.get('patient', ''),
                'lignes': lignes_response,
                'total': float(devis_data.get('total', 0)),
                'souscripteur': devis_data.get('souscripteur', ''),
                'tauxCouverture': devis_data.get('taux_couverture', ''),
                'dateCreation': devis_data.get('date_creation', ''),
                'statutPaiement': devis_data.get('statut_paiement', 'NON_REGLÉ'),
                'datePaiement': devis_data.get('date_paiement'),
                'commentairePaiement': devis_data.get('commentaire_paiement', '')
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            # Logger l'erreur complète pour le débogage
            import logging
            import traceback
            logger = logging.getLogger(__name__)
            logger.error(f"Erreur lors de la création du devis: {str(e)}\n{traceback.format_exc()}")
            
            # Retourner une erreur détaillée
            return Response({
                'error': str(e),
                'detail': 'Erreur lors de la création du devis. Vérifiez les logs du serveur pour plus de détails.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = DevisCreateSerializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        devis = serializer.save()
        
        # Retourner au format camelCase
        response_serializer = DevisSerializer(devis)
        devis_data = response_serializer.data
        
        # Construire les lignes avec les noms d'analyses depuis la base de données
        lignes_response = []
        for ligne_data in devis_data.get('lignes', []):
            analyse_nom = ligne_data.get('analyse_nom', '') or ligne_data.get('nom', '')
            analyse_categorie = ligne_data.get('analyse_categorie', '') or ligne_data.get('categorie', '')
            
            # Si les noms ne sont pas disponibles, récupérer depuis la base de données
            if not analyse_nom:
                try:
                    from .models import DevisLigne
                    ligne_obj = DevisLigne.objects.get(id=ligne_data.get('id', ''))
                    if ligne_obj.analyse:
                        analyse_nom = ligne_obj.analyse.nom
                        analyse_categorie = ligne_obj.analyse.categorie
                except:
                    pass
            
            lignes_response.append({
                'id': ligne_data.get('id', ''),
                'analyseId': ligne_data.get('analyseId', '') or ligne_data.get('analyse', ''),
                'nom': analyse_nom or 'Analyse inconnue',
                'categorie': analyse_categorie or 'non-categorise',
                'prix': float(ligne_data.get('prix', 0)),
                'quantite': ligne_data.get('quantite', 1)
            })
        
        return Response({
            'id': devis_data['id'],
            'numero': devis_data['numero'],
            'patientId': devis_data['patient'],
            'lignes': lignes_response,
            'total': float(devis_data['total']),
            'souscripteur': devis_data.get('souscripteur', ''),
            'tauxCouverture': devis_data.get('taux_couverture', ''),
            'dateCreation': devis_data['date_creation'],
            'statutPaiement': devis_data.get('statut_paiement', 'NON_REGLÉ'),
            'datePaiement': devis_data.get('date_paiement'),
            'commentairePaiement': devis_data.get('commentaire_paiement', '')
        })
    
    @action(detail=True, methods=['patch'], url_path='update-paiement')
    def update_paiement(self, request, pk=None):
        """Mettre à jour le statut de paiement d'un devis"""
        devis = self.get_object()
        
        statut_paiement = request.data.get('statutPaiement') or request.data.get('statut_paiement')
        date_paiement = request.data.get('datePaiement') or request.data.get('date_paiement')
        commentaire_paiement = request.data.get('commentairePaiement') or request.data.get('commentaire_paiement')
        
        if statut_paiement:
            devis.statut_paiement = statut_paiement
        if date_paiement:
            devis.date_paiement = date_paiement
        if commentaire_paiement is not None:
            devis.commentaire_paiement = commentaire_paiement
        
        devis.save()
        
        # Retourner le devis mis à jour
        serializer = DevisSerializer(devis)
        devis_data = serializer.data
        
        return Response({
            'id': devis_data['id'],
            'numero': devis_data['numero'],
            'patientId': devis_data['patient'],
            'total': float(devis_data['total']),
            'souscripteur': devis_data.get('souscripteur', ''),
            'tauxCouverture': devis_data.get('taux_couverture', ''),
            'dateCreation': devis_data['date_creation'],
            'statutPaiement': devis_data.get('statut_paiement', 'NON_REGLÉ'),
            'datePaiement': devis_data.get('date_paiement'),
            'commentairePaiement': devis_data.get('commentaire_paiement', '')
        })


# Vues d'authentification avec JWT
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Vue pour l'authentification des utilisateurs avec JWT - Protégée contre les attaques par force brute"""
    from .security import login_rate_limiter, get_client_ip, log_security_event
    
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '')
    
    # Validation des entrées
    if not username or not password:
        return Response(
            {'error': 'Nom d\'utilisateur et mot de passe requis'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Limiter la longueur des entrées pour éviter les attaques
    if len(username) > 150 or len(password) > 128:
        log_security_event('suspicious_activity', request, 
                          f'Entrées trop longues - username: {len(username)}, password: {len(password)}')
        return Response(
            {'error': 'Données invalides'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Identifier pour le rate limiting (IP + username)
    client_ip = get_client_ip(request)
    identifier = f"{client_ip}_{username}"
    
    # Vérifier le rate limiting
    is_allowed, remaining_attempts, lockout_until = login_rate_limiter.is_allowed(identifier)
    
    if not is_allowed:
        if lockout_until:
            log_security_event('brute_force_attempt', request, 
                             f'Compte verrouillé pour {username} jusqu\'à {lockout_until}')
            return Response(
                {
                    'error': 'Trop de tentatives échouées. Compte temporairement verrouillé.',
                    'lockout_until': lockout_until.isoformat() if lockout_until else None
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
    
    # Tentative d'authentification
    user = None
    try:
        user = authenticate(request, username=username, password=password)
        # Si échec (casse différente), réessayer avec le nom exact en base
        if user is None and User.objects.filter(username__iexact=username).exists():
            u = User.objects.get(username__iexact=username)
            if check_password(password, u.password):
                user = u
    except Exception as e:
        import logging
        logger = logging.getLogger('api.security')
        logger.error(f"Erreur lors de l'authentification pour {username}: {str(e)}")
    
    if user is not None:
        if user.is_active:
            # Enregistrer la tentative réussie
            login_rate_limiter.record_attempt(identifier, success=True)
            
            # Générer les tokens JWT
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            # Déterminer le type d'utilisateur
            is_superuser = user.is_superuser
            
            # Logger la connexion réussie
            log_security_event('successful_login', request, user=user)
            
            return Response({
                'success': True,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'is_superuser': is_superuser,
                    'is_manager': not is_superuser
                },
                'access': str(access_token),
                'refresh': str(refresh)
            })
        else:
            # Compte désactivé - enregistrer comme tentative échouée
            login_rate_limiter.record_attempt(identifier, success=False)
            log_security_event('failed_login', request, 
                             f'Compte désactivé pour {username}', user=user)
            return Response(
                {'error': 'Nom d\'utilisateur ou mot de passe incorrect'},
                status=status.HTTP_401_UNAUTHORIZED
            )
    else:
        # Authentification échouée - enregistrer comme tentative échouée
        login_rate_limiter.record_attempt(identifier, success=False)
        log_security_event('failed_login', request, 
                         f'Tentative échouée pour {username}')
        
        # Message générique pour ne pas révéler si l'utilisateur existe
        return Response(
            {
                'error': 'Nom d\'utilisateur ou mot de passe incorrect',
                'remaining_attempts': remaining_attempts - 1
            },
            status=status.HTTP_401_UNAUTHORIZED
        )


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(request):
    """Vue pour déconnecter l'utilisateur - Blacklist le refresh token"""
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({'success': True, 'message': 'Déconnexion réussie'})
    except Exception as e:
        # Même en cas d'erreur, retourner un succès
        return Response({'success': True, 'message': 'Déconnexion réussie'})


@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats_view(request):
    """Retourne les totaux pour le dashboard (counts + stats du jour et du mois)."""
    from django.utils import timezone
    from django.db.models import Sum
    now = timezone.now()
    # Devis du mois en cours
    devis_mois_qs = Devis.objects.filter(
        date_creation__month=now.month,
        date_creation__year=now.year
    )
    devis_mois = devis_mois_qs.count()
    total_montant_mois = devis_mois_qs.aggregate(s=Sum('total'))['s'] or 0
    # Statistiques du jour (aujourd'hui)
    debut_jour = now.replace(hour=0, minute=0, second=0, microsecond=0)
    devis_jour_qs = Devis.objects.filter(date_creation__gte=debut_jour)
    devisAujourdhui = devis_jour_qs.count()
    montantAujourdhui = devis_jour_qs.aggregate(s=Sum('total'))['s'] or 0
    return Response({
        'totalAnalyses': Analyse.objects.count(),
        'totalIPM': IPM.objects.count(),
        'totalAssurances': Assurance.objects.count(),
        'totalPatients': Patient.objects.count(),
        'totalDevis': Devis.objects.count(),
        'devisMois': devis_mois,
        'totalMontantMois': float(total_montant_mois),
        'devisAujourdhui': devisAujourdhui,
        'montantAujourdhui': float(montantAujourdhui),
    })


def check_auth_view(request):
    """Vue pour vérifier si l'utilisateur est authentifié"""
    user = request.user
    if user.is_authenticated:
        return Response({
            'authenticated': True,
            'user': {
                'id': user.id,
                'username': user.username,
                'is_superuser': user.is_superuser,
                'is_manager': not user.is_superuser
            }
        })
    else:
        return Response({'authenticated': False}, status=status.HTTP_401_UNAUTHORIZED)


@csrf_exempt
@api_view(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAdminUser])  # Gestion des catégories réservée aux admins
def categories_view(request, categorie_name=None):
    """Vue pour gérer les catégories (admin seulement)
    
    GET: Liste toutes les catégories (admin seulement)
    POST: Crée une nouvelle catégorie (admin seulement)
    PUT/PATCH: Modifie une catégorie (admin seulement)
    DELETE: Supprime une catégorie (admin seulement)
    """
    from django.db.models import Q
    import logging
    logger = logging.getLogger(__name__)
    
    # Vérifier que l'utilisateur est authentifié et est admin
    if not request.user or not request.user.is_authenticated:
        logger.warning(f"Tentative d'accès non authentifiée aux catégories: {request.method}")
        return Response(
            {'error': 'Authentification requise'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    if not request.user.is_superuser:
        logger.warning(f"Tentative d'accès non autorisée aux catégories par {request.user.username}: {request.method}")
        return Response(
            {'error': 'Accès réservé aux administrateurs'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if request.method == 'GET':
        # Récupérer toutes les catégories depuis le modèle Categorie
        categories_actives = list(Categorie.objects.filter(actif=True).values_list('nom', flat=True))
        categories_inactives = list(Categorie.objects.filter(actif=False).values_list('nom', flat=True))
        
        # Récupérer aussi les catégories depuis Analyse (pour compatibilité)
        categories_analyses = Analyse.objects.values_list('categorie', flat=True).distinct()
        categories_analyses = [str(cat).strip() for cat in categories_analyses if cat and str(cat).strip()]
        
        # Combiner et dédupliquer (uniquement des chaînes valides)
        toutes_categories = set()
        for cat in categories_actives + categories_inactives + categories_analyses:
            if cat is not None:
                s = str(cat).strip()
                if s and len(s) <= 50:  # Categorie.nom a max_length=50
                    toutes_categories.add(s)
        
        # Construire la liste avec get_or_create pour éviter les conflits
        categories_data = []
        for cat in sorted(toutes_categories):
            categorie_obj, created = Categorie.objects.get_or_create(
                nom=cat,
                defaults={'actif': True}
            )
            categories_data.append({
                'nom': categorie_obj.nom,
                'actif': categorie_obj.actif
            })
        
        return Response({
            'categories': categories_data
        })
    
    elif request.method == 'POST':
        # Créer une nouvelle catégorie (en créant une analyse exemple)
        logger.info(f"Création de catégorie - données reçues: {request.data}")
        categorie = request.data.get('categorie', '')
        if isinstance(categorie, str):
            categorie = categorie.strip()
        else:
            categorie = str(categorie).strip() if categorie else ''
        
        if not categorie:
            logger.warning(f"Tentative de création de catégorie sans nom: {request.data}")
            return Response(
                {'error': 'Le nom de la catégorie est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Vérifier si la catégorie existe déjà dans le modèle Categorie
        if Categorie.objects.filter(nom=categorie).exists():
            return Response(
                {'error': 'Cette catégorie existe déjà'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Créer la catégorie dans le modèle Categorie
        categorie_obj = Categorie.objects.create(nom=categorie, actif=True)
        
        # Créer une analyse exemple avec cette catégorie pour que la catégorie apparaisse
        analyse_exemple = Analyse.objects.create(
            id=str(uuid.uuid4()),
            nom=f'[EXEMPLE] Catégorie {categorie}',
            categorie=categorie
        )
        
        return Response({
            'message': f'Catégorie "{categorie}" créée avec succès',
            'categorie': categorie,
            'actif': categorie_obj.actif
        }, status=status.HTTP_201_CREATED)
    
    elif request.method in ['PUT', 'PATCH']:
        # Modifier une catégorie (renommer toutes les analyses avec cette catégorie)
        old_name = request.data.get('old_name', '').strip()
        new_name = request.data.get('new_name', '').strip() or request.data.get('categorie', '').strip()
        
        if not old_name or not new_name:
            return Response(
                {'error': 'Les noms old_name et new_name (ou categorie) sont requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if old_name == new_name:
            return Response(
                {'error': 'Le nouveau nom doit être différent de l\'ancien'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Vérifier si la nouvelle catégorie existe déjà
        if Analyse.objects.filter(categorie=new_name).exists():
            return Response(
                {'error': f'La catégorie "{new_name}" existe déjà'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Renommer toutes les analyses avec cette catégorie
        count = Analyse.objects.filter(categorie=old_name).update(categorie=new_name)
        
        return Response({
            'message': f'Catégorie "{old_name}" renommée en "{new_name}" ({count} analyse(s) mise(s) à jour)',
            'old_name': old_name,
            'new_name': new_name,
            'updated_count': count
        })
    
    elif request.method == 'DELETE':
        # Supprimer une catégorie (supprimer toutes les analyses avec cette catégorie)
        # Récupérer le nom de catégorie depuis l'URL (categorie_name) ou depuis request.data
        categorie = categorie_name or request.data.get('categorie', '')
        if isinstance(categorie, str):
            categorie = categorie.strip()
        else:
            categorie = str(categorie).strip() if categorie else ''
        
        logger.info(f"Suppression de catégorie - nom: {categorie}, depuis URL: {categorie_name}, depuis data: {request.data.get('categorie', '')}")
        
        if not categorie:
            logger.warning(f"Tentative de suppression de catégorie sans nom: {request.data}")
            return Response(
                {'error': 'Le nom de la catégorie est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Compter les analyses avec cette catégorie
        analyses_categorie = Analyse.objects.filter(categorie=categorie)
        count = analyses_categorie.count()
        
        if count == 0:
            logger.warning(f"Tentative de suppression de catégorie inexistante: {categorie}")
            return Response(
                {'error': 'Cette catégorie n\'existe pas'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Vérifier si des analyses de cette catégorie sont utilisées dans des devis
        try:
            # Récupérer les IDs des analyses de cette catégorie
            analyse_ids = list(analyses_categorie.values_list('id', flat=True))
            
            # Vérifier si ces analyses sont utilisées dans des DevisLigne
            from .models import DevisLigne
            lignes_utilisant_analyse = DevisLigne.objects.filter(analyse_id__in=analyse_ids)
            count_lignes = lignes_utilisant_analyse.count()
            
            if count_lignes > 0:
                # Des analyses sont utilisées dans des devis, on ne peut pas les supprimer
                logger.warning(f"Impossible de supprimer la catégorie '{categorie}': {count_lignes} ligne(s) de devis utilisent des analyses de cette catégorie")
                return Response(
                    {
                        'error': f'Impossible de supprimer la catégorie "{categorie}". {count_lignes} ligne(s) de devis utilisent des analyses de cette catégorie. Veuillez d\'abord supprimer ou modifier ces devis.',
                        'lignes_devis_count': count_lignes
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Aucune ligne de devis n'utilise ces analyses, on peut les supprimer
            deleted_count = analyses_categorie.delete()[0]
            logger.info(f"Catégorie '{categorie}' supprimée avec succès ({deleted_count} analyse(s) supprimée(s))")
            
            return Response({
                'message': f'Catégorie "{categorie}" supprimée avec succès ({deleted_count} analyse(s) supprimée(s))',
                'deleted_count': deleted_count
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Erreur lors de la suppression de la catégorie '{categorie}': {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Erreur lors de la suppression de la catégorie: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['POST'])
@permission_classes([IsAdminUser])
def categories_activate_view(request, categorie_name):
    """Activer une catégorie (superadmin uniquement)"""
    try:
        categorie = Categorie.objects.get(nom=categorie_name)
        categorie.actif = True
        categorie.save()
        return Response({
            'message': f'Catégorie "{categorie_name}" activée avec succès',
            'categorie': categorie_name,
            'actif': True
        })
    except Categorie.DoesNotExist:
        # Créer la catégorie si elle n'existe pas
        categorie = Categorie.objects.create(nom=categorie_name, actif=True)
        return Response({
            'message': f'Catégorie "{categorie_name}" créée et activée avec succès',
            'categorie': categorie_name,
            'actif': True
        }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def categories_deactivate_view(request, categorie_name):
    """Désactiver une catégorie (superadmin uniquement)"""
    try:
        categorie = Categorie.objects.get(nom=categorie_name)
        categorie.actif = False
        categorie.save()
        return Response({
            'message': f'Catégorie "{categorie_name}" désactivée avec succès',
            'categorie': categorie_name,
            'actif': False
        })
    except Categorie.DoesNotExist:
        # Créer la catégorie si elle n'existe pas
        categorie = Categorie.objects.create(nom=categorie_name, actif=False)
        return Response({
            'message': f'Catégorie "{categorie_name}" créée et désactivée avec succès',
            'categorie': categorie_name,
            'actif': False
        }, status=status.HTTP_201_CREATED)


@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Accessible à tous les utilisateurs authentifiés
def generer_numero_facture_mensuelle_view(request):
    """Vue pour générer un numéro de facture mensuelle basé sur la période
    
    Format: FACT-YYYY-MM-XXX
    Exemple: FACT-2026-12-001
    """
    from datetime import datetime
    
    mois = request.query_params.get('mois')
    annee = request.query_params.get('annee')
    type_prise_en_charge = request.query_params.get('type_prise_en_charge', '')
    entite_id = request.query_params.get('entite_id', '')
    
    if not mois or not annee:
        return Response(
            {'error': 'Les paramètres mois et annee sont requis'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        mois_int = int(mois)
        annee_int = int(annee)
        
        # Format: FACT-YYYY-MM-XXX (ex: FACT-2026-12-001)
        # Pour générer un numéro séquentiel, on compte les devis de cette période pour cette entité
        # et on utilise ce nombre comme base pour le numéro
        
        # Compter les devis de cette période pour cette entité
        # Filtrer les devis par date et par entité (via les patients)
        from django.db.models import Q
        
        date_debut = datetime(annee_int, mois_int, 1)
        date_fin = datetime(annee_int, mois_int + 1, 1) if mois_int < 12 else datetime(annee_int + 1, 1, 1)
        
        # Filtrer les devis de cette période
        devis_periode = Devis.objects.filter(
            date_creation__year=annee_int,
            date_creation__month=mois_int
        )
        
        # Filtrer par entité si fournie
        if entite_id and type_prise_en_charge:
            if type_prise_en_charge == 'IPM':
                devis_periode = devis_periode.filter(patient__type_prise_en_charge='IPM', patient__ipm_id=entite_id)
            elif type_prise_en_charge == 'ASSURANCE':
                devis_periode = devis_periode.filter(patient__type_prise_en_charge='ASSURANCE', patient__assurance_id=entite_id)
        
        # Compter les devis uniques (par patient) pour générer un numéro séquentiel
        # On utilise le nombre de patients distincts comme base
        patients_distincts = devis_periode.values('patient_id').distinct().count()
        
        # Numéro séquentiel basé sur le nombre de factures mensuelles générées pour cette période
        # Pour simplifier, on utilise un numéro basé sur l'identifiant de l'entité et la période
        # Format: FACT-YYYY-MM-XXX où XXX est un numéro séquentiel
        prefixe = f'FACT-{annee_int}-{str(mois_int).zfill(2)}'
        
        # Générer un numéro séquentiel basé sur la combinaison période + type + entité
        # Pour avoir un numéro cohérent, on utilise un hash court de l'identifiant
        import hashlib
        identifiant = f"{annee_int}{str(mois_int).zfill(2)}{type_prise_en_charge}{entite_id}"
        hash_id = int(hashlib.md5(identifiant.encode()).hexdigest()[:3], 16) % 1000
        numero_sequence = str(hash_id + 1).zfill(3)
        
        # Numéro de facture: FACT-YYYY-MM-XXX
        numero_facture = f"{prefixe}-{numero_sequence}"
        
        return Response({
            'numero_facture': numero_facture,
            'mois': mois_int,
            'annee': annee_int,
            'type_prise_en_charge': type_prise_en_charge,
            'entite_id': entite_id
        })
        
    except ValueError:
        return Response(
            {'error': 'Mois et année doivent être des nombres entiers'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Erreur lors de la génération du numéro de facture: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAdminUser])  # Statistiques réservées aux admins
def statistiques_paiement_view(request):
    """Vue pour obtenir les statistiques mensuelles de paiement des factures mensuelles groupées par IPM/Assurance"""
    from django.db.models import Q, Count, Sum
    from datetime import datetime
    import hashlib
    
    mois = request.query_params.get('mois')
    annee = request.query_params.get('annee')
    
    if not mois or not annee:
        return Response(
            {'error': 'Les paramètres mois et annee sont requis'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        mois_int = int(mois)
        annee_int = int(annee)
        
        # Filtrer les devis du mois et de l'année
        queryset = Devis.objects.filter(
            date_creation__year=annee_int,
            date_creation__month=mois_int
        ).select_related('patient', 'patient__ipm', 'patient__assurance')
        
        # Grouper les devis par IPM/Assurance et type de prise en charge
        factures_mensuelles = {}
        
        for devis in queryset:
            patient = devis.patient
            type_prise_en_charge = patient.type_prise_en_charge if patient else None
            entite_id = None
            entite_nom = None
            
            if type_prise_en_charge == 'IPM' and patient.ipm:
                entite_id = patient.ipm.id
                entite_nom = patient.ipm.nom
            elif type_prise_en_charge == 'ASSURANCE' and patient.assurance:
                entite_id = patient.assurance.id
                entite_nom = patient.assurance.nom
            
            if not entite_id:
                continue  # Ignorer les devis sans IPM/Assurance
            
            # Créer une clé unique pour cette facture mensuelle (période + type + entité)
            facture_key = f"{annee_int}-{mois_int:02d}-{type_prise_en_charge}-{entite_id}"
            
            if facture_key not in factures_mensuelles:
                # Générer le numéro de facture mensuelle
                prefixe = f'FACT-{annee_int}-{mois_int:02d}'
                identifiant = f"{annee_int}{mois_int:02d}{type_prise_en_charge}{entite_id}"
                hash_id = int(hashlib.md5(identifiant.encode()).hexdigest()[:3], 16) % 1000
                numero_sequence = str(hash_id + 1).zfill(3)
                numero_facture = f"{prefixe}-{numero_sequence}"
                
                factures_mensuelles[facture_key] = {
                    'id': facture_key,
                    'numeroFacture': numero_facture,
                    'typePriseEnCharge': type_prise_en_charge,
                    'entiteId': entite_id,
                    'entiteNom': entite_nom,
                    'montantCouvert': 0,  # Sera calculé plus bas
                    'devis_ids': [],
                    'statutPaiement': 'NON_REGLÉ',
                    'datePaiement': None,
                    'commentairePaiement': ''
                }
            
            # Calculer le montant couvert pour ce devis
            taux_couverture_str = devis.taux_couverture or '0'
            try:
                taux_couverture = float(taux_couverture_str)
            except (ValueError, TypeError):
                taux_couverture = 0
            
            montant_couvert = float(devis.total) * (1 - taux_couverture / 100)
            factures_mensuelles[facture_key]['montantCouvert'] += montant_couvert
            factures_mensuelles[facture_key]['devis_ids'].append(devis.id)
            
            # Prendre le statut de paiement du premier devis (ou le plus récent)
            # Pour simplifier, on prendra le statut du devis actuel si non défini
            if factures_mensuelles[facture_key]['statutPaiement'] == 'NON_REGLÉ' and devis.statut_paiement:
                factures_mensuelles[facture_key]['statutPaiement'] = devis.statut_paiement
                factures_mensuelles[facture_key]['datePaiement'] = devis.date_paiement.isoformat() if devis.date_paiement else None
                factures_mensuelles[facture_key]['commentairePaiement'] = devis.commentaire_paiement or ''
        
        # Convertir le dictionnaire en liste
        factures_list = list(factures_mensuelles.values())
        
        # Calculer les statistiques
        non_regles = sum(1 for f in factures_list if f['statutPaiement'] == 'NON_REGLÉ')
        partiellement_regles = sum(1 for f in factures_list if f['statutPaiement'] == 'PARTIELLEMENT_REGLÉ')
        regles = sum(1 for f in factures_list if f['statutPaiement'] == 'REGLÉ')
        montant_total = sum(f['montantCouvert'] for f in factures_list)
        
        return Response({
            'mois': mois_int,
            'annee': annee_int,
            'statistiques': {
                'nonRegles': non_regles,
                'partiellementRegles': partiellement_regles,
                'regles': regles,
                'montantTotal': float(montant_total)
            },
            'factures': factures_list
        })
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Erreur lors de la récupération des statistiques: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
