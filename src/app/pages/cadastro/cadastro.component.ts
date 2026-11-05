import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService, mensagemErroAuth, senhaValida } from '../../core/services/auth.service';
import { CustomInputComponent } from '../../components/custom-input/custom-input.component';
import { CustomSelectComponent, SelectOption } from '../../components/custom-select/custom-select.component';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    CommonModule,
    CustomInputComponent,
    CustomSelectComponent
  ],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CadastroComponent {

  email = '';
  username = '';
  password = '';
  confirmPassword = '';
  nacionalidade = '';
  idioma = '';
  code = '';

  readonly etapa = signal<'cadastro' | 'verificacao' | 'confirmado'>('cadastro');
  readonly carregando = signal(false);
  readonly mensagem = signal('');
  readonly tipoMensagem = signal<'success' | 'error' | 'info'>('info');

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
    private authService: AuthService
  ) {}

  onCadastro(event: Event) {
    event.preventDefault();

    if (!this.username.trim() || !this.email.trim() || !this.password || !this.nacionalidade || !this.idioma) {
      this.definirMensagem('Todos os campos do formulário são obrigatórios.', 'error');
      return;
    }

    if (!this.confirmPassword) {
      this.definirMensagem('Confirme sua senha para continuar.', 'error');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.definirMensagem('As senhas não coincidem.', 'error');
      return;
    }

    if (!senhaValida(this.password)) {
      this.definirMensagem(
        'A senha deve ter entre 6 e 20 caracteres, incluindo uma letra maiúscula, uma minúscula, um número e um símbolo.',
        'error'
      );
      return;
    }

    this.carregando.set(true);
    this.mensagem.set('');

    const dadosCadastro = {
      username: this.username.trim(),
      email: this.email.trim(),
      password: this.password,
      nationality: this.nacionalidade,
      language: this.idioma
    };

    this.authService.cadastrar(dadosCadastro).subscribe({
      next: (response) => {
        this.etapa.set('verificacao');
        this.definirMensagem(response.message || 'Cadastro realizado. Verifique seu email para obter o código de confirmação.', 'success');
        this.carregando.set(false);
      },
      error: (error: unknown) => {
        this.carregando.set(false);
        this.definirMensagem(
          mensagemErroAuth(error, 'Não foi possível realizar o cadastro. Tente novamente.'),
          'error'
        );
      }
    });
  }

  onVerificarEmail(event: Event): void {
    event.preventDefault();
    if (!this.code) {
      this.definirMensagem('Informe o código recebido por email.', 'error');
      return;
    }

    this.carregando.set(true);
    this.mensagem.set('');
    this.authService.verificarEmail(this.email.trim(), this.code).subscribe({
      next: (response) => {
        this.etapa.set('confirmado');
        this.definirMensagem(response.message || 'Email confirmado com sucesso.', 'success');
        this.carregando.set(false);
      },
      error: (error: unknown) => {
        this.carregando.set(false);
        this.definirMensagem(
          mensagemErroAuth(error, 'Não foi possível confirmar o email. Confira o código e tente novamente.'),
          'error'
        );
      }
    });
  }

  onReenviarCodigo(): void {
    this.carregando.set(true);
    this.mensagem.set('');
    this.authService.reenviarVerificacao(this.email.trim()).subscribe({
      next: (response) => {
        this.definirMensagem(response.message || 'Um novo código foi enviado para seu email.', 'success');
        this.carregando.set(false);
      },
      error: (error: unknown) => {
        this.carregando.set(false);
        this.definirMensagem(
          mensagemErroAuth(error, 'Não foi possível reenviar o código. Tente novamente.'),
          'error'
        );
      }
    });
  }

  private definirMensagem(message: string, type: 'success' | 'error' | 'info'): void {
    this.mensagem.set(message);
    this.tipoMensagem.set(type);
  }
}