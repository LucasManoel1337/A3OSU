import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface TorneioResponse {
  id: number;
  nome: string;
  tipo: string;
  modo: string;
  vagas: number;
  descricao: string;
  isPrivado: boolean;
  banner?: string; 
  logo?: string;
  organizadorId?: string;
  organizadorUsuario?: string;
  organizadorAvatar?: string;
  organizadorVerificado?: boolean;
  dataInicio?: string;
  horaInicio?: string;
  status?: string;
}

export interface TorneioDetalhesDTO {
  id: number;
  nome: string;
  tipo: string;
  modo: string;
  vagas: number;
  vagasRestantes: number;
  descricao: string;
  isPrivado: boolean;
  bannerUrlTorneio?: string;
  logoUrlTorneio?: string;
  organizadorId?: string;
  organizador?: string;
  organizadorNacionalidade?: string;
  organizadorVerificado?: string;
  organizadorAvatarUrl?: string;
  criadoEm?: string;
  dataInicio?: string;
  horaInicio?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TorneioService {
  private apiUrl = '/torneios'; 

  constructor(private http: HttpClient) { }

  private getHeadersJson() {
    const token = localStorage.getItem('jwt_token');
    if (token && token.length > 2000) {
      console.error("Token suspeito! Limpando localStorage.");
      localStorage.removeItem('jwt_token');
      return {}; 
    }

    return token ? {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    } : {};
  }

  criarTorneio(dadosFormulario: any, criadorId: number, moderadoresIds: number[], isRascunho: boolean): Observable<TorneioResponse> {
    const formData = new FormData();

    formData.append('criadorId', criadorId.toString());
    formData.append('nome', dadosFormulario.nome);
    formData.append('tipo', dadosFormulario.tipo);
    formData.append('modo', dadosFormulario.modo);
    formData.append('vagas', dadosFormulario.vagas.toString());
    formData.append('descricao', dadosFormulario.descricao);
    formData.append('isPrivado', dadosFormulario.isPrivado);
    formData.append('dataInicio', dadosFormulario.dataInicio);
    formData.append('horaInicio', dadosFormulario.horaInicio);

    if (dadosFormulario.isPrivado && dadosFormulario.senha) {
      formData.append('senha', dadosFormulario.senha);
    }

    if (dadosFormulario.banner instanceof File) {
      formData.append('banner', dadosFormulario.banner);
    }

    if (dadosFormulario.logo instanceof File) {
      formData.append('logo', dadosFormulario.logo);
    }

    if (moderadoresIds && moderadoresIds.length > 0) {
      moderadoresIds.forEach(id => {
        formData.append('moderadoresIds', id.toString());
      });
    }

    formData.append('rascunho', isRascunho === true ? 'true' : 'false');

    return this.http.post<TorneioResponse>(this.apiUrl, formData, this.getHeadersJson());
  }

  listarTorneios(): Observable<TorneioResponse[]> {
    return this.http.get<TorneioResponse[]>(this.apiUrl, this.getHeadersJson());
  }

  buscarTorneioPorId(id: number): Observable<TorneioDetalhesDTO> {
    return this.http.get<TorneioDetalhesDTO>(`${this.apiUrl}/${id}`, this.getHeadersJson());
  }

  entrarNoTorneio(torneioId: number, dados: { jogadorId: number, senha?: string }) {
    return this.http.post(`${this.apiUrl}/${torneioId}/entrar`, dados, {
      ...this.getHeadersJson(),
      responseType: 'text' as const
    });
  }

  buscarInscritosDoTorneio(torneioId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${torneioId}/inscritos`, this.getHeadersJson());
  }

  listarParticipando(idUsuario: number): Observable<TorneioResponse[]> {
    return this.http.get<TorneioResponse[]>(`${this.apiUrl}/participando/${idUsuario}`, this.getHeadersJson());
  }

  // Busca os que o jogador criou
  listarCriados(idUsuario: number): Observable<TorneioResponse[]> {
    return this.http.get<TorneioResponse[]>(`${this.apiUrl}/criados/${idUsuario}`, this.getHeadersJson());
  }

  // Busca os que o jogador é moderador
  listarModerando(idUsuario: number): Observable<TorneioResponse[]> {
    return this.http.get<TorneioResponse[]>(`${this.apiUrl}/moderando/${idUsuario}`, this.getHeadersJson());
  }
}