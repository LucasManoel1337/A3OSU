import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common'; // <-- Importe isso

export interface AuthResponse {
  token: string;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private apiUrl = '/api/auth';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  login(credenciais: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credenciais).pipe(
      tap(response => this.salvarDados(response.token, response.username))
    );
  }

  cadastrar(dadosCadastro: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/cadastro`, dadosCadastro).pipe(
      tap(response => this.salvarDados(response.token, response.username))
    );
  }

  logout(): void {
    // Só tenta limpar se estiver no navegador
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('username');
    }
  }

  estaLogado(): boolean {
    // Só tenta ler se estiver no navegador. Se for o servidor Node rodando, retorna falso.
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('jwt_token');
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
}