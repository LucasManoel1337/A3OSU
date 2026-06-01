import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServerStatusService {
  private currentServer = new BehaviorSubject<string>('Buscando...');
  currentServer$ = this.currentServer.asObservable();

  setServerUrl(url: string) {
    try {
      const urlObj = new URL(url);
      this.currentServer.next(urlObj.host);
    } catch {
      this.currentServer.next(url);
    }
  }
}