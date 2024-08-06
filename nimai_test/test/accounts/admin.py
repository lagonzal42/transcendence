from django.contrib import admin
from django.contrib.auth.models import Group

from .models import User


class UserAdmin(admin.ModelAdmin):
    list_display = ("account_id", "email", "is_superuser")
    readonly_fields = ('created_at', 'updated_at')
    ordering = ("-updated_at",)
    exclude = ("username", )

    fieldsets = (
        (None, {"fields": ("account_id", "email", "first_name", "last_name", "birth_date",
                           "is_active", "created_at", "updated_at"
                           )}),
        ("Permissions", {
         "fields": ("is_superuser", "is_staff", "user_permissions")
         }),
    )


admin.site.register(User, UserAdmin)
admin.site.unregister(Group)