import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TorneioDetalhesDTO, TorneioService } from '../../core/services/torneios.service';
import { UserService } from '../../core/services/user.service';
import { ModalService } from '../../core/services/modal.service';
import { parseActiveTournamentSuspension } from '../../core/models/user-punishment.model';
import { catchError, finalize, forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-torneio-detalhe',
  templateUrl: './torneio-detalhe.component.html',
  styleUrls: ['./torneio-detalhe.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule]
})
export class TorneioDetalheComponent implements OnInit, OnDestroy {
  torneioId!: number;
  torneio: any; 
  jogadores: any[] = [];
  
  currentUserId: number = 0;
  carregandoInscricao: boolean = false;
  mostrarModalSenha: boolean = false;
  senhaDigitada: string = '';
  carregandoDados = true;

  private readonly tempoMinimoLoadingMs = 500;
  private inicioCarregamento = 0;
  private loadingTimeout?: ReturnType<typeof setTimeout>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private torneioService: TorneioService,
    private userService: UserService,
    private modalService: ModalService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.torneioId = Number(this.route.snapshot.paramMap.get('id'));
    
    this.carregarDadosIniciais();
  }

  ngOnDestroy(): void {
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
  }

  private carregarDadosIniciais(): void {
    this.inicioCarregamento = Date.now();
    this.carregandoDados = true;

    forkJoin({
      torneio: this.torneioService.buscarTorneioPorId(this.torneioId),
      jogadores: this.torneioService.buscarInscritosDoTorneio(this.torneioId).pipe(
        catchError(erro => {
          console.error('Erro ao carregar os inscritos:', erro);
          return of([]);
        })
      ),
      usuario: this.userService.getProfile().pipe(
        catchError(() => {
          console.warn('Usuário não logado.');
          return of(null);
        })
      )
    }).pipe(
      finalize(() => this.finalizarCarregamento())
    ).subscribe({
      next: ({ torneio, jogadores, usuario }) => {
        this.torneio = {
          ...torneio,
          bannerUrl: torneio.bannerUrlTorneio,
          logoUrl: torneio.logoUrlTorneio
        };
        this.jogadores = jogadores;
        if (usuario) {
          this.currentUserId = usuario.idUser;
        }
        this.cdr.detectChanges();
      },
      error: (erro) => {
        console.error('Erro ao carregar detalhes do torneio:', erro);
        this.modalService.abrir('error', 'Não foi possível carregar os detalhes deste torneio.');
        this.voltar();
      }
    });
  }

  private finalizarCarregamento(): void {
    const tempoRestante = this.tempoMinimoLoadingMs - (Date.now() - this.inicioCarregamento);
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
    this.loadingTimeout = setTimeout(() => {
      this.carregandoDados = false;
      this.cdr.detectChanges();
      this.loadingTimeout = undefined;
    }, Math.max(0, tempoRestante));
  }

  carregarDadosDoTorneio() {
    this.torneioService.buscarTorneioPorId(this.torneioId).subscribe({
      next: (dados: TorneioDetalhesDTO) => {
        this.torneio = dados;
        this.torneio.bannerUrl = dados.bannerUrlTorneio;
        this.torneio.logoUrl = dados.logoUrlTorneio;
        this.cdr.detectChanges(); 
      },
      error: (erro) => {
        console.error('Erro ao carregar detalhes do torneio:', erro);
        this.modalService.abrir('error', 'Não foi possível carregar os detalhes deste torneio.');
        this.voltar();
      }
    });
  }

  carregarInscritos() {
    this.torneioService.buscarInscritosDoTorneio(this.torneioId).subscribe({
      next: (dados) => {
        this.jogadores = dados;
        this.cdr.detectChanges();
      },
      error: (erro) => {
        console.error('Erro ao carregar os inscritos:', erro);
      }
    });
  }

  voltar() {
    this.router.navigate(['/torneios']); 
  }
  
  inscreverNoTorneio() {
    if (this.carregandoInscricao) {
      return;
    }

    if (this.currentUserId === 0) {
      this.modalService.abrir('warning', 'Você precisa estar logado para participar.');
      return;
    }

    if (this.torneio.isPrivado) {
      this.senhaDigitada = '';
      this.mostrarModalSenha = true;
    } else {
      this.enviarInscricao();
    }
  }

  fecharModal() {
    this.mostrarModalSenha = false;
    this.senhaDigitada = '';
  }

  enviarInscricao() {
    if (this.carregandoInscricao) {
      return;
    }

    this.carregandoInscricao = true;

    const payload = {
      jogadorId: this.currentUserId,
      senha: this.senhaDigitada || undefined 
    };

    this.torneioService.entrarNoTorneio(this.torneioId, payload).subscribe({
      next: (resposta) => {
        this.carregandoInscricao = false;
        this.fecharModal();
        this.modalService.abrir('success', 'Inscrição confirmada com sucesso!');
        
        this.carregarDadosDoTorneio(); 
        this.carregarInscritos(); 
      },
      error: (erro) => {
        this.carregandoInscricao = false;
        if (parseActiveTournamentSuspension(erro.error)) {
          return;
        }
        const msgErro = erro.error || 'Erro ao realizar inscrição. Tente novamente.';
        this.modalService.abrir('error', msgErro);
      }
    });
  }

  verPerfilJogador(jogador: any) {
    this.router.navigate(['/perfil', jogador.id]);
  }
}