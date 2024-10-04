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
from friends.models import FriendList, FriendRequest    

class User(AbstractUser):
    avatar = models.ImageField(default="noob.png")
    username = models.CharField(max_length=100, unique=True, null=True)
    email = models.EmailField(unique=True, null=True)
    password = models.CharField(max_length=100)
    first_name = models.CharField(max_length=100, default="noob")
    last_name = models.CharField(max_length=100, default="noob")
    tournament_name = models.CharField(max_length=100, default="noob")
    is_online = models.BooleanField(default=False)
    games_played = models.PositiveIntegerField(default=0)
    games_won = models.PositiveIntegerField(default=0)
    games_lost = models.PositiveIntegerField(default=0)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(default=timezone.now)
    friends = models.ManyToManyField('self', through='Friendship', symmetrical=False, related_name='added_friends')
    friend_requests = models.ManyToManyField('self', through='FriendRequest', symmetrical=False, related_name='received_requests')

    #USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.username

    def save(self, *args, **kwargs):
        if not self.pk:  # Only modify tournament_name for new instances
            random_number = random.randint(1, 1000)
            self.tournament_name = f"noob{random_number}"
        super().save(*args, **kwargs)
    
class FriendshipRequest(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friendship_request_sender')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friendship_request_receiver')
    sender_uuid = models.CharField(max_length=255, null=True, blank=True)
    receiver_uuid = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['sender', 'receiver'] 

    def __str__(self):
        return f'{self.sender} has sent a friend request to {self.receiver}'

class Friendship(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friendship_creator')
    friend = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friendship_receiver')
    user_uuid = models.CharField(max_length=255, null=True, blank=True)
    friend_uuid = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'friend'] 

    def __str__(self):
        return f'{self.user} is friends with {self.friend}'

def in_30_days():
    return timezone.now() + timedelta(days=30)

class OtpToken(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="otps")
    otp_code = models.CharField(max_length=6, default=secrets.token_hex(3))
    tp_created_at = models.DateTimeField(auto_now_add=True)
    otp_expires_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return self.user.username

# class AccessToken(models.Model):
#     # tied user
#     user = models.ForeignKey(User, on_delete=models.CASCADE)
#     # Access token (max_length is set to 40 because the token is set to a hashed string in sha1).
#     token = models.CharField(max_length=40)
#     # access date and time
#     access_datetime = models.DateTimeField(default=in_30_days)

#     def str(self):
#         # Set the email address, access date and time and token to be visible.
#         dt = timezone.localtime(self.access_datetime).strftime("%Y/%m/%d %H:%M:%S")
#         return self.user.user_id + '(' + dt + ') - ' + self.token

#     @staticmethod
#     def create(user: User):
#         # Retrieve the user's existing tokens.
#         if AccessToken.objects.filter(user=user).exists():
#             # Deleted if token already exists
#             AccessToken.objects.get(user=user).delete()

#         # Token creation (as UserID + Password + system date hash value)
#         dt = timezone.now()
#         str = user.user_id + user.password + dt.strftime('%Y%m%d%H%M%S%f')
#         hash = hashlib.sha1(str.encode('utf-8')).hexdigest()

#         # Add tokens to DB.
#         token = AccessToken.objects.create(
#             user=user,
#             token=hash,
#             access_datetime=dt)

#         return token