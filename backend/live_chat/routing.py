from django.urls import path, re_path

from .consumers import *

websocket_urlpatterns = [
    path("" , ChatConsumer.as_asgi()) , 
]