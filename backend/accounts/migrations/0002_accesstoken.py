# Generated by Django 3.2.25 on 2024-08-28 13:54

import accounts.models
from django.db import migrations, models
import django.db.models.deletion
# from datetime import timedelta
from django.utils import timezone


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='AccessToken',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('token', models.CharField(max_length=40)),
                ('access_datetime', models.DateTimeField(default=accounts.models.in_30_days)),
                # ('access_datetime', models.DateTimeField(default=timezone.now() + timedelta(days=30))),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='accounts.user')),
            ],
        ),
    ]
