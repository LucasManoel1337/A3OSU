import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HeaderComponent } from '../../components/header/header.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

import { CustomInputComponent } from '../../components/custom-input/custom-input.component';
import {
  CustomSelectComponent,
  SelectOption
} from '../../components/custom-select/custom-select.component';

import { UserService } from '../../core/services/user.service';
import { ModalService } from '../../core/services/modal.service';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    SidebarComponent,
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
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    this.buscarPerfil();
  }

  buscarPerfil(): void {

    this.loadingService.show();

    this.userService.getProfile().subscribe({

      next: (user) => {

        this.nickname = user.username;
        this.email = user.email;

        this.nacionalidade = user.nationality || '';
        this.idioma = user.language || '';

        this.loadingService.hide();
      },

      error: () => {

        this.loadingService.hide();

        this.modalService.abrir(
          'error',
          'Erro ao carregar perfil.'
        );
      }
    });
  }

  salvarPerfil(): void {

    if (!this.nacionalidade || !this.idioma) {

      this.modalService.abrir(
        'warning',
        'Preencha os campos.'
      );

      return;
    }

    this.carregandoPerfil = true;

    this.userService.updateProfile({

      nationality: this.nacionalidade,
      language: this.idioma

    }).subscribe({

      next: () => {

        this.carregandoPerfil = false;

        this.modalService.abrir(
          'success',
          'Perfil atualizado.'
        );
      },

      error: () => {

        this.carregandoPerfil = false;

        this.modalService.abrir(
          'error',
          'Erro ao atualizar perfil.'
        );
      }
    });
  }

  alterarSenha(): void {

    if (
      !this.senhaAtual ||
      !this.novaSenha ||
      !this.confirmarNovaSenha
    ) {

      this.modalService.abrir(
        'warning',
        'Preencha todos os campos.'
      );

      return;
    }

    if (this.novaSenha !== this.confirmarNovaSenha) {

      this.modalService.abrir(
        'error',
        'As senhas não coincidem.'
      );

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

        this.modalService.abrir(
          'success',
          'Senha alterada.'
        );
      },

      error: () => {

        this.carregandoSenha = false;

        this.modalService.abrir(
          'error',
          'Erro ao alterar senha.'
        );
      }
    });
  }
}