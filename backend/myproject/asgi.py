# """
# ASGI config for myproject project.

# It exposes the ASGI callable as a module-level variable named ``application``.

# For more information on this file, see
# https://docs.djangoproject.com/en/3.2/howto/deployment/asgi/
# """

# import os
# from channels.auth import AuthMiddlewareStack
# from channels.routing import ProtocolTypeRouter, URLRouter
# from channels.security.websocket import AllowedHostsOriginValidator
# from django.core.asgi import get_asgi_application
# import liveCalculator.routing

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')

# #application = get_asgi_application()
# django_asgi_app = get_asgi_application()
# # Initialize Django ASGI application early to ensure the AppRegistry
# # is populated before importing code that may import ORM models.

# application = ProtocolTypeRouter({
#     "http": django_asgi_app,
#     # Just HTTP for now. (We can add other protocols later.)
#     "websocket": AllowedHostsOriginValidator(
#         AuthMiddlewareStack(URLRouter(liveCalculator.routing.websocket_urlpatterns))
#         ),
# })
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
import liveCalculator.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(
                liveCalculator.routing.websocket_urlpatterns
            )
        )
    ),
})