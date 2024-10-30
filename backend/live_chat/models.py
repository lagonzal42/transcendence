from django.db import models

# Create your models here.

class Message(models.Model):
    sender = models.BigIntegerField()
    receiver = models.BigIntegerField()
    message = models.charField(max_length=200)