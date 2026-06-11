import { ChangeDetectorRef, Component, NgZone, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';
import { CustomInputComponent } from '../../components/custom-input/custom-input.component';
import {
  CustomSelectComponent,
  SelectOption
} from '../../components/custom-select/custom-select.component';

import { UserService } from '../../core/services/user.service';
import { ModalService } from '../../core/services/modal.service';
import { LoadingService } from '../../core/services/loading.service';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CustomInputComponent,
    CustomSelectComponent
  ],
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css']
})
export class ConfigComponent implements OnInit {

  nickname = '';
  email = '';
  nacionalidade = '';
  idioma = '';

  senhaAtual = '';
  novaSenha = '';
  confirmarNovaSenha = '';

  carregandoPerfil = false;
  carregandoSenha = false;

  currentUserId: number = 0;
  avatarPreview = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHfd3PPulVSp4ZbuBFNkePoUR_fLJQe474Ag&s';
  bannerPreview = 'https://images4.alphacoders.com/991/thumb-1920-991403.png';

  private isBrowser: boolean;

  listaNacionalidades: SelectOption[] = [
    { value: 'br', label: 'Brasileiro' },
    { value: 'us', label: 'Americano' },
    { value: 'jp', label: 'Japonês' }
  ];

  listaIdiomas: SelectOption[] = [
    { value: 'pt-BR', label: 'Português' },
    { value: 'en-US', label: 'English' }
  ];

  constructor(
    private userService: UserService,
    private modalService: ModalService,
    private loadingService: LoadingService,
    private sanitizer: DomSanitizer,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.loadingService.show();
    this.buscarPerfil();
  }

  buscarPerfil(): void {
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.nickname = user.username;
        this.email = user.email;
        this.nacionalidade = user.nationality || '';
        this.idioma = user.language || '';
        this.currentUserId = user.idUser;
        this.buscarImagens();
      },
      error: () => {
        this.loadingService.hide();
        this.modalService.abrir('error', 'Erro ao carregar perfil.');
      }
    });
  }

  private blobParaBase64(blob: Blob): Promise<string> {
    return new Promise((resolve) => {
      if (!this.isBrowser) {
        resolve('');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }

  buscarImagens(): void {
    const avatar$ = this.userService.getAvatar(this.currentUserId).pipe(
      catchError(() => of(new Blob())) // se falhar, retorna blob vazio
    );
    const banner$ = this.userService.getBanner(this.currentUserId).pipe(
      catchError(() => of(new Blob())) // se falhar, retorna blob vazio
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
        console.log('Erro inesperado ao buscar imagens');
        this.loadingService.hide();
      },
      complete: () => this.loadingService.hide()
    });
  }

  salvarPerfil(): void {
    if (!this.nacionalidade || !this.idioma) {
      this.modalService.abrir('warning', 'Preencha os campos.');
      return;
    }

    this.carregandoPerfil = true;
    this.userService.updateProfile({
      nationality: this.nacionalidade,
      language: this.idioma
    }).subscribe({
      next: () => {
        this.carregandoPerfil = false;
        this.modalService.abrir('success', 'Perfil atualizado.');
      },
      error: () => {
        this.carregandoPerfil = false;
        this.modalService.abrir('error', 'Erro ao atualizar perfil.');
      }
    });
  }

  alterarSenha(): void {
    if (!this.senhaAtual || !this.novaSenha || !this.confirmarNovaSenha) {
      this.modalService.abrir('warning', 'Preencha todos os campos.');
      return;
    }

    if (this.novaSenha !== this.confirmarNovaSenha) {
      this.modalService.abrir('error', 'As senhas não coincidem.');
      return;
    }

    this.carregandoSenha = true;
    this.userService.changePassword({
      currentPassword: this.senhaAtual,
      newPassword: this.novaSenha,
      confirmNewPassword: this.confirmarNovaSenha
    }).subscribe({
      next: () => {
        this.carregandoSenha = false;
        this.senhaAtual = '';
        this.novaSenha = '';
        this.confirmarNovaSenha = '';
        this.modalService.abrir('success', 'Senha alterada.');
      },
      error: () => {
        this.carregandoSenha = false;
        this.modalService.abrir('error', 'Erro ao alterar senha.');
      }
    });
  }

  onFileSelected(event: any, type: 'avatar' | 'banner'): void {
    if (!this.isBrowser) return;

    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.modalService.abrir('error', 'O arquivo deve ter no máximo 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.ngZone.run(() => {
        if (type === 'avatar') this.avatarPreview = e.target.result;
        else this.bannerPreview = e.target.result;
        this.cdr.detectChanges();
      });
    };
    reader.readAsDataURL(file);

    this.userService.uploadAsset(file, type).subscribe({
      next: () => this.modalService.abrir('success', 'Imagem alterada com sucesso!'),
      error: (err) => {
        this.modalService.abrir('error', 'Erro ao enviar a imagem.');
        console.error(err);
      }
    });
  }

  getSafeUrl(url: string): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle(`url('${url}')`);
  }
}