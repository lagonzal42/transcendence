from django.shortcuts import render
import os

from .models import *

from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import Room, Message
from django.shortcuts import get_object_or_404

# Create your views here.

def chatPage(request, room_name):
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_room_messages(request, room_name):
    room = get_object_or_404(Room, uuid=room_name)
    messages = room.messages.all().order_by('created_at')

    message_list = [{
        'message': msg.body, 
        'username': msg.sent_by,
        'timestamp': msg.created_at.isoformat()
    } for msg in messages]

    return Response(message_list)