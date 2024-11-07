import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Match
import asyncio

class PongGameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.room_group_name = f'game_{self.game_id}'
        
        # Initialize game state
        self.game_state = {
            'player1_y': 200,
            'player2_y': 200,
            'ball_x': 350,
            'ball_y': 250,
            'ball_dx': 5,
            'ball_dy': 5,
            'score1': 0,
            'score2': 0,
            'game_over': False,
            'winner': None
        }

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        
        # Send initial game state
        await self.send(text_data=json.dumps(self.game_state))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        
        if data['type'] == 'paddle_move':
            # Update paddle position
            player_type = data.get('player_type')
            direction = data.get('direction')
            
            if player_type == 'player1':
                self.game_state['player1_y'] += 10 if direction == 'down' else -10
            else:
                self.game_state['player2_y'] += 10 if direction == 'down' else -10
                
            # Keep paddles within bounds
            self.game_state['player1_y'] = max(0, min(425, self.game_state['player1_y']))
            self.game_state['player2_y'] = max(0, min(425, self.game_state['player2_y']))

        # Broadcast the updated game state
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_state_update',
                'game_state': self.game_state
            }
        )

    async def game_state_update(self, event):
        await self.send(text_data=json.dumps(event['game_state']))