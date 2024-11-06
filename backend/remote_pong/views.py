from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import GameSession
from .matchmaking_service import MatchmakingService
from django.shortcuts import get_object_or_404

class MatchmakingViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['POST'])
    def join_queue(self, request):
        try:
            MatchmakingService.add_to_queue(request.user)
            return Response({'status': 'joined queue'})
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['POST'])
    def leave_queue(self, request):
        MatchmakingService.remove_from_queue(request.user)
        return Response({'status': 'left queue'})

    @action(detail=False, methods=['GET'])
    def active_game(self, request):
        game = GameSession.objects.filter(
            status=GameSession.IN_PROGRESS
        ).filter(
            models.Q(player1=request.user) | 
            models.Q(player2=request.user)
        ).first()
        
        if game:
            return Response({
                'game_id': str(game.id),
                'opponent': game.player2.username if game.player1 == request.user else game.player1.username
            })
        return Response({'game_id': None})