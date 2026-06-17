import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LoadingService } from '../../core/services/loading.service';
import { FormsModule } from '@angular/forms';
import { TorneioResponse, TorneioService } from '../../core/services/torneios.service';

@Component({
  selector: 'app-torneios',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './torneios.component.html',
  styleUrls: ['./torneios.component.css']
})
export class TorneiosComponent implements OnInit {

  torneios: TorneioResponse[] = [];
  torneiosFiltrados: TorneioResponse[] = [];
  termoBusca: string = '';

  constructor(
    private torneioService: TorneioService,
    private loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarTorneios();
  }

  carregarTorneios(): void {
    this.loadingService.show();
    this.torneioService.listarTorneios().subscribe({
      next: (dados) => {
        // Pré-processa as imagens para garantir o formato correto no HTML
        this.torneios = dados.map(t => ({
          ...t,
          banner: t.banner ? `data:image/jpeg;base64,${t.banner}` : 'https://images4.alphacoders.com/991/thumb-1920-991403.png',
          logo: t.logo ? `data:image/jpeg;base64,${t.logo}` : undefined
        }));
        this.torneiosFiltrados = [...this.torneios];
        this.loadingService.hide();
      },
      error: (err) => {
        console.error('Erro ao buscar torneios', err);
        this.loadingService.hide();
      }
    });
  }

  filtrarTorneios(): void {
    const termo = this.termoBusca.toLowerCase();
    this.torneiosFiltrados = this.torneios.filter(t => 
      t.nome.toLowerCase().includes(termo) || 
      t.modo.toLowerCase().includes(termo)
    );
  }

  abrirDetalhes(id: number) {
    this.router.navigate(['/torneios', id]);
  }
}