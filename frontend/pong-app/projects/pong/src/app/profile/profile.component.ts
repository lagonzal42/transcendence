import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from '../services/chat.service';
//import { AuthService } from '../services/auth.service';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  friends: any[] = [];
  currentUsername: string = '';
  isLoading: boolean = true;
  error: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private chatService: ChatService,
    //private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData() {
    this.isLoading = true;
    this.error = null;

    this.http.get<User>('http://localhost:8000/accounts/current_user/').subscribe({
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

    this.http.get(`http://localhost:8000/accounts/list_friends/${username}/`).subscribe({
      next: (data: any) => {
        this.friends = data;
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
    const users = [this.currentUsername, friendUsername].sort();
    const roomName = `private_${users[0]}_${users[1]}`;
    this.router.navigate(['/chat', roomName]);
  }
}
