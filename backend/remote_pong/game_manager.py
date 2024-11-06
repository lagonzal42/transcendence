from matchmaking.classes.paddle import Paddle
from matchmaking.classes.ball import Ball
import asyncio
import json

class GameState:
    def __init__(self, game_id, player1_id, player2_id):
        self.game_id = game_id
        self.game_width = 500
        self.game_height = 500
        self.paddle_height = 100
        self.paddle_width = 25
        
        # Initialize game objects
        self.ball = Ball(self.game_width / 2, self.game_height / 2)
        self.paddle1 = Paddle(self.paddle_width, self.paddle_height, 0, 
                            (self.game_height - self.paddle_height) / 2)
        self.paddle2 = Paddle(self.paddle_width, self.paddle_height, 
                            self.game_width - self.paddle_width, 
                            (self.game_height - self.paddle_height) / 2)
        
        self.player1_id = player1_id
        self.player2_id = player2_id
        self.player1_score = 0
        self.player2_score = 0
        
        self.is_running = False

    def update_game_state(self):
        if not self.is_running:
            return

        # Update ball position
        self.ball.move()
        self.ball.calculateCollisions(self.paddle1, self.paddle2, self.game_height)
        goal = self.ball.goalDetection(self.game_width)
        
        # Handle scoring
        if goal == 2:
            self.player2_score += 1
            self.ball = Ball(self.game_height / 2, self.game_height / 2)
        elif goal == 1:
            self.player1_score += 1
            self.ball = Ball(self.game_height / 2, self.game_height / 2)

    def get_game_state(self):
        return {
            'ball': {
                'x': self.ball.xPos,
                'y': self.ball.yPos
            },
            'paddle1': {
                'y': self.paddle1.yPos
            },
            'paddle2': {
                'y': self.paddle2.yPos
            },
            'score': {
                'player1': self.player1_score,
                'player2': self.player2_score
            }
        }