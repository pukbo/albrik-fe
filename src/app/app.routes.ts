import { Routes } from '@angular/router';
import { serviziResolver, servizioResolver } from './core/servizi.resolvers';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home'),
    resolve: { servizi: serviziResolver },
  },
  {
    path: 'servizi',
    loadComponent: () => import('./pages/servizi/servizi'),
    resolve: { servizi: serviziResolver },
  },
  {
    path: 'servizi/:slug',
    loadComponent: () => import('./pages/servizio/servizio'),
    resolve: { servizio: servizioResolver },
  },
  {
    path: 'contatti',
    loadComponent: () => import('./pages/contatti/contatti'),
    resolve: { servizi: serviziResolver },
  },
  {
    path: 'privacy',
    loadComponent: () => import('./pages/privacy/privacy'),
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found'),
  },
];
