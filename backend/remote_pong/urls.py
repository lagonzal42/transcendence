from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

urlpatterns = [
    path('queue/join/', views.JoinQueueView.as_view(), name='join-queue'),
    path('queue/check/', views.CheckMatchView.as_view(), name='check-match')
]