import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { uniquePlayerNamesValidator } from '../uniquePlayerName/uniquePlayerName.validator'; // Adjust the path as necessary
import { platform } from 'os';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-tournament',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, TranslateModule],
  templateUrl: './tournament.component.html',
  styleUrl: './tournament.component.css'
})

export class TournamentComponent implements OnInit {
  tournamentForm: FormGroup;
  group1: string[] = [];
  group2: string[] = [];
  formSubmitted: boolean = false;
  currentRound: number = 1;
  winners: string[] = [];
  tournamentComplete: boolean = false;
  currentMatch: {
    player1: string;
    player2: string;
  } | null = null;
  matchResults: {
    player1: string;
    player2: string;
    winner: string;
    score1: number;
    score2: number;
  }[] = [];
  countdownSeconds: number = 0;

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

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
    
  ) {
    this.tournamentForm = this.fb.group({
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
    this.tournamentForm = this.fb.group({
      player1: ['', Validators.required],
      player2: ['', Validators.required],
      player3: ['', Validators.required],
      player4: ['', Validators.required],
    }, { validator: uniquePlayerNamesValidator(['player1', 'player2', 'player3', 'player4']) });
    
    // Only load state if we're in the browser
    if (isPlatformBrowser(this.platformId)) {
      this.loadTournamentState();
    }
  }

  ngOnInit() {
    this.route.paramMap.subscribe(() => {
      if (isPlatformBrowser(this.platformId) && window.history.state.winner) {
        // console.log("Winner from navigation: ", window.history.state.winner);
        // console.log("left score: ", window.history.state.leftScore)
        // console.log("right score: ", window.history.state.rightScore)
        this.handleMatchComplete(window.history.state.winner, window.history.state);
      }
    })

    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        if (user) {
          this.isLoggedIn = true;
          this.currentUser = user.username;
          this.tournamentForm.get('player1')?.setValue(user.username);
          this.tournamentForm.get('player1')?.disable();
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
            this.tournamentForm.get('player2')?.setValue(this.player2AuthForm.get('username')?.value);
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
            this.tournamentForm.get('player3')?.setValue(this.player3AuthForm.get('username')?.value);
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
            this.tournamentForm.get('player4')?.setValue(this.player4AuthForm.get('username')?.value);
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

  private loadTournamentState() {
    if (isPlatformBrowser(this.platformId)) {
      const savedState = localStorage.getItem('tournamentState');
      if (savedState) {
        const state = JSON.parse(savedState);
        this.formSubmitted = state.formSubmitted;
        this.group1 = state.group1;
        this.group2 = state.group2;
        this.currentRound = state.currentRound;
        this.winners = state.winners;
        this.tournamentComplete = state.tournamentComplete;
        this.currentMatch = state.currentMatch;
        this.matchResults = state.matchResults || [];
      }
    }
  }

  private saveTournamentState() {
    if (isPlatformBrowser(this.platformId)) {
      const state = {
        formSubmitted: this.formSubmitted,
        group1: this.group1,
        group2: this.group2,
        currentRound: this.currentRound,
        winners: this.winners,
        tournamentComplete: this.tournamentComplete,
        currentMatch: this.currentMatch,
        matchResults: this.matchResults
      };
      localStorage.setItem('tournamentState', JSON.stringify(state));
    }
  }

  shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // swap elements
    }
    return array;
  }
  
  onSubmit() {
    if (this.tournamentForm.valid) {
      const players = [
        {
          name: this.tournamentForm.get('player1')?.value,
          isAuthenticated: this.isLoggedIn
        },
        {
          name: this.tournamentForm.get('player2')?.value,
          isAuthenticated: this.showPlayer2Auth && this.player2AuthForm.valid
        },
        {
          name: this.tournamentForm.get('player3')?.value,
          isAuthenticated: this.showPlayer3Auth && this.player3AuthForm.valid
        },
        {
          name: this.tournamentForm.get('player4')?.value,
          isAuthenticated: this.showPlayer4Auth && this.player4AuthForm.valid
        }
      ];
  
      const shuffled = this.shuffleArray(players);
  
      this.group1 = [shuffled[0], shuffled[1]];
      this.group2 = [shuffled[2], shuffled[3]];
  
      this.formSubmitted = true;
      this.saveTournamentState();
  
      this.startMatch(this.group1[0], this.group1[1]);
      // You can also start the second match if needed
      // this.startMatch(this.group2[0], this.group2[1]);
    } else {
      this.tournamentForm.markAllAsTouched();
    }
  }

  // onSubmit() {
  //   if (this.tournamentForm.valid) {
  //     const players = {
  //       player1Name: this.tournamentForm.get('player1')?.value,
  //       player2Name: this.tournamentForm.get('player2')?.value,
  //       player3Name: this.tournamentForm.get('player3')?.value,
  //       player4Name: this.tournamentForm.get('player4')?.value,
  //       isAuthenticated: {
  //         player1: this.isLoggedIn,
  //         player2: this.showPlayer2Auth && this.player2AuthForm.valid,
  //         player3: this.showPlayer3Auth && this.player3AuthForm.valid,
  //         player4: this.showPlayer4Auth && this.player4AuthForm.valid
  //       }
  //     };
  //     // const shuffled = this.shuffleArray(players);
  //     // this.group1 = [shuffled[0], shuffled[1]];
  //     // this.group2 = [shuffled[2], shuffled[3]];

  //     this.formSubmitted = true;
  //     this.saveTournamentState();
      
  //     this.startMatch(this.group1[0], this.group1[1]);
  //   } else {
  //     this.tournamentForm.markAllAsTouched();
  //   }
  // }

  handleMatchComplete(winner: string, state: any) {
    const leftScore = state?.leftScore || 0;
    const rightScore = state?.rightScore || 0;
    // console.log("leftScore: ", leftScore);
    // console.log("rightScore: ", rightScore);
    if (this.currentMatch) {
      this.matchResults.push({
        player1: this.currentMatch.player1,
        player2: this.currentMatch.player2,
        winner: winner,
        score1: leftScore,
        score2: rightScore
      });
    }
  
    this.winners.push(winner);
  
    if (this.currentRound === 1) {
      if (this.winners.length === 1) {
        // First match complete
        // Remove the countdown timer and automatic start of second match
        this.currentMatch = null;
        // Delete these lines:
        // this.countdownSeconds = 8; // Start countdown from 8
        // const countdownInterval = setInterval(() => {
        //   this.countdownSeconds--;
        //   if (this.countdownSeconds <= 0) {
        //     clearInterval(countdownInterval);
        //   }
        // }, 1000);
        
        // Remove the automatic start of the second match
        // setTimeout(() => {
        //   this.startMatch(this.group2[0], this.group2[1]);
        // }, 8000);
      } else if (this.winners.length === 2) {
        // After second match, prepare for finals
        this.currentRound = 2;
        this.currentMatch = null;
        // Final match is already handled by button click
      }
    } else if (this.currentRound === 2 && this.winners.length === 3) {
      this.tournamentComplete = true;
      this.currentMatch = null;
    } 
    this.saveTournamentState();
  }

  startFinalMatch() {
    if (this.winners.length === 2) {
      this.startMatch(this.winners[0], this.winners[1]);
    }
  }

  // Add a method to reset the tournament
  resetTournament() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('tournamentState');
    }
    this.formSubmitted = false;
    this.group1 = [];
    this.group2 = [];
    this.currentRound = 1;
    this.winners = [];
    this.tournamentComplete = false;
    this.currentMatch = null;
    this.matchResults = [];
    this.tournamentForm.reset();
  }

  startMatch(player1: string, player2: string) {
    this.currentMatch = { player1, player2 };
    this.saveTournamentState();

    const navigationExtras: NavigationExtras =  {
      state: {
        players: {
          leftPlayerName: player1,
          rightPlayerName: player2,
          isTournamentMatch: true,
        }
      }
    };

    this.router.navigate(['/pong-game'], navigationExtras);
  }

  // shuffleArray(array: Array<any>): Array<any> 
  // {
  //   const shuffled = array.sort(() => Math.random() - 0.5);
  //   return shuffled;
  // }
}
