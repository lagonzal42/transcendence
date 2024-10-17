import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private apiUrl = 'http://localhost:8000/api/profile/'; // La URL de tu backend

  constructor(private http: HttpClient) {}

  // Método para obtener los datos del perfil
  getUserProfile(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
