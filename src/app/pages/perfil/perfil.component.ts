import { Component, OnInit, Inject, PLATFORM_ID, NgZone, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { forkJoin, catchError, of } from 'rxjs';
import { UserService } from '../../core/services/user.service';
import { LoadingService } from '../../core/services/loading.service';
import { ActivatedRoute } from '@angular/router';

export interface MedalhaConfig {
  label: string;
  icon: string;
  cssClass: string;
  desc: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {

  username: string | null = 'Jogador';
  dataEntrada: string = '';
  criadoEm: string = '';
  currentUserId: number = 0;

  avatarPreview = '';
  bannerPreview = '';

  nacionalidade: string = 'br';
  isVerified: boolean = false;

  private isBrowser: boolean;

  conquistasDoUsuario: string[] = []; 

  dicionarioMedalhas: Record<string, MedalhaConfig> = {
    'FOUNDER': { 
      label: 'Fundador Beta', 
      icon: '⭐', 
      cssClass: 'founder', 
      desc: 'Fundador do Sistema' 
    },
    'MEMBRO_BETA': { 
      label: 'Membro Beta', 
      icon: '💫', 
      cssClass: 'champion', 
      desc: 'Acessou o Sistema Durante o Beta' 
    }
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private userService: UserService,
    private loadingService: LoadingService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.loadingService.show();

    this.route.paramMap.subscribe(params => {
      const idUrl = params.get('idUsuario'); 

      if (idUrl) {
        this.buscarPerfilPublico(Number(idUrl)); 
      } else {
        this.buscarPerfil();
      }
    });
  }

  buscarPerfil(): void {
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.username = user.username;
        this.currentUserId = user.idUser;
        this.nacionalidade = user.nationality;
        this.isVerified = user.verificado;
        this.conquistasDoUsuario = user.conquistas;
        this.criadoEm = user.criadoEm;
        this.buscarImagens();
      },
      error: () => {
        this.loadingService.hide();
      }
    });
  }

  buscarPerfilPublico(idUsuario: number): void {
    this.userService.getProfileById(idUsuario).subscribe({
      next: (user) => {
        this.username = user.username;
        this.currentUserId = user.idUser; 
        this.nacionalidade = user.nationality || 'un';
        this.isVerified = user.verificado || false;
        this.criadoEm = user.criadoEm;

        if (user.criadoEm) {
          const dataBanco = new Date(user.criadoEm);
          this.dataEntrada = `${dataBanco.toLocaleString('pt-BR', { month: 'long' })} de ${dataBanco.getFullYear()}`;
        }

        this.conquistasDoUsuario = user.conquistas;

        this.buscarImagens(); 
      },
      error: () => {
        console.error('Perfil não encontrado');
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

  get vitrineDeMedalhas(): MedalhaConfig[] {
    const ativas = this.conquistasDoUsuario
      .map(codigo => this.dicionarioMedalhas[codigo])
      .filter(medalha => medalha !== undefined);
 
    const vitrine = [...ativas];
    const maxSlots = 4;
    
    while (vitrine.length < maxSlots) {
      vitrine.push({ 
        label: 'Bloqueado', 
        icon: '🔒', 
        cssClass: 'empty', 
        desc: 'Jogue torneios para desbloquear mais conquistas.' 
      });
    }

    return vitrine;
  }
}