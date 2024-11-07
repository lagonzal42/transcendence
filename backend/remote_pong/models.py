# matchmaking/models.py
from django.db import models
from accounts.models import User

class GameQueue(models.Model):
    player = models.ForeignKey(User, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    skill_rating = models.IntegerField(default=1000)
    status = models.CharField(max_length=20, choices=[
        ('QUEUED', 'In Queue'),
        ('MATCHED', 'Matched'),
        ('PLAYING', 'In Game')
    ])
    
class Match(models.Model):
    player1 = models.ForeignKey(User, related_name='player1_matches', on_delete=models.CASCADE)
    player2 = models.ForeignKey(User, related_name='player2_matches', on_delete=models.CASCADE)
    game_id = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    winner = models.ForeignKey(User, null=True, related_name='won_matches', on_delete=models.SET_NULL)