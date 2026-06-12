import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { CadastroComponent } from './pages/cadastro/cadastro.component';
import { LayoutPrivadoComponent } from './components/layout-privado/layout-privado.component';
import { authGuard } from './core/guards/auth.guard';
import { HomeComponent } from './pages/home/home.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { ConfigComponent } from './pages/config/config.component';
import { TorneiosComponent } from './pages/torneios/torneios.component';
import { CriarTorneiosComponent } from './pages/criar-torneios/criar-torneios.component';
import { PesquisarComponent } from './pages/pesquisar/pesquisar.component';
import { PegadinhaComponent } from './pages/pegadinha/pegadinha.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: CadastroComponent },
  {
    path: '',
    component: LayoutPrivadoComponent,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'perfil', component: PerfilComponent },
      { path: 'config', component: ConfigComponent },
      { path: 'torneios', component: TorneiosComponent },
      { path: 'criar-torneio', component: CriarTorneiosComponent },
      { path: 'pesquisar-perfil', component: PesquisarComponent },
      { path: 'perfil/:username', component: PerfilComponent },
      { path: 'pegadinha', component: PegadinhaComponent }
    ]
  },

  { path: '**', redirectTo: 'login' }
];