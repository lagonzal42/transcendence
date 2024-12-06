from rest_framework import serializers
from .models import User, FriendRequest

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(max_length=68, write_only=True)
    password2 = serializers.CharField(max_length=68, write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'id', 'tournament_name', 'avatar', 'last_login', 'date_joined', 'games_played', 'games_won', 'games_lost', 'friends')

    def validate(self, attrs):
        password = attrs.get('password', '')
        password2 = attrs.get('password2', '')
        username = attrs.get('username', '')
        email = attrs.get('email', '')
        if password != password2:
            raise serializers.ValidationError('passwords do not match')
        
        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError('This username is already taken')
        
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError('This email is already taken')

        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')

        user = User.objects.create_user(
            username = validated_data.get('username'),
            email = validated_data.get('email'),
            is_active=False  # User is deactivated by default
        )
        user.set_password(password)
        user.save()
        return user

    
class LoginSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password')

    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            raise serialzier.ValidationError("Both username and password are required.")
        
        return data

class UpdateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('email', 'tournament_name', 'avatar')
        extra_kwargs = {
            'email': {'required': False},
            'tournament_name': {'required': False},
            'avatar': {'required': False}
        }

    def update(self, instance, validated_data):
        # Only update fields that were actually passed
        if 'email' in validated_data:
            instance.email = validated_data['email']
        if 'tournament_name' in validated_data:
            instance.tournament_name = validated_data['tournament_name']
        if 'avatar' in validated_data:
            instance.avatar = validated_data['avatar']
        
        instance.save()
        return instance

class FriendSerializer(serializers.ModelSerializer):
    class Meta:
        model = FriendRequest
        fields = ['from_user', 'to_user']

