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

from .services import send_activation_email

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
            user_mail = serializer.save()

            # Prepare the response data
            user = serializer.data
            # Send the activation email using the service
            send_activation_email(user_mail, from_email="noreply@essencecatch.com")
            
            return Response({
                'data':user,
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
                logger.info('アカウントが有効化されました')  # Account activated

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
                # Create JWT token
                refresh = RefreshToken.for_user(user)

                return Response({
                    'user_id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    # "refresh" and "access" are JWT tokens
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }, status=200)
            else:
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
        