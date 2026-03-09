# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_devis_statut_paiement'),
    ]

    operations = [
        migrations.AddField(
            model_name='ipm',
            name='actif',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='assurance',
            name='actif',
            field=models.BooleanField(default=True),
        ),
    ]

