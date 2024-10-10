from django.urls import path
from .views import Send2FACodeView, Verify2FAView

app_name = 'two_factor_auth'

urlpatterns = [
    path('send-code/<int:user_id>/', Send2FACodeView.as_view(), name='send_2fa_code'),
    path('verify/', Verify2FAView.as_view(), name='verify_2fa'),
]
