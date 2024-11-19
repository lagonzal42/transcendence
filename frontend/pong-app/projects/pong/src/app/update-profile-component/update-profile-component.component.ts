import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-update-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="update-profile-container">
      <h3>Update Profile</h3>
      <form [formGroup]="updateForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>Display Name</label>
          <input type="text" formControlName="tournament_name" class="form-control">
        </div>
        
        <div class="form-group">
          <label>Avatar</label>
          <input type="file" (change)="onFileSelected($event)" accept="image/*" class="form-control">
        </div>

        <div class="avatar-preview" *ngIf="avatarPreview">
          <img [src]="avatarPreview" alt="Avatar preview">
        </div>

        <button type="submit" [disabled]="updateForm.invalid">Update Profile</button>
      </form>
    </div>
  `,
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
  `]
})
export class UpdateProfileComponent implements OnInit {
  updateForm: FormGroup;
  avatarPreview: string | null = null;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.updateForm = this.fb.group({
      tournament_name: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.updateForm.patchValue({
          tournament_name: user.username
        });
      },
      error: (error) => console.error('Error loading user data:', error)
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
    if (this.updateForm.valid) {
      const formData = new FormData();
      formData.append('tournament_name', this.updateForm.get('tournament_name')?.value);
      if (this.selectedFile) {
        formData.append('avatar', this.selectedFile);
      }

      this.authService.getCurrentUser().pipe(
        switchMap(user => this.authService.updateProfile(formData, user.username))
      ).subscribe({
        next: (response) => {
          console.log('Profile updated successfully', response);
        },
        error: (error) => console.error('Error updating profile:', error)
      });
    }
  }
}
