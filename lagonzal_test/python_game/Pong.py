import pygame
import random
from classes.paddle import Paddle
from classes.ball import Ball

pygame.init()

UP = 0
DOWN = 1

gameWidth = 500
gameHeight = 500
ballRadius = 12


win = pygame.display.set_mode((gameWidth, gameHeight))

pygame.display.set_caption("Pong")

paddleHeight = 100
paddleWidth = 25

player1Score = 0
player2Score = 0



ball = Ball(gameWidth / 2, gameHeight / 2)
paddle1 = Paddle(paddleWidth, paddleHeight, 0, (gameHeight - paddleHeight) / 2)
paddle2 = Paddle(paddleWidth, paddleHeight, gameWidth - paddleWidth, (gameHeight - paddleHeight) / 2)
run  = True
while run:
    pygame.time.delay(10)
    
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            run = False
    
    keys = pygame.key.get_pressed()

    if (keys[pygame.K_UP]):
        if paddle2.yPos - paddle2.speed >= 0:
            paddle2.move(UP)
    if (keys[pygame.K_DOWN]):
        if paddle2.yPos + paddle2.height < gameHeight:
            paddle2.move(DOWN)
    if (keys[pygame.K_w]):
        if paddle1.yPos - paddle1.speed >= 0:
            paddle1.move(UP)
    if (keys[pygame.K_s]):
        if paddle1.yPos + paddle1.height < gameHeight:
            paddle1.move(DOWN)

    ball.move()
    ball.calculateCollisions(paddle1, paddle2, gameHeight)
    goal = ball.goalDetection(gameWidth)
    
    if goal == 2:
        player2Score += 1
        ball = Ball(gameHeight / 2, gameHeight / 2)
    elif goal == 1:
        player1Score += 1
        ball = Ball(gameHeight / 2, gameHeight / 2)
    
    if goal != 0:
        print(f"Score: {player1Score} : {player2Score}")
    
    pygame.draw.rect(win, (0, 0, 0), (0, 0, gameWidth, gameHeight))
    pygame.draw.rect(win, (255, 0, 0), (paddle1.xPos, paddle1.yPos, paddle1.width, paddle1.height))
    pygame.draw.rect(win, (0, 255, 0), (paddle2.xPos, paddle2.yPos, paddle2.width, paddle2.height))
    pygame.draw.circle(win, (255, 250, 5), (ball.xPos, ball.yPos), ball.radius, 0)
    pygame.display.update()

pygame.quit()