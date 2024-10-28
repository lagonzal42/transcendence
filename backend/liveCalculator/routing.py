from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/livec/$', consumers.Calculator.as_asgi()),
    re_path(r"ws/calc/(?P<room_name>\w+)/$", consumers.ChatConsumer.as_asgi()),
    re_path(r"ws/game/$", consumers.MultiplayerConsumer.as_asgi()),
    ]
