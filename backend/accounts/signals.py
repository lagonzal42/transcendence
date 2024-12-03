from django.core.mail import send_mail
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from django.utils import timezone
from accounts.models import User

@receiver(post_save, sender=User)
def send_email_func(sender, instance, created, **kwargs):
    print("entering signal handler")
    if created:
        subject = "Welcome to Our Platform"
        message = f'Hi  {instance.username}, thank you for registering at our site.'
        from_email = 'otxoboy64@gmail.com'
        recipient_list = [instance.email]

        send_mail(subject, message, from_email, recipient_list)

