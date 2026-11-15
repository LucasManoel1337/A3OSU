import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { inject } from '@angular/core';
import { ServerStatusService } from '../services/server-status.service'; // <-- Importe o serviço
import { parseActiveTournamentSuspension } from '../models/user-punishment.model';
import { PunishmentNoticeService } from '../services/punishment-notice.service';

let currentServerIndex = 0;

export const failoverInterceptor: HttpInterceptorFn = (req, next) => {
  const BACKEND_URLS = environment.backendUrls;
  
  // Usamos o inject() porque estamos dentro de uma função, não de uma classe
  const statusService = inject(ServerStatusService);
  const punishmentNoticeService = inject(PunishmentNoticeService);

  const cloneRequest = (index: number) => req.clone({
    url: `${BACKEND_URLS[index]}${req.url}`
  });

  // Atualiza o widget visual dizendo qual servidor estamos usando
  statusService.setServerUrl(BACKEND_URLS[currentServerIndex]);

  return next(cloneRequest(currentServerIndex)).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 0) {
        console.warn(`[Sistemas Distribuídos] Servidor ${BACKEND_URLS[currentServerIndex]} falhou.`);
        
        currentServerIndex = (currentServerIndex + 1) % BACKEND_URLS.length;
        
        console.log(`[Sistemas Distribuídos] Trocando para: ${BACKEND_URLS[currentServerIndex]}`);
        
        // Se cair, já atualiza o visual imediatamente para a nova porta!
        statusService.setServerUrl(BACKEND_URLS[currentServerIndex]);
        
        return next(cloneRequest(currentServerIndex));
      }
      if (error.status === 403) {
        const punishment = parseActiveTournamentSuspension(error.error);
        if (punishment) {
          punishmentNoticeService.show(punishment, 'tournament');
        }
      }
      return throwError(() => error);
    })
  );
};