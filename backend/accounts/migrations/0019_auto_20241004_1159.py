# Generated by Django 3.1.7 on 2024-10-04 11:59

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0018_auto_20241004_0932'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='friends',
        ),
        migrations.AddField(
            model_name='user',
            name='friend_list',
            field=models.ManyToManyField(blank=True, related_name='_user_friend_list_+', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='otptoken',
            name='otp_code',
            field=models.CharField(default='0cacea', max_length=6),
        ),
    ]