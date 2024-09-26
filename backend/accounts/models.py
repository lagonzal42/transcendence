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


class User(AbstractUser):
    avatar = models.ImageField(default="noob.png")
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    tournament_name = models.CharField(max_length=100, default="noob")
    is_online = models.BooleanField(default=False)
    games_played = models.PositiveIntegerField(default=0)
    games_won = models.PositiveIntegerField(default=0)
    games_lost = models.PositiveIntegerField(default=0)
    friends = models.ManyToManyField('self', blank=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.username
    
        # Helper method to add a friend
    def add_friend(self, user):
        """Add a friend to the user's friend list."""
        self.friends.add(user)

    # Helper method to remove a friend
    def remove_friend(self, user):
        """Remove a friend from the user's friend list."""
        self.friends.remove(user)

    # Check if someone is a friend
    def is_friend(self, user):
        """Check if a user is a friend."""
        return self.friends.filter(id=user.id).exists()

def in_30_days():
    return timezone.now() + timedelta(days=30)

class OtpToken(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="otps")
    otp_code = models.CharField(max_length=6, default=secrets.token_hex(3))
    tp_created_at = models.DateTimeField(auto_now_add=True)
    otp_expires_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return self.user.username

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_token(sender, instance=None, created=False, **kwargs):
    if created:
        if instance.is_superuser:
            pass
        
        else:
            OtpToken.objects.create((user=instance, otp_expires_at=)timezone.now() + timezone.timedelta(minutes=2))
            instance.is_active=False
            instance.save()

        otp = OtpToken.objects.filter(user=instance).last()
        subject="Email Verification"
        message = f"""
                            Hi {instance.username}, here is your OTP {otp.otp_code}
                            it expires in 5 minutes, use the url below to redirect back to the website
                            http://0.0.0.0:8000/verify_email/{instance.username}

                            """
        sender = "otxoboy64@gmail.com"
        

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