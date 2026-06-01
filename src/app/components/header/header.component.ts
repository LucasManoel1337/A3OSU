import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  
  username: string | null = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Busca o nome do usuário assim que o header for carregado na tela
    this.username = localStorage.getItem('username');
  }

  sair() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}