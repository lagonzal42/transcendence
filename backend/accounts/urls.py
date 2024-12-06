from django.urls import path
from . import views
from django.urls import path, include
from accounts.views import UpdateProfileView
from rest_framework.routers import DefaultRouter
from .views import ListFriendsView, AddFriendView, AcceptFriendRequestView, ActivateAccountView

app_name = 'accounts'

urlpatterns = [
    path('account_list/', views.AccountList.as_view(), name='AccountList'),
    # path('account_register/', views.RegisterView.as_view(), name='RegisterView'),
    # path('account_detail/<str:username>', views.UserDetailView.as_view(), name='UserDetailView'),
    # path('account_login/', views.LoginView.as_view(), name='LoginView'),
    # path('account_close/', views.CloseAccountView.as_view(), name='CloseAccountView'),
    # path('account_update/<str:username>', views.UpdateProfileView.as_view(), name='auth_update_profile'),
    # path('list_friends/<str:username>', ListFriendsView.as_view(), name='ListFriendsView'),
    # path('add_friend/<str:username>', AddFriendView.as_view(), name="AddFriendView"),
    # path('accept_friend_request/<str:username>', AcceptFriendRequestView.as_view(), name="AcceptFriendRequest"),
    # path('activation/', views.ActivateAccountView.as_view(), name='activate_account'),

    # User management
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('me/', views.CurrentUser.as_view(), name='current_user'),
    
    # User profile
    path('users/', views.AccountList.as_view(), name='user_list'),
    path('users/search/', views.SearchUsersView.as_view(), name='user_search'),
    path('users/<str:username>/', views.UserDetailView.as_view(), name='user_detail'),
    path('users/<str:username>/update/', views.UpdateProfileView.as_view(), name='user_update'),
    path('users/<str:username>/close/', views.CloseAccountView.as_view(), name='user_close'),
    
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