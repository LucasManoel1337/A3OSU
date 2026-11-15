import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService, UsuarioModeracao } from '../../core/services/user.service';
import { UserPunishment, UserPunishmentRequest, UserPunishmentType } from '../../core/models/user-punishment.model';

@Component({
  selector: 'app-moderacao',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './moderacao.component.html',
  styleUrl: './moderacao.component.css'
})
export class ModeracaoComponent implements OnInit {
  secaoAtiva: 'denuncias' | 'jogadores' = 'jogadores';
  readonly conquistas = [
    { codigo: 'FOUNDER', nome: 'Fundador da plataforma' },
    { codigo: 'MEMBRO_BETA', nome: 'Membro Beta' },
    { codigo: 'PRIMEIRA_BATALHA', nome: 'Primeira Batalha' },
    { codigo: 'ORGANIZADOR', nome: 'Organizador de Copa' }
  ];

  termo = '';
  resultados: UsuarioModeracao[] = [];
  usuarioSelecionado: UsuarioModeracao | null = null;
  tituloNovo = '';
  tipoPunicao: UserPunishmentType = 'BANIMENTO_PERMANENTE';
  motivoPunicao = '';
  validadePunicao = '';
  aplicandoPunicao = false;
  buscando = false;
  verificandoPermissao = true;
  permitido = false;
  mensagem = '';
  erro = '';

  constructor(
    private userService: UserService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userService.getProfile().subscribe({
      next: perfil => {
        this.ngZone.run(() => {
          this.permitido = (perfil.conquistas ?? []).includes('FOUNDER');
          this.verificandoPermissao = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.verificandoPermissao = false;
          this.erro = 'Não foi possível validar sua permissão. Entre novamente e tente outra vez.';
          this.cdr.detectChanges();
        });
      }
    });
  }

  pesquisar(): void {
    const termo = this.termo.trim();
    this.mensagem = '';
    this.erro = '';
    this.usuarioSelecionado = null;
    if (termo.length < 2) {
      this.resultados = [];
      this.erro = 'Digite pelo menos 2 caracteres para pesquisar.';
      return;
    }

    this.buscando = true;
    this.userService.pesquisarUsuariosParaModeracao(termo).subscribe({
      next: usuarios => {
        this.ngZone.run(() => {
          this.resultados = usuarios;
          this.buscando = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.buscando = false;
          this.erro = 'Não foi possível pesquisar usuários. Verifique sua permissão Founder e tente novamente.';
          this.cdr.detectChanges();
        });
      }
    });
  }

  selecionarUsuario(usuario: UsuarioModeracao): void {
    this.ngZone.run(() => {
      this.usuarioSelecionado = {
        ...usuario,
        conquistas: [...usuario.conquistas],
        titulos: [...usuario.titulos],
        punicoes: [...usuario.punicoes]
      };
      this.mensagem = '';
      this.erro = '';
      this.cdr.detectChanges();
    });
  }

  alterarVerificacao(event: Event): void {
    const user = this.usuarioSelecionado;
    if (!user) return;
    const verificado = (event.target as HTMLInputElement).checked;
    this.userService.atualizarVerificado(user.idUser, verificado).subscribe({
      next: () => {
        this.ngZone.run(() => {
          user.verificado = verificado;
          this.mensagem = verificado ? 'Selo de verificado concedido.' : 'Selo de verificado removido.';
          this.cdr.detectChanges();
        });
      },
      error: () => this.ngZone.run(() => {
        this.erro = 'Não foi possível atualizar o selo de verificado.';
        this.cdr.detectChanges();
      })
    });
  }

  alterarConquista(codigo: string, event: Event): void {
    const user = this.usuarioSelecionado;
    if (!user) return;
    const conceder = (event.target as HTMLInputElement).checked;
    this.userService.atualizarConquista(user.idUser, codigo, conceder).subscribe({
      next: () => {
        this.ngZone.run(() => {
          user.conquistas = conceder
            ? [...new Set([...user.conquistas, codigo])]
            : user.conquistas.filter(item => item !== codigo);
          this.mensagem = 'Conquistas atualizadas.';
          this.cdr.detectChanges();
        });
      },
      error: () => this.ngZone.run(() => {
        this.erro = 'Não foi possível atualizar a conquista.';
        this.cdr.detectChanges();
      })
    });
  }

