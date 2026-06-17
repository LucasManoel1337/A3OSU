import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UsuarioBusca {
  id: number;
  username: string;
  avatarUrl: string | null;
  nacionalidade: string;
  isVerified: boolean;
  criadoEm: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  private apiUrl = '/users';

  constructor(private http: HttpClient) {}

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
}