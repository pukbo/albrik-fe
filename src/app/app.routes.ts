import { Routes } from '@angular/router';
import { adminGuard } from './admin/admin-auth';
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

  // Pannello admin
  {
    path: 'admin/login',
    loadComponent: () => import('./admin/pagine/login'),
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/pagine/layout'),
    canActivate: [adminGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'richieste' },
      { path: 'richieste', loadComponent: () => import('./admin/pagine/richieste') },
      { path: 'richieste/:id', loadComponent: () => import('./admin/pagine/richiesta') },
    ],
  },

  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found'),
  },
];
