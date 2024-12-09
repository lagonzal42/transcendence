import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { uniquePlayerNamesValidator } from '../uniquePlayerName/uniquePlayerName.validator'; // Adjust the path as necessary
import { platform } from 'os';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-tournament',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
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

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
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
      if (history.state.winner) {
        console.log("Winner from navigation: ", history.state.winner);
        this.handleMatchComplete(history.state.winner);
      }
    })
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

  onSubmit() {
    if (this.tournamentForm.valid) {
      const players = [
        this.tournamentForm.get('player1')?.value,
        this.tournamentForm.get('player2')?.value,
        this.tournamentForm.get('player3')?.value,
        this.tournamentForm.get('player4')?.value
      ];

      const shuffled = this.shuffleArray(players);
      this.group1 = [shuffled[0], shuffled[1]];
      this.group2 = [shuffled[2], shuffled[3]];
      this.formSubmitted = true;
      this.saveTournamentState();
      
      this.startMatch(this.group1[0], this.group1[1]);
    } else {
      this.tournamentForm.markAllAsTouched();
    }
  }

  handleMatchComplete(winner: string) {
    // Get the scores from the navigation state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      const winner = navigation.extras.state['winner'];
      if (winner){
        console.log("players who won match" + winner);
        console.log("leftPlayerScore: " + navigation.extras.state['leftScore']);
        console.log('rightScore: ' + navigation.extras.state['rightScore']);
      }
    }
    const state = navigation?.extras.state as any;
    const leftScore = state?.leftScore || 0;
    const rightScore = state?.rightScore || 0;
    
    // Store match result
    if (this.currentMatch) {
      this.matchResults.push({
        player1: this.currentMatch.player1,
        player2: this.currentMatch.player2,
        winner: winner,
        score1: this.currentMatch.player1 === winner ? leftScore : rightScore,
        score2: this.currentMatch.player2 === winner ? rightScore : leftScore
      });
    }

    this.winners.push(winner);

    if (this.currentRound === 1) {
      if (this.winners.length === 1) {
        // After first match, start second match
        setTimeout(() => {
          this.startMatch(this.group2[0], this.group2[1]);
        }, 2000);
      } else if (this.winners.length === 2) {
        // After second match, prepare for finals
        this.currentRound = 2;
        // Don't automatically start final match - let user click button
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

  shuffleArray(array: Array<any>): Array<any> 
  {
    const shuffled = array.sort(() => Math.random() - 0.5);
    return shuffled;
  }
}
