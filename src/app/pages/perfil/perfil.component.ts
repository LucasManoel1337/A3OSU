import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [HeaderComponent, SidebarComponent, CommonModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  
  username: string | null = 'Jogador';
  dataEntrada: string = '';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Resgata o nome que salvamos na hora do login
      const nickSalvo = localStorage.getItem('username');
      if (nickSalvo) {
        this.username = nickSalvo;
      }
    }
    
    // Apenas uma data fictícia de exemplo para compor o visual do perfil
    const hoje = new Date();
    this.dataEntrada = `${hoje.toLocaleString('pt-BR', { month: 'long' })} de ${hoje.getFullYear()}`;
  }
}