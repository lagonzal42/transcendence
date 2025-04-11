from django.apps import AppConfig, accounts

class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        import accounts.signals
        import os
        from django.conf import settings
        
        # Ensure media and avatar directories exist
        media_root = settings.MEDIA_ROOT
        avatars_dir = os.path.join(media_root, 'avatars')
        
        if not os.path.exists(media_root):
            os.makedirs(media_root, exist_ok=True)
            
        if not os.path.exists(avatars_dir):
            os.makedirs(avatars_dir, exist_ok=True)