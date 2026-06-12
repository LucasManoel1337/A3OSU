import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError, of } from 'rxjs';

// 1. Importe o UserService e a interface
import { UserService, UsuarioBusca } from '../../core/services/user.service';

@Component({
  selector: 'app-pesquisar-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './pesquisar.component.html',
  styleUrls: ['./pesquisar.component.css']
})
export class PesquisarComponent implements OnInit {

  buscaControl = new FormControl('');
  usuarios: UsuarioBusca[] = [];
  carregando: boolean = false;
  pesquisaRealizada: boolean = false;

  // 2. Injete o UserService no construtor
  constructor(private userService: UserService) {}

  ngOnInit(): void {
    // Escuta tudo que o usuário digita no campo de busca
    this.buscaControl.valueChanges.pipe(
      
      // Espera 800 milissegundos após a última tecla digitada
      debounceTime(800), 
      
      // Só continua se o texto for diferente da última busca
      distinctUntilChanged(), 
      
      // Aciona o loading apenas se tiver algo digitado
      tap(termo => {
        if (termo && termo.trim() !== '') {
          this.carregando = true;
          this.pesquisaRealizada = true;
        }
      }),
      
      // Troca o fluxo para a chamada da API (cancela requisições anteriores se o usuário voltar a digitar)
      switchMap(termo => {
        // Se o campo estiver vazio, limpa a tela e não chama a API
        if (!termo || termo.trim() === '') {
          this.usuarios = [];
          this.carregando = false;
          this.pesquisaRealizada = false;
          return of([]); 
        }
        
        // 3. A CHAMADA REAL PARA O SEU BACKEND
        return this.userService.buscarUsuariosPorNick(termo).pipe(
          // Pega qualquer erro de rede (Backend fora, erro 500, etc) para não quebrar o Angular
          catchError(erro => {
            console.error('Erro ao comunicar com a API de busca:', erro);
            return of([]); // Retorna array vazio em caso de falha
          })
        );
      })

    ).subscribe({
      next: (resultados) => {
        // Recebe os dados do Spring Boot e atualiza o HTML
        this.usuarios = resultados;
        this.carregando = false;
      }
    });
  }
}