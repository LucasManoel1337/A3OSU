import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface mapeando exatamente o DTO que o Spring Boot vai devolver
export interface TorneioResponse {
  id: number;
  nome: string;
  tipo: string;
  modo: string;
  vagas: number;
  descricao: string;
  isPrivado: boolean;
  banner?: string; // O Spring devolve a string em Base64
  logo?: string;   // O Spring devolve a string em Base64
}

@Injectable({
  providedIn: 'root'
})
export class TorneioService {
  private apiUrl = '/torneios'; 

  constructor(private http: HttpClient) { }

  private getHeadersJson() {
    const token = localStorage.getItem('jwt_token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  criarTorneio(dadosFormulario: any, criadorId: number): Observable<TorneioResponse> {
    const formData = new FormData();

    formData.append('criadorId', criadorId.toString());
    formData.append('nome', dadosFormulario.nome);
    formData.append('tipo', dadosFormulario.tipo);
    formData.append('modo', dadosFormulario.modo);
    formData.append('vagas', dadosFormulario.vagas.toString());
    formData.append('descricao', dadosFormulario.descricao);
    formData.append('isPrivado', dadosFormulario.isPrivado);

    if (dadosFormulario.isPrivado && dadosFormulario.senha) {
      formData.append('senha', dadosFormulario.senha);
    }

    if (dadosFormulario.banner instanceof File) {
      formData.append('banner', dadosFormulario.banner);
    }

    if (dadosFormulario.logo instanceof File) {
      formData.append('logo', dadosFormulario.logo);
    }

    return this.http.post<TorneioResponse>(this.apiUrl, formData, this.getHeadersJson());
  }

  listarTorneios(): Observable<TorneioResponse[]> {
    return this.http.get<TorneioResponse[]>(this.apiUrl, this.getHeadersJson());
  }
}