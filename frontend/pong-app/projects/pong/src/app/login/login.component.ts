import { Component} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { HttpClient} from '@angular/common/http'

@Component({
	selector: 'app-login',
	standalone: true,
	imports: [ReactiveFormsModule, CommonModule], 
	templateUrl: './login.component.html',
	styleUrl: './login.component.css'
})
export class LoginComponent {
	loginForm: FormGroup;

	constructor(private fb: FormBuilder, private httpClient: HttpClient)
	{
		this.loginForm = this.fb.group({
			username: ['', Validators.required],
			password: ['', Validators.required]
		});
	}

	onSubmit()
	{
		if (this.loginForm.valid)
		{
			const formData = this.loginForm.value;
			console.log('Form Submitted!', this.loginForm.value);
			//direction must be changed this is only for test
			this.httpClient.post('http://localhost:8000/accounts/account_login/', formData).subscribe({
				next: (response: any) =>
				{
					console.log("Server response: ", response);
				},
				error: (err: any) => {
					console.error("Server error response", err);
				}
			})
		}
		else
		{
			console.log('Form is invalid');
			// Optionally, you can mark all controls as touched to trigger validation messages
			this.loginForm.markAllAsTouched();
		}
	}
}
