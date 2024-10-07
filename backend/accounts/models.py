from django.db import models
import uuid
# from django.db import models
import hashlib
from datetime import timedelta
from django.utils import timezone
    
from django.conf import settings
from django.dispatch import receiver
from django.db.models.signals import post_save
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    avatar = models.ImageField(blank=True, )
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(max_length=254)
    password = models.CharField(max_length=100)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)

    def __str__(self):
        return self.username

def in_30_days():
    return timezone.now() + timedelta(days=30)

# @receiver(post_save, sender=settings.AUTH_USER_MODEL)
# def create_auth_token(sender, instance=None, created=False, **kwargs):
#     if created:
#         Token.objects.create(user=instance)

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
    

        
# class AccessToken(models.Model):
#     # tied user
#     user = models.ForeignKey(User, on_delete=models.CASCADE)
#     # Access token (max_length is set to 40 because the token is set to a hashed string in sha1).
#     token = models.CharField(max_length=40)
#     # access date and time
#     access_ = models.DateTimeField(default=in_30_days)

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