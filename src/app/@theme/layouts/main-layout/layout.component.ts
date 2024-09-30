import { Component } from '@angular/core';
import { SidenavComponent } from '../../components/sidenav/sidenav.component';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-layout',
  templateUrl: 'layout.component.html',
  standalone: true,
  imports: [SidenavComponent, HeaderComponent, RouterModule]
})
export class LayoutComponent {
  constructor() {}
}
