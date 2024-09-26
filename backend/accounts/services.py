from django.core.mail import send_mail
from .models import AccountActivateToken

def send_activation_email(user, from_email):
    """Business logic to send an activation email."""
    email = user.email
    account_activate_token = AccountActivateToken.objects.create_token(user=user)
    activate_token = account_activate_token.activate_token
    
    # Create the activation URL
    url = f'{ACTIVATE_URL}/activation/?token={activate_token}'

    subject = 'Essence Catch : Account Activation'
    message = f'''
    このメールは Essence Catch から送信されています。
    以下のリンクをクリックしてアカウントを有効化してください。
    {url}

    このメールに心当たりがない場合は、このメールを無視してください。
    また, 送信専用のアドレスのため, このメールに返信しないでください。

    EssenceCatch © 2024 by Kaito.
    '''
    send_mail(subject, message, from_email, [email])
