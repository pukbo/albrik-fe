import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Tutte le pagine sono renderizzate sul server a ogni richiesta: i crawler ricevono
 * sempre HTML completo e un nuovo servizio nel DB è online senza rifare la build.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
