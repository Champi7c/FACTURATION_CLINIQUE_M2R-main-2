from django.db import models
from django.core.validators import MinValueValidator


class Categorie(models.Model):
    """Modèle pour gérer les catégories avec activation/désactivation"""
    nom = models.CharField(max_length=50, unique=True, primary_key=True)
    actif = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'categories'
        ordering = ['nom']

    def __str__(self):
        return self.nom


class Analyse(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    nom = models.CharField(max_length=500)
    categorie = models.CharField(max_length=50, default='analyses')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'analyses'
        ordering = ['nom']

    def __str__(self):
        return self.nom


class IPM(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    nom = models.CharField(max_length=255)
    actif = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ipms'
        ordering = ['nom']

    def __str__(self):
        return self.nom


class Assurance(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    nom = models.CharField(max_length=255)
    actif = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'assurances'
        ordering = ['nom']

    def __str__(self):
        return self.nom


class Tarif(models.Model):
    TYPE_CHOICES = [
        ('IPM', 'IPM'),
        ('ASSURANCE', 'ASSURANCE'),
    ]

    id = models.CharField(max_length=50, primary_key=True)
    analyse = models.ForeignKey(Analyse, on_delete=models.CASCADE, db_column='analyse_id')
    type_prise_en_charge = models.CharField(max_length=10, choices=TYPE_CHOICES, null=True, blank=True)
    ipm = models.ForeignKey(IPM, on_delete=models.CASCADE, db_column='ipm_id', null=True, blank=True)
    assurance = models.ForeignKey(Assurance, on_delete=models.CASCADE, db_column='assurance_id', null=True, blank=True)
    prix = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'tarifs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.analyse.nom} - {self.prix} FCFA"


class Patient(models.Model):
    TYPE_CHOICES = [
        ('IPM', 'IPM'),
        ('ASSURANCE', 'ASSURANCE'),
    ]

    id = models.CharField(max_length=50, primary_key=True)
    nom_complet = models.CharField(max_length=255)
    matricule = models.CharField(max_length=100)
    type_prise_en_charge = models.CharField(max_length=10, choices=TYPE_CHOICES)
    ipm = models.ForeignKey(IPM, on_delete=models.SET_NULL, db_column='ipm_id', null=True, blank=True)
    assurance = models.ForeignKey(Assurance, on_delete=models.SET_NULL, db_column='assurance_id', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'patients'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.nom_complet} ({self.matricule})"


class Devis(models.Model):
    STATUT_PAIEMENT_CHOICES = [
        ('NON_REGLÉ', 'Non réglé'),
        ('PARTIELLEMENT_REGLÉ', 'Partiellement réglé'),
        ('REGLÉ', 'Réglé'),
    ]
    
    id = models.CharField(max_length=100, primary_key=True)
    numero = models.CharField(max_length=20, unique=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, db_column='patient_id')
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    souscripteur = models.CharField(max_length=255, null=True, blank=True)
    taux_couverture = models.CharField(max_length=10, null=True, blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    statut_paiement = models.CharField(max_length=20, choices=STATUT_PAIEMENT_CHOICES, default='NON_REGLÉ', null=True, blank=True)
    date_paiement = models.DateField(null=True, blank=True)
    commentaire_paiement = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'devis'
        ordering = ['-date_creation']

    def __str__(self):
        return f"Devis {self.numero} - {self.patient.nom_complet}"


class DevisLigne(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    devis = models.ForeignKey(Devis, on_delete=models.CASCADE, db_column='devis_id', related_name='lignes')
    analyse = models.ForeignKey(Analyse, on_delete=models.PROTECT, db_column='analyse_id')
    prix = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    quantite = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])

    class Meta:
        db_table = 'devis_lignes'

    def __str__(self):
        return f"{self.devis.numero} - {self.analyse.nom} x{self.quantite}"


