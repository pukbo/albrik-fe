import { Routes } from '@angular/router';
import { adminGuard } from './admin/admin-auth';
import { prodottiResolver, prodottoResolver } from './core/prodotti.resolvers';
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
  // Catalogo: una coppia di route per categoria (i condizionatori si aggiungeranno qui)
  {
    path: 'caldaie',
    loadComponent: () => import('./pages/catalogo/catalogo'),
    data: { categoria: 'CALDAIA' },
    resolve: { prodotti: prodottiResolver, servizi: serviziResolver },
  },
  {
    path: 'caldaie/:slug',
    loadComponent: () => import('./pages/prodotto/prodotto'),
    data: { categoria: 'CALDAIA' },
    resolve: { prodotto: prodottoResolver, servizi: serviziResolver },
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
    // link personale inviato al cliente con il preventivo
    path: 'preventivo/:token',
    loadComponent: () => import('./pages/preventivo/preventivo-online'),
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
      { path: 'preventivi/:id', loadComponent: () => import('./admin/pagine/preventivo') },
      { path: 'servizi', loadComponent: () => import('./admin/pagine/servizi') },
      { path: 'servizi/nuovo', loadComponent: () => import('./admin/pagine/servizio') },
      { path: 'servizi/:id', loadComponent: () => import('./admin/pagine/servizio') },
      { path: 'catalogo', loadComponent: () => import('./admin/pagine/prodotti') },
      { path: 'catalogo/nuovo', loadComponent: () => import('./admin/pagine/prodotto') },
      { path: 'catalogo/:id', loadComponent: () => import('./admin/pagine/prodotto') },
      { path: 'statistiche', loadComponent: () => import('./admin/pagine/statistiche') },
    ],
  },

  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found'),
  },
];
