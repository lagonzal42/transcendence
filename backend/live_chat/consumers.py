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
        print(data)
        message_body = data['message']
        username = data['username']
        room_name = data['room']

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

    # async def receive(self, text_data):
    #     data = json.loads(text_data)
    #     print(data)
    #     message_body = data['message']
    #     username = data['username']
    #     room_name = data['room']

    #     # Check if sender is blocked by receiver
    #     sender = await self.get_user(username)
    #     receiver = await self.get_room_participant(room_name, username)
        
    #     if sender and receiver and not await self.is_blocked(sender, receiver):
    #         await self.save_message(username, room_name, message_body)
    #         await self.channel_layer.group_send(
    #             self.room_group_name,
    #             {
    #                 'type': 'chat_message',
    #                 'message': message_body,
    #                 'username': username
    #             }
    #         )


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
            return room.status != Room.CLOSED
        except Room.DoesNotExist:
            return True  # Allow connection to create new room