import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ProfileComponent } from './profile/profile.component';
import { SearchComponent } from './search/search.component';
import { TournamentComponent } from './tournament/tournament.component';
import { LocalPlayComponent } from './local-play/local-play.component';
import { PongGameComponent } from './pong-game/pong-game.component';
import { ChatComponent } from './chat/chat.component';
import { UpdateProfileComponent } from './update-profile-component/update-profile-component.component';


export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'login', component: LoginComponent },
      { path: 'signup', component: SignupComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'profile/:username', component: ProfileComponent },
      //{ path: 'search', component: SearchComponent },
      { path: 'tournament', component: TournamentComponent },
      { path: 'local-play', component: LocalPlayComponent },
      { path: 'pong-game', component: PongGameComponent },
      { path: 'profile/:username/update', component: UpdateProfileComponent },
    ]
  },
  {
    path: 'chat/:roomId',
    component: ChatComponent
  }
];