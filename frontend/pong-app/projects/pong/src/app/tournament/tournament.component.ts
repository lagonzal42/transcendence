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
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';

interface Player {
  name: string;
  isAuthenticated: boolean;
  tournamentName: string;
}

@Component({
  selector: 'app-tournament',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, TranslateModule],
  templateUrl: './tournament.component.html',
  styleUrl: './tournament.component.css'
})

export class TournamentComponent implements OnInit {
  tournamentForm: FormGroup;
  group1: Player[] = [];
  group2: Player[] = [];
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
  showMatchPreparation: boolean = false;
  matchPreparationCountdown: number = 5;

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
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
    
  ) {
    this.tournamentForm = this.fb.group({
      player1: [{value: '', disabled: false}, Validators.required],
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
    
    // Only load state if we're in the browser
    if (isPlatformBrowser(this.platformId)){
      this.loadTournamentState();
    }
  }

  ngOnInit() {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        if (user) {
          this.isLoggedIn = true;
          this.currentUser = user.username;
          this.tournamentForm.patchValue({
            player1: user.username
          });
          this.tournamentForm.get('player1')?.disable();
        } else {
          this.isLoggedIn = false;
          this.currentUser = '';
          this.tournamentForm.get('player1')?.enable();
        }
      },
      error: (error) => {
        console.error('Error getting current user:', error);
        this.isLoggedIn = false;
        this.currentUser = '';
        this.tournamentForm.get('player1')?.enable();
      }
    });

    this.route.paramMap.subscribe(() => {
      if (isPlatformBrowser(this.platformId) && window.history.state && window.history.state.winner) {
        console.log('Received game state:', window.history.state);
        this.handleMatchComplete(window.history.state.winner, window.history.state);

        // Clear navigation state to prevent processing it again
        this.router.navigate(
          [], 
          {
            relativeTo: this.route,
            queryParams: {},
            replaceUrl: true
          }
        );
      }
    });
  }

  onPlayer2TypeChange(type: string) {
    this.showPlayer2Auth = type === 'registered';
    if (type === 'guest') {
      this.player2AuthForm.reset();
      this.player2AuthStatus = 'none';
      this.player2AuthMessage = '';
    }
  }

  onPlayer3TypeChange(type: string) {
    this.showPlayer3Auth = type === 'registered';
    if (type === 'guest') {
      this.player3AuthForm.reset();
      this.player3AuthStatus = 'none';
      this.player3AuthMessage = '';
    }
  }

  onPlayer4TypeChange(type: string) {
    this.showPlayer4Auth = type === 'registered';
    if (type === 'guest') {
      this.player4AuthForm.reset();
      this.player4AuthStatus = 'none';
      this.player4AuthMessage = '';
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

  handleMatchComplete(winner: string, state: any) {
    const leftScore = state?.leftScore || 0;
    const rightScore = state?.rightScore || 0;
  
    // Check if this is a new match result
    const isNewResult = !this.matchResults.some(mr => 
      mr.player1 === this.currentMatch?.player1 && 
      mr.player2 === this.currentMatch?.player2
    );
  
    if (this.currentMatch && isNewResult) {
      this.matchResults.push({
        player1: this.currentMatch.player1,
        player2: this.currentMatch.player2,
        winner: winner,
        score1: leftScore,
        score2: rightScore
      });
      
      // Only add to winners array if it's a new match
      if (!this.winners.includes(winner)) {
        this.winners.push(winner);
      }
    }
  
    this.currentMatch = null;
  
    console.log('Match completed:', {
      winners: this.winners.length,
      matchResults: this.matchResults.length,
      currentRound: this.currentRound
    });
  
    // Only advance to finals when both semi-final matches are complete
    if (this.currentRound === 1) {
      if (this.matchResults.length >= 2) { // Check matchResults.length instead of winners.length
        // Both semi-final matches are complete, move to finals
        this.currentRound = 2;
      }
    } else if (this.currentRound === 2 && this.matchResults.length === 3) {
      // Final match is complete
      this.tournamentComplete = true;
    }
  
    this.saveTournamentState();
  }

  startFinalMatch() {
    if (this.winners.length === 2) {
      this.startMatch(this.winners[0], this.winners[1]);
    }
  }

  resetTournament() {
    localStorage.removeItem('tournamentState');
    window.location.reload();
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
        this.showMatchPreparation = false;
        this.matchPreparationCountdown = 5;
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

  shuffleArray(array: Player[]): Player[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // swap elements
    }
    return array;
  }
  
  onSubmit() {
    if (this.tournamentForm.valid) {
      // Create players array
      const players: Player[] = [
        {
          name: this.tournamentForm.get('player1')?.value,
          isAuthenticated: this.isLoggedIn,
          tournamentName: this.tournamentForm.get('player1')?.value // Default to name
        },
        {
          name: this.tournamentForm.get('player2')?.value,
          isAuthenticated: this.showPlayer2Auth && this.player2AuthForm.valid,
          tournamentName: this.tournamentForm.get('player2')?.value // Default to name
        },
        {
          name: this.tournamentForm.get('player3')?.value,
          isAuthenticated: this.showPlayer3Auth && this.player3AuthForm.valid,
          tournamentName: this.tournamentForm.get('player3')?.value // Default to name
        },
        {
          name: this.tournamentForm.get('player4')?.value,
          isAuthenticated: this.showPlayer4Auth && this.player4AuthForm.valid,
          tournamentName: this.tournamentForm.get('player4')?.value // Default to name
        }
      ];

      // Create an array of promises to fetch tournament names for all players
      const namePromises = players.map(player => {
        if (player.isAuthenticated) {
          // Only fetch tournament names for authenticated players
          return this.getTournamentName(player.name)
            .then(tournamentName => {
              player.tournamentName = tournamentName;
              return player;
            });
        } else {
          // For guest players, use their name as tournament name
          return Promise.resolve(player);
        }
      });

      // Wait for all tournament names to be fetched
      Promise.all(namePromises)
        .then(playersWithNames => {
          // Shuffle the players for random matchups
          const shuffled = this.shuffleArray(playersWithNames);
          
          // Divide into two groups
          this.group1 = [shuffled[0], shuffled[1]];
          this.group2 = [shuffled[2], shuffled[3]];
          
          // Set form as submitted and save state
          this.formSubmitted = true;
          this.saveTournamentState();
          
          // Start the first match
          console.log("Starting tournament with players:", this.group1, this.group2);
          this.startTournament();
        })
        .catch(error => {
          console.error('Error fetching tournament names:', error);
          // Fallback: proceed without tournament names
          const shuffled = this.shuffleArray(players);
          this.group1 = [shuffled[0], shuffled[1]];
          this.group2 = [shuffled[2], shuffled[3]];
          this.formSubmitted = true;
          this.saveTournamentState();
          this.startTournament();
        });
    } else {
      this.tournamentForm.markAllAsTouched();
    }
  }

  startTournament() {
    if (this.matchResults.length === 0 && this.winners.length === 0) {
      this.startMatch(this.group1[0].tournamentName, this.group1[1].tournamentName);
    }
  }

  startSecondMatch() {
    if (this.winners.length === 1 && this.group2.length >= 2) {
      this.startMatch(this.group2[0].tournamentName, this.group2[1].tournamentName);
    }
  }

  startMatch(player1: string, player2: string) {
    this.currentMatch = { player1, player2 };
    this.showMatchPreparation = true;
    this.matchPreparationCountdown = 5;
    
    const countdownInterval = setInterval(() => {
      this.matchPreparationCountdown--;
      if (this.matchPreparationCountdown <= 0) {
        clearInterval(countdownInterval);
        this.showMatchPreparation = false;
        this.saveTournamentState();

        const navigationExtras: NavigationExtras = {
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
    }, 1000);
  }

  skipCountdown() {
    this.matchPreparationCountdown = 0;
  }

  private getTournamentName(username: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.http.get<{tournament_name: string}>(`${environment.apiUrl}/accounts/tournament-name/${username}/`)
        .subscribe({
          next: (response) => resolve(response?.tournament_name || username),
          error: (error) => {
            console.error('Error fetching tournament name:', error);
            resolve(username); // Fallback to username on error
          }
        });
    });
  }
}
