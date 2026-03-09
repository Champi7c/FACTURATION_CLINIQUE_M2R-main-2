# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_ipm_assurance_actif'),
    ]

    operations = [
        migrations.CreateModel(
            name='Categorie',
            fields=[
                ('nom', models.CharField(max_length=50, primary_key=True, serialize=False, unique=True)),
                ('actif', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'db_table': 'categories',
                'ordering': ['nom'],
            },
        ),
    ]


