import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ChatService } from '../services/chat.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { FormsModule } from '@angular/forms';
import { WebSocketService } from '../services/websocket.service';
import { Subscription } from 'rxjs';
import { MatchHistoryComponent } from '../match-history/match-history.component';

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
  is_online?: boolean;
}

interface UserResponse {
  message: string;
  user: User;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, MatchHistoryComponent    ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit, OnDestroy {
  currentUsername: string = '';
  isLoading: boolean = false;
  error: string | null = null;
  searchQuery: string = '';
  searchResults: any[] = [];
  friendRequests: FriendRequest[] = [];
  friends: Friend[] = [];
  blockedUsers: any[] = [];
  public readonly API_URL = 'http://localhost:8000';

  userAvatar: string = 'assets/default-avatar.png';
  isUserOnline: boolean = false;
  userStats = {
    games_played: 0,
    games_won: 0,
    games_lost: 0
  };
  isOwnProfile: boolean = false;
  private userStatusSubscription!  : Subscription;
  onlineUsers: Set<number> = new Set();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const username = params['username'];
      if (username) {
        this.currentUsername = username;
        this.loadUserProfile(username);
      }
    });

    this.route.params.subscribe(params => {
      const username = params['username'];
      if (username) {
        this.currentUsername = username;
        this.loadUserProfile(username);
        this.loadFriendRequests();
      }
    });

    // Subscribe to user status updates
    this.subscriptionStatus();
  }

  ngOnDestroy() {
    if (this.userStatusSubscription) {
      this.userStatusSubscription.unsubscribe();
    }
  }


  subscriptionStatus():void
  {
    this.userStatusSubscription = this.webSocketService.userStatus$.subscribe(status => {
      if (status.status === 'online') {
        this.onlineUsers.add(status.user_id);
      } else {
        this.onlineUsers.delete(status.user_id);
      }
      this.friends = [...this.friends];
    });
  }
  loadUserProfile(username: string) {
    this.isLoading = true;
    this.error = null;

    
    this.authService.getCurrentUser().subscribe({
      next: (currentUser) => {
        this.isOwnProfile = currentUser.username === username;
        this.http.get<UserResponse>(`http://localhost:8000/accounts/users/${username}/`).subscribe({
          next: (response) => {
            if (response.user && response.user.username) {
              this.currentUsername = response.user.username;
              if (response.user.avatar) {
                this.userAvatar = `http://localhost:8000${response.user.avatar}`;
              } else {
                this.userAvatar = 'assets/default-avatar.png';
              }
              this.isUserOnline = response.user.is_online ?? false;
              this.userStats = {
                games_played: response.user.games_played ?? 0,
                games_won: response.user.games_won ?? 0,
                games_lost: response.user.games_lost ?? 0
              };
              this.loadFriends(response.user.username);
              this.isLoading = false;
            }
          },
          error: (error) => {
            console.error('Error loading user profile:', error);
            this.error = 'Failed to load user profile';
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error getting current user:', error);
        this.isLoading = false;
      }
    });
    setTimeout(() => this.subscriptionStatus(), 2000);
  }

  showUpdateProfile() {
    this.router.navigate(['/profile/update']);
  }

  loadFriends(username: string) {
    if (!username) {
      console.error('Username is required to get friends');
      return;
    }

    this.http.get<Friend[]>(`http://localhost:8000/accounts/users/${username}/friends/`).subscribe({
      next: (friends) => {
        console.log('Friends data:', friends);
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

  searchUsers()
  {
    this.http.get<any[]>(`${this.API_URL}/accounts/users/search/?query=${this.searchQuery.trim()}`).subscribe({
      next: (results) => {
        this.searchResults = results;
      },
      error: (error) => {
        console.error('Error searching users:', error);
        this.error = 'Failed to search users';
      }
    })
  }

  sendFriendRequest(username: string) {

      this.http.post(`${this.API_URL}/accounts/friend-requests/send/`, {to_username: username}, {headers: {'Content-Type': 'application/json'}}).subscribe({
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
    this.http.get<FriendRequest[]>("http://localhost:8000/accounts/friend-requests/").subscribe({
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
    this.http.post(`${this.API_URL}/accounts/friend-requests/accept/`, {
      from_username: request.from_user.username
    }).subscribe({
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
    })
  }

  declineFriendRequest(requestId: number) {
    this.http.post(`${this.API_URL}/accounts/friend-requests/${requestId}/decline/`, {}).subscribe({
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

  isUserOnline_f(userId: number): boolean {
    return this.webSocketService.isUserOnline(userId);
  }

  GoToMatchHistory() {
    this.router.navigate(['/match-history', this.currentUsername]);
  }
}
