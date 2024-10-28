import random
from math import sin, cos, radians
from .paddle import Paddle

'''
	Ball class for the pong game

'''


class Ball:
	MAXANGLE = 60

	def __init__(self, xPos : int, yPos : int):
		self.xPos = xPos
		self.yPos = yPos
		self.touches = 1
		self.speed = 1
		self.radius = 12
		
		self.xVector = 0
		while self.xVector == 0:
			self.xVector = random.randint(-1, 1)
		
		self.yVector = 0
		while self.yVector == 0:
			self.yVector = random.randint(-1, 1)
	
	def move(self):
		if self.touches > 1:
			self.speed += 1
			self.touches = 0
		self.xPos += self.speed * self.xVector
		self.yPos += self.speed * self.yVector

	
	def calculatePaddleCollision(self, paddle1 : Paddle, paddle2 : Paddle):
		if self.xPos <= paddle1.xPos + paddle1.width + self.radius:
			if self.yPos >= paddle1.yPos and self.yPos <= paddle1.yPos + paddle1.height:
				if self.xVector < 0:
					self.calculateRebound(paddle1, -1)
					self.touches += 1
		
		if self.xPos >= paddle2.xPos - paddle2.width + self.radius:
			if self.yPos >= paddle2.yPos and self.yPos <= paddle2.yPos + paddle2.height:
				if self.xVector > 0:
					self.calculateRebound(paddle2, 1)
					self.touches += 1
	
	def calculateCollisions(self, paddle1 : Paddle, paddle2 : Paddle, gameHeight : int):
		if self.yPos - self.radius <= 0:
			self.yVector *= -1
		elif self.yPos + self.radius >= gameHeight:
			self.yVector *= -1
		
		self.calculatePaddleCollision(paddle1, paddle2)

	def calculateRebound(self, paddle : Paddle, factor):
		relativeIntersection = 	self.yPos - (paddle.yPos + paddle.height / 2)
		normalIntersec = relativeIntersection / (paddle.height / 2)
		bounceAngle = (normalIntersec * self.MAXANGLE)
		self.calculateVectors(bounceAngle, factor)

	def goalDetection(self, gameWidth : int):
		if self.xPos + self.radius >= gameWidth:
			return (2)
		elif self.xPos - self.radius <= 0:
			return (1)
		return (0)
	
	def calculateVectors(self, bounceAngle : float, factor : int):
		radianAngle = radians(bounceAngle)
		self.yVector = sin(radianAngle)
		self.xVector =  - cos(radianAngle) * factor

	