import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserPunishment } from '../models/user-punishment.model';

export type PunishmentNoticeContext = 'account' | 'tournament';

export interface PunishmentNotice {
  context: PunishmentNoticeContext;
  punishment: UserPunishment;
}

@Injectable({ providedIn: 'root' })
export class PunishmentNoticeService {
  private readonly noticeSubject = new BehaviorSubject<PunishmentNotice | null>(null);
  readonly notice$ = this.noticeSubject.asObservable();

  show(punishment: UserPunishment, context: PunishmentNoticeContext): void {
    this.noticeSubject.next({ punishment, context });
  }

  dismiss(): void {
    this.noticeSubject.next(null);
  }
}
