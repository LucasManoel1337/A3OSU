import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  username = 'Jogador';
  menuAberto = false; // <-- Controle do menu

  constructor(private router: Router) {}

  ngOnInit() {
    const nickSalvo = localStorage.getItem('username');
    if (nickSalvo) {
      this.username = nickSalvo;
    }
  }

  // Abre/fecha o menu e impede que o clique se espalhe pela tela
  toggleMenu(event: Event) {
    event.stopPropagation();
    this.menuAberto = !this.menuAberto;
  }

  // Se o usuário clicar em qualquer outro lugar da página, fecha o menu
  @HostListener('document:click')
  fecharMenu() {
    this.menuAberto = false;
  }

  sair() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}