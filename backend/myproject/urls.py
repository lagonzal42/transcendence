"""myproject URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic.base import RedirectView
from django.urls import reverse_lazy
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),
    path('accounts/', include('accounts.urls')),
    # authenticate users in the browsable API interface without having to manually set up a login system
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    re_path(r'^$', RedirectView.as_view(url=reverse_lazy('api-root'), permanent=False)),
    # obtain JWT token
    path('api-auth/jwt/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    # reobtain JWT token
    path('api-auth/jwt/refresh', TokenRefreshView.as_view(), name='token_refresh'),
    # path('chat/', include('live_chat.urls')),

    # API Endpoints
    # path('api/', include([
    #     # Auth endpoints
    #     path('auth/', include([
    #         path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    #         path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    #         path('', include('rest_framework.urls')),
    #     ])),
    # ])),
    path('two_factor_auth/', include('two_factor_auth.urls', namespace='two_factor_auth')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
