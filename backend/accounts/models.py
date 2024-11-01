from django.db import models
import uuid
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
    avatar = models.ImageField(default="noob.png")
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
    from_user = models.ForeignKey(User, related_name='from_user', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='to_user', on_delete=models.CASCADE)

    def __str__(self):
	    return "From {}, to {}".format(self.from_user.username, self.to_user.username)

# class FriendshipRequest(models.Model):
#     sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friendship_request_sender')
#     receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friendship_request_receiver')
#     sender_uuid = models.CharField(max_length=255, null=True, blank=True)
#     receiver_uuid = models.CharField(max_length=255, null=True, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     is_active = models.BooleanField(default=True)

#     class Meta:
#         unique_together = ['sender', 'receiver'] 

#     def __str__(self):
#         return f'{self.sender} has sent a friend request to {self.receiver}'

# class Friendship(models.Model):
#     user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friendship_creator')
#     friend = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friendship_receiver')
#     user_uuid = models.CharField(max_length=255, null=True, blank=True)
#     friend_uuid = models.CharField(max_length=255, null=True, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         unique_together = ['user', 'friend'] 

#     def __str__(self):
#         return f'{self.user} is friends with {self.friend}'

def in_30_days():
    return timezone.now() + timedelta(days=30)

class OtpToken(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="otps")
    otp_code = models.CharField(max_length=6, default=secrets.token_hex(3))
    tp_created_at = models.DateTimeField(auto_now_add=True)
    otp_expires_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return self.user.username



# For further activation and token creation
class AccountActivateTokensManager(models.Manager):

    def activate_user_by_token(self, activate_token):
        # Obtain tokens within the validity period.
        user_activate_token = self.filter(
            activate_token=activate_token,
            expired_at__gte=timezone.now()
        ).first()

        # Activate the account if a token exists
        if user_activate_token:
            user = user_activate_token.user
            user.is_active = True
            user.save()
            return user
        else:
            raise self.model.DoesNotExist

    def create_token(self, user):
        token = self.model(user=user)
        token.set_expiration_date()
        token.save()
        return token

# Make activation token
class AccountActivateToken(models.Model):
    token = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                                on_delete=models.CASCADE,
                                related_name='activate_token')
    activate_token = models.UUIDField(default=uuid.uuid4)
    expired_at = models.DateTimeField()
    objects = AccountActivateTokensManager()

    def set_expiration_date(self):
        self.expired_at = timezone.now() + timedelta(minutes=10)
        self.save()
        return self.expired_at