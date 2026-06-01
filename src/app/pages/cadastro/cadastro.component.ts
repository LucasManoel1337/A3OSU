import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ModalService } from '../../core/services/modal.service'; // <-- Importação do Modal

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.css'
})
export class CadastroComponent {
  
  email = '';
  username = '';
  password = '';
  carregando = false;
  // A variável mensagemErro foi apagada daqui!

  constructor(
    private authService: AuthService,
    private router: Router,
    private modalService: ModalService // <-- Injeção do serviço
  ) {}

  onCadastro(event: Event) {
    event.preventDefault();
    this.carregando = true;

    const dadosCadastro = {
      username: this.username,
      email: this.email,
      password: this.password
    };

    this.authService.cadastrar(dadosCadastro).subscribe({
      next: (response) => {
        // Dispara o modal de sucesso com o nick do jogador
        this.modalService.abrir('success', `Conta criada com sucesso! Bem-vindo(a), ${response.username}!`);
        
        // Aguarda 1.5s para o usuário ler, fecha o modal e manda para a Home
        setTimeout(() => {
          this.modalService.fechar();
          this.router.navigate(['/home']);
        }, 1500);
      },
      error: (erro) => {
        this.carregando = false;
        
        // Dispara o modal de erro ou alerta
        if (erro.status === 400 || erro.status === 500) {
          this.modalService.abrir('error', 'Não foi possível cadastrar. Usuário ou e-mail já em uso.');
        } else {
          this.modalService.abrir('warning', 'O servidor está offline no momento. Tente novamente mais tarde.');
        }
      }
    });
  }
}