import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../core/services/modal.service'; // <-- Importe o serviço

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';
  carregando = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private modalService: ModalService // <-- Injete o serviço aqui
  ) {}

  onLogin(event: Event) {
    event.preventDefault();
    this.carregando = true;

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: (response) => {
        // Dispara o modal de sucesso verde
        this.modalService.abrir('success', `Bem-vindo de volta, ${response.username}!`);
        
        setTimeout(() => {
          this.modalService.fechar();
          this.router.navigate(['/home']);
        }, 1500);
      },
      error: (erro) => {
        this.carregando = false;
        
        // Dispara o modal de erro vermelho dependendo do código
        if (erro.status === 403 || erro.status === 401) {
          this.modalService.abrir('error', 'Usuário não encontrado ou senha incorreta.');
        } else {
          this.modalService.abrir('warning', 'O servidor de autenticação está offline no momento.');
        }
      }
    });
  }
}