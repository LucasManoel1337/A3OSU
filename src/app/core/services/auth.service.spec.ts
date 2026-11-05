import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('username');
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('username');
  });

  it('sends registration details and does not authenticate the new account', () => {
    service.cadastrar({
      username: 'player',
      email: 'player@example.com',
      password: 'Strong!123',
      nationality: 'br',
      language: 'pt-BR'
    }).subscribe();

    const request = httpTestingController.expectOne('/api/auth/cadastro');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      username: 'player',
      email: 'player@example.com',
      password: 'Strong!123',
      nationality: 'br',
      language: 'pt-BR'
    });
    request.flush({ message: 'Verification email sent.' });
    expect(localStorage.getItem('jwt_token')).toBeNull();
  });

  it('sends confirmation codes as strings without removing leading zeros', () => {
    service.verificarEmail('player@example.com', '000042').subscribe();

    const request = httpTestingController.expectOne('/api/auth/verificar-email');
    expect(request.request.body).toEqual({ email: 'player@example.com', code: '000042' });
    expect(typeof request.request.body.code).toBe('string');
    request.flush({ message: 'Email verified.' });
  });

  it('resends email verification codes', () => {
    service.reenviarVerificacao('player@example.com').subscribe();

    const request = httpTestingController.expectOne('/api/auth/reenviar-verificacao');
    expect(request.request.body).toEqual({ email: 'player@example.com' });
    request.flush({ message: 'A new code was sent.' });
  });

  it('requests a password recovery code by email', () => {
    service.esqueciSenha('player@example.com').subscribe();

    const request = httpTestingController.expectOne('/api/auth/esqueci-senha');
    expect(request.request.body).toEqual({ email: 'player@example.com' });
    request.flush({ message: 'If the account exists, an email was sent.' });
  });

  it('sends password reset details with the exact code string', () => {
    service.redefinirSenha('player@example.com', '000007', 'NewStrong!4').subscribe();

    const request = httpTestingController.expectOne('/api/auth/redefinir-senha');
    expect(request.request.body).toEqual({
      email: 'player@example.com',
      code: '000007',
      newPassword: 'NewStrong!4'
    });
    request.flush({ message: 'Password changed.' });
  });

  it('logs in with email and stores the returned token and username', () => {
    service.login({ email: 'player@example.com', password: 'Strong!123' }).subscribe();

    const request = httpTestingController.expectOne('/api/auth/login');
    expect(request.request.body).toEqual({ email: 'player@example.com', password: 'Strong!123' });
    request.flush({ token: 'jwt-token', username: 'player' });

    expect(localStorage.getItem('jwt_token')).toBe('jwt-token');
    expect(localStorage.getItem('username')).toBe('player');
    expect(request.request.withCredentials).toBe(true);
  });

  it('renews the access token using the refresh cookie', () => {
    service.renovarToken().subscribe();

    const request = httpTestingController.expectOne('/api/auth/refresh');
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBe(true);
    request.flush({ token: 'renewed-jwt', username: 'player' });

    expect(localStorage.getItem('jwt_token')).toBe('renewed-jwt');
    expect(localStorage.getItem('username')).toBe('player');
    expect(localStorage.getItem('token_refreshed_at')).not.toBeNull();
  });

  it('restores a session after reload when the access token has expired', () => {
    const expiredPayload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 60 }));
    localStorage.setItem('jwt_token', `header.${expiredPayload}.signature`);
    let restored = false;

    service.restaurarSessao().subscribe(value => restored = value);

    const request = httpTestingController.expectOne('/api/auth/refresh');
    expect(request.request.withCredentials).toBe(true);
    request.flush({ token: 'renewed-jwt', username: 'player' });

    expect(restored).toBe(true);
    expect(localStorage.getItem('jwt_token')).toBe('renewed-jwt');
    expect(localStorage.getItem('username')).toBe('player');
  });
});
