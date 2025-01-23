import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
// import { TranslateModule, TranslateService } from '@ngx-translate/core';
// import { HomeComponent } from './home/home.component';
// import { AboutComponent } from './about/about.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LayoutComponent, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'pong';

  localesList = [
    { code: 'en-US', label: 'English'},
    { code: 'es-PR', label: 'Spanish'},
    { code: 'fr-FR', label: 'French'},
  ];
}
