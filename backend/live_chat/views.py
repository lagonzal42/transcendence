from django.shortcuts import render

from .models import *

from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view


# Create your views here.

def chatPage(request):
    context = {}
    return render(request, "live_chat/chatPage.html", context)