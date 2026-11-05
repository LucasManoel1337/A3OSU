import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, finalize, map, of, shareReplay, tap, throwError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

export interface AuthResponse {
  token: string;
  username: string;
}

export interface AuthMessageResponse {
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CadastroRequest {
  username: string;
  email: string;
  password: string;
  nationality: string;
  language: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = '/api/auth';
  private readonly idleTimeoutMs = 30 * 60 * 1000;
  private readonly refreshIntervalMs = 15 * 60 * 1000;
  private idleTimeout?: ReturnType<typeof setTimeout>;
  private lastRefreshAt = 0;
  private lastRefreshAttemptAt = 0;
  private lastActivityAt = 0;
  private refreshInProgress = false;
  private refreshRequest?: Observable<AuthResponse>;
  private sessionTrackingStarted = false;
  private readonly activityEvents = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const;
  private readonly onActivity = (): void => this.registrarAtividade();
  private readonly onStorage = (event: StorageEvent): void => this.sincronizarAtividade(event);

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.iniciarMonitoramentoSessao();
    }
  }

  login(credenciais: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credenciais, { withCredentials: true }).pipe(
      tap(response => {
        this.salvarDados(response.token, response.username);
        this.iniciarMonitoramentoSessao(true);
      })
    );
  }

  cadastrar(dadosCadastro: CadastroRequest): Observable<AuthMessageResponse> {
    return this.http.post<AuthMessageResponse>(`${this.apiUrl}/cadastro`, dadosCadastro);
  }

  verificarEmail(email: string, code: string): Observable<AuthMessageResponse> {
    return this.http.post<AuthMessageResponse>(`${this.apiUrl}/verificar-email`, { email, code });
  }

  reenviarVerificacao(email: string): Observable<AuthMessageResponse> {
    return this.http.post<AuthMessageResponse>(`${this.apiUrl}/reenviar-verificacao`, { email });
  }

  esqueciSenha(email: string): Observable<AuthMessageResponse> {
    return this.http.post<AuthMessageResponse>(`${this.apiUrl}/esqueci-senha`, { email });
  }

  redefinirSenha(email: string, code: string, newPassword: string): Observable<AuthMessageResponse> {
    return this.http.post<AuthMessageResponse>(`${this.apiUrl}/redefinir-senha`, {
      email,
      code,
      newPassword
    });
  }

  renovarToken(): Observable<AuthResponse> {
    if (!this.refreshRequest) {
      this.refreshRequest = this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, {}, { withCredentials: true }).pipe(
        tap(response => {
          this.salvarDados(response.token, response.username);
          this.lastRefreshAt = Date.now();
          this.lastRefreshAttemptAt = this.lastRefreshAt;
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token_refreshed_at', this.lastRefreshAt.toString());
          }
        }),
        finalize(() => this.refreshRequest = undefined),
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }
    return this.refreshRequest;
  }

  restaurarSessao(): Observable<boolean> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(false);
    }

    const lastActivity = Number(localStorage.getItem('last_activity_at'));
    if (Number.isFinite(lastActivity) && lastActivity > 0 && Date.now() - lastActivity >= this.idleTimeoutMs) {
      this.encerrarSessao();
      return of(false);
    }

    const token = localStorage.getItem('jwt_token');
    if (token && !this.tokenExpirado(token)) {
      this.iniciarMonitoramentoSessao();
      return of(true);
    }

    return this.renovarToken().pipe(
      tap(() => this.iniciarMonitoramentoSessao()),
      map(() => true),
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)) {
          this.encerrarSessao();
          return of(false);
        }
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.pararMonitoramentoSessao();
      this.limparDadosSessao();
      this.http.post<AuthMessageResponse>(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe({
        error: error => console.error('Não foi possível invalidar a sessão no servidor.', error)
      });
    }
  }

  estaLogado(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        return false;
      }

      const lastActivity = Number(localStorage.getItem('last_activity_at'));
      if (Number.isFinite(lastActivity) && lastActivity > 0 && Date.now() - lastActivity >= this.idleTimeoutMs) {
        this.encerrarPorInatividade();
        return false;
      }

      return true;
    }
    return false;
  }

  private salvarDados(token: string, username: string): void {
    // Só salva se estiver no navegador
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('jwt_token', token);
      localStorage.setItem('username', username);
    }
  }

  private iniciarMonitoramentoSessao(novaSessao = false): void {
    if (!isPlatformBrowser(this.platformId) || !localStorage.getItem('jwt_token')) {
      return;
    }

    const now = Date.now();
    const savedActivity = Number(localStorage.getItem('last_activity_at'));
    this.lastActivityAt = novaSessao || !Number.isFinite(savedActivity) || savedActivity <= 0
      ? now
      : savedActivity;

    const savedRefresh = Number(localStorage.getItem('token_refreshed_at'));
    this.lastRefreshAt = novaSessao || !Number.isFinite(savedRefresh) || savedRefresh <= 0
      ? now
      : savedRefresh;
    this.lastRefreshAttemptAt = this.lastRefreshAt;
    localStorage.setItem('last_activity_at', this.lastActivityAt.toString());
    if (novaSessao || !Number.isFinite(savedRefresh) || savedRefresh <= 0) {
      localStorage.setItem('token_refreshed_at', this.lastRefreshAt.toString());
    }

    if (!this.sessionTrackingStarted) {
      this.activityEvents.forEach(eventName => window.addEventListener(eventName, this.onActivity, { passive: true }));
      window.addEventListener('storage', this.onStorage);
      this.sessionTrackingStarted = true;
    }

    this.armarTemporizadorInatividade();
  }

  private pararMonitoramentoSessao(): void {
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
      this.idleTimeout = undefined;
    }

    if (this.sessionTrackingStarted && isPlatformBrowser(this.platformId)) {
      this.activityEvents.forEach(eventName => window.removeEventListener(eventName, this.onActivity));
      window.removeEventListener('storage', this.onStorage);
      this.sessionTrackingStarted = false;
    }
  }

  private registrarAtividade(): void {
    if (!localStorage.getItem('jwt_token')) {
      return;
    }

    const now = Date.now();
    this.lastActivityAt = now;
    const savedActivity = Number(localStorage.getItem('last_activity_at'));
    if (!Number.isFinite(savedActivity) || now - savedActivity >= 5000) {
      localStorage.setItem('last_activity_at', now.toString());
    }
    this.armarTemporizadorInatividade();

    if (
      !this.refreshInProgress &&
      now - this.lastRefreshAt >= this.refreshIntervalMs &&
      now - this.lastRefreshAttemptAt >= 60_000
    ) {
      this.tentarRenovarToken();
    }
  }

  private sincronizarAtividade(event: StorageEvent): void {
    if (event.key !== 'last_activity_at' || !event.newValue || !localStorage.getItem('jwt_token')) {
      return;
    }

    const lastActivity = Number(event.newValue);
    if (!Number.isFinite(lastActivity) || lastActivity <= this.lastActivityAt) {
      return;
    }

    this.lastActivityAt = lastActivity;
    this.armarTemporizadorInatividade();
  }

  private armarTemporizadorInatividade(): void {
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
    }

    const remaining = this.idleTimeoutMs - (Date.now() - this.lastActivityAt);
    if (remaining <= 0) {
      this.encerrarPorInatividade();
      return;
    }

    this.idleTimeout = setTimeout(() => this.encerrarPorInatividade(), remaining);
  }

  private tentarRenovarToken(): void {
    this.refreshInProgress = true;
    this.lastRefreshAttemptAt = Date.now();
    this.renovarToken().subscribe({
      error: error => {
        this.refreshInProgress = false;
        if (error.status === 401 || error.status === 403) {
          this.encerrarSessao();
          return;
        }
        console.error('Não foi possível renovar a sessão. A renovação será tentada novamente após atividade.', error);
      },
      complete: () => {
        this.refreshInProgress = false;
      }
    });
  }

  private encerrarPorInatividade(): void {
    this.encerrarSessao();
    this.router.navigate(['/login']);
  }

  private encerrarSessao(): void {
    this.pararMonitoramentoSessao();
    this.limparDadosSessao();
  }

  private limparDadosSessao(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('username');
    localStorage.removeItem('last_activity_at');
    localStorage.removeItem('token_refreshed_at');
  }

  private tokenExpirado(token: string): boolean {
    try {
      const payload = token.split('.')[1];
      if (!payload) {
        return true;
      }

      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
      const expiration = JSON.parse(decoded).exp;
      return typeof expiration !== 'number' || expiration * 1000 <= Date.now() + 30_000;
    } catch {
      return true;
    }
  }
}

export function mensagemErroAuth(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'error' in error) {
    const body: unknown = error.error;

    if (typeof body === 'string' && body.trim()) {
      return body;
    }

    if (body && typeof body === 'object' && 'message' in body) {
      const message = body.message;
      if (typeof message === 'string' && message.trim()) {
        return message;
      }
    }

    if (body && typeof body === 'object' && 'error' in body) {
      const message = body.error;
      if (typeof message === 'string' && message.trim()) {
        return message;
      }
    }
  }

  return fallback;
}

export function senhaValida(password: string): boolean {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,20}$/.test(password);
}