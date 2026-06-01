import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-pesquisar.component',
  imports: [HeaderComponent, SidebarComponent],
  templateUrl: './pesquisar.component.html',
  styleUrl: './pesquisar.component.css',
})
export class PesquisarComponent {}
