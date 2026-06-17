import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { CustomInputComponent } from '../../components/custom-input/custom-input.component';
import { CustomSelectComponent, SelectOption } from '../../components/custom-select/custom-select.component';
import { CustomCheckboxComponent } from '../../components/custom-checkbox/custom-checkbox.component';

import { ModalService } from '../../core/services/modal.service';
import { LoadingService } from '../../core/services/loading.service';
import { TorneioService } from '../../core/services/torneios.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-criar-torneios',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomInputComponent,
    CustomSelectComponent,
    CustomCheckboxComponent
  ],
  templateUrl: './criar-torneios.component.html',
  styleUrls: ['./criar-torneios.component.css']
})
export class CriarTorneiosComponent implements OnInit {
  torneioForm: FormGroup;
  bannerSelecionado: string | null = null;
  logoSelecionada: string | null = null;
  carregando = false;

  currentUserId: number = 0;

  tiposTorneioOptions: SelectOption[] = [
    { value: 'casual', label: 'Casual' },
    { value: 'ranked', label: 'Ranked' }
  ];

  modosOsuOptions: SelectOption[] = [
    { value: 'osu', label: 'osu' },
    { value: 'taiko', label: 'taiko' },
    { value: 'catch', label: 'catch' },
    { value: 'mania', label: 'mania' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private modalService: ModalService,
    private loadingService: LoadingService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private torneioService: TorneioService,
    private userService: UserService
  ) {
    this.torneioForm = this.fb.group({
      banner: [null],
      logo: [null],
      nome: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(80)]],
      tipo: ['', Validators.required],
      modo: ['', Validators.required],
      vagas: [null, [Validators.required, Validators.min(10), Validators.max(200)]],
      descricao: ['', [Validators.required, Validators.maxLength(1000)]],
      isPrivado: [false],
      senha: [''],
      dataInicio: ['', Validators.required],
      horaInicio: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.currentUserId = user.idUser; // Salva o ID!
      },
      error: () => {
        this.modalService.abrir('error', 'Sessão expirada. Faça login novamente.');
        this.router.navigate(['/login']);
      }
    });

    this.torneioForm.get('isPrivado')?.valueChanges.subscribe(privado => {
      const senhaControl = this.torneioForm.get('senha');
      if (privado) {
        senhaControl?.setValidators([Validators.required, Validators.minLength(6)]);
      } else {
        senhaControl?.clearValidators();
        senhaControl?.setValue('');
      }
      senhaControl?.updateValueAndValidity();
    });
  }

  atualizarCampo(campo: string, valor: any) {
    if (campo === 'vagas') {
      let val = parseInt(valor, 10);
      if (val > 200) val = 200;
      if (val < 10) val = 10;
      this.torneioForm.get(campo)?.setValue(val);
    } else {
      this.torneioForm.get(campo)?.setValue(valor);
    }
    this.torneioForm.get(campo)?.markAsTouched();
  }

  onFileSelected(event: any, tipo: 'banner' | 'logo'): void {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.modalService.abrir('error', 'O arquivo deve ter no máximo 5MB.');
      return;
    }

    this.torneioForm.patchValue({ [tipo]: file });

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.ngZone.run(() => {
        if (tipo === 'banner') this.bannerSelecionado = e.target.result;
        else this.logoSelecionada = e.target.result;
        this.cdr.detectChanges();
      });
    };
    reader.readAsDataURL(file);
  }

  cancelar(): void {
    this.router.navigate(['/home']);
  }

  criarTorneio(): void {
    if (this.torneioForm.invalid) {
      this.torneioForm.markAllAsTouched();
      this.modalService.abrir('warning', 'Preencha todos os campos obrigatórios corretamente.');
      return;
    }

    if (this.currentUserId === 0) {
      this.modalService.abrir('error', 'Erro ao identificar usuário logado.');
      return;
    }

    this.carregando = true;
    this.loadingService.show();

    this.torneioService.criarTorneio(this.torneioForm.value, this.currentUserId).subscribe({
      next: (resposta) => {
        console.log('Torneio criado no banco com sucesso!', resposta);
        this.carregando = false;
        this.loadingService.hide();
        this.modalService.abrir('success', 'Torneio criado com sucesso!');

        this.router.navigate(['/torneios']);
      },
      error: (erro) => {
        console.error('Erro ao criar torneio no Spring Boot', erro);
        this.carregando = false;
        this.loadingService.hide();
        this.modalService.abrir('error', 'Ocorreu um erro ao criar o torneio. Tente novamente.');
      }
    });
  }
}