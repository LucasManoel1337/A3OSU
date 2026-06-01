import { Component, OnInit, Inject, PLATFORM_ID, NgZone, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { forkJoin, catchError, of } from 'rxjs';

import { HeaderComponent } from '../../components/header/header.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { UserService } from '../../core/services/user.service';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [HeaderComponent, SidebarComponent, CommonModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {

  username: string | null = 'Jogador';
  dataEntrada: string = '';
  currentUserId: number = 0;

  avatarPreview = '';
  bannerPreview = '';

  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private userService: UserService,
    private loadingService: LoadingService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.loadingService.show();

    if (this.isBrowser) {
      const nickSalvo = localStorage.getItem('username');
      if (nickSalvo) this.username = nickSalvo;
    }

    const hoje = new Date();
    this.dataEntrada = `${hoje.toLocaleString('pt-BR', { month: 'long' })} de ${hoje.getFullYear()}`;

    this.buscarPerfil();
  }

  buscarPerfil(): void {
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.username = user.username;
        this.currentUserId = user.idUser;
        this.buscarImagens();
      },
      error: () => {
        this.loadingService.hide();
      }
    });
  }

  private blobParaBase64(blob: Blob): Promise<string> {
    return new Promise((resolve) => {
      if (!this.isBrowser) { resolve(''); return; }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }

  buscarImagens(): void {
    if (!this.isBrowser) {
      this.loadingService.hide();
      return;
    }

    const avatar$ = this.userService.getAvatar(this.currentUserId).pipe(
      catchError(() => of(new Blob()))
    );
    const banner$ = this.userService.getBanner(this.currentUserId).pipe(
      catchError(() => of(new Blob()))
    );

    forkJoin([avatar$, banner$]).subscribe({
      next: async ([avatarBlob, bannerBlob]) => {
        if (avatarBlob?.size > 0) {
          this.avatarPreview = await this.blobParaBase64(avatarBlob);
        }
        if (bannerBlob?.size > 0) {
          this.bannerPreview = await this.blobParaBase64(bannerBlob);
        }
        this.ngZone.run(() => this.cdr.detectChanges());
      },
      error: () => {
        console.log('Erro ao buscar imagens do perfil');
        this.loadingService.hide();
      },
      complete: () => this.loadingService.hide()
    });
  }
}