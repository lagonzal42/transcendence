import { Component, OnInit } from '@angular/core';
import { UserProfileService } from '../userProfileService/userProfileService';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [CommonModule]
})
export class ProfileComponent implements OnInit {
  userProfile: any;

  constructor(private userProfileService: UserProfileService) {}

  ngOnInit(): void {
    this.getFriends();
    this.getMatchHistory();
  }

  getFriends() {
    const url : string = 'http://localhost:8000/accounts/list_friends/' + localStorage.getItem('username');
    this.http.get(url).subscribe((data: any) => {
      this.friends = data;
      console.log(data);
    });
  }

  // getMatchHistory() {
  //   this.http.get('/api/match-history').subscribe((data: any) => {
  //     this.matches = data;
  //   });
  // }
}
