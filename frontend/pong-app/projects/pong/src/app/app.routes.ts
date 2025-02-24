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
import { PongGameComponent } from './pong-game/dualplayer/pong-game.component';
import { AuthenticationGuard } from './auth/authentication.guard';
import { MultiplayerComponent } from './pong-game/multiplayer/multiplayer.component';
import { ChatComponent } from './chat/chat.component';
import { UpdateProfileComponent } from './update-profile-component/update-profile-component.component';
import { MatchHistoryComponent } from './match-history/match-history.component';
import { TwoFactorComponent} from './2FA/2FA.component';
import { VerifyComponent } from './verify_token/verify.component';
import { Page4Component } from './page4/page4.component';



export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: LayoutComponent,
        children: [
          { path: '', component: HomeComponent },
          { path: 'Home', component: HomeComponent },
          { path: 'login', component: LoginComponent },
          { path: 'signup', component: SignupComponent },
          { path: 'profile', component: ProfileComponent, canActivate: [AuthenticationGuard] },
          { path: 'profile/:username', component: ProfileComponent, canActivate: [AuthenticationGuard] },
          { path: 'tournament', component: TournamentComponent },
          { path: 'local-play', component: LocalPlayComponent },
          { path: 'pong-game', component: PongGameComponent },
          { path: 'multiplayer', component: MultiplayerComponent },
          { path: 'profile/:username/update', component: UpdateProfileComponent, canActivate: [AuthenticationGuard] },
          { path: 'match-history/:username', component: MatchHistoryComponent },
          { path: 'two-factor', component: TwoFactorComponent },
          { path: 'verify', component: VerifyComponent },
          { path: 'chat/:roomId', component: ChatComponent },
          { path: '4page', component: Page4Component },
        ]
      },
      //{
      //  path: 'chat/:roomId',
      //  component: ChatComponent
      //},
      {
        path: 'verify/:token',
        component: VerifyComponent
      }
    ]
  },
  //{
  //path: '',
  //redirectTo: '/en-US',
  //pathMatch: 'full'
  //}
];