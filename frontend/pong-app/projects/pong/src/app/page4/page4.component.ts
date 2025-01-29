import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-page4',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, TranslateModule],
  templateUrl: './page4.component.html',
  styleUrl: './page4.component.css'
})
export class Page4Component implements OnInit {
  multiplayerForm: FormGroup;
  isLoggedIn: boolean = false;
  currentUser: string = '';
  showPlayerAuth: boolean[] = [false, false, false];
  playerAuthForms: FormGroup[] = [];
  playerAuthStatus: ('none' | 'success' | 'error')[] = ['none', 'none', 'none'];
  playerAuthMessages: string[] = ['', '', ''];

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    this.multiplayerForm = this.fb.group({
      player1: ['', Validators.required],
      player2: ['', Validators.required],
      player3: ['', Validators.required],
      player4: ['', Validators.required],
      player2Type: ['guest'],
      player3Type: ['guest'],
      player4Type: ['guest']
    });

    // Create auth forms for players 2, 3, and 4
    for (let i = 0; i < 3; i++) {
      this.playerAuthForms[i] = this.fb.group({
        username: ['', Validators.required],
        password: ['', Validators.required]
      });
    }
  }

  ngOnInit() {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        if (user) {
          this.isLoggedIn = true;
          this.currentUser = user.username;
          this.multiplayerForm.get('player1')?.setValue(user.username);
          this.multiplayerForm.get('player1')?.disable();
        }
      },
      error: (error) => {
        this.isLoggedIn = false;
      }
    });
  }

  onPlayerTypeChange(playerNum: number, type: string) {
    this.showPlayerAuth[playerNum - 2] = type === 'registered';
    if (type === 'guest') {
      this.playerAuthForms[playerNum - 2].reset();
    }
  }

  authenticatePlayer(playerNum: number) {
    const formIndex = playerNum - 2;
    const authForm = this.playerAuthForms[formIndex];
    
    if (authForm.valid) {
      this.authService.validateCredentials(
        authForm.get('username')?.value,
        authForm.get('password')?.value
      ).subscribe({
        next: (isValid) => {
          if (isValid) {
            this.playerAuthStatus[formIndex] = 'success';
            this.playerAuthMessages[formIndex] = `Player ${playerNum} verified successfully!`;
            this.multiplayerForm.get(`player${playerNum}`)?.setValue(authForm.get('username')?.value);
          } else {
            this.playerAuthStatus[formIndex] = 'error';
            this.playerAuthMessages[formIndex] = 'Invalid credentials. Please try again.';
          }
        },
        error: (error) => {
          this.playerAuthStatus[formIndex] = 'error';
          this.playerAuthMessages[formIndex] = 'Authentication failed. Please try again.';
        }
      });
    }
  }

  onSubmit() {
    if (this.multiplayerForm.valid) {
      const players = {
        player1Name: this.multiplayerForm.get('player1')?.value,
        player2Name: this.multiplayerForm.get('player2')?.value,
        player3Name: this.multiplayerForm.get('player3')?.value,
        player4Name: this.multiplayerForm.get('player4')?.value,
        isAuthenticated: {
          player1: this.isLoggedIn,
          player2: this.showPlayerAuth[0] && this.playerAuthForms[0].valid,
          player3: this.showPlayerAuth[1] && this.playerAuthForms[1].valid,
          player4: this.showPlayerAuth[2] && this.playerAuthForms[2].valid
        }
      };

      this.router.navigate(['/multiplayer'], { state: { players } });
    } else {
      this.multiplayerForm.markAllAsTouched();
    }
  }
}
