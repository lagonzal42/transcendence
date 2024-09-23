import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { uniquePlayerNamesValidator } from '../uniquePlayerName/uniquePlayerName.validator'; // Adjust the path as necessary
import { platform } from 'os';

@Component({
  selector: 'app-tournament',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './tournament.component.html',
  styleUrl: './tournament.component.css'
})
export class TournamentComponent {
  tournamentForm: FormGroup;
  group1: string[] = [];
  group2: string[] = [];
  formSubmitted: boolean = false;

  constructor(private fb: FormBuilder) {
    this.tournamentForm = this.fb.group({
      player1: ['', Validators.required],
      player2: ['', Validators.required],
      player3: ['', Validators.required],
      player4: ['', Validators.required],
    }, { validator: uniquePlayerNamesValidator() });
  }

  onSubmit() 
  {
    if (this.tournamentForm.valid) 
    {
      console.log('Form Submitted!', this.tournamentForm.value);
      const players : Array<string> = [
        this.tournamentForm.get('player1')?.value,
        this.tournamentForm.get('player2')?.value,
        this.tournamentForm.get('player3')?.value,
        this.tournamentForm.get('player4')?.value
      ];

      const shuffled : Array<string> = this.shuffleArray(players);

      const group1 = [shuffled[0], shuffled[1]];
      const group2 = [shuffled[2], shuffled[3]];

      console.log('Group 1:', group1);
      console.log('Group 2:', group2);
      
    } 
    else 
    {
      console.log('Form is invalid');
      // Mark all controls as touched to trigger validation messages
      this.tournamentForm.markAllAsTouched();
    }
  }

  shuffleArray(array: Array<any>): Array<any> 
  {
    const shuffled = array.sort(() => Math.random() - 0.5);
    return shuffled;
  }
}
