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

from .models import AccountActivateToken
import logging

import random
from datetime import timedelta
from django.utils import timezone
from django.conf import settings

from .services import send_activation_email

from django.shortcuts import redirect
from django.urls import reverse
import requests

# Set up a logger
logger = logging.getLogger(__name__)

def BaseView(request):
    users = User.objects.all()
    return render(request, 'accounts/base.html', {'users':users})
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
    serializer_class = UserRegisterSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid(raise_exception=True):
            # # the model instance, to send activation mail
            user_insta = serializer.save()

            # Send the activation email using the service
            send_activation_email(user_insta, from_email="noreply@essencecatch.com")

            # # serialized representation of the data to return to frontend
            user = serializer.data
            # Print all the items in the user dictionary
            print("User data after registration:")
            for key, value in user.items():
                print(f"{key}: {value}")

#### another send email function                
            # send_code_to_user(user['email'])
#### another send email function                

            
            return Response(user, status=status.HTTP_201_CREATED)
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

# # # # --- LoginView separated 2fa version --- # # # # # 

class LoginView(GenericAPIView):
    """API login class"""
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer
    print("Entered LoginView")


    def post(self, request, *args, **kwargs):
        # Print the received request data (username and password)
        print(f"Received data in LoginView: {request.data}")
        serializer = self.get_serializer(data=request.data) 
        if serializer.is_valid(raise_exception=True):
            user = authenticate(
                username=serializer.validated_data['username'],
                password=serializer.validated_data['password']
            )
            print(f"user data in LoginView: {user.username}")

            if user is not None:
                #Store user info for 2FA verification
                request.session['user_id'] = user.id
                # Prepare to call the send_2fa_code endpoint in the two_factor_auth app
                url = reverse('two_factor_auth:send_2fa_code', kwargs={'user_id': user.id})
                response = requests.post(request.build_absolute_uri(url))
                # Return the response from the 2FA service
                return Response(response.json(), status=response.status_code)
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
    permission_classes = [IsAuthenticated]
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
class ListFriendsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username=None):
        friends_json = {}
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found."}, status=404)

        friends = user.friends.all()

        if username is None:
            for friend in friends:
                friends_json[friend.username] = get_user_data(friend)
        else:
            try:
                friend = User.objects.get(username=username)
                friends_json[friend.username] = get_user_data(friend)
            except User.DoesNotExist:
                return JsonResponse({"error": "Friend not found."}, status=404)

        return JsonResponse(friends_json)

# class ListFriendsView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request, id=None):
#         friends_json = {}
#         user = User.objects.get(id=id)
#         friends = user.friends.all()

#         if id is None:
#             for friend in friends:
#                 friends_json[friend.id] = get_user_data(friend)
#         else:
#             try:
#                 friend = User.objects.get(id=id)
#                 friends_json[friend.id] = get_user_data(friend)
#             except User.DoesNotExist:
#                 return JsonResponse({"error": "User not found."}, status=404)

#         #print(friends_json)
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
        print(friend_request.id)

        return Response({'message': 'Friend request sent successfully.'}, status=200)

# class AcceptFriendRequestView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, id):
#         user = User.objects.get(id=id)
#         request_id = request.data.get('request_id')

#         if request_id is None:
#             return Response({'error': "No request id provided."}, status=400)

#         try:
#             friend_request = FriendRequest.objects.get(id=request_id, to_user=user)
#         except FriendRequest.DoesNotExist:
#             return Response({'error': 'Friend request not found.'}, status=404)

#         # Add each other as friends
#         user.friends.add(friend_request.from_user)
#         friend_request.from_user.friends.add(user)

#         # Delete the friend request after acceptance
#         friend_request.delete()

#         return Response({'message': 'Friend request accepted successfully.'}, status=200)


# class AddFriendView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, id):
#         user = User.objects.get(id=id)
#         request_id = request.data.get('request_id')

#         if request_id is None:
#             return Response({'error': "No friend id provided."}, status=400)

#         try:
#             friend = User.objects.get(id=request_id)
#         except User.DoesNotExist:
#             return Response({'error': 'User not found'}, status=404)
#         if request_id == user.id:
#             return Response({'message': "Users cant add themselves as friends"})
        
#          # Check if friend request already exists
#         if FriendRequest.objects.filter(from_user=user, to_user=friend).exists():
#             return Response({'error': 'Friend request already sent.'}, status=400)

#         # Create a friend request
#         friend_request = FriendRequest.objects.create(from_user=user, to_user=friend)
        
#         print("friend_request.id")
#         print(friend_request.id)

#         return Response({'message': 'Friend request sent successfully.'}, status=200)
    
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
    

