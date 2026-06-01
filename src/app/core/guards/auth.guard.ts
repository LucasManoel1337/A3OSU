import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  // Como é uma função solta (e não uma classe), usamos o inject() para trazer os serviços
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verifica se existe um token no localStorage usando o método que criamos no AuthService
  if (authService.estaLogado()) {
    return true; // Catraca liberada! Pode carregar a tela.
  } else {
    // Se não tiver token, joga o engraçadinho de volta pra tela de login
    router.navigate(['/login']);
    return false; // Catraca bloqueada!
  }
};