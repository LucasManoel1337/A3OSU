import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RankingTableComponent } from '../../components/ranking-table/ranking-table.component';
import { TorneioDetalhesDTO, TorneioService } from '../../core/services/torneios.service';

@Component({
  selector: 'app-torneio-detalhe',
  templateUrl: './torneio-detalhe.component.html',
  styleUrls: ['./torneio-detalhe.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RankingTableComponent, RouterModule]
})
export class TorneioDetalheComponent implements OnInit {
  torneioId!: number;
  torneio: any; 
  jogadores: any[] = []; 

  // Configuração das colunas solicitadas para bater com o componente genérico
  colunasTabela = [
    { key: 'posicao', label: 'Posição' },
    { key: 'username', label: 'Jogador' },
    { key: 'nacionalidade', label: 'País', hasFlag: true },
    { key: 'pontuacao', label: 'Pontuação' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private torneioService: TorneioService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.torneioId = Number(this.route.snapshot.paramMap.get('id'));
    this.carregarDadosDoTorneio();
    this.carregarJogadoresMocados();
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
        alert('Não foi possível carregar os detalhes deste torneio.');
        this.voltar();
      }
    });
  }

  carregarJogadoresMocados() {
    // Dados mocados atualizados com indexação de ranking e pontuações
    this.jogadores = [
      { posicao: '#1', username: 'peppy', nacionalidade: 'au', pontuacao: '1.430.200' },
      { posicao: '#2', username: 'Mrekk', nacionalidade: 'au', pontuacao: '1.398.500' },
      { posicao: '#3', username: 'WhiteCat', nacionalidade: 'de', pontuacao: '1.210.000' },
      { posicao: '#4', username: 'Lkz', nacionalidade: 'br', pontuacao: '950.400' }
    ];
  }

  voltar() {
    this.router.navigate(['/torneios']); 
  }
  
  inscreverNoTorneio() {
    console.log('Inscrição simulada!');
  }

  verPerfilJogador(jogador: any) {
    console.log('Abrindo perfil do jogador:', jogador.username);
  }
}