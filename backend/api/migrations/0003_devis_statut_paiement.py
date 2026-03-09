# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_devisligne_quantite'),
    ]

    operations = [
        migrations.AddField(
            model_name='devis',
            name='statut_paiement',
            field=models.CharField(blank=True, choices=[('NON_REGLÉ', 'Non réglé'), ('PARTIELLEMENT_REGLÉ', 'Partiellement réglé'), ('REGLÉ', 'Réglé')], default='NON_REGLÉ', max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='devis',
            name='date_paiement',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='devis',
            name='commentaire_paiement',
            field=models.TextField(blank=True, null=True),
        ),
    ]

