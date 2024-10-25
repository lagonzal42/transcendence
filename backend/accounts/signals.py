from django.core.mail import send_mail
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from django.utils import timezone
from accounts.models import User

# @receiver(post_save, sender=settings.AUTH_USER_MODEL)
# def create_token(sender, instance=None, created=False, **kwargs):
#     print("POST SAVE RECEIVER TRIGGERED")
#     if created:
#         if instance.is_superuser:
#             pass
#         else:
#             OtpToken.objects.create(user=instance, otp_expires_at=timezone.now() + timezone.timedelta(minutes=2))
#             instance.is_active = False
#             instance.save()

#         otp = OtpToken.objects.filter(user=instance).last()
#         subject = "Email Verification"
#         message = f"""
#             Hi {instance.username}, here is your OTP {otp.otp_code}
#             it expires in 5 minutes, use the url below to redirect back to the website
#             http://0.0.0.0:8000/accounts/verify_email/{instance.username}
#         """
#         sender_email = "otxoboy64@gmail.com"
#         recipient_list = [instance.email]
#         print(recipient_list)
#         send_mail(subject, message, settings.EMAIL_HOST_USER, recipient_list)

@receiver(post_save, sender=User)
def send_email_func(sender, instance, created, **kwargs):
    print("entering signal handler")
    if created:
        subject = "Welcome to Our Platform"
        message = f'Hi  {instance.username}, thank you for registering at our site.'
        from_email = 'otxoboy64@gmail.com'
        recipient_list = [instance.email]

        send_mail(subject, message, from_email, recipient_list)

