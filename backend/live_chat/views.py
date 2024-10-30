from django.shortcuts import render

# Create your views here.

def chatPage(request):
    context = {}
    return render(request, "live_chat/chatPage.html", context)