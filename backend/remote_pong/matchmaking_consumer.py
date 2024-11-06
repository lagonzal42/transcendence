from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from .models import PlayerQueue, GameSession
import json
from asgiref.sync import async_to_sync, sync_to_async

class MatchmakingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if not self.scope["user"].is_authenticated:
            await self.close()
            return

        await self.accept()
        await self.add_to_queue()

    async def disconnect(self, close_code):
        await self.remove_from_queue()

    @database_sync_to_async
    def add_to_queue(self):
        # Add player to queue
        player_queue = PlayerQueue.objects.create(
            player=self.scope["user"]
        )
        
        # Try to find a match
        self.find_match()

    @database_sync_to_async
    def remove_from_queue(self):
        PlayerQueue.objects.filter(player=self.scope["user"]).delete()

    @database_sync_to_async
    def find_match(self):
        # Get players in queue ordered by join time
        queued_players = PlayerQueue.objects.order_by('joined_at')
        
        if queued_players.count() >= 2:
            player1_queue = queued_players[0]
            player2_queue = queued_players[1]
            
            # Create game session
            game_session = GameSession.objects.create(
                player1=player1_queue.player,
                player2=player2_queue.player,
                status=GameSession.IN_PROGRESS,
                started_at=timezone.now()
            )
            
            # Remove players from queue
            player1_queue.delete()
            player2_queue.delete()
            
            # Notify players
            async_to_sync(self.channel_layer.group_send)(
                f"user_{player1_queue.player.id}",
                {
                    "type": "match_found",
                    "game_id": str(game_session.id)
                }
            )
            
            async_to_sync(self.channel_layer.group_send)(
                f"user_{player2_queue.player.id}",
                {
                    "type": "match_found",
                    "game_id": str(game_session.id)
                }
            )

    async def match_found(self, event):
        await self.send(text_data=json.dumps({
            "type": "match_found",
            "game_id": event["game_id"]
        }))