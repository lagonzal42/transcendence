from . import views
from django.urls import path, include



urlpatterns = [
    # path('signup/', views.RegisterView.as_view(), name='user-signup'), #new user registration
    # path('login/', views.LoginView.as_view(), name='user-login'),#login control
    # path('users/<str:user_id>/', views.UserDetailView.as_view(), name='user-detail'), # Obtain user info
    # path('users/<str:user_id>/update/', views.UserUpdateView.as_view(), name='user-update'), # Undate user info
    # path('delete/<str:user_id>/', views.CloseAccountView.as_view(), name='close-account'), # remove account
    # # obtain jwt-token
    # path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    # # reobtain jwt-token
    # path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
        
]

