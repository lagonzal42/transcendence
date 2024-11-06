import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from '../services/chat.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface FriendRequest {
  id: number;
  from_user: User;
  to_user: User;
  status: string;
  created_at: string;
}

interface ChatUser {
  id: number;
  username: string;
  isBlocked: boolean;
}

interface Friend {
  id: number;
  username: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  friends: Friend[] = [];
  currentUsername: string = '';
  isLoading: boolean = true;
  error: string | null = null;
  searchQuery: string = '';
  searchResults: User[] = [];
  friendRequests: FriendRequest[] = [];
  blockedUsers: ChatUser[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadFriendRequests();
    this.loadBlockedUsers();
  }

  loadUserData() {
    this.isLoading = true;
    this.error = null;

    this.http.get<User>(`${this.authService.API_URL}/accounts/me/`).subscribe({
      next: (user) => {
        this.currentUsername = user.username;
        this.getFriends(user.username);
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        this.error = 'Failed to load user data';
        this.isLoading = false;
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  getFriends(username: string) {
    if (!username) {
      console.error('Username is required to get friends');
      return;
    }

    this.http.get(`http://localhost:8000/accounts/users/${username}/friends/`).subscribe({
      next: (data: any) => {
        this.friends = data.map((friend: any) => ({
          id: friend.id,
          username: friend.username
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error getting friends:', error);
        this.error = 'Failed to load friends';
        this.isLoading = false;
      }
    });
  }

  startChat(friendUsername: string) {
    if (!this.currentUsername) {
      console.error('Current user not loaded');
      return;
    }
    const roomName = this.chatService.createChatRoom(this.currentUsername, friendUsername);
    this.router.navigate(['/chat', roomName]);
  }

  searchUsers() {
    if (this.searchQuery.trim()) {
      this.authService.searchUsers(this.searchQuery).subscribe({
        next: (results) => {
          this.searchResults = results;
        },
        error: (error) => {
          console.error('Error searching users:', error);
          this.error = 'Failed to search users';
        }
      });
    }
  }

  sendFriendRequest(username: string) {
    this.authService.sendFriendRequest(username).subscribe({
      next: (response) => {
        console.log('Friend request sent successfully:', response);
        this.searchResults = this.searchResults.filter(user => user.username !== username);
      },
      error: (err) => {
        console.error('Error sending friend request:', err);
        if (err.error && err.error.message) {
          this.error = err.error.message;
        } else {
          this.error = 'Failed to send friend request';
        }
      }
    });
  }

  loadFriendRequests() {
    this.authService.getFriendRequests().subscribe({
      next: (requests) => {
        this.friendRequests = requests;
      },
      error: (error) => {
        console.error('Error loading friend requests:', error);
        this.error = 'Failed to load friend requests';
      }
    });
  }

  acceptFriendRequest(request: FriendRequest) {
    this.authService.acceptFriendRequest(request.from_user.username).subscribe({
      next: () => {
        this.friendRequests = this.friendRequests.filter(
          req => req.from_user.username !== request.from_user.username
        );
        this.loadUserData();
      },
      error: (error) => {
        console.error('Error accepting friend request:', error);
        this.error = 'Failed to accept friend request';
      }
    });
  }

  declineFriendRequest(requestId: number) {
    this.authService.declineFriendRequest(requestId).subscribe({
      next: () => {
        this.friendRequests = this.friendRequests.filter(req => req.id !== requestId);
      },
      error: (error) => {
        console.error('Error declining friend request:', error);
        this.error = 'Failed to decline friend request';
      }
    });
  }

  loadBlockedUsers() {
    this.isLoading = true;
    this.chatService.getBlockedUsers().subscribe({
      next: (users) => {
        this.blockedUsers = users;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading blocked users:', error);
        this.error = 'Failed to load blocked users';
        this.isLoading = false;
      }
    });
  }

  blockUser(userId: number) {
    this.chatService.blockUser(userId).subscribe({
      next: () => {
        // Remove from friends list if present
        this.friends = this.friends.filter(friend => friend.id !== userId);
        // Reload blocked users
        this.loadBlockedUsers();
      },
      error: (error) => {
        console.error('Error blocking user:', error);
        this.error = 'Failed to block user';
      }
    });
  }

  unblockUser(userId: number) {
    this.chatService.unblockUser(userId).subscribe({
      next: () => {
        this.blockedUsers = this.blockedUsers.filter(user => user.id !== userId);
      },
      error: (error) => {
        console.error('Error unblocking user:', error);
        this.error = 'Failed to unblock user';
      }
    });
  }
}
