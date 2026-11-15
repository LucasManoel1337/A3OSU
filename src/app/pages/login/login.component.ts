import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService, mensagemErroAuth, senhaValida } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../core/services/modal.service';
import { CustomInputComponent } from '../../components/custom-input/custom-input.component';
import { parseActiveBan } from '../../core/models/user-punishment.model';
import { PunishmentNoticeService } from '../../core/services/punishment-notice.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule, CustomInputComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  email = '';
  password = '';
  code = '';
  newPassword = '';
  confirmNewPassword = '';

  readonly modo = signal<'login' | 'esqueci-senha' | 'redefinir-senha' | 'senha-alterada'>('login');
  readonly etapaRedefinicao = signal<'codigo' | 'senha'>('codigo');
  readonly carregando = signal(false);
  readonly mensagem = signal('');
  readonly tipoMensagem = signal<'success' | 'error' | 'info'>('info');
  constructor(
    private authService: AuthService,
    private router: Router,
    private modalService: ModalService,
    private punishmentNoticeService: PunishmentNoticeService
  ) { }

  onLogin(event: Event) {
    event.preventDefault();
    if (!this.email.trim() || !this.password) {
      this.definirMensagem('Informe seu email e sua senha.', 'error');
      return;
    }

    this.carregando.set(true);
    this.mensagem.set('');
    this.authService.login({ email: this.email.trim(), password: this.password }).subscribe({
      next: (response) => {
        this.modalService.abrir('success', `Bem-vindo de volta, ${response.username}!`);

        setTimeout(() => {
          this.modalService.fechar();
          this.router.navigate(['/home']);
        }, 1500);
      },
      error: (error: unknown) => {
        this.carregando.set(false);
        const punishment = error instanceof HttpErrorResponse ? parseActiveBan(error.error) : null;
        if (punishment) {
          this.punishmentNoticeService.show(punishment, 'account');
          return;
        }
        this.definirMensagem(
          mensagemErroAuth(error, 'Não foi possível entrar. Verifique suas credenciais e tente novamente.'),
          'error'
        );
      }
    });
  }

  onEsqueciSenha(event: Event): void {
    event.preventDefault();
    if (!this.email.trim()) {
      this.definirMensagem('Informe seu email para receber o código de recuperação.', 'error');
      return;
    }

    this.solicitarCodigoRedefinicao(true);
  }

  onReenviarCodigoRedefinicao(): void {
    this.solicitarCodigoRedefinicao(false);
  }

  private solicitarCodigoRedefinicao(iniciarFluxo: boolean): void {
    this.carregando.set(true);
    this.mensagem.set('');
    this.authService.esqueciSenha(this.email.trim()).subscribe({
      next: (response) => {
        if (iniciarFluxo) {
          this.modo.set('redefinir-senha');
        }
        this.etapaRedefinicao.set('codigo');
        this.code = '';
        this.newPassword = '';
        this.confirmNewPassword = '';
        this.definirMensagem(response.message || 'Se o email estiver cadastrado, você receberá um código para redefinir sua senha.', 'info');
        this.carregando.set(false);
      },
      error: (error: unknown) => {
        this.carregando.set(false);
        this.definirMensagem(
          mensagemErroAuth(error, 'Não foi possível solicitar a recuperação da senha. Tente novamente.'),
          'error'
        );
      }
    });
  }

  onContinuarRedefinicao(event: Event): void {
    event.preventDefault();
    if (!this.code.trim()) {
      this.definirMensagem('Informe o código recebido por email.', 'error');
      return;
    }

    this.mensagem.set('');
    this.etapaRedefinicao.set('senha');
  }

  onRedefinirSenha(event: Event): void {
    event.preventDefault();
    if (!this.newPassword || !this.confirmNewPassword) {
      this.definirMensagem('Informe e confirme sua nova senha.', 'error');
      return;
    }

    if (this.newPassword !== this.confirmNewPassword) {
      this.definirMensagem('As senhas não coincidem.', 'error');
      return;
    }

    if (!senhaValida(this.newPassword)) {
      this.definirMensagem(
        'A senha deve ter entre 6 e 20 caracteres, incluindo uma letra maiúscula, uma minúscula, um número e um símbolo.',
        'error'
      );
      return;
    }

    this.carregando.set(true);
    this.mensagem.set('');
    this.authService.redefinirSenha(this.email.trim(), this.code, this.newPassword).subscribe({
      next: (response) => {
        this.modo.set('senha-alterada');
        this.definirMensagem(response.message || 'Senha alterada com sucesso. Faça login com sua nova senha.', 'success');
        this.carregando.set(false);
      },
      error: (error: unknown) => {
        this.carregando.set(false);
        this.definirMensagem(
          mensagemErroAuth(error, 'Não foi possível redefinir a senha. Confira o código e tente novamente.'),
          'error'
        );
      }
    });
  }

  voltarParaLogin(): void {
    this.modo.set('login');
    this.mensagem.set('');
    this.password = '';
    this.code = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
    this.etapaRedefinicao.set('codigo');
  }

  private definirMensagem(message: string, type: 'success' | 'error' | 'info'): void {
    this.mensagem.set(message);
    this.tipoMensagem.set(type);
  }

}

export { parseActiveBan } from '../../core/models/user-punishment.model';