# from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import User, FriendRequest, AccountActivateToken, Match

admin.site.register(User)
admin.site.register(FriendRequest)
admin.site.register(AccountActivateToken)
admin.site.register(Match)
