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
    # Fields for reading (GET requests) - converts User objects to usernames
    player1_username = serializers.CharField(source='player1.username', read_only=True)
    player2_username = serializers.CharField(source='player2.username', read_only=True)
    player3_username = serializers.CharField(source='player3.username', read_only=True, allow_null=True)
    player4_username = serializers.CharField(source='player4.username', read_only=True, allow_null=True)
    winner_username = serializers.CharField(source='winner.username', read_only=True)

    # Fields for writing (POST requests) - converts IDs to User objects
    player1 = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True)
    player2 = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True)
    player3 = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True,required=False, allow_null=True, )
    player4 = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True, required=False,allow_null=True)
    winner = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True)

    class Meta:
        model = Match
        fields = [
            'id', 'player1', 'player2', 'player3', 'player4', 
            'player1_score', 'player2_score', 'winner', 
            'match_date', 'match_type', 
            'player1_username', 'player2_username', 
            'player3_username', 'player4_username', 'winner_username'
        ]