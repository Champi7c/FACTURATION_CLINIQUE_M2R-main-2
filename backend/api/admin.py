from django.contrib import admin
from .models import Analyse, IPM, Assurance, Tarif, Patient, Devis, DevisLigne


@admin.register(Analyse)
class AnalyseAdmin(admin.ModelAdmin):
    list_display = ('nom', 'categorie', 'created_at')
    list_filter = ('categorie',)
    search_fields = ('nom',)


@admin.register(IPM)
class IPMAdmin(admin.ModelAdmin):
    list_display = ('nom', 'created_at')
    search_fields = ('nom',)


@admin.register(Assurance)
class AssuranceAdmin(admin.ModelAdmin):
    list_display = ('nom', 'created_at')
    search_fields = ('nom',)


@admin.register(Tarif)
class TarifAdmin(admin.ModelAdmin):
    list_display = ('analyse', 'type_prise_en_charge', 'ipm', 'assurance', 'prix', 'created_at')
    list_filter = ('type_prise_en_charge',)
    search_fields = ('analyse__nom',)


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('nom_complet', 'matricule', 'type_prise_en_charge', 'ipm', 'assurance', 'created_at')
    list_filter = ('type_prise_en_charge',)
    search_fields = ('nom_complet', 'matricule')


class DevisLigneInline(admin.TabularInline):
    model = DevisLigne
    extra = 1


@admin.register(Devis)
class DevisAdmin(admin.ModelAdmin):
    list_display = ('numero', 'patient', 'total', 'date_creation')
    list_filter = ('date_creation',)
    search_fields = ('numero', 'patient__nom_complet')
    inlines = [DevisLigneInline]


