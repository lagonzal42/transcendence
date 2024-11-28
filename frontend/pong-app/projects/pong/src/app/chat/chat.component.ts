import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage } from '../services/chat.service';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, OnDestroy {
  messages$!: Observable<ChatMessage[]>;
  newMessage: string = '';
  private roomName: string = '';
  public username: string = '';
  showUserActions = false;
  isUserBlocked = false;
  otherUsername = '';
  otherUserId: number = 0;

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.roomName = params['roomId'];
      if (this.roomName.startsWith('private_')) {
        const users = this.roomName.replace('private_', '').split('_');
        this.http.get<User>(`${this.authService.API_URL}/accounts/me/`).subscribe({
          next: (user) => {
            this.username = user.username;
            this.otherUsername = users.find(u => u !== this.username) || '';
            
            // Get other user's details and check if blocked
            this.chatService.getUserProfile(this.otherUsername).subscribe({
              next: (otherUser) => {
                this.otherUserId = otherUser.user.id;
                this.chatService.getBlockedUsers().subscribe({
                  next: (blockedUsers) => {
                    this.isUserBlocked = blockedUsers.some(u => u.id === this.otherUserId);
                    if (this.username && this.roomName) {
                      this.messages$ = this.chatService.getMessages(this.roomName);
                      this.chatService.connectToChat(this.roomName, this.username);
                    }
                  }
                });
              }
            });
          },
          error: (error) => {
            console.error('Error getting user:', error);
          }
        });
      }
    });
  }

  ngOnDestroy() {
    this.chatService.disconnect();
  }

  sendMessage() {
    if (this.newMessage.trim() && !this.isUserBlocked) {
      this.chatService.sendMessage(this.newMessage, this.username, this.roomName);
      this.newMessage = '';
    }
  }

  toggleUserActions() {
    this.showUserActions = !this.showUserActions;
  }

  viewProfile() {
    this.router.navigate(['/profile'], { 
      queryParams: { username: this.otherUsername } 
    });
  }

  toggleBlock() {
    if (this.isUserBlocked) {
      this.chatService.unblockUser(this.otherUserId).subscribe({
        next: () => {
          this.isUserBlocked = false;
        },
        error: (error) => console.error('Error unblocking user:', error)
      });
    } else {
      this.chatService.blockUser(this.otherUserId).subscribe({
        next: () => {
          this.isUserBlocked = true;
        },
        error: (error) => console.error('Error blocking user:', error)
      });
    }
  }

  navigateToProfile(username: string) {
    this.router.navigate(['/profile'], {
      queryParams: {username: username}
    });
  }
}
