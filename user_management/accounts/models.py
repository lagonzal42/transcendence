# from django.db import models
from django.db import models
import hashlib
from datetime import timedelta
from django.utils import timezone
    
def in_30_days():
    return timezone.now() + timedelta(days=30)
from django.conf import settings
from django.dispatch import receiver
from django.db.models.signals import post_save
from rest_framework.authtoken.models import Token

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    bio = models.TextField(blank=True)
    profile_pic = models.ImageField(blank=True)

    def __str__(self):
        return self.username

# Create your models here.
# class User(models.Model):
#     user_id = models.CharField(max_length=20, unique=True)
#     username = models.CharField(max_length=20, default="username_default")
#     password = models.CharField(max_length=20)
#     nickname = models.CharField(max_length=50)
#     comment = models.CharField(max_length=100, blank=True)
    
#     def __str__(self):
#         return self.user_id



class AccessToken(models.Model):
    # tied user
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    # Access token (max_length is set to 40 because the token is set to a hashed string in sha1).
    token = models.CharField(max_length=40)
    # access date and time
    access_datetime = models.DateTimeField(default=in_30_days)

    def str(self):
        # Set the email address, access date and time and token to be visible.
        dt = timezone.localtime(self.access_datetime).strftime("%Y/%m/%d %H:%M:%S")
        return self.user.user_id + '(' + dt + ') - ' + self.token

    @staticmethod
    def create(user: User):
        # Retrieve the user's existing tokens.
        if AccessToken.objects.filter(user=user).exists():
            # Deleted if token already exists
            AccessToken.objects.get(user=user).delete()

        # Token creation (as UserID + Password + system date hash value)
        dt = timezone.now()
        str = user.user_id + user.password + dt.strftime('%Y%m%d%H%M%S%f')
        hash = hashlib.sha1(str.encode('utf-8')).hexdigest()

        # Add tokens to DB.
        token = AccessToken.objects.create(
            user=user,
            token=hash,
            access_datetime=dt)

        return token