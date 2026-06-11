import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout-privado',
  imports: [HeaderComponent, SidebarComponent, RouterOutlet],
  templateUrl: './layout-privado.component.html',
  styleUrl: './layout-privado.component.scss',
})
export class LayoutPrivadoComponent {}
