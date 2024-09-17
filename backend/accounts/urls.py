from . import views
from django.urls import path, include

app_name = 'accounts'

urlpatterns = [
    path('', views.BaseView, name='BaseView'),
    #path('account_list/', views.AccountList.as_view(), name='AccountList'),
    path('account_detail/<int:pk>', views.UserDetailView.as_view(), name='UserDetailView'),
    path('register_account/', views.RegisterView.as_view(), name='RegisterView'),
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

