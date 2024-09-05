#from .serializers import RegisterSerializer,LoginSerializer, UserUpdateSerializer
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_201_CREATED, HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND, HTTP_500_INTERNAL_SERVER_ERROR
from rest_framework.generics import GenericAPIView
from rest_framework.views import APIView
from .models import  User, AccessToken
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

from .models import User
from .serializers import UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


class UserLogIn(ObtainAuthToken):
    
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token = Token.objects.get(user=user)
        return Response({
            'token': token.key,
            'id': user.pk,
            'username': user.username
        })

# class RegisterView(APIView):
#     @staticmethod
#     def post(request, *args, **kwargs):
#         print(request.data)
#         serializer = RegisterSerializer(data=request.data)
#         if serializer.is_valid(raise_exception=True):
#             # If the password and confirmation password do not match
#             if serializer.validated_data['password'] != request.data['password_confirmation']:
#                 return Response({'error': 2}, status=HTTP_400_BAD_REQUEST)

#             # If the UserID has already been used
#             if User.objects.filter(user_id=serializer.validated_data['user_id']).exists():
#                 return Response({'error': 3}, status=HTTP_400_BAD_REQUEST)

#             # No error
#             try:
#                 serializer.save()
#             except:
#                 # database error
#                 return Response({'error': 11}, status=HTTP_500_INTERNAL_SERVER_ERROR)

#             return Response(serializer.data, status=HTTP_201_CREATED)
#         return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

# class LoginView(GenericAPIView):
#     """API login class"""
#     permission_classes = [AllowAny]
#     serializer_class = LoginSerializer

#     def post(self, request, *args, **kwargs):
#         serializer = self.get_serializer(data=request.data)
#         if serializer.is_valid(raise_exception=True):
#             user = User.objects.get(user_id=serializer.validated_data["user_id"])
#             user_id = serializer.validated_data['user_id']
#             token = AccessToken.create(user)
#             return Response({'detail': "Login successful.", 'error': 0, 'token': token.token, 'user_id': user_id})
#         return Response({'error': 1}, status=HTTP_400_BAD_REQUEST)
#    permission_classes = [AllowAny]
#    serializer_class = LoginSerializer


#    def post(self, request, *args, **kwargs):
#         serializer = LoginSerializer(data=request.data)
#         if serializer.is_valid(raise_exception=True):
#             user = authenticate(
#                 user_id=serializer.validated_data['user_id'],
#                 password=serializer.validated_data['password']
#             )
#             if user is not None:
#                 refresh = RefreshToken.for_user(user)
#                 return Response({
#                     'refresh': str(refresh),
#                     'access': str(refresh.access_token),
#                 }, status=status.HTTP_200_OK)
#             else:
#                 return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class UserDetailView(APIView):
#     # permission_classes = [IsAuthenticated]
#     def get(self, request, user_id):
#         # Obtain user info
#         user = User.objects.filter(user_id=user_id).first()

#         if not user:
#             # If user doesn't exist
#             return Response({"message": "No User found"}, status=404)

#         response_data = {
#             "message": "User details by user_id",
#             "user": {
#                 "username": user.username,
#                 "user_id": user.user_id,
#                 "nickname": user.nickname,
#                 "comment": user.comment
#             }
#         }

#         return Response(response_data, status=200)

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

# class CloseAccountView(APIView):
#     def post(self, request, user_id):
#         ## Remove account
#         try:
#             user = User.objects.filter(user_id=user_id).first()
#             user.delete()
#         except User.DoesNotExist:
#             raise Response("No User found")

#         return Response({"message": "Account and user successfully removed"}, status=200)
        