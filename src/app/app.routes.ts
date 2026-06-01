import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { CadastroComponent } from './pages/cadastro/cadastro.component';
import { authGuard } from './core/guards/auth.guard';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { ConfigComponent } from './pages/config/config.component';
import { SobreProjetoComponent } from './pages/sobre-projeto/sobre-projeto.component';
import { TorneiosComponent } from './pages/torneios/torneios.component';
import { CriarTorneiosComponent } from './pages/criar-torneios/criar-torneios.component';
import { PesquisarComponent } from './pages/pesquisar/pesquisar.component';

export const routes: Routes = [
  // Rota raiz: redireciona automaticamente para o login ao abrir o app
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: CadastroComponent },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'perfil', component: PerfilComponent, canActivate: [authGuard] },
  { path: 'config', component: ConfigComponent, canActivate: [authGuard] },
  { path: 'sobre-projeto', component: SobreProjetoComponent, canActivate: [authGuard] },
  { path: 'torneios', component: TorneiosComponent, canActivate: [authGuard] },
  { path: 'criar-torneio', component: CriarTorneiosComponent, canActivate: [authGuard] },
  { path: 'pesquisar-perfil', component: PesquisarComponent, canActivate: [authGuard] },
  
  // Rota curinga: se o usuário digitar qualquer URL inválida, volta para o login
  { path: '**', redirectTo: 'login' }
];