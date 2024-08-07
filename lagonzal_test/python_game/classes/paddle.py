'''
    Paddle class for pong game
'''
UP = 0
DOWN = 1

class Paddle:
    def __init__(self, width : int, height : int, xPos : int, yPos : int):
        self.xPos = xPos
        self.yPos = yPos
        self.width = width
        self.height = height
        self.speed = 5
    
    def move(self, direction : bool):
        if (direction == UP):
            self.yPos -= self.speed
        else:
            self.yPos += self.speed
    

        