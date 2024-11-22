import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
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

	constructor(
		private fb: FormBuilder,
		private authService: AuthService,
		private router: Router
	) {
		this.loginForm = this.fb.group({
			username: ['', Validators.required],
			password: ['', Validators.required]
		});
	}

	onSubmit() {
		if (this.loginForm.valid) {
			const { username, password } = this.loginForm.value;
			console.log('Attempting login with:', username);
			this.authService.login(username, password).subscribe({
				next: (response) => {
					console.log('Login backend response:', response);
					this.router.navigate(['']);
				},
				error: (err) => {
					console.error('Server error:', err.error.detail);
				}
			});
		} else {
			this.loginForm.markAllAsTouched();
		}
	}
}
