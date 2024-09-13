import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { HttpClient} from '@angular/common/http'

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  signupForm: FormGroup;

  constructor(private fb: FormBuilder, private httpClient:HttpClient) {
    this.signupForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.signupForm.valid) {
      const formData = this.signupForm.value;
			console.log('Form Submitted!', this.signupForm.value);
			//direction must be changed this is only for test
			this.httpClient.post('frontend-test:1234', formData).subscribe({
				next: (response: any) =>
				{
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
