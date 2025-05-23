import { Component, OnInit, OnDestroy } from '@angular/core';
//import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
//import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';
// import { map, catchError } from 'rxjs/operators';
// import { Observable, throwError, of, BehaviorSubject } from 'rxjs';
// import { Injectable, Inject , PLATFORM_ID} from '@angular/core';
// import { error } from 'console';

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
		// First check for URL params (/:token style)
		this.route.params.subscribe(params => {
			const pathToken = params['token'];
			if (pathToken) {
			//   console.log("token exists in path param");
			  this.activateAccount(pathToken);
			  return;
			}
			
			// If no path param, check for query params (?token= style)
			this.route.queryParams.subscribe(qParams => {
			  const queryToken = qParams['token'];
			  if (queryToken) {
				// console.log("token exists in query param");
				this.activateAccount(queryToken);
			  } else {
				this.message = 'Invalid activation link';
				this.isError = true;
			  }
			});
		  });
	}
	
	activateAccount(token: string): void {
		this.http.get(`${environment.backendURL}accounts/activation/?token=${token}`).subscribe({
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