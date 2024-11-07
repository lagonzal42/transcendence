from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

urlpatterns = [
    path('queue/join/', views.join_queue, name='join-queue'),
    path('queue/check/', views.check_match, name='check-match')
]