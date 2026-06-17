
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
  // Recebe o torneio do componente pai
  @Input() torneio: any;

  constructor(private router: Router) {}

  abrirDetalhes() {
    this.router.navigate(['/torneios', this.torneio.id]);
  }
}