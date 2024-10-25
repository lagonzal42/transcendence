import { Component} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { HttpClient} from '@angular/common/http'
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
	selector: 'app-login',
	standalone: true,
	imports: [ReactiveFormsModule, CommonModule], 
	templateUrl: './login.component.html',
	styleUrl: './login.component.css'
})
export class LoginComponent {
	loginForm: FormGroup;

	constructor(private fb: FormBuilder, private httpClient: HttpClient, private router: Router,
		private authService: AuthService)
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
			this.authService.login(formData).subscribe((status: number) => {
				if (status === 0)
				{
					this.router.navigate(['']);
				}
				else
					console.log('Login failed');
			});
		}
		else
		{
			console.log('Form is invalid');
			// Optionally, you can mark all controls as touched to trigger validation messages
			this.loginForm.markAllAsTouched();
		}
	}
}
