import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
// import { UserProfileService } from '../userProfileService/userProfileService';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [CommonModule, HttpClientModule],
  standalone: true
})
export class ProfileComponent implements OnInit {
  userProfile: any;
  friends: any;

  constructor(
    // private userProfileService: UserProfileService,
    private http: HttpClient // Inyectar HttpClient en el constructor
  ) {}

  ngOnInit(): void {
    this.getFriends();
    this.getAccountDetail();
    //this.getMatchHistory();
  }

  getAccountDetail() {
    const url: string = 'http://localhost:8000/accounts/account_detail/' + localStorage.getItem('username');
    this.http.get(url).subscribe(
      (data: any) => {
        this.userProfile = data;
        console.log(this.userProfile);
      },
      (error) => {
        console.error('Error al cargar la informacion de perfil', error);
      }
    );
  }

  getFriends() {
    const url: string = 'http://localhost:8000/accounts/list_friends/' + localStorage.getItem('username');
    this.http.get(url).subscribe(
      (data: any) => {
        this.friends = data;
        console.log(data);
      },
      (error) => {
        console.error('Error al cargar la lista de amigos', error);
      }
    );
  }

  // getMatchHistory() {
  //   this.http.get('/api/match-history').subscribe((data: any) => {
  //     this.matches = data;
  //   });
  // }
}
