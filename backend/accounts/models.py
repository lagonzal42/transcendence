from django.db import models
from django.db import models
import hashlib
from datetime import timedelta
from django.utils import timezone
    
from django.conf import settings
from django.dispatch import receiver
from django.db.models.signals import post_save
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import AbstractUser
from django.contrib.auth import get_user_model
import secrets
import random    

class User(AbstractUser):
    avatar = models.ImageField(upload_to='avatars/', default="noob.png")
    username = models.CharField(max_length=100, unique=True, null=True)
    email = models.EmailField(unique=True, null=True)
    password = models.CharField(max_length=100)
    tournament_name = models.CharField(max_length=100, default="noob")
    is_online = models.BooleanField(default=False)
    games_played = models.PositiveIntegerField(default=0)
    games_won = models.PositiveIntegerField(default=0)
    games_lost = models.PositiveIntegerField(default=0)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(default=timezone.now)
    friends = models.ManyToManyField('self', blank=True, symmetrical=True)
    blocked_users = models.ManyToManyField('self', symmetrical=False, related_name='blocked_by', blank=True)


    #USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.username

    def save(self, *args, **kwargs):
        if not self.pk:  # Only modify tournament_name for new instances
            random_number = random.randint(1, 1000)
            self.tournament_name = f"noob{random_number}"
        super().save(*args, **kwargs)

class FriendRequest(models.Model):
    from_user = models.ForeignKey(User, related_name='friend_requests_sent', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='friend_requests_received', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined')
    ], default='pending')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('from_user', 'to_user')

    def __str__(self):
	    return "From {}, to {}".format(self.from_user.username, self.to_user.username)

def in_30_days():
    return timezone.now() + timedelta(days=30)

class OtpToken(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="otps")
    otp_code = models.CharField(max_length=6, default=secrets.token_hex(3))
    tp_created_at = models.DateTimeField(auto_now_add=True)
    otp_expires_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return self.user.username
