import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .game_manager import GameState
import asyncio

class PongGameConsumer(AsyncWebsocketConsumer):
    games = {}  # Store active games
    
    async def connect(self):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.game_group_name = f'game_{self.game_id}'
        
        # Join game group
        await self.channel_layer.group_add(
            self.game_group_name,
            self.channel_name
        )
        await self.accept()
        
        # Initialize game if not exists
        if self.game_id not in self.games:
            self.games[self.game_id] = GameState(
                self.game_id,
                self.scope['user'].id,
                None  # Will be set when second player joins
            )
            
    async def disconnect(self, close_code):
        # Leave game group
        await self.channel_layer.group_discard(
            self.game_group_name,
            self.channel_name
        )
        
        if self.game_id in self.games:
            del self.games[self.game_id]

    async def receive(self, text_data):
        data = json.loads(text_data)
        game = self.games.get(self.game_id)
        
        if not game:
            return
            
        if data['type'] == 'player_move':
            # Update paddle position based on player input
            if self.scope['user'].id == game.player1_id:
                if data['direction'] == 'up':
                    if game.paddle1.yPos - game.paddle1.speed >= 0:
                        game.paddle1.move(0)  # UP
                elif data['direction'] == 'down':
                    if game.paddle1.yPos + game.paddle1.height < game.game_height:
                        game.paddle1.move(1)  # DOWN
            else:
                if data['direction'] == 'up':
                    if game.paddle2.yPos - game.paddle2.speed >= 0:
                        game.paddle2.move(0)
                elif data['direction'] == 'down':
                    if game.paddle2.yPos + game.paddle2.height < game.game_height:
                        game.paddle2.move(1)
                        
            # Update game state and broadcast
            game.update_game_state()
            await self.channel_layer.group_send(
                self.game_group_name,
                {
                    'type': 'game_state_update',
                    'game_state': game.get_game_state()
                }
            )

    async def game_state_update(self, event):
        # Send game state to WebSocket
        await self.send(text_data=json.dumps(event['game_state']))