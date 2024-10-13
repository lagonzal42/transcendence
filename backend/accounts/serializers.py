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
        if password != password2:
            raise serializers.ValidationError('passwords do not match')
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')

        user = User.objects.create_user(
            username = validated_data.get('username'),
            email = validated_data.get('email'),
            first_name = validated_data.get('first_name'),
            last_name = validated_data.get('last_name'),
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
    email = serializers.EmailField(required=True)
    friends = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'tournament_name', 'friends')

    def validate_email(self, value):
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError({"email": "This email is already in use."})
        return value

    def validate_username(self, value):
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(username=value).exists():
            raise serializers.ValidationError({"username": "This username is already in use."})
        return value
    
    def update(self, instance, validated_data):
        instance.email = validated_data['email']
        instance.username = validated_data['username']
        instance.tournament_name = validated_data['tournament_name']

        instance.save()

        return instance

class FriendSerializer(serializers.ModelSerializer):
    class Meta:
        model = FriendRequest
        fields = ['from_user', 'to_user']

