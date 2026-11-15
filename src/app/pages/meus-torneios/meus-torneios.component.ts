import { Component, NgModule, OnInit } from '@angular/core';
import { TorneioResponse, TorneioService } from '../../core/services/torneios.service';
import { LoadingService } from '../../core/services/loading.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { ModalService } from '../../core/services/modal.service';
import { TorneioCardComponent } from '../../components/torneio-card/torneio-card.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-meus-torneios',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TorneioCardComponent],
  templateUrl: './meus-torneios.component.html',
  styleUrls: ['./meus-torneios.component.css']
})
export class MeusTorneiosComponent implements OnInit {

  torneios: TorneioResponse[] = [];
  torneiosParticipando: TorneioResponse[] = [];
  torneiosCriados: TorneioResponse[] = [];
  torneiosModerando: TorneioResponse[] = [];
  termoBusca: string = '';
  carregando = false;
  erroCarregamento = '';

  currentUserId: number = 0;

  constructor(
    private torneioService: TorneioService,
    private loadingService: LoadingService,
    private router: Router,
    private userService: UserService,
    private modalService: ModalService,
  ) {}

  ngOnInit(): void {
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.currentUserId = user.idUser;
        this.carregarTodosOsTorneios();
      },
      error: () => {
        this.erroCarregamento = 'Não foi possível carregar sua conta. Atualize a página e tente novamente.';
      }
    });
  }

  carregarTodosOsTorneios(): void {
    this.carregando = true;
    this.erroCarregamento = '';
    this.loadingService.show();

    forkJoin({
      participando: this.torneioService.listarParticipando(this.currentUserId),
      criados: this.torneioService.listarCriados(this.currentUserId),
      moderando: this.torneioService.listarModerando(this.currentUserId)
    }).subscribe({
      next: (results) => {
        
        const formatarImagens = (lista: TorneioResponse[]) => lista.map(t => ({
          ...t,
          banner: t.banner ? `data:image/jpeg;base64,${t.banner}` : 'https://images4.alphacoders.com/991/thumb-1920-991403.png',
          logo: t.logo ? `data:image/jpeg;base64,${t.logo}` : undefined,
          organizadorAvatar: t.organizadorAvatar ? `data:image/jpeg;base64,${t.organizadorAvatar}` : undefined
        }));

        this.torneiosParticipando = formatarImagens(results.participando);
        this.torneiosCriados = formatarImagens(results.criados);
        this.torneiosModerando = formatarImagens(results.moderando);
        this.carregando = false;
        this.loadingService.hide();
      },
      error: () => {
        this.carregando = false;
        this.erroCarregamento = 'Não foi possível carregar seus torneios. Tente novamente.';
        this.loadingService.hide();
      }
    });
  }

  filtrarTorneios(lista: TorneioResponse[]): TorneioResponse[] {
    const termo = this.termoBusca.trim().toLocaleLowerCase();
    return termo ? lista.filter(torneio => torneio.nome.toLocaleLowerCase().includes(termo)) : lista;
  }

  abrirDetalhes(id: number) {
    this.router.navigate(['/torneios', id]);
  }
}