from .serializers import UserRegisterSerializer, LoginSerializer, UpdateUserSerializer, FriendSerializer
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_201_CREATED, HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND, HTTP_500_INTERNAL_SERVER_ERROR
from rest_framework.generics import GenericAPIView, ListAPIView, UpdateAPIView
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny
# For JWT
# from rest_framework_simplejwt.tokens import RefreshToken

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, action
from django.contrib.auth.decorators import login_required

from .models import User, OtpToken, FriendRequest
from django.db import IntegrityError
from django.shortcuts import render

from django.contrib.auth.forms import UserCreationForm
from django.urls import reverse_lazy
from django.contrib.auth import authenticate
from django.core.mail import EmailMessage
from django.core.mail import send_mail
from django.conf import settings
from django.http import HttpResponse

class AccountList(ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer

    def get(self, request):
        users = self.get_queryset()
        serializer = self.serializer_class(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

def send_code_to_user(email):
    user = User.objects.get(email=email)

    otp = OtpToken.objects.create(user=user)

    EmailMessage(
        subject = 'Account Verification',
        body = f"Hi {user.first_name},\nThanks for signing up on our site.\nPlease verify your email with the following one time password:\n\n{otp.otp_code}\n\n\n",
        from_email = settings.EMAIL_HOST_USER,
        to = [user.email]
    ).send()


#   @user_not_authenticated
class RegisterView(APIView):
    serializer_class = UserRegisterSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            user = serializer.data
            send_code_to_user(user['email'])
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserDetailView(APIView):
    # permission_classes = [IsAuthenticated]
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
                "tournament_name": user.tournament_name,
                #"avatar": user.avatar,
                "last_login": user.last_login,
                "date_joined": user.date_joined,
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
                return Response({
                    'user_id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                }, status=200)
            else:
                return Response({'error': 'Invalid credentials'}, status=400)
        return Response(serializer.errors, status=400)

class UpdateProfileView(UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UpdateUserSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get(self, request, id):
        user = User.objects.filter(pk=id).first()
        if not user:
            return Response({"message": "No User found"}, status=404)
        return Response({
                    'username': user.username,
                    'email': user.email,
                    'tournament_name': user.tournament_name,
                }, status=200)

class CloseAccountView(APIView):
    def post(self, request, id):
        ## Remove account
        try:
            user = User.objects.filter(id=id).first()
            user.delete()
        except User.DoesNotExist:
            raise Response("No User found")

        return Response({"message": "Account and user successfully removed"}, status=200)
    

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = FriendSerializer
    lookup_field = 'username'

    @action(detail=True, methods=['post'], url_path='add_friend')
    def add_friend(self, request, username=None):
        """Add a friend to the user's friend list."""
        user = self.get_object()
        friend_id = request.data.get('friend_id')

        try:
            friend = User.objects.get(pk=friend_id)
        except User.DoesNotExist:
            return Response({'detail': 'Friend not found'}, status=status.HTTP_404_NOT_FOUND)

        if friend not in user.friends.all():
            user.friends.add(friend)
            user.save()
            return Response({'detail': f'{friend.username} added to friends.'}, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'User is already a friend.'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='remove_friend')
    def remove_friend(self, request, username=None):
        """Remove a friend from the user's friend list."""
        user = self.get_object()
        friend_id = request.data.get('friend_id')

        try:
            friend = User.objects.get(pk=friend_id)
        except User.DoesNotExist:
            return Response({'detail': 'Friend not found'}, status=status.HTTP_404_NOT_FOUND)

        if friend in user.friends.all():
            user.friends.remove(friend)
            user.save()
            return Response({'detail': f'{friend.username} removed from friends.'}, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'User is not a friend.'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], url_path='list_friends')
    def list_friends(self, request, username=None):
        """List all friends of the user."""
        user = self.get_object()
        friends = user.friends.all()
        serializer = FriendSerializer(friends, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
