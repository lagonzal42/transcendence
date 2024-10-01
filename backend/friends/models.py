from django.db import models
from django.conf import settings
from django.utils import timezone


class FriendList(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="user")
    friends = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name="friend")

    def __str__(self):
        return self.user.username
    
    def add_friend(self, account):
        #add new friend
        
        if not account in self.friends.all():
            self.friends.add(account)
    
    def remove_friend(self, account):
        #remove a friend
        
        if account in self.friends.all():
            self.friend.remove(account)
    
    def unfriend(self, removee):
        #Initiate the action of unfriending someone
        remover_friends_list = self #person terminating the friendship
        
        remover_friends_list.remove_friend(removee)

        #remove the friend from removee friend list
        friends_list = FriendList.objects.get(user=removee)
        friends_list.remove_friend(self.user)

    def is_mutual_friend(self, friend):
        #is this a friend?
        if friend in self.friends.all():
            return True
        return False


class FriendRequest(models.Model):
    """
    A friend request consits of two main parts:
        1. SENDER:
            -Person sending/initiating the friend request
        2. RECEIVER:
            -Person receiving the friend request

    """

    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sender")
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="receiver")
    is_active = models.BooleanField(blank=True, null=False, default=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.sender.username
    
    def accept(self):
        """
        Accept a friend request
        Update both sender and receiver friend lists
        """
        receiver_friend_list = FriendList.objects.get(user=self.receiver)
        if receiver_friend_list:
            receiver_friend_list.add_friend(self.sender)
            sender_friend_list = FriendList.objects.get(user=self.sender)
            if sender_friend_list:
                sender_friend_list.add_friend(self.receiver)
                self.is_active = False
                self.save()

    def decline(self):
        """ 
        Decline a friend request
        It is "declined" by setting the is_active field to false
        """
        self.is_active=Flase
        self.save()
    
    def cancel(self):
        """
        Cancel friend request
        it is canceled by setting the is_active field to false, this is from the perspective of the sender
        This is only different with respect to "Decline" through the notification that is generated.
        """
        self.is_active = False
        self.save()

