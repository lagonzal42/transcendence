from django.db.models import Q
from .serializers import UserRegisterSerializer, LoginSerializer, UpdateUserSerializer, FriendSerializer, MatchSerializer
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

from .models import User, OtpToken, FriendRequest, Match
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
    
        if serializer.is_valid():
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
        print(f"Validation errors for register: {serializer.errors}")
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, username):
        # Obtain user info
        user = User.objects.filter(username=username).first()

        if not user:
            # If user doesn't exist
            return Response({"message": "No User found"}, status=404)

        avatar_url = user.avatar.url if user.avatar else None

        response_data = {
            "message": "Found user",
            "user": {
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "id": user.id,
                "tournament_name": user.tournament_name,
                "avatar": avatar_url,
                "last_login": user.last_login,
                "date_joined": user.date_joined,
                "is_online": user.is_online,
            }
        }
        return Response(response_data, status=200)

class UserMatchHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
            matches = Match.objects.filter(
                Q(player1=user) | Q(player2=user)
            ).select_related('player1', 'player2', 'winner')

            serializer = MatchSerializer(matches, many=True)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)    

class MatchCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Get the User objects for the players
            player1 = User.objects.get(username=request.data['player1_username'])
            player2 = User.objects.get(username=request.data['player2_username'])
            winner = User.objects.get(username=request.data['winner_username'])

            # Create match data
            match_data = {
                'player1': player1.id,
                'player2': player2.id,
                'player1_score': request.data['player1_score'],
                'player2_score': request.data['player2_score'],
                'winner': winner.id,
                'match_type': request.data['match_type']
            }

            # Use the serializer to validate and save
            serializer = MatchSerializer(data=match_data)
            if serializer.is_valid():
                serializer.save()
                
                # Update player stats
                player1.games_played += 1
                player2.games_played += 1
                
                if winner == player1:
                    player1.games_won += 1
                    player2.games_lost += 1
                else:
                    player2.games_won += 1
                    player1.games_lost += 1
                
                player1.save()
                player2.save()
                
                return Response(serializer.data, status=201)
            return Response(serializer.errors, status=400)
            
        except User.DoesNotExist:
            return Response({'error': 'One or more users not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=400)

class LoginView(GenericAPIView):
    """API login class"""
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data) 
        if serializer.is_valid(raise_exception=True):
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            # print(username)
            # print(password)
            user = authenticate(username=username, password=password)

            if user:
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
                }, status=status.HTTP_200_OK)
            else:
                print("entering here")
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh_token")
            if not refresh_token:
                return Response(
                    {"error": "Refresh token is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"error": "Invalid token or token has been blacklisted"}, status=status.HTTP_400_BAD_REQUEST)

class UpdateProfileView(UpdateAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = UpdateUserSerializer
    lookup_field = 'username'

    def update(self, request, *args, **kwargs):
        partial = True
        instance = self.get_object()
        
        # Create a new dict with only the fields that were sent
        data_to_update = {}
        if 'tournament_name' in request.data:
            data_to_update['tournament_name'] = request.data['tournament_name']
        if 'email' in request.data:
            data_to_update['email'] = request.data['email']
        if 'avatar' in request.FILES:
            data_to_update['avatar'] = request.FILES['avatar']

        serializer = self.get_serializer(instance, data=data_to_update, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

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
        friend_data = [{
            'id': friend.id,
            'username': friend.username,
            'is_online': friend.is_online,
        } for friend in friends]
        return Response(friend_data)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

def get_user_data(user):
    return  {
                'username': user.username,
                'email': user.email,
                'tournament_name': user.tournament_name,
                'friends': list(user.friends.values_list('username', flat=True)),
            }
    
class AcceptFriendRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from_username = request.data.get('from_username')
        
        try:
            # Find the pending request from this user
            friend_request = FriendRequest.objects.get(
                from_user__username=from_username,
                to_user=request.user,
                status='pending'
            )
            
            # Add each other as friends
            request.user.friends.add(friend_request.from_user)
            friend_request.from_user.friends.add(request.user)
            
            # Update request status
            friend_request.status = 'accepted'
            friend_request.save()
            
            return Response({'message': 'Friend request accepted successfully'}, status=200)
            
        except FriendRequest.DoesNotExist:
            return Response({'error': 'Friend request not found'}, status=404)

class RemoveFriendView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, username):
        try:
            user = User.objects.get(username=username)
            friend_username = request.data.get('user_to_remove')
            
            if not friend_username:
                return Response({'error': 'Friend username is required'}, status=400)
            
            friend = User.objects.get(username=friend_username)
            
            # Remove from both users' friend lists
            user.friends.remove(friend)
            friend.friends.remove(user)
            
            return Response({'message': 'Friend removed successfully'}, status=200)
            
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

class CurrentUser(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        return Response({
            'username': user.username,
        }, status=status.HTTP_200_OK)
    
class SearchUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.GET.get('query', '')
        if not query:
            return Response({'error': 'Search query is required'}, status=400)

        #print(f"Search query: {query}")
        
        # Debug: Check total users in database
        all_users = User.objects.all()
        # print(f"Total users in database: {all_users.count()}")
        # print(f"All usernames and IDs: {[(user.username, user.id) for user in all_users]}")
        # print(f"Current user ID: {request.user.id}")
        
        # Original query with debug
        users = User.objects.filter(username__icontains=query).exclude(id=request.user.id)[:10]
        #print(f"Found users for query '{query}': {[(user.username, user.id) for user in users]}")
        
        user_data = [{
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name
        } for user in users]
        
        return Response(user_data)

class FriendRequestListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        pending_requests = FriendRequest.objects.filter(
            to_user=request.user,
            status='pending'
        )
        
        requests_data = [{
            'id': req.id,
            'from_user': {
                'id': req.from_user.id,
                'username': req.from_user.username,
                'email': req.from_user.email
            },
            'to_user': {
                'id': req.to_user.id,
                'username': req.to_user.username,
                'email': req.to_user.email
            },
            'status': req.status,   
            'created_at': req.created_at
        } for req in pending_requests]
        
        return Response(requests_data)

class SendFriendRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            to_username = request.data.get('to_username')
            if not to_username:
                return Response({'error': 'Username is required'}, status=400)

            to_user = User.objects.get(username=to_username)

            if request.user == to_user:
                return Response({'error': 'Cannot send friend request to yourself'}, status=400)

            # Check if they're already friends
            if request.user.friends.filter(id=to_user.id).exists():
                return Response({'error': 'Already friends'}, status=400)

            # Check if a request already exists
            existing_request = FriendRequest.objects.filter(
                from_user=request.user,
                to_user=to_user,
            ).first()

            if existing_request:
                if existing_request.status == 'pending':
                    return Response({'error': 'Friend request already sent'}, status=200)
                elif existing_request.status == 'declined':
                    # If there was a declined request, update it to pending
                    existing_request.status = 'pending'
                    existing_request.save()
                    return Response({'message': 'Friend request sent successfully'}, status=201)

            friend_request = FriendRequest.objects.create(
                from_user=request.user,
                to_user=to_user,
                status='pending'
            )

            return Response({'message': 'Friend request sent successfully'}, status=201)

        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        except Exception as e:
            print(f"Error in SendFriendRequestView: {str(e)}")  # For debugging
            return Response(
                {'error': 'An error occurred while processing your request'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DeclineFriendRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, request_id):
        try:
            friend_request = FriendRequest.objects.get(
                id=request_id,
                to_user=request.user,
                status='pending'
            )
        except FriendRequest.DoesNotExist:
            return Response({'error': 'Friend request not found'}, status=404)

        friend_request.status = 'declined'
        friend_request.save()

        return Response({'message': 'Friend request declined'}, status=200)

class BlockUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        try:
            user_to_block = User.objects.get(id=user_id)
            
            if request.user == user_to_block:
                return Response({'error': 'Cannot block yourself'}, status=400)
                
            request.user.blocked_users.add(user_to_block)
            return Response({'message': 'User blocked successfully'}, status=200)
            
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

class UnblockUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        try:
            user_to_unblock = User.objects.get(id=user_id)
            request.user.blocked_users.remove(user_to_unblock)
            return Response({'message': 'User unblocked successfully'}, status=200)
            
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

class BlockedUsersListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            blocked_users = request.user.blocked_users.all()
            blocked_users_data = [{
                'id': user.id,
                'username': user.username,
                'email': user.email,  # Only include if needed
                'isBlocked': True
            } for user in blocked_users]
            
            return Response(blocked_users_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': 'An error occurred while fetching blocked users'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )