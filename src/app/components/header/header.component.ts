import { Component, OnInit, HostListener, Inject, PLATFORM_ID, NgZone, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';

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

  private isBrowser: boolean;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
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
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.username = user.username;
        this.isVerificado = user.verificado;
        this.userId = user.idUser;
        this.buscarAvatar(user.idUser);
      },
      error: () => console.log('Erro ao carregar perfil no header')
    });
  }

  private buscarAvatar(userId: number): void {
    this.userService.getAvatar(userId).pipe(
      catchError(() => of(new Blob()))
    ).subscribe({
      next: (blob) => {
        if (!blob || blob.size === 0) return;
        const reader = new FileReader();
        reader.onload = () => {
          this.ngZone.run(() => {
            this.avatarPreview = reader.result as string;
            this.cdr.detectChanges();
          });
        };
        reader.readAsDataURL(blob);
      }
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
    return this.avatarPreview || 'assets/avatar.png';
  }
}