from django.test import TestCase

from accounts.models import AccountActivateToken
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class AccountActivateTokenTests(TestCase):

    def setUp(self):
        # Create a user and activation token for testing
        self.user = User.objects.create_user(username='testuser', password='password')
        self.token = AccountActivateToken.objects.create(user=self.user)

    def test_activate_user_by_token(self):
        # Simulate activating the user by token
        user_activated = AccountActivateToken.objects.activate_user_by_token(self.token.token)

        # Check if the user was activated
        self.assertIsNotNone(user_activated)
        self.assertEqual(user_activated, self.user)

        # Check if the token is deleted
        self.assertFalse(AccountActivateToken.objects.filter(user=self.user).exists())

