import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
  avatar?: string;
  is_online?: boolean;
  games_played?: number;
  games_won?: number;
  games_lost?: number;
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

interface UserResponse {
  message: string;
  user: User;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  currentUsername: string = '';
  isLoading: boolean = false;
  error: string | null = null;
  searchQuery: string = '';
  searchResults: any[] = [];
  friendRequests: FriendRequest[] = [];
  friends: Friend[] = [];
  blockedUsers: any[] = [];

  userAvatar: string = 'assets/default-avatar.png';
  isUserOnline: boolean = false;
  userStats = {
    games_played: 0,
    games_won: 0,
    games_lost: 0
  };
  isOwnProfile: boolean = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const username = params['username'];
      if (username) {
        this.currentUsername = username;
        this.loadUserProfile(username);
        this.loadFriendRequests();
      }
    });
  }

  loadUserProfile(username: string) {
    this.isLoading = true;
    this.error = null;

    this.http.get<UserResponse>(`${this.authService.API_URL}/accounts/users/${username}/`).subscribe({
      next: (response) => {
        if (response.user && response.user.username) {
          this.currentUsername = response.user.username;
          this.userAvatar = response.user.avatar || 'assets/default-avatar.png';
          this.isUserOnline = response.user.is_online ?? false;
          this.userStats = {
            games_played: response.user.games_played ?? 0,
            games_won: response.user.games_won ?? 0,
            games_lost: response.user.games_lost ?? 0
          };
          this.loadFriends(response.user.username);
          this.isLoading = false;
        } else {
          console.error('Invalid user data:', response);
          this.error = 'Invalid user data received';
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.error = 'Failed to load user profile';
        this.isLoading = false;
      }
    });
  }

  showUpdateProfile() {
    this.router.navigate(['/profile/update']);
  }

  loadFriends(username: string) {
    if (!username) {
      console.error('Username is required to get friends');
      return;
    }

    this.http.get<Friend[]>(`${this.authService.API_URL}/accounts/users/${username}/friends/`).subscribe({
      next: (friends) => {
        this.friends = friends;
      },
      error: (error) => {
        console.error('Error loading friends:', error);
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
        this.loadUserProfile(this.currentUsername);
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
        this.friends = this.friends.filter(friend => friend.id !== userId);
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
