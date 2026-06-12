import { Component, OnInit, Inject, PLATFORM_ID, NgZone, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { forkJoin, catchError, of } from 'rxjs';
import { UserService } from '../../core/services/user.service';
import { LoadingService } from '../../core/services/loading.service';
import { ActivatedRoute } from '@angular/router';

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
  currentUserId: number = 0;

  avatarPreview = '';
  bannerPreview = '';

  private isBrowser: boolean;

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

    // 3. Fica escutando as mudanças na URL
    this.route.paramMap.subscribe(params => {
      const urlUsername = params.get('username');

      if (urlUsername) {
        // Se tem nome na URL, estamos visitando o perfil de alguém!
        this.username = urlUsername;
        
        // AQUI: Você chamaria algo como this.userService.getProfileByUsername(urlUsername)
        this.buscarPerfilPublico(urlUsername); 
      } else {
        // Se NÃO tem nome na URL (acessou direto /perfil), é o próprio usuário logado
        this.buscarPerfil();
      }
    });
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

  buscarPerfilPublico(nick: string) {
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