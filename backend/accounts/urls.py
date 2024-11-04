from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    # User management
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('me/', views.CurrentUser.as_view(), name='current_user'),
    
    # User profile
    path('users/', views.AccountList.as_view(), name='user_list'),
    path('users/<str:username>/', views.UserDetailView.as_view(), name='user_detail'),
    path('users/<str:username>/update/', views.UpdateProfileView.as_view(), name='user_update'),
    path('users/<str:username>/close/', views.CloseAccountView.as_view(), name='user_close'),
    
    # Friend management
    path('users/<str:username>/friends/', views.ListFriendsView, name='friend_list'),
    path('users/<str:username>/friends/add/', views.AddFriendView.as_view(), name='friend_add'),
    path('users/<str:username>/friends/accept/', views.AcceptFriendRequestView.as_view(), name='friend_accept'),
]