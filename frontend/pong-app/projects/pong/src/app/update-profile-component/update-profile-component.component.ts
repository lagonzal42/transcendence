import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-update-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  //template: './update-profile-component.component.html',
  template: `<div class="update-profile-container">
    <h3 i18n>Update Profile</h3>
    <form [formGroup]="updateForm" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label i18n>Tournament name</label>
        <input type="text" formControlName="tournament_name" class="form-control">
      </div>

      <div class="form-group">
        <label i18n>Avatar</label>
        <input type="file" (change)="onFileSelected($event)" accept="image/*" class="form-control">
      </div>

      <div class="avatar-preview" *ngIf="avatarPreview">
        <img [src]="avatarPreview" alt="Avatar preview">
      </div>

      <button type="submit" 
              [disabled]="updateForm.get('email')?.errors?.['email'] || 
                         (!updateForm.get('tournament_name')?.value && 
                          !updateForm.get('email')?.value && 
                          !selectedFile)" i18n>
        Update Profile
      </button>
    </form>
  </div>`,
  styles: [`
    .update-profile-container {
      max-width: 500px;
      margin: 20px auto;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .avatar-preview img {
      max-width: 150px;
      margin-top: 10px;
      border-radius: 50%;
    }
    .form-group {
      margin-bottom: 15px;
    }
    .error-message {
      color: red;
      font-size: 0.8em;
      margin-top: 5px;
    }
    .debug-info {
      margin-top: 20px;
      padding: 10px;
      background: #f8f8f8;
      border: 1px solid #ddd;
    }
  `]
})
export class UpdateProfileComponent implements OnInit {
  updateForm: FormGroup;
  avatarPreview: string | null = null;
  selectedFile: File | null = null;
  username: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.updateForm = this.fb.group({
      tournament_name: [''],
      email: ['', [Validators.email]]
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.username = params['username'];
      this.loadUserData();
    });
  }

  loadUserData() {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        // console.log('User data received:', user);
        this.updateForm.patchValue({
          tournament_name: user.tournament_name || user.username,
          email: user.email
        });
        // console.log('Form validity:', this.updateForm.valid);
        // console.log('Form errors:', this.updateForm.errors);
      },
      // error: (error) => console.error('Error loading user data:', error)
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.avatarPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    const formData = new FormData();
    const tournamentName = this.updateForm.get('tournament_name')?.value;
    const email = this.updateForm.get('email')?.value;

    if (tournamentName) {
      formData.append('tournament_name', tournamentName);
    }
    if (email) {
      formData.append('email', email);
    }
    if (this.selectedFile) {
      formData.append('avatar', this.selectedFile);
    }
    
    if (tournamentName || email || this.selectedFile) {
      this.authService.updateProfile(formData, this.username).subscribe({
        next: (response) => {
          //console.log("response", response);
          const avatarFilename = response.avatar.split('/').pop();
          //console.log("response.avatar:", response.avatar);
          if (response.avatar) {
            this.router.navigate(['/profile', this.username], {
              queryParams: { newAvatarUrl: avatarFilename }
            });
          } else {
            // console.error('No avatar URL in response');
          }
        }
        // error: (error) => console.error('Error updating profile:', error)
      });
    }
  }
}
