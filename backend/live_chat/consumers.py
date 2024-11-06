import json
import uuid
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from channels.db import database_sync_to_async
from asgiref.sync import async_to_sync, sync_to_async
from django.contrib.auth import get_user_model
from .models import Room, Message

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