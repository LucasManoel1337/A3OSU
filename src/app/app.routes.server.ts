import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'config',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'perfil/:username',
    renderMode: RenderMode.Client
  },
  {
    path: 'torneios/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'meus-torneios/:idUsuario',
    renderMode: RenderMode.Client
  },
  {
    path: 'torneios/gerenciar/:id',
    renderMode: RenderMode.Client
  }
];
