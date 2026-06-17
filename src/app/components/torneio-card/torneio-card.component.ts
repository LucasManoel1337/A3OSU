import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-torneio-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './torneio-card.component.html',
  styleUrls: ['./torneio-card.component.css']
})
export class TorneioCardComponent {
  
  @Input() torneio: any;
  
  @Input() modoAdmin: boolean = false; 

  constructor(private router: Router) {}

  abrirDetalhes() {
    if (this.modoAdmin) {
      this.router.navigate(['/torneios/gerenciar', this.torneio.id]);
    } else {
      // Se for apenas participante, vai para a visão pública
      this.router.navigate(['/torneios', this.torneio.id]);
    }
  }
}