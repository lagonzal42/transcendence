import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  friends: any[] = [];
  matches: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getFriends();
    this.getMatchHistory();
  }

  getFriends() {
    this.http.get('http://localhost:8000/accounts/list_friends/user1/').subscribe((data: any) => {
      this.friends = data;
    });
  }

  getMatchHistory() {
    this.http.get('/api/match-history').subscribe((data: any) => {
      this.matches = data;
    });
  }
}
