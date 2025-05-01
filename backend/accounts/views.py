import os
from django.db.models import Q
from .serializers import UserRegisterSerializer, LoginSerializer, UpdateUserSerializer, FriendSerializer, MatchSerializer
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_201_CREATED, HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND, HTTP_500_INTERNAL_SERVER_ERROR
from rest_framework.generics import GenericAPIView, ListAPIView, UpdateAPIView
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny
# For JWT
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import TokenError

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

from .services import send_activation_email
from .models import AccountActivateToken
from django.shortcuts import redirect
from django.urls import reverse
import requests
from two_factor_auth.views import Send2FACodeView
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import TokenError

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

class RegisterView(APIView):
    permission_classes = [AllowAny]
    serializer_class = UserRegisterSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user_intra = serializer.save()
            #user = serializer.data
            # send_code_to_user(user['email'])
            send_activation_email(user_intra, from_email="trascendence.simplepong@gmail.com")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ActivateAccountView(APIView):

    permission_classes = [AllowAny]
    def get(self, request):
        token = request.query_params.get('token')  # Token passed as query param

        try:
            # Attempt to activate the user by token
            user = AccountActivateToken.objects.activate_user_by_token(token)

            # If the user is successfully activated
            if user:

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
        user = User.objects.filter(username=username).first()

        if not user:
            return Response({"message": "No User found"}, status=404)

        if user.avatar and hasattr(user.avatar, 'url'):
            avatar_url = user.avatar.url
            print(f"Avatar URL from model: {avatar_url}")
            # Use try/except to handle potential file system errors
            try:
                print(f"File exists: {os.path.exists(user.avatar.path)}")
                print(f"File size: {os.path.getsize(user.avatar.path) if os.path.exists(user.avatar.path) else 'N/A'}")
            except Exception as e:
                print(f"Error checking avatar file: {str(e)}")
        else:
            avatar_url = None
            print("No avatar URL available")

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
                "games_played": user.games_played,
                "games_won": user.games_won,
                "games_lost": user.games_lost,
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
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            # Get authentication status for both players from request
            # player1_auth = request.data.get('isAuthenticated', {}).get('player1', False)
            # player2_auth = request.data.get('isAuthenticated', {}).get('player2', False)

            player1_auth = User.objects.get(username=request.data['player1_username'])
            player2_auth = User.objects.get(username=request.data['player2_username'])

            # If either player is not authenticated, don't save the match
            if not player1_auth or not player2_auth:
                return Response({'message': 'Match not saved - both players must be authenticated'}, status=200)

            # Get the usernames
            player1_username = request.data['player1_username']
            player2_username = request.data['player2_username']
            winner_username = request.data['winner_username']

            try:
                # Get both players from database
                player1 = User.objects.get(username=player1_username)
                player2 = User.objects.get(username=player2_username)
                
                # Determine winner
                if winner_username == player1_username:
                    winner = player1
                elif winner_username == player2_username:
                    winner = player2
                else:
                    return Response({'error': 'Invalid winner username'}, status=400)

                # Create match data
                match_data = {
                    'player1': player1.id,
                    'player2': player2.id,
                    'player1_score': request.data['player1_score'],
                    'player2_score': request.data['player2_score'],
                    #'winner': winner.id,
                    'match_type': request.data['match_type']
                }
                try:
                    player3_username = request.data['player3_username']
                    player4_username = request.data['player4_username']
                    player3 = User.objects.get(username=player3_username)
                    player4 = User.objects.get(username=player4_username)
                    print("players are in database")
                    print(player3.id)
                    print(player4.id)
                    print(request.data['player3_score'])
                    print(request.data['player4_score'])
                    match_extension = {
                        'player3': player3.id,
                        'player4': player4.id,
                        'player3_score': request.data['player3_score'],
                        'player4_score': request.data['player4_score']
                    }
                    print('match extesion: ' , match_extension)
                    match_data.update(match_extension)
                    if winner_username == player3_username:
                        winner = player3
                    elif winner_username == player4_username:
                        winner = player4
                except:
                    print('Player 3 and 4 not available')
                match_data.update({'winner': winner.id})

                # Use the serializer to validate and save
                serializer = MatchSerializer(data=match_data)
                if serializer.is_valid():
                    match = serializer.save()
                    
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
                return Response(serializer.errors, status=402)
                
            except User.DoesNotExist:
                return Response({'error': 'One or more users not found'}, status=404)
            
        except Exception as e:
            return Response({'error': str(e)}, status=400)

