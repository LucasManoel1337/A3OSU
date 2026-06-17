import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TorneioDetalhesDTO, TorneioService } from '../../core/services/torneios.service';
import { UserService } from '../../core/services/user.service';
import { ModalService } from '../../core/services/modal.service';

@Component({
  selector: 'app-torneio-detalhe',
  templateUrl: './torneio-detalhe.component.html',
  styleUrls: ['./torneio-detalhe.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule]
})
export class TorneioDetalheComponent implements OnInit {
  torneioId!: number;
  torneio: any; 
  jogadores: any[] = [];
  
  currentUserId: number = 0;
  carregandoInscricao: boolean = false;
  mostrarModalSenha: boolean = false;
  senhaDigitada: string = '';

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
    
    this.userService.getProfile().subscribe({
      next: (user) => this.currentUserId = user.idUser,
      error: () => console.warn('Usuário não logado.')
    });

    this.carregarDadosDoTorneio();
    this.carregarInscritos();
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
        this.cdr.detectChanges(); // Atualiza a tela com a nova lista
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
        
        // Recarrega as vagas E a lista de jogadores logo após se inscrever!
        this.carregarDadosDoTorneio(); 
        this.carregarInscritos(); 
      },
      error: (erro) => {
        this.carregandoInscricao = false;
        const msgErro = erro.error || 'Erro ao realizar inscrição. Tente novamente.';
        this.modalService.abrir('error', msgErro);
      }
    });
  }

  verPerfilJogador(jogador: any) {
    this.router.navigate(['/perfil', jogador.id]);
  }
}