from . import views
from django.urls import path, include
from accounts.views import UpdateProfileView

app_name = 'accounts'

urlpatterns = [
    path('account_list/', views.AccountList.as_view(), name='AccountList'),
    path('account_register/', views.RegisterView.as_view(), name='RegisterView'),
    path('account_detail/<int:id>', views.UserDetailView.as_view(), name='UserDetailView'),
    path('account_login/', views.LoginView.as_view(), name='LoginView'),
    path('account_close/', views.CloseAccountView.as_view(), name='CloseAccountView'),
    path('account_update/<int:id>', views.UpdateProfileView.as_view(), name='auth_update_profile'),
]