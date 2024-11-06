from django.db import transaction
from django.utils import timezone
from .models import PlayerQueue, GameSession

class MatchmakingService:
    @staticmethod
    def find_match(player):
        """
        Tries to find a match for the given player.
        Returns a GameSession if a match is found, None otherwise.
        """
        with transaction.atomic():
            # Look for players in queue with similar skill rating
            potential_matches = PlayerQueue.objects.exclude(
                player=player
            ).order_by('joined_at')[:1]
            
            if potential_matches:
                match = potential_matches[0]
                
                # Create game session
                game_session = GameSession.objects.create(
                    player1=player,
                    player2=match.player,
                    status=GameSession.IN_PROGRESS,
                    started_at=timezone.now()
                )
                
                # Remove both players from queue
                PlayerQueue.objects.filter(
                    player__in=[player, match.player]
                ).delete()
                
                return game_session
            
            return None

    @staticmethod
    def add_to_queue(player):
        """
        Adds a player to the matchmaking queue.
        """
        return PlayerQueue.objects.create(player=player)

    @staticmethod
    def remove_from_queue(player):
        """
        Removes a player from the matchmaking queue.
        """
        PlayerQueue.objects.filter(player=player).delete()