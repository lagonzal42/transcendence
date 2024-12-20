from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    # User management
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('me/', views.CurrentUser.as_view(), name='current_user'),
    path('matches/', views.MatchCreateView.as_view(), name='match-create'),
    path('validate-credentials/', views.validate_credentials, name='validate-credentials'),
    
    # User profile
    path('users/', views.AccountList.as_view(), name='user_list'),
    path('users/search/', views.SearchUsersView.as_view(), name='user_search'),
    path('users/<str:username>/', views.UserDetailView.as_view(), name='user_detail'),
    path('users/<str:username>/update/', views.UpdateProfileView.as_view(), name='user_update'),
    path('users/<str:username>/close/', views.CloseAccountView.as_view(), name='user_close'),
    path('users/<str:username>/matches/', views.UserMatchHistoryView.as_view(), name='user-match-history'),
    
    # Friend management
    path('users/<str:username>/friends/', views.ListFriendsView, name='friend_list'),
    path('friend-requests/', views.FriendRequestListView.as_view(), name='friend_request_list'),
    path('friend-requests/send/', views.SendFriendRequestView.as_view(), name='send_friend_request'),
    path('friend-requests/accept/', views.AcceptFriendRequestView.as_view(), name='accept_friend_request'),
    path('friend-requests/decline/', views.DeclineFriendRequestView.as_view(), name='decline_friend_request'),
    
    # Blocking functionality
    path('block/<int:user_id>/', views.BlockUserView.as_view(), name='block_user'),
    path('unblock/<int:user_id>/', views.UnblockUserView.as_view(), name='unblock_user'),
    path('blocked-users/', views.BlockedUsersListView.as_view(), name='blocked_users_list'),
]