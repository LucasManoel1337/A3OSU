import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TorneioDetalhesDTO, TorneioService } from '../../core/services/torneios.service';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { UserService } from '../../core/services/user.service';
import { ModalService } from '../../core/services/modal.service';

@Component({
  selector: 'app-torneio-gerenciar',
  templateUrl: './torneio-gerenciar.component.html',
  styleUrls: ['./torneio-gerenciar.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule]
})
export class TorneioGerenciarComponent implements OnInit {
  torneioId!: number;
  torneio: any;
  jogadores: any[] = [];
  moderadores: any[] = []; 
  novoModeradorId: string = ''; 

  termoBusca: string = '';
  paginaAtual: number = 1;
  itensPorPagina: number = 10;

  buscaModeradorControl = new FormControl('');
  resultadosModeradores: any[] = [];
  moderadoresSelecionados: any[] = [];
  buscandoMod: boolean = false;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private torneioService = inject(TorneioService);
  private userService = inject(UserService);
  private modalService = inject(ModalService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.torneioId = Number(this.route.snapshot.paramMap.get('id'));
    this.carregarDadosDoTorneio();
    this.carregarInscritos();
    this.carregarModeradores(); // <-- Chama a lista atual do banco
    this.configurarBuscaModeradores(); // <-- Inicia o listener do input
  }

  // --- LÓGICA DE BUSCA E PAGINAÇÃO ---

  // 1. Primeiro filtra por nome
  get jogadoresFiltrados() {
    if (!this.termoBusca.trim()) {
      return this.jogadores;
    }
    const termo = this.termoBusca.toLowerCase();
    return this.jogadores.filter(j => j.username.toLowerCase().includes(termo));
  }

  // 2. Depois aplica a paginação em cima da lista filtrada
  get jogadoresPaginados() {
    const indexInicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const indexFim = indexInicio + this.itensPorPagina;
    return this.jogadoresFiltrados.slice(indexInicio, indexFim);
  }

  get totalPaginas() {
    return Math.ceil(this.jogadoresFiltrados.length / this.itensPorPagina) || 1;
  }

  mudarPagina(novaPagina: number) {
    if (novaPagina >= 1 && novaPagina <= this.totalPaginas) {
      this.paginaAtual = novaPagina;
    }
  }

  aoBuscar() {
    this.paginaAtual = 1; // Volta para a página 1 sempre que o usuário digitar algo na busca
  }

  calcularPosicaoReal(indexNaPagina: number): number {
    return (this.paginaAtual - 1) * this.itensPorPagina + indexNaPagina + 1;
  }

  // --- RESTANTE DOS MÉTODOS ---

  carregarDadosDoTorneio() {
    this.torneioService.buscarTorneioPorId(this.torneioId).subscribe({
      next: (dados: TorneioDetalhesDTO) => {
        this.torneio = dados;
        this.torneio.bannerUrl = dados.bannerUrlTorneio;
        this.torneio.logoUrl = dados.logoUrlTorneio;
        this.torneio.status = dados.status;
        this.cdr.detectChanges();
      },
      error: () => {
        this.modalService.abrir('error', 'Erro ao carregar dados do painel de controle.');
        this.router.navigate(['/torneios']);
      }
    });
  }

  carregarInscritos() {
    this.torneioService.buscarInscritosDoTorneio(this.torneioId).subscribe({
      next: (dados) => {
        this.jogadores = dados;
        this.cdr.detectChanges();
      },
      error: (erro) => console.error('Erro ao buscar inscritos:', erro)
    });
  }

  adicionarModerador() {
    if (!this.novoModeradorId.trim()) return;
    this.modalService.abrir('success', `Moderador ID ${this.novoModeradorId} adicionado.`);
    this.novoModeradorId = '';
  }

  verPerfilJogador(jogador: any) {
    this.router.navigate(['/perfil', jogador.idUser]);
  }

  carregarModeradores() {
    this.torneioService.listarModeradores(this.torneioId).subscribe({
      next: (dados) => this.moderadoresSelecionados = dados,
      error: (err) => console.error('Erro ao carregar moderadores', err)
    });
  }

  configurarBuscaModeradores() {
    this.buscaModeradorControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      tap(termo => {
        if (termo && termo.trim() !== '') this.buscandoMod = true;
      }),
      switchMap(termo => {
        if (!termo || termo.trim() === '') {
          this.resultadosModeradores = [];
          this.buscandoMod = false;
          return of([]); 
        }
        return this.userService.buscarUsuariosPorNick(termo).pipe(catchError(() => of([])));
      })
    ).subscribe({
      next: (resultados) => {
        // Remove dos resultados os que já são moderadores
        this.resultadosModeradores = resultados.filter(
          (r: any) => !this.moderadoresSelecionados.some(m => m.id === r.id || m.jogadorId === r.id)
        );
        this.buscandoMod = false;
        this.cdr.detectChanges();
      }
    });
  }

  adicionarModeradorLista(user: any) {
    this.torneioService.adicionarModerador(this.torneioId, user.id).subscribe({
      next: () => {
        this.modalService.abrir('success', `${user.username} agora é moderador!`);
        this.carregarModeradores(); // Recarrega a lista do banco
        this.buscaModeradorControl.setValue(''); // Limpa o input
        this.resultadosModeradores = []; // Fecha o dropdown
      },
      error: () => this.modalService.abrir('error', 'Erro ao adicionar moderador.')
    });
  }

  removerModerador(mod: any) {
    const idParaRemover = mod.jogadorId || mod.id; 
    
    this.torneioService.removerModerador(this.torneioId, idParaRemover).subscribe({
      next: () => {
        this.modalService.abrir('success', 'Moderador removido com sucesso!');
        this.carregarModeradores(); // Recarrega a lista do banco
      },
      error: () => this.modalService.abrir('error', 'Erro ao remover moderador.')
    });
  }

  alterarStatus(novoStatus: string) {
    this.torneioService.atualizarStatus(this.torneioId, novoStatus).subscribe({
        next: (resp) => {
        this.torneio.status = novoStatus; // Atualiza localmente se der sucesso
        this.modalService.abrir('success', `Status alterado para: ${novoStatus}`);
        },
        error: (err) => {
        console.error(err);
        this.modalService.abrir('error', 'Erro ao alterar status.');
        }
    });
    }

    salvarPontuacaoSingle(jogador: any, event: Event) {
    event.stopPropagation();
    
    // Nota: certifique-se de que o objeto jogador tenha o 'idUser' ou 'id' correto
    const idJogador = jogador.idUser || jogador.id; 
    
    this.torneioService.atualizarPontuacao(this.torneioId, idJogador, jogador.pontuacao).subscribe({
        next: () => {
        this.modalService.abrir('success', `Pontuação de ${jogador.username} salva!`);
        },
        error: () => {
        this.modalService.abrir('error', 'Erro ao salvar pontuação.');
        }
    });
    }

    get proximoStatus(): { label: string, status: string, icon: string } | null {
      if (!this.torneio || !this.torneio.status) return null;

      switch (this.torneio.status) {
        case 'Em Rascunho':
          return { label: 'Publicar Torneio', status: 'Aguardando Início', icon: '📢' };
        case 'Aguardando Início':
          return { label: 'Começar Torneio', status: 'Em Andamento', icon: '▶️' };
        case 'Em Andamento':
          return { label: 'Encerrar Torneio', status: 'Encerrado', icon: '⏹️' };
        default:
          return null;
      }
    }
}