from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from django.utils import timezone
import random
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status
from accounts.models import User


class Send2FACodeView(GenericAPIView):
    """Sends 2FA code to user's email"""
    def get(self, request, user_id):
        # Get user
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Generate a random 2FA code
        code = random.randint(100000, 999999)

        # Store the code and expiry in session
        request.session['2fa_code'] = code
        expiry_time = timezone.now() + timezone.timedelta(minutes=5)
        request.session['2fa_code_expiry'] = expiry_time.isoformat()

        # Send the 2FA code via email
        send_mail(
            'Your 2FA Code',
            f'Your verification code is: {code}',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )

        return Response({
            'message': '2FA code sent to your email.'
        }, status=status.HTTP_200_OK)

class Verify2FAView(GenericAPIView):
    """Verifies the 2FA code"""
    def post(self, request, *args, **kwargs):
        code = request.data.get('code')

        # Get stored code and expiry from session
        stored_code = request.session.get('2fa_code')
        expiry_time_str = request.session.get('2fa_code_expiry')

        # Verify 2FA code and expiry
        if not expiry_time_str or timezone.now() > timezone.datetime.fromisoformat(expiry_time_str):
            return Response({'error': '2FA session expired'}, status=status.HTTP_400_BAD_REQUEST)

        if stored_code and code == str(stored_code):
            # 2FA success
            user_id = request.session.get('user_id')
            if user_id:
                user = User.objects.get(id=user_id)

                # Create JWT tokens
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'message': 'Login successful'
                }, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'User session expired'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Invalid 2FA code'}, status=status.HTTP_400_BAD_REQUEST)


# from django.shortcuts import render

# # Create your views here.



# class LoginView(GenericAPIView):
#     """API login class"""
#     permission_classes = [AllowAny]
#     serializer_class = LoginSerializer

#     def post(self, request, *args, **kwargs):
#         serializer = self.get_serializer(data=request.data)
#         if serializer.is_valid(raise_exception=True):
#             user = authenticate(
#                 username=serializer.validated_data['username'],
#                 password=serializer.validated_data['password']
#             )
#             if user is not None:
#                 # Generate a random 2FA code
#                 code = random.randint(100000, 999999)

#                 # Store the code in the session
#                 request.session['2fa_code'] = code
                
#                 # Convert datetime to string before storing in session
#                 expiry_time = timezone.now() + timezone.timedelta(minutes=5)
#                 request.session['2fa_code_expiry'] = expiry_time.isoformat()
#                 print(f"Session data before saving: {request.session.items()}")



#                 request.session.save() # Explicitly save the session

#                 # Debug: Log session data
#                 print(f"Session key: {request.session.session_key}")
#                 print(f"Stored 2FA code: {request.session.get('2fa_code')}")
#                 print(f"Expiry time: {request.session.get('2fa_code_expiry')}")

#                 # # Retrieve stored 2FA code and expiry from session
#                 # test_code = request.session.get('2fa_code')
#                 # test_expiry_time_str = request.session.get('2fa_code_expiry')

#                 # # Debugging logs
#                 # print(f"TEST** Stored 2FA code: {test_code}")
#                 # print(f"TEST** Expiry time string from session: {test_expiry_time_str}")

#                 # Send the code via email
#                 send_mail(
#                     'Your 2FA Code',
#                     f'Your verification code is: {code}',
#                     settings.DEFAULT_FROM_EMAIL,
#                     [user.email],
#                     fail_silently=False,
#                 )

#                 return Response({
#                     'message': '2FA code sent to your email. Please verify to complete login.'
#                 }, status=200)
#             else:
#                 return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class Verify2FAView(GenericAPIView):
#     """API 2FA verification class"""
#     permission_classes = [AllowAny]

#     def post(self, request, *args, **kwargs):
#         code = request.data.get('code')
#         # In Verify2FAView
#         print(f"Session data in Verify2FAView: {request.session.items()}")

#         # Retrieve stored 2FA code and expiry from session
#         stored_code = request.session.get('2fa_code')
#         expiry_time_str = request.session.get('2fa_code_expiry')

#         # Debugging logs
#         print(f"Session key: {request.session.session_key}")

#         print(f"Stored 2FA code: {stored_code}")
#         print(f"Received 2FA code: {code}")
#         print(f"Expiry time string from session: {expiry_time_str}")

#         # Convert expiry_time back to a datetime object
#         if expiry_time_str:
#             try:
#                 expiry_time = timezone.datetime.fromisoformat(expiry_time_str)
#                 print(f"Converted expiry time: {expiry_time}")
#                 print(f"Current time: {timezone.now()}")
#             except Exception as e:
#                 print(f"Error converting expiry time: {e}")
#                 return Response({'error': 'Error parsing 2FA expiry time'}, status=status.HTTP_400_BAD_REQUEST)
#         else:
#             print("Expiry time not found in session")
#             return Response({'error': '2FA session expired or invalid'}, status=status.HTTP_400_BAD_REQUEST)

#         # # Convert expiry_time back to a datetime object
#         # if expiry_time_str:
#         #     expiry_time = timezone.datetime.fromisoformat(expiry_time_str)
#         # else:
#         #     return Response({'error': '2FA session expired or invalid'}, status=status.HTTP_400_BAD_REQUEST)

#         # Verify 2FA code and expiry
#         if code and code == str(stored_code) and timezone.now() < expiry_time:
#             # Get the user from the session
#             user_id = request.session.get('user_id')  # Ensure user ID is stored after successful authentication
#             if user_id:
#                 try:
#                     user = User.objects.get(id=user_id)

#                     # Create JWT token
#                     refresh = RefreshToken.for_user(user)

#                     # Clear the session data
#                     del request.session['2fa_code']
#                     del request.session['2fa_code_expiry']
#                     del request.session['user_id']

#                     # Return user information and tokens
#                     return Response({
#                         'user_id': user.id,
#                         'username': user.username,
#                         'email': user.email,
#                         'first_name': user.first_name,
#                         'last_name': user.last_name,
#                         'refresh': str(refresh),
#                         'access': str(refresh.access_token),
#                     }, status=200)
#                 except User.DoesNotExist:
#                     return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
#             else:
#                 return Response({'error': 'User session expired or invalid'}, status=status.HTTP_400_BAD_REQUEST)
#         else:
#             return Response({'error': 'Invalid or expired 2FA code'}, status=status.HTTP_400_BAD_REQUEST)