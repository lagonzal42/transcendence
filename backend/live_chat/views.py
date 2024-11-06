from django.shortcuts import render
import os

from .models import *

from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view


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