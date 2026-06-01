import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { failoverInterceptor } from './core/interceptors/failover-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Adicione esta linha para ativar as chamadas HTTP e o interceptor
    provideHttpClient(withInterceptors([failoverInterceptor])) 
  ]
};
