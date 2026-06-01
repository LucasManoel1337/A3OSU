import { Component, OnInit, HostListener, Inject, PLATFORM_ID, NgZone, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { catchError, of } from 'rxjs';

import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {

  username = 'Jogador';
  menuAberto = false;
  avatarPreview = '';

  private isBrowser: boolean;

  constructor(
    private router: Router,
    private userService: UserService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    const nickSalvo = localStorage.getItem('username');
    if (nickSalvo) this.username = nickSalvo;

    this.buscarPerfil();
  }

  private buscarPerfil(): void {
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.username = user.username;
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
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  get avatarSrc(): string {
    return this.avatarPreview || 'assets/avatar.png';
  }
}