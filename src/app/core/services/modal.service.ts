import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// Tipos permitidos para o nosso modal
export type ModalType = 'success' | 'warning' | 'error';

export interface ModalState {
  isOpen: boolean;
  message: string;
  type: ModalType;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  // Estado inicial: Fechado e sem mensagem
  private modalState = new BehaviorSubject<ModalState>({
    isOpen: false,
    message: '',
    type: 'success'
  });

  // Transformamos em um Observable para o HTML poder "escutar" as mudanças em tempo real
  modalState$ = this.modalState.asObservable();

  // Método para abrir o modal de qualquer componente
  abrir(type: ModalType, message: string) {
    this.modalState.next({ isOpen: true, message, type });
  }

  // Método para fechar
  fechar() {
    this.modalState.next({ ...this.modalState.value, isOpen: false });
  }
}