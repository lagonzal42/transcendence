from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from django.utils import timezone
import random
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status
from accounts.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
from django.contrib.sessions.models import Session
from django.contrib.sessions.backends.db import SessionStore

class Send2FACodeView(GenericAPIView):
    """Sends 2FA code to user's email""" 
    def post(self, request, user_id):
        # Get user
        try:
            user = User.objects.get(id=user_id)
            # logger.debug(f"User found: {user.username}")
        except User.DoesNotExist:
            # logger.error('User not found for ID: %s', user_id)
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Generate a random 2FA code
        code = random.randint(100000, 999999)

        # Store the code and expiry in session
        request.session['2fa_code'] = code
        expiry_time = timezone.now() + timezone.timedelta(minutes=1)
        request.session['2fa_code_expiry'] = expiry_time.isoformat()
        # request.session['user_id'] = user_id
        request.session.modified = True

        # # # DEBUG
        # print("New:::::Send2FA Session data:", request.session.items())
        # print("Session data after setting 2FA code:", dict(request.session))
        request.session.save()

        # logger.debug(f"Stored session in Send2FACodeView: {request.session.items()}")

        # # DEBUG
        print("============================================================")
        print(f"Generate::Stored session: {request.session.items()}")
        print(f"Generate::Session keys: {list(request.session.keys())}")
        print(f"Session id: {request.session._session_key}")
        print("============================================================")
        # Send the 2FA code via email
        send_mail(
            'Your 2FA Code',
            f'Your verification code is: {code}',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )

        # logger.info(f"2FA code sent to {user.email}. Code: {code}")

        return Response({
            'message': '2FA code sent to your email.',
            'sessionid': str(request.session._session_key)
        }, status=status.HTTP_200_OK)

class Verify2FAView(GenericAPIView):
    """Verifies the 2FA code"""
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):

        code = request.data.get('code')

        # Get stored code and expiry from session
        sessionid = request.data.get('sessionid')
        sessions = Session.objects.get(session_key=sessionid)
        session_data = sessions.get_decoded()
        
        stored_code = session_data.get('2fa_code')
        expiry_time_str = session_data.get('2fa_code_expiry')
        user_id = session_data.get('user_id')  # Get user_id from session
        # # DEBUG
        # print("============================================================")
        # print(f"Verify::Stored code: {stored_code}")
        # print(f"Verify::Code: {code}")
        # print(f"Verify::Expire time: {expiry_time_str}")
        # print(f"Verify::Session keys: {sessionid}")
        # print("============================================================")

        # # DEBUG
        # print(f"Stored 2FA code: {stored_code}")
        # print(f"Received 2FA code: {code}")
        # print(f"Expiry time string from session: {expiry_time_str}")

        # Verify 2FA code and expiry
        if not expiry_time_str or timezone.now() > timezone.datetime.fromisoformat(expiry_time_str):
            return Response({'error': '2FA session expired'}, status=status.HTTP_400_BAD_REQUEST)

        if stored_code and code == str(stored_code):
            try:
                # Get user from user_id
                user = User.objects.get(id=user_id)
                
                # Create JWT tokens
                refresh = RefreshToken.for_user(user)
                
                # Clear session data
                request.session.pop('2fa_code', None)
                request.session.pop('2fa_code_expiry', None)
                request.session.pop('user_id', None)
                
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'message': 'Login successful'
                }, status=status.HTTP_200_OK)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({'error': 'Invalid 2FA code'}, status=status.HTTP_400_BAD_REQUEST)

