from rest_framework import serializers
from .models import Categorie, Analyse, IPM, Assurance, Tarif, Patient, Devis, DevisLigne
from .validators import sanitize_string, validate_numeric, validate_uuid
import uuid


class CategorieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categorie
        fields = ['nom', 'actif', 'created_at']
        read_only_fields = ['created_at']


class AnalyseSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False, allow_blank=False, allow_null=False)
    
    class Meta:
        model = Analyse
        fields = ['id', 'nom', 'categorie', 'created_at']
        read_only_fields = ['created_at']
    
    def validate_id(self, value):
        if not value or value.strip() == '':
            return str(uuid.uuid4())
        try:
            return validate_uuid(value)
        except Exception:
            return str(uuid.uuid4())
    
    def validate_nom(self, value):
        """Valide et nettoie le nom de l'analyse"""
        if not value:
            raise serializers.ValidationError('Le nom est requis')
        return sanitize_string(value, max_length=200)
    
    def validate_categorie(self, value):
        """Valide la catégorie"""
        if value:
            return sanitize_string(value, max_length=100)
        return value
    
    def create(self, validated_data):
        if 'id' not in validated_data or not validated_data['id']:
            validated_data['id'] = str(uuid.uuid4())
        return super().create(validated_data)


class IPMSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False, allow_blank=False, allow_null=False)
    
    class Meta:
        model = IPM
        fields = ['id', 'nom', 'actif', 'created_at']
        read_only_fields = ['created_at']
    
    def validate_id(self, value):
        if not value or value.strip() == '':
            return str(uuid.uuid4())
        return value
    
    def create(self, validated_data):
        if 'id' not in validated_data or not validated_data['id']:
            validated_data['id'] = str(uuid.uuid4())
        return super().create(validated_data)


class AssuranceSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False, allow_blank=False, allow_null=False)
    
    class Meta:
        model = Assurance
        fields = ['id', 'nom', 'actif', 'created_at']
        read_only_fields = ['created_at']
    
    def validate_id(self, value):
        if not value or value.strip() == '':
            return str(uuid.uuid4())
        return value
    
    def create(self, validated_data):
        if 'id' not in validated_data or not validated_data['id']:
            validated_data['id'] = str(uuid.uuid4())
        return super().create(validated_data)


class TarifSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False, allow_blank=False, allow_null=False)
    analyse = serializers.PrimaryKeyRelatedField(queryset=Analyse.objects.all(), required=False)
    ipm = serializers.PrimaryKeyRelatedField(queryset=IPM.objects.all(), required=False, allow_null=True)
    assurance = serializers.PrimaryKeyRelatedField(queryset=Assurance.objects.all(), required=False, allow_null=True)
    
    class Meta:
        model = Tarif
        fields = ['id', 'analyse', 'type_prise_en_charge', 'ipm', 'assurance', 'prix', 'created_at']
        read_only_fields = ['created_at']
    
    def validate_prix(self, value):
        """Valide le prix"""
        try:
            return validate_numeric(value, min_value=0, max_value=1000000)
        except Exception as e:
            raise serializers.ValidationError(f'Prix invalide: {str(e)}')
    
    def validate(self, data):
        # Lors de la mise à jour, si analyse n'est pas fourni, utiliser celui de l'instance existante
        if self.instance and 'analyse' not in data:
            data['analyse'] = self.instance.analyse
        # S'assurer que analyse est toujours présent
        if 'analyse' not in data or data['analyse'] is None:
            raise serializers.ValidationError({'analyse': 'Ce champ est obligatoire.'})
        return data
    
    def validate_id(self, value):
        if not value or value.strip() == '':
            return str(uuid.uuid4())
        return value
    
    def create(self, validated_data):
        if 'id' not in validated_data or not validated_data['id']:
            validated_data['id'] = str(uuid.uuid4())
        return super().create(validated_data)


class PatientSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False, allow_blank=False, allow_null=False)
    ipm = serializers.PrimaryKeyRelatedField(queryset=IPM.objects.all(), required=False, allow_null=True)
    assurance = serializers.PrimaryKeyRelatedField(queryset=Assurance.objects.all(), required=False, allow_null=True)
    
    class Meta:
        model = Patient
        fields = ['id', 'nom_complet', 'matricule', 'type_prise_en_charge', 'ipm', 'assurance', 'created_at']
        read_only_fields = ['created_at']
    
    def validate_id(self, value):
        if not value or value.strip() == '':
            return str(uuid.uuid4())
        return value
    
    def validate_nom_complet(self, value):
        """Valide et nettoie le nom complet du patient"""
        if not value:
            raise serializers.ValidationError('Le nom complet est requis')
        return sanitize_string(value, max_length=200)
    
    def validate_matricule(self, value):
        """Valide le matricule"""
        if value:
            return sanitize_string(value, max_length=50)
        return value
    
    def validate(self, data):
        # S'assurer que ipm et assurance sont None si vides
        if 'ipm' in data and (data['ipm'] == '' or data['ipm'] is None):
            data['ipm'] = None
        if 'assurance' in data and (data['assurance'] == '' or data['assurance'] is None):
            data['assurance'] = None
        return data
    
    def create(self, validated_data):
        if 'id' not in validated_data or not validated_data['id']:
            validated_data['id'] = str(uuid.uuid4())
        # S'assurer que ipm et assurance sont None si vides
        if 'ipm' in validated_data and (validated_data['ipm'] == '' or validated_data['ipm'] is None):
            validated_data['ipm'] = None
        if 'assurance' in validated_data and (validated_data['assurance'] == '' or validated_data['assurance'] is None):
            validated_data['assurance'] = None
        return super().create(validated_data)


class DevisLigneSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False, allow_blank=False, allow_null=False)
    analyse = serializers.PrimaryKeyRelatedField(queryset=Analyse.objects.all())
    analyse_nom = serializers.CharField(source='analyse.nom', read_only=True)
    analyse_categorie = serializers.CharField(source='analyse.categorie', read_only=True)
    analyseId = serializers.CharField(source='analyse.id', read_only=True)
    
    class Meta:
        model = DevisLigne
        fields = ['id', 'analyse', 'analyseId', 'analyse_nom', 'analyse_categorie', 'prix', 'quantite']
    
    def validate_id(self, value):
        if not value or value.strip() == '':
            return str(uuid.uuid4())
        return value
    
    def create(self, validated_data):
        if 'id' not in validated_data or not validated_data['id']:
            validated_data['id'] = str(uuid.uuid4())
        # S'assurer qu'une quantité est définie (par défaut 1)
        if 'quantite' not in validated_data or validated_data['quantite'] is None:
            validated_data['quantite'] = 1
        return super().create(validated_data)
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Retirer le champ analyse (on garde analyseId pour le frontend)
        representation.pop('analyse', None)
        return representation


class DevisSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False, allow_blank=False, allow_null=False)
    patient = serializers.PrimaryKeyRelatedField(queryset=Patient.objects.all())
    lignes = DevisLigneSerializer(many=True, required=False)
    
    class Meta:
        model = Devis
        fields = ['id', 'numero', 'patient', 'total', 'souscripteur', 'taux_couverture', 'date_creation', 'lignes', 'statut_paiement', 'date_paiement', 'commentaire_paiement']
        read_only_fields = ['date_creation', 'numero']
    
    def validate_id(self, value):
        if not value or value.strip() == '':
            return str(uuid.uuid4())
        return value
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Utiliser les lignes déjà chargées via prefetch_related pour éviter les requêtes N+1
        lignes = instance.lignes.all() if hasattr(instance, 'lignes') else []
        representation['lignes'] = DevisLigneSerializer(lignes, many=True).data
        return representation


class DevisCreateSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False, allow_blank=False, allow_null=False)
    patient = serializers.PrimaryKeyRelatedField(queryset=Patient.objects.all())
    lignes = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=True
    )
    
    class Meta:
        model = Devis
        fields = ['id', 'numero', 'patient', 'total', 'souscripteur', 'taux_couverture', 'date_creation', 'lignes', 'statut_paiement', 'date_paiement', 'commentaire_paiement']
        read_only_fields = ['date_creation', 'numero']
    
    def validate_id(self, value):
        if not value or value.strip() == '':
            return str(uuid.uuid4())
        return value
    
    def create(self, validated_data):
        lignes_data = validated_data.pop('lignes', [])
        
        # Générer un ID si non fourni
        if 'id' not in validated_data or not validated_data['id']:
            validated_data['id'] = str(uuid.uuid4())
        
        # Générer le numéro de devis
        from datetime import datetime
        annee = 2026
        dernier_devis = Devis.objects.filter(numero__startswith=f'{annee}-').order_by('-numero').first()
        if dernier_devis:
            try:
                dernier_numero = int(dernier_devis.numero.split('-')[1])
                nouveau_numero = dernier_numero + 1
            except (ValueError, IndexError):
                nouveau_numero = 1
        else:
            nouveau_numero = 1
        
        validated_data['numero'] = f'{annee}-{str(nouveau_numero).zfill(5)}'
        
        # Calculer le total en prenant en compte la quantité (prix × quantité)
        total = 0
        for ligne in lignes_data:
            prix = float(ligne.get('prix', 0))
            quantite = int(ligne.get('quantite', 1))
            total += prix * quantite
        validated_data['total'] = total
        
        # Créer le devis
        devis = Devis.objects.create(**validated_data)
        
        # Créer les lignes (permettre les doublons maintenant)
        for ligne in lignes_data:
            analyse_id = ligne.get('analyseId')
            prix = float(ligne.get('prix', 0))
            quantite = int(ligne.get('quantite', 1))
            if analyse_id:
                try:
                    analyse = Analyse.objects.get(id=analyse_id)
                    DevisLigne.objects.create(
                        id=str(uuid.uuid4()),
                        devis=devis,
                        analyse=analyse,
                        prix=prix,
                        quantite=quantite
                    )
                except Analyse.DoesNotExist:
                    pass
        
        return devis
    
    def update(self, instance, validated_data):
        lignes_data = validated_data.pop('lignes', [])
        
        # Mettre à jour les champs du devis
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Supprimer les anciennes lignes
        DevisLigne.objects.filter(devis=instance).delete()
        
        # Calculer le nouveau total en prenant en compte la quantité (prix × quantité)
        total = 0
        for ligne in lignes_data:
            prix = float(ligne.get('prix', 0))
            quantite = int(ligne.get('quantite', 1))
            total += prix * quantite
        instance.total = total
        
        # Créer les nouvelles lignes (permettre les doublons maintenant)
        for ligne in lignes_data:
            analyse_id = ligne.get('analyseId')
            prix = float(ligne.get('prix', 0))
            quantite = int(ligne.get('quantite', 1))
            if analyse_id:
                try:
                    analyse = Analyse.objects.get(id=analyse_id)
                    DevisLigne.objects.create(
                        id=str(uuid.uuid4()),
                        devis=instance,
                        analyse=analyse,
                        prix=prix,
                        quantite=quantite
                    )
                except Analyse.DoesNotExist:
                    pass
        
        instance.save()
        return instance
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Utiliser les lignes déjà chargées via prefetch_related pour éviter les requêtes N+1
        lignes = instance.lignes.all() if hasattr(instance, 'lignes') else []
        representation['lignes'] = DevisLigneSerializer(lignes, many=True).data
        return representation
