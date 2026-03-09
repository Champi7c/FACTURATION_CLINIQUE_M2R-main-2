from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    AnalyseViewSet, IPMViewSet, AssuranceViewSet,
    TarifViewSet, PatientViewSet, DevisViewSet,
    login_view, logout_view, check_auth_view, dashboard_stats_view, statistiques_paiement_view, categories_view,
    categories_activate_view, categories_deactivate_view,
    generer_numero_facture_mensuelle_view
)

router = DefaultRouter()
router.register(r'analyses', AnalyseViewSet, basename='analyse')
router.register(r'ipms', IPMViewSet, basename='ipm')
router.register(r'assurances', AssuranceViewSet, basename='assurance')
router.register(r'tarifs', TarifViewSet, basename='tarif')
router.register(r'patients', PatientViewSet, basename='patient')
router.register(r'devis', DevisViewSet, basename='devis')

urlpatterns = [
    path('', include(router.urls)),
    path('test/', lambda request: __import__('django.http').http.JsonResponse({'message': 'API Backend fonctionne correctement!'})),
    path('auth/login/', login_view, name='login'),
    path('auth/logout/', logout_view, name='logout'),
    path('auth/check/', check_auth_view, name='check_auth'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('dashboard-stats/', dashboard_stats_view, name='dashboard_stats'),
    path('statistiques/paiement/', statistiques_paiement_view, name='statistiques_paiement'),
    path('factures-mensuelles/numero/', generer_numero_facture_mensuelle_view, name='generer_numero_facture_mensuelle'),
    path('categories/', categories_view, name='categories'),  # GET, POST
    path('categories/<str:categorie_name>/', categories_view, name='categories_detail'),  # PUT, PATCH, DELETE
    path('categories/<str:categorie_name>/activate/', categories_activate_view, name='categories_activate'),
    path('categories/<str:categorie_name>/deactivate/', categories_deactivate_view, name='categories_deactivate'),
]


