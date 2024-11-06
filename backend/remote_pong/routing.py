from django.urls import re_path
from . import consumers, matchmaking_consumer

websocket_urlpatterns = [
    re_path(r'ws/pong/(?P<game_id>\w+)/$', consumers.PongGameConsumer.as_asgi()),
    re_path(r'ws/matchmaking/$', matchmaking_consumer.MatchmakingConsumer.as_asgi()),
]