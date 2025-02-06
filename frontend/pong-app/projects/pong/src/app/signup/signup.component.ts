import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { HttpClient} from '@angular/common/http'
import { Router } from '@angular/router';
import { environment } from '../../environment/environment';
import { TranslateModule } from '@ngx-translate/core';

interface ErrorResponse {
  error: {
    username?: string[];
    email?: string[];
    password?: string[];
  }
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, TranslateModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  signupForm: FormGroup;
  usernameError: string = '';
  emailError: string = '';
  passwordError: string = '';

  constructor(private fb: FormBuilder, private httpClient:HttpClient, private router: Router) {
    this.signupForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      password2: ['', Validators.required]
    });
  }

  onSubmit() {
    this.usernameError = '';
    this.emailError = '';
    this.passwordError = '';
  
    if (this.signupForm.valid) {
      const formData = this.signupForm.value;
      this.httpClient.post(`${environment.backendURL}accounts/register/`, formData).subscribe({
        next: (response: any) => {
          this.router.navigate(['']);
          console.log("Server response: ", response);
        },
        error: (err: ErrorResponse) => {
          console.error("Error details:", err.error);
          
          if (err.error?.username) {
            this.usernameError = err.error.username[0];
          }
          if (err.error?.email) {
            this.emailError = err.error.email[0];
          }
          if (err.error?.password) {
            this.passwordError = err.error.password[0];
          }
        }
      });
    } else {
      console.log('Form is invalid');
    }
  }
}
