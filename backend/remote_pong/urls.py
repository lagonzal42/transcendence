from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'matchmaking', views.MatchmakingViewSet, basename='matchmaking')

urlpatterns = [
    path('', include(router.urls)),
]