import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-criar-torneios.component',
  imports: [HeaderComponent, SidebarComponent],
  templateUrl: './criar-torneios.component.html',
  styleUrl: './criar-torneios.component.css',
})
export class CriarTorneiosComponent {}
