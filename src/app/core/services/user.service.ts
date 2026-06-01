import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

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
}