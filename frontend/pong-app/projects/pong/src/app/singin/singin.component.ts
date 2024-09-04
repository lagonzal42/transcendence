import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-singin',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './singin.component.html',
  styleUrl: './singin.component.css'
})
export class SinginComponent {
  singinForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.singinForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.singinForm.valid) {
      console.log('Form Submitted!', this.singinForm.value);
    } else {
      console.log('Form is invalid');
      // Optionally, you can mark all controls as touched to trigger validation messages
      this.singinForm.markAllAsTouched();
    }
  }
}
