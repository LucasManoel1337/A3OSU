import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoadingService } from './core/services/loading.service';
import { ModalComponent } from './components/modal/modal.component';
import { PunishmentNoticeComponent } from './components/punishment-notice/punishment-notice.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    ModalComponent,
    PunishmentNoticeComponent,
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {

  constructor(
    public loadingService: LoadingService
  ) {}
}