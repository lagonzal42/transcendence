from django.contrib.sites.shortcuts import get_current_site
from django.urls import reverse
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.conf import settings
from .models import AccountActivateToken

def send_activation_email(user, from_email, request=None):
    """Business logic to send an activation email."""
    email = user.email

    account_activate_token = AccountActivateToken.objects.create_token(user=user)
    activate_token = account_activate_token.activate_token

    if request:
        domain = get_current_site(request).domain
    else:
        domain = "localhost:8089"  # Fallback por si `request` no está disponible

    activation_url = f"https://{domain}/verify?token={activate_token}"

    subject = "Pong Game: Account Activation"
    message = f"""
    Hi {user.username},

    This email is sent from Pong Game.
    Please click the link below to activate your account:
    
    {activation_url}

    If you did not request this email, please ignore it.
    """

    send_mail(subject, message, from_email, [email])