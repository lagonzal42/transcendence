from django.shortcuts import render
import os

from .models import *

from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view


# Create your views here.

def chatPage(request, room_name):
    print(f"ChatPage view called with room_name: {room_name}")  # Debug print
    print(f"Current working directory: {os.getcwd()}")  # Print working directory
    print(f"Request path: {request.path}")  # Print the request path
    
    template_path = "live_chat/chatPage.html"
    print(f"Looking for template: {template_path}")  # Print template path
    
    context = {
        'room_name': room_name
    }
    try:
        return render(request, template_path, context)
    except Exception as e:
        print(f"Error rendering template: {e}")  # Debug print
        raise