  concederTitulo(): void {
    const user = this.usuarioSelecionado;
    const titulo = this.tituloNovo.trim();
    if (!user || !titulo) return;
    this.userService.atualizarTitulo(user.idUser, titulo, true).subscribe({
      next: () => {
        this.ngZone.run(() => {
          user.titulos = [...new Set([...user.titulos, titulo])];
          this.tituloNovo = '';
          this.mensagem = 'Título concedido ao jogador.';
          this.cdr.detectChanges();
        });
      },
      error: () => this.ngZone.run(() => {
        this.erro = 'Não foi possível conceder o título. Use até 60 caracteres.';
        this.cdr.detectChanges();
      })
    });
  }

  removerTitulo(titulo: string): void {
    const user = this.usuarioSelecionado;
    if (!user) return;
    this.userService.atualizarTitulo(user.idUser, titulo, false).subscribe({
      next: () => {
        this.ngZone.run(() => {
          user.titulos = user.titulos.filter(item => item !== titulo);
          this.mensagem = 'Título removido do jogador.';
          this.cdr.detectChanges();
        });
      },
      error: () => this.ngZone.run(() => {
        this.erro = 'Não foi possível remover o título.';
        this.cdr.detectChanges();
      })
    });
  }

  aplicarPunicao(): void {
    const user = this.usuarioSelecionado;
    const reason = this.motivoPunicao.trim();
    const requerValidade = this.tipoPunicao === 'BANIMENTO_TEMPORARIO';
    const expiresAt = this.validadePunicao || null;

    if (!user || !reason || reason.length > 1000 || (requerValidade && !expiresAt)) {
      this.erro = requerValidade && !expiresAt
        ? 'Informe até quando o banimento temporário ficará ativo.'
        : 'Preencha um motivo com até 1000 caracteres.';
      return;
    }
    if (expiresAt && new Date(expiresAt).getTime() <= Date.now()) {
      this.erro = 'A data e hora de término precisa estar no futuro.';
      return;
    }

    const request: UserPunishmentRequest = {
      type: this.tipoPunicao,
      reason,
      expiresAt: this.tipoPunicao === 'BANIMENTO_PERMANENTE' ? null : expiresAt
    };
    this.aplicandoPunicao = true;
    this.erro = '';
    this.userService.aplicarPunicao(user.idUser, request).subscribe({
      next: punishment => {
        this.ngZone.run(() => {
          user.punicoes = [punishment, ...user.punicoes];
          this.motivoPunicao = '';
          this.validadePunicao = '';
          this.mensagem = 'Punição aplicada e registrada no histórico.';
          this.aplicandoPunicao = false;
          this.cdr.detectChanges();
        });
      },
      error: error => this.ngZone.run(() => {
        this.erro = error?.error?.message || error?.error?.detail
          || error?.error || 'Não foi possível aplicar a punição.';
        this.aplicandoPunicao = false;
        this.cdr.detectChanges();
      })
    });
  }

  revogarPunicao(punishment: UserPunishment): void {
    const user = this.usuarioSelecionado;
    if (!user || !punishment.active) return;

    this.userService.revogarPunicao(punishment.id).subscribe({
      next: updated => {
        this.ngZone.run(() => {
          user.punicoes = user.punicoes.map(item => item.id === updated.id ? updated : item);
          this.mensagem = 'Punição encerrada. O registro foi mantido no histórico.';
          this.cdr.detectChanges();
        });
      },
      error: error => this.ngZone.run(() => {
        this.erro = error?.error?.message || error?.error?.detail
          || error?.error || 'Não foi possível encerrar a punição.';
        this.cdr.detectChanges();
      })
    });
  }

  nomePunicao(type: UserPunishmentType): string {
    switch (type) {
      case 'BANIMENTO_PERMANENTE': return 'Banimento permanente';
      case 'BANIMENTO_TEMPORARIO': return 'Banimento temporário';
      case 'SUSPENSAO_RANQUEADO': return 'Suspensão de torneios ranked';
      case 'SUSPENSAO_CASUAL': return 'Suspensão de torneios casuais';
    }
  }

  statusPunicao(punishment: UserPunishment): string {
    if (punishment.active) return 'Ativa';
    return punishment.expiresAt && new Date(punishment.expiresAt) <= new Date()
      ? 'Expirada'
      : 'Encerrada';
  }
}
