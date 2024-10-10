from .serializers import UserRegisterSerializer, LoginSerializer, UpdateUserSerializer
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_201_CREATED, HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND, HTTP_500_INTERNAL_SERVER_ERROR
from rest_framework.generics import GenericAPIView, ListAPIView, UpdateAPIView
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny
# For JWT
from rest_framework_simplejwt.tokens import RefreshToken

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import ValidationError
from rest_framework import status
from rest_framework.decorators import api_view

from .models import User
from django.db import IntegrityError
from django.shortcuts import render

from django.contrib.auth.forms import UserCreationForm
from django.urls import reverse_lazy
from django.contrib.auth import authenticate
from django.core.mail import EmailMessage

from .models import AccountActivateToken
import logging

import random
from datetime import timedelta
from django.utils import timezone
from django.conf import settings

from .services import send_activation_email

from django.shortcuts import redirect

# Set up a logger
logger = logging.getLogger(__name__)

def BaseView(request):
    users = User.objects.all()
    return render(request, 'accounts/base.html', {'users':users})

class AccountList(ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer


class RegisterView(APIView):
    serializer_class = UserRegisterSerializer


    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid(raise_exception=True):
            # the model instance, to send activation mail
            user_insta = serializer.save()

            # serialized representation of the data to return to frontend
            user_data = serializer.data
            # Send the activation email using the service
            send_activation_email(user_insta, from_email="noreply@essencecatch.com")
            
            return Response({
                'data':user_data,
                'message': 'Thanks for signing up'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class ActivateAccountView(APIView):

    def get(self, request):
        token = request.query_params.get('token')  # Token passed as query param

        try:
            # Attempt to activate the user by token
            user = AccountActivateToken.objects.activate_user_by_token(token)

            # If the user is successfully activated
            if user:
                logger.info('Account has been activated.')  # Account activated

                # Delete the activation token after successful activation
                AccountActivateToken.objects.filter(user=user).delete()

                return Response(
                    {'message': 'Account activated successfully'},
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {'message': 'Invalid or expired token.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except AccountActivateToken.DoesNotExist:
            return Response(
                {'message': 'Invalid token or user does not exist.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id):
        # Obtain user info
        user = User.objects.filter(pk=id).first()

        if not user:
            # If user doesn't exist
            return Response({"message": "No User found"}, status=404)

        response_data = {
            "message": "Found user",
            "user": {
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "id": user.id,
            }
        }
        return Response(response_data, status=200)

# # # # --- LoginView separated 2fa version --- # # # # # 

class LoginView(GenericAPIView):
    """API login class"""
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user = authenticate(
                username=serializer.validated_data['username'],
                password=serializer.validated_data['password']
            )
            if user is not None:
                #Store user info for 2FA verification
                request.session['user_id'] = user.id
# Redirect to 2FA service
                return redirect('two_factor_auth:send_2fa_code', user_id=user.id)
            else:
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# # # # --- LoginView separated 2fa version --- # # # # # 


# class Verify2FAView(GenericAPIView):
#     """API 2FA verification class"""
#     permission_classes = [AllowAny]

#     def post(self, request, *args, **kwargs):
#         code = request.data.get('code')
#         # In Verify2FAView
#         print(f"Session data in Verify2FAView: {request.session.items()}")

#         # Retrieve stored 2FA code and expiry from session
#         stored_code = request.session.get('2fa_code')
#         expiry_time_str = request.session.get('2fa_code_expiry')

#         # Debugging logs
#         print(f"Session key: {request.session.session_key}")

#         print(f"Stored 2FA code: {stored_code}")
#         print(f"Received 2FA code: {code}")
#         print(f"Expiry time string from session: {expiry_time_str}")

#         # Convert expiry_time back to a datetime object
#         if expiry_time_str:
#             try:
#                 expiry_time = timezone.datetime.fromisoformat(expiry_time_str)
#                 print(f"Converted expiry time: {expiry_time}")
#                 print(f"Current time: {timezone.now()}")
#             except Exception as e:
#                 print(f"Error converting expiry time: {e}")
#                 return Response({'error': 'Error parsing 2FA expiry time'}, status=status.HTTP_400_BAD_REQUEST)
#         else:
#             print("Expiry time not found in session")
#             return Response({'error': '2FA session expired or invalid'}, status=status.HTTP_400_BAD_REQUEST)

#         # # Convert expiry_time back to a datetime object
#         # if expiry_time_str:
#         #     expiry_time = timezone.datetime.fromisoformat(expiry_time_str)
#         # else:
#         #     return Response({'error': '2FA session expired or invalid'}, status=status.HTTP_400_BAD_REQUEST)

#         # Verify 2FA code and expiry
#         if code and code == str(stored_code) and timezone.now() < expiry_time:
#             # Get the user from the session
#             user_id = request.session.get('user_id')  # Ensure user ID is stored after successful authentication
#             if user_id:
#                 try:
#                     user = User.objects.get(id=user_id)

#                     # Create JWT token
#                     refresh = RefreshToken.for_user(user)

#                     # Clear the session data
#                     del request.session['2fa_code']
#                     del request.session['2fa_code_expiry']
#                     del request.session['user_id']

#                     # Return user information and tokens
#                     return Response({
#                         'user_id': user.id,
#                         'username': user.username,
#                         'email': user.email,
#                         'first_name': user.first_name,
#                         'last_name': user.last_name,
#                         'refresh': str(refresh),
#                         'access': str(refresh.access_token),
#                     }, status=200)
#                 except User.DoesNotExist:
#                     return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
#             else:
#                 return Response({'error': 'User session expired or invalid'}, status=status.HTTP_400_BAD_REQUEST)
#         else:
#             return Response({'error': 'Invalid or expired 2FA code'}, status=status.HTTP_400_BAD_REQUEST)


class UpdateProfileView(UpdateAPIView):

    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = UpdateUserSerializer

class CloseAccountView(APIView):
    def post(self, request, id):
        ## Remove account
        try:
            user = User.objects.filter(id=id).first()
            user.delete()
        except User.DoesNotExist:
            raise Response("No User found")

        return Response({"message": "Account and user successfully removed"}, status=200)

# mail sending test
from django.core.mail import send_mail
from django.http import HttpResponse

def send_test_email(request):
    subject = 'Test Email'
    message = 'This is a test email from Django!'
    from_email = config('EMAIL_HOST_USER')  # Your Gmail address
    recipient_list = ['recipient@example.com']  # Change to your recipient's email

    send_mail(subject, message, from_email, recipient_list)

    return HttpResponse('Test email sent!')


# from django.http import JsonResponse

# def set_session(request):
#     request.session['test_key'] = 'test_value'
#     return JsonResponse({'message': 'Session set'})

# def get_session(request):
#     test_value = request.session.get('test_key', 'Session not found')
#     return JsonResponse({'test_key': test_value})