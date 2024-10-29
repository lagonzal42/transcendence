import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css'],
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class EditProfileComponent implements OnInit {
  userProfile: any = {
    name: 'Jugador Ejemplo', // Estos datos deben ser editables
    email: 'jugador@ejemplo.com',
    photoUrl: 'https://ejemplo.com/foto.jpg'
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Aquí cargarías el perfil del usuario
    this.loadUserProfile();
  }

  loadUserProfile() {
    // Simulación de carga de perfil, reemplaza esto por la carga real de tu perfil
  }

  onSubmit() {
    // Lógica para guardar los cambios en el perfil
    console.log('Perfil actualizado:', this.userProfile);
    // Aquí podrías agregar lógica para enviar los datos a un servidor

    // Redirigir al perfil después de guardar
    this.router.navigate(['/profile']);
  }
}
