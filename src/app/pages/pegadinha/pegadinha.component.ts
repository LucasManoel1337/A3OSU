import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pegadinha',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pegadinha.component.html',
  styleUrls: ['./pegadinha.component.css']
})
export class PegadinhaComponent {

  constructor(private router: Router) {}

  voltar(): void {
    // Redireciona de volta para a Home
    this.router.navigate(['/home']);
  }
}