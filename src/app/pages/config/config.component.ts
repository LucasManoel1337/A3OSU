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
  isVerified: boolean = false;
  titulosDisponiveis: string[] = [];
  tituloSelecionado: string | null = null;
  salvandoTitulo = false;
  avatarPreview = '';
  bannerPreview = '';
  avatarLoading = true;
  bannerLoading = true;
  readonly avatarPadrao = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHfd3PPulVSp4ZbuBFNkePoUR_fLJQe474Ag&s';
  readonly bannerPadrao = 'https://images4.alphacoders.com/991/thumb-1920-991403.png';

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
        this.isVerified = user.verificado;
        this.titulosDisponiveis = user.titulosDisponiveis ?? [];
        this.tituloSelecionado = user.tituloSelecionado ?? null;
        this.buscarImagens();
      },
      error: () => {
        this.avatarLoading = false;
        this.bannerLoading = false;
        this.loadingService.hide();
        this.modalService.abrir('error', 'Erro ao carregar perfil.');
      }
    });
  }

  private blobParaBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.isBrowser) {
        resolve('');
        return;
      }
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
          avatarBlob.size > 0 ? this.blobParaBase64(avatarBlob) : Promise.resolve(''),
          bannerBlob.size > 0 ? this.blobParaBase64(bannerBlob) : Promise.resolve('')
        ]).then(([avatar, banner]) => {
          this.ngZone.run(() => {
            this.avatarPreview = avatar;
            this.bannerPreview = banner;
            this.avatarLoading = false;
            this.bannerLoading = false;
            this.cdr.detectChanges();
          });
        }).catch(error => {
          console.error('Erro ao converter as imagens de perfil.', error);
          this.ngZone.run(() => {
            this.avatarLoading = false;
            this.bannerLoading = false;
            this.cdr.detectChanges();
          });
        }).finally(() => this.loadingService.hide());
      },
      error: () => {
        this.avatarLoading = false;
        this.bannerLoading = false;
        this.loadingService.hide();
      }
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

  salvarTitulo(): void {
    this.salvandoTitulo = true;
    this.userService.selecionarTitulo(this.tituloSelecionado).subscribe({
      next: () => {
        this.salvandoTitulo = false;
        this.modalService.abrir('success', 'Título do perfil atualizado.');
      },
      error: () => {
        this.salvandoTitulo = false;
        this.modalService.abrir('error', 'Não foi possível atualizar o título do perfil.');
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
      const preview = e.target?.result;
      if (typeof preview !== 'string') {
        this.ngZone.run(() => this.modalService.abrir('error', 'Não foi possível ler o arquivo selecionado.'));
        return;
      }

      this.ngZone.run(() => {
        if (type === 'avatar') {
          this.avatarPreview = preview;
          this.avatarLoading = false;
        } else {
          this.bannerPreview = preview;
          this.bannerLoading = false;
        }
        this.cdr.detectChanges();
      });

      this.userService.uploadAsset(file, type).subscribe({
        next: () => {
          if (type === 'avatar') this.userService.notifyAvatarUpdated(preview);
          this.modalService.abrir('success', 'Imagem alterada com sucesso!');
        },
        error: (err) => {
          this.modalService.abrir('error', 'Erro ao enviar a imagem.');
          console.error(err);
        }
      });
    };
    reader.onerror = () => {
      this.ngZone.run(() => this.modalService.abrir('error', 'Não foi possível ler o arquivo selecionado.'));
    };
    reader.readAsDataURL(file);
  }

  getSafeUrl(url: string): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle(`url('${url}')`);
  }
}