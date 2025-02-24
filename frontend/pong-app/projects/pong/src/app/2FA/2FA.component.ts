import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable, throwError, of, BehaviorSubject } from 'rxjs';
import { Injectable, Inject , PLATFORM_ID} from '@angular/core';
import {environment} from '../../../src/environment/environment'




@Component({
	selector: 'app-2FA',
	standalone: true,
	imports: [ReactiveFormsModule, CommonModule],
	templateUrl: './2FA.component.html',
	styleUrl: './2FA.component.css'
})
export class TwoFactorComponent {
	twoForm: FormGroup;
	loginError: string = '';

	constructor(
		private fb: FormBuilder,
		private authService: AuthService,
		private router: Router,
		private httpClient: HttpClient,
		@Inject(PLATFORM_ID) private platformId: Object
	) {
		this.twoForm = this.fb.group({
			twoFactor: ['', Validators.required],
		});
	}

	onSubmit() {
		this.loginError = '';
		if (this.twoForm.valid) 
		{		
				const verifyInfo =
				{
					code: this.twoForm.value.twoFactor,
					sessionid: localStorage.getItem('sessionid')
				}
				console.log('Sending verification info:', verifyInfo);
				
				this.httpClient.post(`${environment.backendURL}two_factor_auth/verify/`, verifyInfo).pipe(
					map((response: any) => 
					{
						if (isPlatformBrowser(this.platformId))
						{
							console.log('kfjdsaoipfjdapso');
							localStorage.setItem('access_token', response.access);
							localStorage.setItem('refresh_token', response.refresh);
							//localStorage.setItem('username', response.user.username);
							//this.isAuthenticatedSubject.next(true);
							this.router.navigate(['']);
							this.authService.startAuthCheckInterval();
						}
					}),
					catchError((error: any) => {
						console.log("Falla aqui" + error);
						return throwError(() => error);
					})).subscribe();
			console.log('fffffff')
		} 
		else 
		{
			this.twoForm.markAllAsTouched();
		}
	}
}
