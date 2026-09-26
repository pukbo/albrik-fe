import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Pannello admin: solo nel browser (dietro login, non va indicizzato né renderizzato sul server)
  {
    path: 'admin/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'admin',
    renderMode: RenderMode.Client,
  },
  /*
   * Sito pubblico: renderizzato sul server a ogni richiesta, così i crawler ricevono
   * sempre HTML completo e un nuovo servizio nel DB è online senza rifare la build.
   */
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
