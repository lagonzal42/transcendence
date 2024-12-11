import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { uniquePlayerNamesValidator } from '../uniquePlayerName/uniquePlayerName.validator'; // Adjust the path as necessary
import { Router } from '@angular/router';
import { platform } from 'os';
import { AuthService } from '../auth/auth.service'

@Component({
  selector: 'app-local-play',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './local-play.component.html',
  styleUrl: './local-play.component.css'
})

export class LocalPlayComponent implements OnInit {
  localPlayForm: FormGroup;
  isLoggedIn: boolean = false;
  currentUser: string = '';
  showPlayer2Auth: boolean = false;
  player2AuthForm: FormGroup;
  // group1: string[] = [];
  // group2: string[] = [];
  //formSubmitted: boolean = false;

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    this.localPlayForm = this.fb.group({
      player1: ['', Validators.required],
      player2: ['', Validators.required],
      player2Type: ['guest']
    }, { validator: uniquePlayerNamesValidator(['player1', 'player2']) });

    this.player2AuthForm = this.fb.group({
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
          this.localPlayForm.get('player1')?.setValue(user.username);
          this.localPlayForm.get('player1')?.disable();
        }
      },
      error: (error) => {
        console.error('Error getting current user: ', error);
        this.isLoggedIn = false;
      }
    })
  }

  onPlayer2TypeChange(type: string) {
    this.showPlayer2Auth = type === 'registered';
    if (type === 'guest') {
      this.player2AuthForm.reset();
    }
  }

  authenticatePlayer2(type: string) {
    if (this.player2AuthForm.valid) {
      this.authService.validateCredentails(
        this.player2AuthForm.get('username')?.value,
        this.player2AuthForm.get('password')?.value
      ).subscribe({
        next: (isValid) => {
          if (isValid) {
            this.localPlayForm.get('player2')?.setValue(this.player2AuthForm.get('username')?.value);
          }
        },
        error: (error) => {
          console.error('Authentication error: ', error);
        }
      });
    }
  }

  onSubmit() {
    if (this.localPlayForm.valid) {
      const players = {
        leftPlayerName: this.localPlayForm.get('player1')?.value,
        rightPlayerName: this.localPlayForm.get('player2')?.value,
        isAuthenticated: {
          player1: this.isLoggedIn,
          player2: this.showPlayer2Auth && this.player2AuthForm.valid
        }
      };

      // Navegar a pong-game pasando el estado de los jugadores
      this.router.navigate(['/pong-game'], { state: { players } });
    } else {
      this.localPlayForm.markAllAsTouched();
    } 
  }

//  shuffleArray(array: Array<any>): Array<any> 
//  {
//    const shuffled = array.sort(() => Math.random() - 0.5);
//    return shuffled;
//  }
}
