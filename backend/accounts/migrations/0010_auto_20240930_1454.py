# Generated by Django 3.1.7 on 2024-09-30 14:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0009_otptoken'),
    ]

    operations = [
        migrations.AlterField(
            model_name='otptoken',
            name='otp_code',
            field=models.CharField(default='1b4f8d', max_length=6),
        ),
    ]
