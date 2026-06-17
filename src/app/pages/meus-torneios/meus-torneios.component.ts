import { Component, OnInit } from '@angular/core';
import { TorneioResponse, TorneioService } from '../../core/services/torneios.service';
import { LoadingService } from '../../core/services/loading.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { ModalService } from '../../core/services/modal.service';
import { TorneioCardComponent } from '../../components/torneio-card/torneio-card.component';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
      }
    });
  }

  carregarTodosOsTorneios(): void {
    this.loadingService.show();

    forkJoin({
      participando: this.torneioService.listarParticipando(this.currentUserId).pipe(
        catchError(err => {
          console.warn('API Participando falhou, a retornar vazio', err);
          return of([]); 
        })
      ),
      criados: this.torneioService.listarCriados(this.currentUserId).pipe(
        catchError(err => {
          console.warn('API Criados falhou (provavelmente 404), a retornar vazio');
          return of([]); 
        })
      ),
      moderando: this.torneioService.listarModerando(this.currentUserId).pipe(
        catchError(err => {
          console.warn('API Moderando falhou (provavelmente 404), a retornar vazio');
          return of([]); 
        })
      )
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
        
        this.loadingService.hide();
      },
      error: (err) => {
        console.error('Erro fatal no forkJoin:', err);
        this.loadingService.hide();
      }
    });
  }

  abrirDetalhes(id: number) {
    this.router.navigate(['/torneios', id]);
  }
}