from rest_framework import serializers
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('user_id', 'password', 'username', 'nickname')
        extra_kwargs = {'password': {'write_only': True}}

        def create(self, validated_data):
            user = User.objects.create_user(**validated_data)
            return user

class LoginSerializer(serializers.Serializer):
    user_id = serializers.CharField(max_length=255, write_only=True)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    def validate(self, data):
        user_id = data.get('user_id')
        password = data.get('password')
        userid = User.objects.get(user_id=user_id)
        re_password = User.objects.get(password=password)
        if user_id == userid.user_id:
            if password == re_password.password:
                return data

            else:
                raise serializers.ValidationError('Unsuccessful failed')

class UserUpdateSerializer(serializers.Serializer):
    nickname = serializers.CharField(max_length=30, allow_blank=True)
    comment = serializers.CharField(max_length=100, allow_blank=True)

    def update(self, instance, validated_data):
        instance.nickname = validated_data.get('nickname', instance.nickname)
        instance.comment = validated_data.get('comment', instance.comment)
        instance.save()
        return instance

# from rest_framework import serializers
# from .models import User

# class RegisterSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ('user_id', 'username', 'password', 'nickname')
#         extra_kwargs = {
#             'password': {'write_only': True}
#         }

#     def create(self, validated_data):
#         user = User.objects.create_user(**validated_data)
#         return user


# class LoginSerializer(serializers.Serializer):
#     user_id = serializers.CharField(max_length=255, write_only=True)
#     username = serializers.CharField(max_length=255, write_only=True, required=False)
#     password = serializers.CharField(write_only=True, style={'input_type': 'password'})

#     def validate(self, data):
#         user_id = data.get('user_id')
#         username = data.get('username')
#         password = data.get('password')

#         if user_id:
#             user = User.objects.filter(user_id=user_id).first()
#         elif username:
#             user = User.objects.filter(username=username).first()
#         else:
#             raise serializers.ValidationError('Either user_id or username must be provided.')

#         if user and user.check_password(password):
#             return data
#         else:
#             raise serializers.ValidationError('Login failed: Incorrect user_id/username or password.')


# class UserUpdateSerializer(serializers.Serializer):
#     nickname = serializers.CharField(max_length=30, allow_blank=True)
#     comment = serializers.CharField(max_length=100, allow_blank=True)
#     username = serializers.CharField(max_length=150, allow_blank=True)

#     def update(self, instance, validated_data):
#         instance.nickname = validated_data.get('nickname', instance.nickname)
#         instance.comment = validated_data.get('comment', instance.comment)
#         instance.username = validated_data.get('username', instance.username)
#         instance.save()
#         return instance
