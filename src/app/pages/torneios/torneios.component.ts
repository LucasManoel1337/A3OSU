import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-torneios.component',
  imports: [HeaderComponent, SidebarComponent],
  templateUrl: './torneios.component.html',
  styleUrl: './torneios.component.css',
})
export class TorneiosComponent {}
