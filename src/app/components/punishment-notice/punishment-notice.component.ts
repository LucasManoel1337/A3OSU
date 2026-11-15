import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PunishmentNoticeService } from '../../core/services/punishment-notice.service';
import { UserPunishmentType } from '../../core/models/user-punishment.model';

@Component({
  selector: 'app-punishment-notice',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './punishment-notice.component.html',
  styleUrl: './punishment-notice.component.css'
})
export class PunishmentNoticeComponent {
  constructor(public noticeService: PunishmentNoticeService) {}

  title(context: 'account' | 'tournament', type: UserPunishmentType): string {
    if (context === 'account') return 'Acesso à conta suspenso';
    return type === 'SUSPENSAO_RANQUEADO'
      ? 'Suspensão de torneios ranked'
      : 'Suspensão de torneios casuais';
  }

  punishmentName(type: UserPunishmentType): string {
    switch (type) {
      case 'BANIMENTO_PERMANENTE': return 'Banimento permanente';
      case 'BANIMENTO_TEMPORARIO': return 'Banimento temporário';
      case 'SUSPENSAO_RANQUEADO': return 'Suspensão de torneios ranked';
      case 'SUSPENSAO_CASUAL': return 'Suspensão de torneios casuais';
    }
  }
}
