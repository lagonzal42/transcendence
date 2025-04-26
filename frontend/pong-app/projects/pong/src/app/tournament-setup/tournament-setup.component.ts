import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { uniquePlayerNamesValidator } from '../uniquePlayerName/uniquePlayerName.validator';

@Component({
  selector: 'app-tournament-setup',
  standalone: true,
  imports: [],
  templateUrl: './tournament-setup.component.html',
  styleUrl: './tournament-setup.component.css'
})
export class TournamentSetupComponent implements OnInit {
  
  @Component({
    selector: 'app-multiplayer-setup',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, TranslateModule],
    templateUrl: './multiplayer-setup.component.html',
    styleUrl: './multiplayer-setup.component.css'
  })

    multiplayerForm: FormGroup;
    isLoggedIn: boolean = false;
    currentUser: string = '';
    showPlayer2Auth: boolean = false;
    showPlayer3Auth: boolean = false;
    showPlayer4Auth: boolean = false;
    player2AuthForm: FormGroup;
    player3AuthForm: FormGroup;
    player4AuthForm: FormGroup;
  
    player2AuthStatus: 'none' | 'success' | 'error' = 'none';
    player2AuthMessage: string = '';
    player3AuthStatus: 'none' | 'success' | 'error' = 'none';
    player3AuthMessage: string = '';
    player4AuthStatus: 'none' | 'success' | 'error' = 'none';
    player4AuthMessage: string = '';
  
    constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
      this.multiplayerForm = this.fb.group({
        player1: ['', Validators.required],
        player2: ['', Validators.required],
        player3: ['', Validators.required],
        player4: ['', Validators.required],
        player2Type: ['guest'],
        player3Type: ['guest'],
        player4Type: ['guest']
      }, { validator: uniquePlayerNamesValidator(['player1', 'player2', 'player3', 'player4']) });
  
      this.player2AuthForm = this.fb.group({
        username: ['', Validators.required],
        password: ['', Validators.required]
      });
  
      this.player3AuthForm = this.fb.group({
        username: ['', Validators.required],
        password: ['', Validators.required]
      });
  
      this.player4AuthForm = this.fb.group({
        username: ['', Validators.required],
        password: ['', Validators.required]
      });
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
  
    onPlayer2TypeChange(type: string) {
      this.showPlayer2Auth = type === 'registered';
      if (type === 'guest') {
        this.player2AuthForm.reset();
      }
    }
  
    onPlayer3TypeChange(type: string) {
      this.showPlayer3Auth = type === 'registered';
      if (type === 'guest') {
        this.player3AuthForm.reset();
      }
    }
  
    onPlayer4TypeChange(type: string) {
      this.showPlayer4Auth = type === 'registered';
      if (type === 'guest') {
        this.player4AuthForm.reset();
      }
    }
  
    authenticatePlayer2() {
      if (this.player2AuthForm.valid) {
        this.authService.validateCredentials(
          this.player2AuthForm.get('username')?.value,
          this.player2AuthForm.get('password')?.value
        ).subscribe({
          next: (isValid) => {
            if (isValid) {
              this.player2AuthStatus = 'success';
              this.player2AuthMessage = 'Player 2 verified successfully!';
              this.multiplayerForm.get('player2')?.setValue(this.player2AuthForm.get('username')?.value);
            } else {
              this.player2AuthStatus = 'error';
              this.player2AuthMessage = 'Invalid credentials. Please try again.';
            }
          },
          error: (error) => {
            this.player2AuthStatus = 'error';
            this.player2AuthMessage = 'Authentication failed. Please try again.';
            console.error('Authentication error:', error);
          }
        });
      }
    }
  
    authenticatePlayer3() {
      if (this.player3AuthForm.valid) {
        this.authService.validateCredentials(
          this.player3AuthForm.get('username')?.value,
          this.player3AuthForm.get('password')?.value
        ).subscribe({
          next: (isValid) => {
            if (isValid) {
              this.player3AuthStatus = 'success';
              this.player3AuthMessage = 'Player 3 verified successfully!';
              this.multiplayerForm.get('player3')?.setValue(this.player3AuthForm.get('username')?.value);
            } else {
              this.player3AuthStatus = 'error';
              this.player3AuthMessage = 'Invalid credentials. Please try again.';
            }
          },
          error: (error) => {
            this.player3AuthStatus = 'error';
            this.player3AuthMessage = 'Authentication failed. Please try again.';
            console.error('Authentication error:', error);
          }
        });
      }
    }
  
    authenticatePlayer4() {
      if (this.player4AuthForm.valid) {
        this.authService.validateCredentials(
          this.player4AuthForm.get('username')?.value,
          this.player4AuthForm.get('password')?.value
        ).subscribe({
          next: (isValid) => {
            if (isValid) {
              this.player4AuthStatus = 'success';
              this.player4AuthMessage = 'Player 4 verified successfully!';
              this.multiplayerForm.get('player4')?.setValue(this.player4AuthForm.get('username')?.value);
            } else {
              this.player4AuthStatus = 'error';
              this.player4AuthMessage = 'Invalid credentials. Please try again.';
            }
          },
          error: (error) => {
            this.player4AuthStatus = 'error';
            this.player4AuthMessage = 'Authentication failed. Please try again.';
            console.error('Authentication error:', error);
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
            player2: this.showPlayer2Auth && this.player2AuthForm.valid,
            player3: this.showPlayer3Auth && this.player3AuthForm.valid,
            player4: this.showPlayer4Auth && this.player4AuthForm.valid
          }
        };
  
        this.router.navigate(['/multiplayer'], { state: { players } });
      } else {
        this.multiplayerForm.markAllAsTouched();
      }
    }
  }
