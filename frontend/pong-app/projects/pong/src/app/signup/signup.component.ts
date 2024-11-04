import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { HttpClient} from '@angular/common/http'
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  signupForm: FormGroup;

  constructor(private fb: FormBuilder, private httpClient:HttpClient, private router: Router) {
    this.signupForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      password2: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.signupForm.valid) {
      const formData = this.signupForm.value;
			console.log('Form Submitted!', this.signupForm.value);
			//direction must be changed this is only for test
			this.httpClient.post('http://localhost:8000/accounts/register/', formData).subscribe({
				next: (response: any) =>
				{
          this.router.navigate(['']);
					console.log("Server response: ", response);
				},
				error: (err: any) => {
					console.error("Server error response", err);
				}
			})
    } else {
      console.log('Form is invalid');
      // Optionally, you can mark all controls as touched to trigger validation messages
      this.signupForm.markAllAsTouched();
    }
  }
}
