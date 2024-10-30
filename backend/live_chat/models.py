from django.db import models
from django.conf import settings

# Create your models here.

class Message(models.Model):
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_chats")
    receive = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="received_chats")
    message = models.CharField(max_length=200)