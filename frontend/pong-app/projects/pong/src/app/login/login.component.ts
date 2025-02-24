import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { userInfo } from 'os';
import { UserInterface } from '../auth/login/interfaces/user.interface';
import { TranslateModule } from '@ngx-translate/core';

@Component({
	selector: 'app-login',
	standalone: true,
	imports: [ReactiveFormsModule, CommonModule, TranslateModule],
	templateUrl: './login.component.html',
	styleUrl: './login.component.css'
})
export class LoginComponent {
	loginForm: FormGroup;
	loginError: string = '';

	constructor(
		private fb: FormBuilder,
		private authService: AuthService,
		private router: Router,
	) {
		this.loginForm = this.fb.group({
			username: ['', Validators.required],
			password: ['', Validators.required]
		});
	}

	onSubmit() {
		this.loginError = '';

		if (this.loginForm.valid) {
			const credentials: UserInterface = {
				username: this.loginForm.value.username,
				password: this.loginForm.value.password
			};

			console.log('Attempting login with:', credentials.username);
			this.authService.login(credentials).subscribe({
				next: (response) => {
					console.log('Login backend response:', response);
					this.router.navigate(['two-factor']);
				},
				error: (err) => {
					console.error('Server error:', err.error);
					if (err.error.error) {
						this.loginError = err.error.error;
					} else {
						this.loginError = 'Login failed. Please try again.';
					}
				}
			});
		} else {
			this.loginForm.markAllAsTouched();
		}
	}
}
