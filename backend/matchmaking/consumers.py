from channels.generic.websocket import AsyncWebsocketConsumer

class Matchmaking(AsyncWebsocketConsumer):
    
    async def connect(self):
        await self.accept()

    