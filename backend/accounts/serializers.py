from rest_framework import serializers
from .models import User, FriendRequest, Match

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
        
        errors = {}
        
        if password != password2:
            errors['password'] = ['Passwords do not match']
        
        if User.objects.filter(username=username).exists():
            errors['username'] = ['This username is already taken']
        
        if User.objects.filter(email=email).exists():
            errors['email'] = ['This email is already taken']
            
        if errors:
            raise serializers.ValidationError(errors)

        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')

        user = User.objects.create_user(
            username = validated_data.get('username'),
            email = validated_data.get('email'),
            #is_active=False  # User is deactivated by default
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

class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = [
            'id', 
            'player1', 'player2', 'player3', 'player4',
            'player1_name', 'player2_name', 'player3_name', 'player4_name',
            'player1_score', 'player2_score', 'player3_score', 'player4_score',
            'winner', 'winner_name', 'match_date', 'match_type'
        ]

    def validate(self, data):
        # Validate that multiplayer matches have all required names and scores
        if data.get('match_type') == 'multiplayer':
            if not all([data.get('player3_name'), data.get('player4_name')]):
                raise serializers.ValidationError("Multiplayer matches require all 4 player names")
            if not all([data.get('player3_score'), data.get('player4_score')]):
                raise serializers.ValidationError("Multiplayer matches require scores for all players")
        
        return data
