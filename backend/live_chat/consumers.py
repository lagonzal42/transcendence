import json
import uuid
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from channels.db import database_sync_to_async
from asgiref.sync import async_to_sync, sync_to_async
from django.contrib.auth import get_user_model
from .models import Room, Message
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        # Check if room exists and is active
        if not await self.can_connect_to_room():
            await self.close()
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
    
    async def disconnect(self , close_code):
        # Leave room
        await self.channel_layer.group_discard(
            self.room_group_name, 
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)
        message_body = data['message']
        username = data['username']
        room_name = data['room']

        # Extract other username from room name
        users = room_name.replace('private_', '').split('_')
        other_username = next(u for u in users if u != username)

        # Check if either user has blocked the other
        if await self.is_blocked(username, other_username) or await self.is_blocked(other_username, username):
            return

        await self.save_message(username, room_name, message_body)

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message_body,
                'username': username
            }
        )

    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']
        username = event['username']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'username': username
        }))

    @database_sync_to_async
    def save_message(self, username, room_name, message_body):
        try:
            # Get or create room
            room, created = Room.objects.get_or_create(
                uuid=room_name,
                defaults={
                    'client': username,
                    'status': Room.ACTIVE,
                    'url': f'/chat/{room_name}/'  # Optional: add the URL
                }
            )

            # Create message
            message = Message.objects.create(
                body=message_body,
                sent_by=username,
                created_by=User.objects.get(username=username) if username else None
            )

            # Add message to room
            room.messages.add(message)
            return message

        except Exception as e:
            print(f"Error saving message: {e}")
            return None

    @database_sync_to_async
    def can_connect_to_room(self):
        try:
            room = Room.objects.get(uuid=self.room_name)
            if room.status == Room.CLOSED:
                return False
            
            # For private rooms, verify participants
            if self.room_name.startswith('private_'):
                usernames = self.room_name.replace('private_', '').split('_')
                user_count = User.objects.filter(username__in=usernames).count()
                return user_count == 2  # Both users must exist
            
            return True
        except Room.DoesNotExist:
            return True  # Allow connection to create new room

    @database_sync_to_async
    def is_blocked(self, sender_username, receiver_username):
        try:
            sender = User.objects.get(username=sender_username)
            receiver = User.objects.get(username=receiver_username)
            return receiver.blocked_users.filter(id=sender.id).exists()
        except User.DoesNotExist:
            return False
        
class StatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Get token and validate user first
        query_string = self.scope['query_string'].decode()
        query_params = dict(qp.split('=') for qp in query_string.split('&') if qp)
        token = query_params.get('token')

        if not token:
            print("No token provided")
            await self.close()
            return

        try:
            valid_user = await self.get_user_from_token(token)
            if not valid_user:
                print("Invalid token or user not found")
                await self.close()
                return
            
            self.scope["user"] = valid_user
            
        except TokenError as e:
            print(f"Token validation error: {e}")
            await self.close()
            return
        except Exception as e:
            print(f"Unexpected error during token validation: {e}")
            await self.close()
            return
        
        user = self.scope["user"]
        if not user.is_authenticated:
            print("Rejecting unauthenticated connection")
            await self.close()
            return

        # First accept the connection
        await self.accept()
        print(f"Connection accepted for user {user.username}")

        # Then join the group
        await self.channel_layer.group_add(
            'status_updates',
            self.channel_name
        )

        # Mark user as online
        await self.set_user_status(user.id, True)

        # Get current online users
        online_users = await self.get_online_users()
        
        # Send initial status after connection is accepted
        await self.send(text_data=json.dumps({
            'type': 'initial_status',
            'online_users': online_users
        }))

        # Broadcast user's online status
        await self.channel_layer.group_send(
            'status_updates',
            {
                'type': 'user_status',
                'user_id': user.id,
                'status': 'online'
            }
        )

    async def disconnect(self, close_code):
        # Mark user as offline when they disconnect
        if self.scope["user"].is_authenticated:
            await self.set_user_status(self.scope["user"].id, False)
            
            # Broadcast status change to all connected clients
            await self.channel_layer.group_send(
                'status_updates',
                {
                    'type': 'user_status',
                    'user_id': self.scope["user"].id,
                    'status': 'offline'
                }
            )
        
        await self.channel_layer.group_discard(
            'status_updates',
            self.channel_name
        )

    async def user_status(self, event):
        # Send status update to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'user_status',
            'user_id': event['user_id'],
            'status': event['status']
        }))

    @database_sync_to_async
    def set_user_status(self, user_id: int, is_online: bool):
        try:
            user = User.objects.get(id=user_id)
            user.is_online = is_online
            user.save(update_fields=['is_online'])
        except User.DoesNotExist:
            pass

    @database_sync_to_async
    def get_user_from_token(self, token):
        try:
            # Decode and validate the token
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            
            # Get the user from the database
            try:
                user = User.objects.get(id=user_id)
                return user if user.is_active else None
            except User.DoesNotExist:
                return None
                
        except TokenError:
            return None

    @database_sync_to_async
    def get_online_users(self):
        return list(User.objects.filter(is_online=True).values_list('id', flat=True))