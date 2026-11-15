import { Component, OnInit, HostListener, Inject, PLATFORM_ID, NgZone, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { catchError, finalize, from, of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {

  username = 'Jogador';
  userId!: number;
  isVerificado = false;
  menuAberto = false;
  avatarPreview = '';
  avatarLoading = true;

  private isBrowser: boolean;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private loadingService: LoadingService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private destroyRef: DestroyRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.userService.avatarUpdated$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(avatar => {
        this.ngZone.run(() => {
          this.avatarPreview = avatar;
          this.cdr.detectChanges();
        });
      });

    const nickSalvo = localStorage.getItem('username');
    if (nickSalvo) this.username = nickSalvo;

    this.buscarPerfil();
  }

  private buscarPerfil(): void {
    this.loadingService.show();
    this.userService.getProfile().pipe(
      switchMap(user => {
        this.username = user.username;
        this.isVerificado = user.verificado;
        this.userId = user.idUser;
        return this.userService.getAvatar(user.idUser).pipe(
          catchError(() => of(new Blob()))
        );
      }),
      switchMap(blob => blob.size > 0 ? from(this.blobParaBase64(blob)) : of('')),
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this.avatarLoading = false;
        this.loadingService.hide();
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: avatar => {
        this.avatarPreview = avatar;
        this.cdr.markForCheck();
      },
      error: error => console.error('Erro ao carregar perfil no header.', error)
    });
  }

  private blobParaBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => reject(reader.error ?? new Error('Não foi possível ler o avatar.'));
      reader.readAsDataURL(blob);
    });
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.menuAberto = !this.menuAberto;
  }

  @HostListener('document:click')
  fecharMenu(): void {
    this.menuAberto = false;
  }

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get avatarSrc(): string {
    return this.avatarPreview || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHfd3PPulVSp4ZbuBFNkePoUR_fLJQe474Ag&s';
  }
}