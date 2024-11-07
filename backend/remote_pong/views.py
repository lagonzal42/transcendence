from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import GameQueue, Match
import uuid

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_queue(request):
    player = request.user
    
    # Check if player is already in queue
    existing_queue = GameQueue.objects.filter(player=player, status='QUEUED').first()
    if existing_queue:
        return JsonResponse({'status': 'already_queued'})
    
    # Check for waiting players
    waiting_player = GameQueue.objects.filter(
        status='QUEUED'
    ).exclude(player=player).first()
    
    if waiting_player:
        # Create a match
        game_id = str(uuid.uuid4())
        Match.objects.create(
            player1=waiting_player.player,
            player2=player,
            game_id=game_id,
            status='ACTIVE'
        )
        
        # Update queue status
        waiting_player.status = 'MATCHED'
        waiting_player.save()
        
        return JsonResponse({
            'status': 'matched',
            'game_id': game_id
        })
    else:
        # Add player to queue
        GameQueue.objects.create(
            player=player,
            status='QUEUED'
        )
        return JsonResponse({'status': 'queued'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_match(request):
    player = request.user
    
    # Check if player has been matched
    match = Match.objects.filter(
        status='ACTIVE'
    ).filter(
        player1=player
    ).first()
    
    if not match:
        match = Match.objects.filter(
            status='ACTIVE'
        ).filter(
            player2=player
        ).first()
    
    if match:
        return JsonResponse({
            'status': 'matched',
            'game_id': match.game_id
        })
    
    return JsonResponse({'status': 'waiting'})