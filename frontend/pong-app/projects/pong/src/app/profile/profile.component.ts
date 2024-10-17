import { Component, OnInit } from '@angular/core';
import { UserProfileService } from '../userProfileService';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userProfile: any;

  constructor(private userProfileService: UserProfileService) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  // Método para cargar el perfil del usuario
  loadUserProfile(): void {
    this.userProfileService.getUserProfile().subscribe(
      data => {
        this.userProfile = data; // Guardar los datos recibidos
      },
      error => {
        console.error('Error al cargar el perfil', error);
      }
    );
  }
}
