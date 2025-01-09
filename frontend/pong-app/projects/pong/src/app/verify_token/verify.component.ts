import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable, throwError, of, BehaviorSubject } from 'rxjs';
import { Injectable, Inject , PLATFORM_ID} from '@angular/core';
import { error } from 'console';

@Component({
	selector: 'verify',
	standalone: true,
	imports: [ReactiveFormsModule, CommonModule],
	templateUrl: './verify.component.html',
	styleUrl: './verify.component.css'
})
export class VerifyComponent implements OnInit {
	message: string = 'Activating your account, please wait...';
	isActivated: boolean = false;
	isError: boolean = false;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private http: HttpClient,
	) {}

	ngOnInit(){
	this.route.queryParams.subscribe(params => {
		const token = params['token'];
		if (token){
			console.log("token exists")
			this.activateAccount(token);
		} else {
			this.message = 'Invalid activation link';
			this.isError = true;
		}
		});
	}
	

	activateAccount(token: string): void {
		this.http.get(`http://localhost:8000/accounts/activation/?token=${token}`).subscribe({
		  next: (response: any) => {
			if (response.message === 'Account activated successfully') {
			  this.message = 'Your account has been successfully activated!';
			  this.isActivated = true;
			} else {
			  this.message = 'Activation failed. Please try again or contact support.';
			  this.isError = true;
			}
		  },
		  error: error => {
			this.message = 'An error occurred. Please try again later.';
			this.isError = true;
		  }
		});
	  }
	
	  goToHome(): void {
		this.router.navigate(['']);
	  }
}