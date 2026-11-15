import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { UserPunishment, UserPunishmentRequest } from '../models/user-punishment.model';

export interface UsuarioBusca {
  id: number;
  username: string;
  avatarUrl: string | null;
  nacionalidade: string;
  isVerified: boolean;
  criadoEm: string;
}

export interface PerfilUsuario {
  idUser: number;
  username: string;
  email: string;
  nationality: string;
  language: string;
  verificado: boolean;
  conquistas: string[];
  titulosDisponiveis: string[];
  tituloSelecionado: string | null;
  criadoEm: string;
  punicoes: UserPunishment[];
}

export interface UsuarioModeracao {
  idUser: number;
  username: string;
  avatarUrl: string | null;
  nacionalidade: string;
  verificado: boolean;
  conquistas: string[];
  titulos: string[];
  punicoes: UserPunishment[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  private apiUrl = '/users';
  private readonly avatarUpdatedSubject = new Subject<string>();
  readonly avatarUpdated$ = this.avatarUpdatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  notifyAvatarUpdated(avatar: string): void {
    this.avatarUpdatedSubject.next(avatar);
  }

  // Helper para rotas que devolvem apenas Texto (String pura) do Spring Boot
  private getHeadersText() {
    const token = localStorage.getItem('jwt_token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      }),
      responseType: 'text' as 'json'
    };
  }

  // Helper para rotas que devolvem Objetos (JSON) do Spring Boot
  private getHeadersJson() {
    const token = localStorage.getItem('jwt_token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  // 1. PUT para atualizar Nacionalidade e Idioma (Devolve texto)
  updateProfile(dados: { nationality: string; language: string }): Observable<string> {
    return this.http.put<string>(`${this.apiUrl}/profile`, dados, this.getHeadersText());
  }

  // 2. PUT para alterar a senha (Devolve texto)
  changePassword(dados: any): Observable<string> {
    return this.http.put<string>(`${this.apiUrl}/change-password`, dados, this.getHeadersText());
  }

  // 3. GET para buscar os dados do usuário (Devolve o objeto JSON do UserProfileDTO)
  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`, this.getHeadersJson());
  }

  uploadAsset(file: File, type: 'avatar' | 'banner') {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(`${this.apiUrl}/upload/${type}`, formData, {
      responseType: 'text'
      ,headers: this.getHeadersJson().headers
    });
  }

  getAvatar(userId: number): Observable<Blob> {
    const token = localStorage.getItem('jwt_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/${userId}/avatar`, {
      headers,
      responseType: 'blob'
    });
  }

  getBanner(userId: number): Observable<Blob> {
    const token = localStorage.getItem('jwt_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/${userId}/banner`, {
      headers,
      responseType: 'blob'
    });
  }

  buscarUsuariosPorNick(termo: string): Observable<UsuarioBusca[]> {
    const params = new HttpParams().set('termo', termo);
    const token = localStorage.getItem('jwt_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<UsuarioBusca[]>(`${this.apiUrl}/busca`, { 
      headers,
      params: params 
    });
  }

  getProfileById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/perfil/${id}`, this.getHeadersJson());
  }

  selecionarTitulo(titulo: string | null): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/titulo`, { titulo }, this.getHeadersJson());
  }

  pesquisarUsuariosParaModeracao(termo: string): Observable<UsuarioModeracao[]> {
    const params = new HttpParams().set('termo', termo);
    return this.http.get<UsuarioModeracao[]>(`${this.apiUrl}/moderacao`, {
      ...this.getHeadersJson(),
      params
    });
  }

  atualizarVerificado(userId: number, verificado: boolean): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/moderacao/${userId}/verificado`, { verificado }, this.getHeadersJson());
  }

  atualizarConquista(userId: number, codigo: string, conceder: boolean): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/moderacao/${userId}/conquistas`,
      { codigo, conceder },
      this.getHeadersJson()
    );
  }

  atualizarTitulo(userId: number, titulo: string, conceder: boolean): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/moderacao/${userId}/titulos`,
      { titulo, conceder },
      this.getHeadersJson()
    );
  }

  aplicarPunicao(userId: number, request: UserPunishmentRequest): Observable<UserPunishment> {
    return this.http.post<UserPunishment>(
      `${this.apiUrl}/moderacao/${userId}/punicoes`,
      request,
      this.getHeadersJson()
    );
  }

  revogarPunicao(punishmentId: number): Observable<UserPunishment> {
    return this.http.delete<UserPunishment>(
      `${this.apiUrl}/moderacao/punicoes/${punishmentId}`,
      this.getHeadersJson()
    );
  }
}