import { Component, OnInit, Inject, PLATFORM_ID, NgZone, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { forkJoin, catchError, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserService } from '../../core/services/user.service';
import { UserPunishment, UserPunishmentType } from '../../core/models/user-punishment.model';
import { LoadingService } from '../../core/services/loading.service';
import { ActivatedRoute, RouterLink } from '@angular/router';

export interface MedalhaConfig {
  label: string;
  icon: string;
  cssClass: string;
  desc: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {

  username: string | null = 'Jogador';
  tituloSelecionado: string | null = null;
  dataEntrada: string = '';
  criadoEm: string = '';
  currentUserId: number = 0;
  isOwnProfile = true;

  avatarPreview = '';
  bannerPreview = '';
  avatarLoading = true;
  bannerLoading = true;

  nacionalidade: string = 'br';
  isVerified: boolean = false;

  private isBrowser: boolean;

  conquistasDoUsuario: string[] = []; 
  punicoes: UserPunishment[] = [];

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
    },
    'PRIMEIRA_BATALHA': { 
      label: 'Primeira Batalha', 
      icon: '⚔️', 
      cssClass: 'primeira-batalha', 
      desc: 'Entrou em um torneio pela 1º vez' 
    },
    'ORGANIZADOR': { 
      label: 'Organizador de Copa', 
      icon: '🏆', 
      cssClass: 'organizador', 
      desc: 'Criou seu primeiro torneio' 
    }
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private userService: UserService,
    private loadingService: LoadingService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private destroyRef: DestroyRef
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.avatarPreview = '';
      this.bannerPreview = '';
      this.avatarLoading = true;
      this.bannerLoading = true;
      this.punicoes = [];
      this.loadingService.show();

      const idUrl = params.get('idUsuario'); 
      this.isOwnProfile = !idUrl;

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
        this.conquistasDoUsuario = user.conquistas ?? [];
        this.punicoes = user.punicoes ?? [];
        this.tituloSelecionado = user.tituloSelecionado ?? null;
        this.criadoEm = user.criadoEm;
        this.buscarImagens();
      },
      error: () => {
        this.avatarLoading = false;
        this.bannerLoading = false;
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
        this.tituloSelecionado = user.tituloSelecionado ?? null;
        this.criadoEm = user.criadoEm;

        if (user.criadoEm) {
          const dataBanco = new Date(user.criadoEm);
          this.dataEntrada = `${dataBanco.toLocaleString('pt-BR', { month: 'long' })} de ${dataBanco.getFullYear()}`;
        }

        this.conquistasDoUsuario = user.conquistas ?? [];
        this.punicoes = user.punicoes ?? [];

        this.buscarImagens(); 
      },
      error: () => {
        console.error('Perfil não encontrado');
        this.avatarLoading = false;
        this.bannerLoading = false;
        this.loadingService.hide();
      }
    });
  }

  private blobParaBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.isBrowser) { resolve(''); return; }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error ?? new Error('Não foi possível ler a imagem do perfil.'));
      reader.readAsDataURL(blob);
    });
  }

  buscarImagens(): void {
    if (!this.isBrowser) {
      this.avatarLoading = false;
      this.bannerLoading = false;
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
      next: ([avatarBlob, bannerBlob]) => {
        Promise.all([
          avatarBlob?.size > 0 ? this.blobParaBase64(avatarBlob) : Promise.resolve(''),
          bannerBlob?.size > 0 ? this.blobParaBase64(bannerBlob) : Promise.resolve('')
        ]).then(([avatar, banner]) => {
          this.avatarPreview = avatar;
          this.bannerPreview = banner;
        }).catch(error => {
          console.error('Erro ao converter as imagens do perfil.', error);
        }).finally(() => this.finalizarCarregamentoImagens());
      },
      error: () => {
        console.log('Erro ao buscar imagens do perfil');
        this.finalizarCarregamentoImagens();
      },
    });
  }

  private finalizarCarregamentoImagens(): void {
    this.ngZone.run(() => {
      this.avatarLoading = false;
      this.bannerLoading = false;
      this.loadingService.hide();
      this.cdr.detectChanges();
    });
  }

  get vitrineDeMedalhas(): MedalhaConfig[] {
    const medalhasVisiveis = this.medalhasVisiveis;
    const codigosConhecidos = [...new Set(this.conquistasDoUsuario)];
    const ativas = codigosConhecidos
      .map(codigo => medalhasVisiveis[codigo])
      .filter(medalha => medalha !== undefined);
 
    const vitrine = [...ativas];
    const maxSlots = Object.keys(medalhasVisiveis).length;
    
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

  get totalConquistasDesbloqueadas(): number {
    return new Set(this.conquistasDoUsuario.filter(codigo => this.medalhasVisiveis[codigo])).size;
  }

  get progressoConquistas(): number {
    const totalConquistas = Object.keys(this.medalhasVisiveis).length;
    return totalConquistas === 0 ? 0 : (this.totalConquistasDesbloqueadas / totalConquistas) * 100;
  }

  nomePunicao(type: UserPunishmentType): string {
    switch (type) {
      case 'BANIMENTO_PERMANENTE': return 'Banimento permanente';
      case 'BANIMENTO_TEMPORARIO': return 'Banimento temporário';
      case 'SUSPENSAO_RANQUEADO': return 'Suspensão de torneios ranked';
      case 'SUSPENSAO_CASUAL': return 'Suspensão de torneios casuais';
    }
  }

  private get medalhasVisiveis(): Record<string, MedalhaConfig> {
    if (this.conquistasDoUsuario.includes('FOUNDER')) {
      return this.dicionarioMedalhas;
    }

    const { FOUNDER: _conquistaSecreta, ...medalhasPublicas } = this.dicionarioMedalhas;
    return medalhasPublicas;
  }
}