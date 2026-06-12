import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RankingTableComponent } from '../../components/ranking-table/ranking-table.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RankingTableComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  
  avisos = [
    { tipo: 'update', icon: '🚀', data: '15 Jun, 2026', titulo: 'Bem-vindo ao Beta!', texto: 'O sistema de torneios já está no ar.' },
    { tipo: 'alert', icon: '⚠️', data: '14 Jun, 2026', titulo: 'Manutenção', texto: 'Instabilidade prevista na madrugada.' }
  ];

  // 1. AVISANDO A TABELA ONDE FICA A BANDEIRA (hasFlag: true)
  colunasPaises = [
    { key: 'pos', label: '#' },
    { key: 'pais', label: 'Nação', hasFlag: true },
    { key: 'pontos', label: 'Performance (PP)' }
  ];

  colunasJogadores = [
    { key: 'pos', label: '#' },
    { key: 'jogador', label: 'Jogador', hasFlag: true },
    { key: 'pontos', label: 'Score Geral' }
  ];

  // 2. VARIÁVEIS DAS TABELAS
  rankNacionalidade: any[] = [];
  rankOsu: any[] = [];
  rankTaiko: any[] = [];
  rankCatch: any[] = [];
  rankMania: any[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.gerarDadosFalsos();
  }

  // ==========================================
  // GERADOR DE DADOS FALSOS (MOCK)
  // ==========================================
  gerarDadosFalsos() {
    // Top Países Fixos
    this.rankNacionalidade = [
      { pos: 1, pais: 'Brasil', sigla: 'br', pontos: '4,520,100' },
      { pos: 2, pais: 'Estados Unidos', sigla: 'us', pontos: '4,100,050' },
      { pos: 3, pais: 'Japão', sigla: 'jp', pontos: '3,890,200' },
      { pos: 4, pais: 'Coreia do Sul', sigla: 'kr', pontos: '3,500,000' },
      { pos: 5, pais: 'Alemanha', sigla: 'de', pontos: '2,900,120' },
      { pos: 6, pais: 'França', sigla: 'fr', pontos: '2,750,000' },
      { pos: 7, pais: 'Reino Unido', sigla: 'gb', pontos: '2,400,000' },
      { pos: 8, pais: 'Canadá', sigla: 'ca', pontos: '2,100,500' },
      { pos: 9, pais: 'Austrália', sigla: 'au', pontos: '1,950,000' },
      { pos: 10, pais: 'Rússia', sigla: 'ru', pontos: '1,800,000' }
    ];

    // Listas base para sortear nomes e bandeiras
    const prefixos = ['Dark', 'Ninja', 'Pro', 'Sky', 'Toxic', 'Lethal', 'Snow', 'Kira', 'Zero', 'Faker', 'Mrekk', 'White'];
    const sufixos = ['_Sniper', 'Cat', 'God', 'San', 'Zz', 'Osu', 'BR', 'Master', 'X', '1337', 'Tuna'];
    const siglas = ['br', 'us', 'jp', 'kr', 'de', 'ru', 'fr', 'gb', 'ca', 'au', 'cl', 'mx'];

    // O "seu" usuário garantido no Top 1 do Standard pra dar moral
    const meusJogadoresStandard = [{ pos: 1, jogador: 'lkz', sigla: 'br', pontos: '150.000' }];
    
    // Função que gera uma tabela com X jogadores
    const gerarListaJogadores = (quantidade: number, offsetPontos: number, baseJogadores: any[] = []) => {
      let lista = [...baseJogadores];
      let pontosAtual = offsetPontos;

      for (let i = lista.length + 1; i <= quantidade; i++) {
        const p = prefixos[Math.floor(Math.random() * prefixos.length)];
        const s = sufixos[Math.floor(Math.random() * sufixos.length)];
        const siglaSorteada = siglas[Math.floor(Math.random() * siglas.length)];
        
        // Diminui os pontos para fazer uma escadinha realista
        pontosAtual -= Math.floor(Math.random() * 500) + 100;

        lista.push({
          pos: i,
          jogador: `${p}${s}`,
          sigla: siglaSorteada,
          pontos: pontosAtual.toLocaleString('pt-BR')
        });
      }
      return lista;
    };

    // Populando as tabelas (Gerando 100 jogadores pra cada modo)
    this.rankOsu = gerarListaJogadores(100, 149500, meusJogadoresStandard);
    this.rankTaiko = gerarListaJogadores(100, 95000);
    this.rankCatch = gerarListaJogadores(100, 110000);
    this.rankMania = gerarListaJogadores(100, 130000);
  }

  irParaPerfil(row: any) {
    if (row.jogador) {
      //this.router.navigate(['/perfil', row.jogador]);
      this.router.navigate(['/pegadinha']);
    }
  }
}