from django.core.mail import send_mail
from django.conf import settings
from .models import AccountActivateToken

def send_activation_email(user, from_email):
    """Business logic to send an activation email."""
    email = user.email
    
    account_activate_token = AccountActivateToken.objects.create_token(user=user)
    activate_token = account_activate_token.activate_token
    
    # Create the activation URL
    #url = f'{settings.ACTIVATE_URL}/activation/?token={activate_token}'
    url = f'http://localhost:4200/verify?token={activate_token}'

    subject = 'Essence Catch : Account Activation'
    message = f'''
    Hi {user.username},
    This email is sent from Essence Catch.
    Please click the link below to activate your account.
    {url}

    If you did not request this email, please ignore it.

    '''

    send_mail(subject, message, from_email, [email])
