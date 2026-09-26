import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Seo } from '../../core/seo';
import { SITE } from '../../core/site.config';
import { impostaStatoHttp } from '../../core/stato-http';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <section class="mx-auto max-w-2xl px-4 py-20 text-center">
      <p class="text-sm font-semibold text-orange-700">Errore 404</p>
      <h1 class="mt-2 text-3xl font-extrabold text-slate-900">Pagina non trovata</h1>
      <p class="mt-3 text-slate-600">La pagina che cerchi non esiste o è stata spostata.</p>
      <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <a routerLink="/" class="rounded-lg bg-blue-900 px-6 py-3 font-semibold text-white hover:bg-blue-800">Torna alla home</a>
        <a routerLink="/servizi" class="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-800 hover:bg-slate-50">
          Vedi i servizi
        </a>
      </div>
    </section>
  `,
})
export default class NotFound {
  constructor() {
    impostaStatoHttp(404);
    inject(Seo).aggiorna({
      title: `Pagina non trovata | ${SITE.nome}`,
      description: 'La pagina richiesta non esiste.',
      path: inject(Router).url,
      noindex: true,
    });
  }
}
