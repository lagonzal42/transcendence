import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { uniquePlayerNamesValidator } from '../uniquePlayerName/uniquePlayerName.validator'; // Adjust the path as necessary
import { Router } from '@angular/router';
import { platform } from 'os';

@Component({
  selector: 'app-local-play',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './local-play.component.html',
  styleUrl: './local-play.component.css'
})

export class LocalPlayComponent {
  localPlayForm: FormGroup;
  group1: string[] = [];
  group2: string[] = [];
  formSubmitted: boolean = false;

  constructor(private fb: FormBuilder, private router: Router) {
    this.localPlayForm = this.fb.group({
      player1: ['', Validators.required],
      player2: ['', Validators.required],
    }, { validator: uniquePlayerNamesValidator(['player1', 'player2']) });
  }

  onSubmit() {
    if (this.localPlayForm.valid) {
      console.log('Form Submitted!', this.localPlayForm.value);
      const players: Array<string> = [
        this.localPlayForm.get('player1')?.value,
        this.localPlayForm.get('player2')?.value
      ];
  
      console.log('Players:', players);
      this.router.navigate(['/pong-game']);
  
      // Aquí podrías realizar cualquier lógica que necesites para el juego local
    } else {
      console.log('Form is invalid');
      // Marca todos los controles como tocados para mostrar mensajes de validación
      this.localPlayForm.markAllAsTouched();
    }
  }  

  shuffleArray(array: Array<any>): Array<any> 
  {
    const shuffled = array.sort(() => Math.random() - 0.5);
    return shuffled;
  }
}