class LoginView(GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            print(f"Logint attempt for: {serializer.validated_data['username']}")

            from django.contrib.auth import get_user_model
            User = get_user_model()
            user_exists = User.objects.filter(username=serializer.validated_data['username']).exists()
            print(f"User exists in DB: {user_exists}")


            user = authenticate(
                username=serializer.validated_data['username'],
                password=serializer.validated_data['password']
            )
            print(f"Authentication result: {user}")  # Debug print

            if user is not None and user.account_activate:
                # print(f"User authenticated, is_active: {user.is_active}")  # Debug print
                # Instead of making a new request, call the 2FA view directly
                from two_factor_auth.views import Send2FACodeView
                
                # Store user_id in session
                request.session['user_id'] = user.id
                request.session.save()
                
                # Use the same session for 2FA
                two_factor_view = Send2FACodeView()
                two_factor_response = two_factor_view.post(request, user_id=user.id)
                return two_factor_response
            else:
                return Response({'error': 'Invalid credentials'}, 
                              status=status.HTTP_401_UNAUTHORIZED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        #     username = serializer.validated_data['username']
        #     password = serializer.validated_data['password']
        #     # print(username)
        #     # print(password)
        #     user = authenticate(username=username, password=password)

        #     if user:
        #         refresh = RefreshToken.for_user(user)
        #         return Response({
        #             'user': {
        #                 'id': user.id,
        #                 'username': user.username,
        #                 'email': user.email,    
        #             },
        #             'tokens': {
        #                 'refresh': str(refresh),
        #                 'access': str(refresh.access_token),
        #             }       
        #         }, status=status.HTTP_200_OK)
        #     else:
        #         print("entering here")
        #         return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        # return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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

    def put(self, request, *args, **kwargs):
        # Log received content type for debugging
        print(f"Request content type: {request.content_type}")
        print(f"Request data: {request.data}")
        print(f"Request FILES: {request.FILES}")
        
        try:
            instance = self.get_object()
            
            # Direct update approach for clarity
            if 'tournament_name' in request.data:
                instance.tournament_name = request.data['tournament_name']
            if 'email' in request.data:
                instance.email = request.data['email']
            if 'avatar' in request.FILES:
                instance.avatar = request.FILES['avatar']
                
            # Save directly
            instance.save()
            
            # Return serialized data
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except Exception as e:
            print(f"Exception in update: {str(e)}")
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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
            friend_request = FriendRequest.objects.get(
                from_user__username=from_username,
                to_user=request.user
            )
            
            if friend_request.status != 'pending':
                return Response(
                    {'error': f'Friend request already {friend_request.status}'}, 
                    status=400
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
    
# class SearchUsersView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         query = request.GET.get('query', '')
#         if not query:
#             return Response({'error': 'Search query is required'}, status=400)

#         #print(f"Search query: {query}")
        
#         # Debug: Check total users in database
#         all_users = User.objects.all()
#         # print(f"Total users in database: {all_users.count()}")
#         # print(f"All usernames and IDs: {[(user.username, user.id) for user in all_users]}")
#         # print(f"Current user ID: {request.user.id}")
        
#         # Original query with debug
#         #users = User.objects.filter(username__icontains(query).exclude(id=request.user.id))
#         users = User.objects.filter(username__icontains=query).exclude(id=request.user.id)

#         print(f"Found users for query '{query}':")
#         print(f"Found users for query '{query}': {[(user.username, user.id) for user in users]}")
        
#         user_data = [{
#             'id': user.id,
#             'username': user.username,
#             'email': user.email,
#             'first_name': user.first_name
#         } for user in users]

#         print(user_data)
        
#         return Response(user_data)

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
                return Response({'error': 'Already friends'}, status=200)

            # Check if there's a pending request in either direction
            existing_request = FriendRequest.objects.filter(
                (Q(from_user=request.user) & Q(to_user=to_user)) |
                (Q(from_user=to_user) & Q(to_user=request.user)),
                status='pending'
            ).first()

            if existing_request:
                if existing_request.from_user == request.user:
                    return Response({'error': 'Friend request already sent'}, status=200)
                else:
                    # If there's a pending request from the other user, accept it
                    request.user.friends.add(to_user)
                    to_user.friends.add(request.user)
                    existing_request.status = 'accepted'
                    existing_request.save()
                    return Response({'message': 'Friend request accepted'}, status=200)

            # Create new friend request
            friend_request = FriendRequest.objects.create(
                from_user=request.user,
                to_user=to_user,
                status='pending'
            )

            return Response({'message': 'Friend request sent successfully'}, status=201)

        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        except IntegrityError:
            return Response({'error': 'Friend request already exists'}, status=400)
        except Exception as e:
            print(f"Error in SendFriendRequestView: {str(e)}")
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

class AccountRefresh(TokenRefreshView):

    def post(self, request):
        refresh_token = request.data.get('refresh')
        access_token = request.data.get('access')
        
        username = request.data.get('username')
        user = User.objects.get(username=username)
        
        if not refresh_token or not access_token:
            return Response({'error': 'Both refresh and access tokens are required'}, status=400)

        try:
            #Validate both tokens
            try:
                RefreshToken(refresh_token)
                AccessToken(access_token)
            except TokenError:
                #token validation failed
                new_refresh = RefreshToken.for_user(user)
                
                return Response({
                    'access': str(new_refresh.access_token),
                    'refresh': str(new_refresh)
                }, status=200)
                
            #usually it wont get here, but if the two tokens are valid it gets
            return Response({
                'access': access_token,
                'refresh': refresh_token
            }, status=200)
            
        except Exception as e:
            return Response({'error': str(e)}, status=401)

        
@api_view(['POST'])
def validate_credentials(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)

    if user is not None:
        return Response({'valid': True})
    else:
        return Response({'valid': False})

# Add this view class to your views.py file
class GetTournamentNameView(APIView):
    """
    View to retrieve a user's tournament name.
    """
    permission_classes = [AllowAny]  # Allow anonymous access for tournament purposes
    
    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
            return Response({
                'tournament_name': user.tournament_name or username
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({
                'tournament_name': username,  # Return the username as fallback
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)