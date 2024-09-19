from .serializers import UserRegisterSerializer, LoginSerializer
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_201_CREATED, HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND, HTTP_500_INTERNAL_SERVER_ERROR
from rest_framework.generics import GenericAPIView, ListAPIView
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny
# For JWT
# from rest_framework_simplejwt.tokens import RefreshToken
# from django.contrib.auth import authenticate
# from rest_framework.permissions import IsAuthenticated


from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view

from .models import User
from django.db import IntegrityError
from django.shortcuts import render

from django.contrib.auth.forms import UserCreationForm
from django.urls import reverse_lazy
from django.contrib.auth import authenticate
from django.core.mail import EmailMessage

def BaseView(request):
    users = User.objects.all()
    return render(request, 'accounts/base.html', {'users':users})

class AccountList(ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer


class RegisterView(APIView):
    serializer_class = UserRegisterSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            user = serializer.data
            return Response({
                'data':user,
                'message': 'Thanks for signing up'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserDetailView(APIView):
    # permission_classes = [IsAuthenticated]
    def get(self, request, id):
        # Obtain user info
        user = User.objects.filter(pk=id).first()

        if not user:
            # If user doesn't exist
            return Response({"message": "No User found"}, status=404)

        response_data = {
            "message": "Found user",
            "user": {
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "id": user.id,
            }
        }
        return Response(response_data, status=200)

class LoginView(GenericAPIView):
    """API login class"""
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user = authenticate(
                username=serializer.validated_data['username'],
                password=serializer.validated_data['password']
            )
            if user is not None:
                return Response({
                    'user_id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                }, status=200)
            else:
                return Response({'error': 'Invalid credentials'}, status=400)
        return Response(serializer.errors, status=400)

# class UserUpdateView(APIView):
#     def patch(self, request, user_id):
#         # Obtain user info
#         user = User.objects.filter(user_id=user_id).first()

#         if not user:
#             # If user doesn't exist
#             return Response({"message": "No User found"}, status=404)

#         if user_id != user.user_id:
#             # If a user with an ID different from that of the authorisation is specified
#             return Response({"message": "No Permission for Update"}, status=403)

#         serializer = UserUpdateSerializer(user, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()

#             response_data = {
#                 "message": "User successfully updated",
#                 "user": {
#                     "nickname": user.nickname,
#                     "comment": user.comment
#                 }
#             }
#             return Response(response_data, status=200)
#         else:
#             error_message = serializer.errors.get('non_field_errors', ['User updation failed'])[0]
#             return Response({"message": "User updation failed", "cause": error_message}, status=400)

#     def post(self, request, user_id):
#         return Response({"message": "Method not allowed"}, status=405)

class CloseAccountView(APIView):
    def post(self, request, id):
        ## Remove account
        try:
            user = User.objects.filter(id=id).first()
            user.delete()
        except User.DoesNotExist:
            raise Response("No User found")

        return Response({"message": "Account and user successfully removed"}, status=200)
        