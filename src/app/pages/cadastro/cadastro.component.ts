import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ModalService } from '../../core/services/modal.service';
import { CustomInputComponent } from '../../components/custom-input/custom-input.component'; // <-- Importado
import { CustomSelectComponent, SelectOption } from '../../components/custom-select/custom-select.component'; // <-- Importado

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [
    RouterModule, 
    FormsModule, 
    CommonModule, 
    CustomInputComponent,  // <-- Registrado
    CustomSelectComponent  // <-- Registrado
  ],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.css'
})
export class CadastroComponent {
  
  email = '';
  username = '';
  password = '';
  carregando = false;

  nacionalidade = '';
  idioma = '';

  listaNacionalidades: SelectOption[] = [
    { value: 'br', label: 'Brasileiro' },
    { value: 'us', label: 'Americano (USA)' },
    { value: 'jp', label: 'Japonês' },
    { value: 'kr', label: 'Sul-Coreano' },
    { value: 'de', label: 'Alemão' },
    { value: 'ca', label: 'Canadense' }
  ];

  listaIdiomas: SelectOption[] = [
    { value: 'pt-BR', label: 'Português (Brasil)' },
    { value: 'en-US', label: 'English (USA)' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private modalService: ModalService
  ) {}

  onCadastro(event: Event) {
    event.preventDefault();

    // 1. VALIDAÇÃO DE CAMPOS OBRIGATÓRIOS: Verifica se TODOS os campos estão preenchidos
    if (!this.username.trim() || !this.email.trim() || !this.password.trim() || !this.nacionalidade || !this.idioma) {
      this.modalService.abrir('warning', 'Todos os campos do formulário são obrigatórios!');
      return;
    }

    // 2. VALIDAÇÃO DA SENHA COM REGEX:
    // - (?=.*[a-z]) : Pelo menos uma letra minúscula
    // - (?=.*[A-Z]) : Pelo menos uma letra maiúscula
    // - (?=.*\d)    : Pelo menos um número
    // - (?=.*[@$!%*?&]) : Pelo menos um caractere especial
    // - {6,20}      : Entre 6 e 20 caracteres de comprimento
    const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,20}$/;

    if (!senhaRegex.test(this.password)) {
      this.modalService.abrir(
        'error', 
        'A senha deve conter entre 6 e 20 caracteres, incluindo: uma letra maiúscula, uma minúscula, um número e um caractere especial (ex: @, $, !, %, *, ?, &).'
      );
      return;
    }

    // Se passou em todas as validações, ativa o carregamento e envia para o back-end
    this.carregando = true;

    const dadosCadastro = {
      username: this.username.trim(),
      email: this.email.trim(),
      password: this.password,
      nationality: this.nacionalidade,
      language: this.idioma
    };

    this.authService.cadastrar(dadosCadastro).subscribe({
      next: (response) => {
        this.modalService.abrir('success', `Conta criada com sucesso! Bem-vindo(a), ${response.username}!`);
        
        setTimeout(() => {
          this.modalService.fechar();
          this.router.navigate(['/home']);
        }, 1500);
      },
      error: (erro) => {
        this.carregando = false;
        if (erro.status === 400 || erro.status === 500) {
          this.modalService.abrir('error', 'Não foi possível cadastrar. Usuário ou e-mail já em uso.');
        } else {
          this.modalService.abrir('warning', 'O servidor está offline no momento. Tente novamente mais tarde.');
        }
      }
    });
  }
}