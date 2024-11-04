from .serializers import UserRegisterSerializer, LoginSerializer, UpdateUserSerializer, FriendSerializer
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
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, action, permission_classes
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
from django.http import HttpResponse, JsonResponse

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
    permission_classes = [AllowAny]
    serializer_class = UserRegisterSerializer


    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.save()
            refresh = RefreshToken.for_user(user)

            return Response({
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                },
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, username):
        # Obtain user info
        user = User.objects.filter(username=username).first()

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
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']

            user = authenticate(username=username, password=password)

            if user:
                refresh = RefreshToken.for_user(user)
                return Response({
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                    },
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }
                }, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"error": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)

class UpdateProfileView(UpdateAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = UpdateUserSerializer
    lookup_field = 'username'

    def get(self, request, username):
        user = User.objects.filter(username=username).first()
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

@api_view(['GET'])
def ListFriendsView(request, username):
    try:
        user = User.objects.get(username=username)
        friends = user.friends.all()
        friend_data = [{'username': friend.username} for friend in friends]
        return Response(friend_data)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

# class ListFriendsView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request, username=None):
#         friends_json = {}
#         try:
#             user = User.objects.get(username=username)
#         except User.DoesNotExist:
#             return JsonResponse({"error": "User not found."}, status=404)

#         friends = user.friends.all()

#         if username is None:
#             for friend in friends:
#                 friends_json[friend.username] = get_user_data(friend)
#         else:
#             try:
#                 friend = User.objects.get(username=username)
#                 friends_json[friend.username] = get_user_data(friend)
#             except User.DoesNotExist:
#                 return JsonResponse({"error": "Friend not found."}, status=404)

#         return JsonResponse(friends_json)

def get_user_data(user):
    return  {
                'username': user.username,
                'email': user.email,
                'tournament_name': user.tournament_name,
                'friends': list(user.friends.values_list('username', flat=True)),
            }

class AddFriendView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, username):
        user = User.objects.get(username=username)
        friend_username = request.data.get('friend_username')

        if friend_username is None:
            return Response({'error': "No friend username provided."}, status=400)

        try:
            friend = User.objects.get(username=friend_username)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

        if friend.username == user.username:
            return Response({'error': "Users cannot send friend requests to themselves."}, status=400)

        # Check if friend request already exists
        if FriendRequest.objects.filter(from_user=user, to_user=friend).exists():
            return Response({'error': 'Friend request already sent.'}, status=400)

        # Create a friend request
        friend_request = FriendRequest.objects.create(from_user=user, to_user=friend)
        print("printting request iddd")
        print(friend_request.id)

        return Response({'message': 'Friend request sent successfully.'}, status=200)
    
class AcceptFriendRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, username):
        user = User.objects.get(username=username)
        request_id = request.data.get('request_id')

        if request_id is None:
            return Response({'error': "No request id provided."}, status=400)

        try:
            friend_request = FriendRequest.objects.get(id=request_id, to_user=user)
        except FriendRequest.DoesNotExist:
            return Response({'error': 'Friend request not found.'}, status=404)

        # Add each other as friends
        user.friends.add(friend_request.from_user)
        friend_request.from_user.friends.add(user)

        # Delete the friend request after acceptance
        friend_request.delete()

        return Response({'message': 'Friend request accepted successfully.'}, status=200)

class RemoveFriendView(APIView):
    def post(self, request, username):
        user = User.objects.get(username=username)
        user_to_remove = request.data.get('user_to_remove')

class CurrentUser(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'tournament_name': user.tournament_name,
        }, status=status.HTTP_200_OK)
    