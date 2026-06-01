import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../core/services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {
  // Injetamos o serviço como 'public' para o HTML conseguir acessá-lo diretamente
  constructor(public modalService: ModalService) {}
}