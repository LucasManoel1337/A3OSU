import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

let currentServerIndex = 0;

export const failoverInterceptor: HttpInterceptorFn = (req, next) => {
  
  // Agora ele busca os links direto do arquivo de configuração!
  const BACKEND_URLS = environment.backendUrls;

  const cloneRequest = (index: number) => req.clone({
    url: `${BACKEND_URLS[index]}${req.url}`
  });

  return next(cloneRequest(currentServerIndex)).pipe(
    catchError((error: HttpErrorResponse) => {
      
      if (error.status === 0) {
        console.warn(`[Sistemas Distribuídos] Servidor ${BACKEND_URLS[currentServerIndex]} falhou.`);
        
        currentServerIndex = (currentServerIndex + 1) % BACKEND_URLS.length;
        
        console.log(`[Sistemas Distribuídos] Trocando para: ${BACKEND_URLS[currentServerIndex]}`);
        
        return next(cloneRequest(currentServerIndex));
      }
      
      return throwError(() => error);
    })
  );
};