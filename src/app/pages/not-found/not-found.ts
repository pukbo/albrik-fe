import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Seo } from '../../core/seo';
import { SITE, TELEFONO_LINK } from '../../core/site.config';
import { impostaStatoHttp } from '../../core/stato-http';

interface Collegamento {
  percorso: string;
  titolo: string;
  testo: string;
}

/** Le pagine più visitate, per non lasciare il visitatore in un vicolo cieco. */
const COLLEGAMENTI: Collegamento[] = [
  { percorso: '/servizi', titolo: 'Servizi', testo: 'Caldaie, bagni e condizionatori' },
  { percorso: '/caldaie', titolo: 'Caldaie', testo: 'Il catalogo dei modelli' },
  { percorso: '/condizionatori', titolo: 'Condizionatori', testo: 'Il catalogo dei modelli' },
  { percorso: '/faq', titolo: 'Domande frequenti', testo: 'Le risposte ai dubbi più comuni' },
];

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <section class="mx-auto max-w-2xl px-4 py-14 text-center md:py-20">
      <!-- "404" con il simbolo del logo al posto dello zero -->
      <p class="entra font-display flex items-center justify-center gap-1 text-7xl font-bold text-blue-950 md:text-8xl" aria-hidden="true">
        <span>4</span>
        <svg viewBox="0 0 64 64" class="size-20 md:size-24">
          <path d="M32 5 C32 5 12 27 12 40 A20 20 0 0 0 52 40 C52 27 32 5 32 5 Z" fill="#1e40af" />
          <path d="M32 24 C34 30 42 33 42 42 A10 10 0 0 1 22 42 C22 37 25 34 27 32 C27 36 29 38 31 38 C29 33 30 28 32 24 Z" fill="#f97316" />
        </svg>
        <span>4</span>
      </p>
      <h1 class="mt-6 text-3xl font-extrabold text-slate-900">Pagina non trovata</h1>
      <p class="mt-3 text-slate-600">
        Qui c'è una perdita che non sappiamo riparare: la pagina che cerchi non esiste o è stata spostata.
      </p>
      <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <a routerLink="/" class="pulsante rounded-lg bg-orange-700 px-6 py-3 font-semibold text-white hover:bg-orange-800">
          Torna alla home <span class="freccia" aria-hidden="true">→</span>
        </a>
        <a routerLink="/contatti" class="pulsante rounded-lg border-2 border-blue-800 px-6 py-3 font-semibold text-blue-800 hover:bg-blue-50">
          Richiedi un preventivo
        </a>
      </div>
    </section>

    <section class="bg-slate-100 py-12" aria-labelledby="titolo-pagine">
      <div class="mx-auto max-w-3xl px-4">
        <h2 id="titolo-pagine" class="text-center text-lg font-bold text-slate-900">Forse cercavi</h2>
        <ul class="mt-6 grid gap-3 sm:grid-cols-2">
          @for (c of collegamenti; track c.percorso) {
            <li>
              <a [routerLink]="c.percorso"
                class="premi group flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-300">
                <span>
                  <span class="block font-semibold text-slate-900">{{ c.titolo }}</span>
                  <span class="block text-sm text-slate-600">{{ c.testo }}</span>
                </span>
                <span class="text-blue-800 transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
              </a>
            </li>
          }
        </ul>
        <p class="mt-8 text-center text-slate-700">
          Preferisci parlare con noi?
          <a [href]="telefonoLink" class="font-semibold whitespace-nowrap text-blue-800 hover:underline">Chiama il {{ site.telefono }}</a>
        </p>
      </div>
    </section>
  `,
})
export default class NotFound {
  protected readonly collegamenti = COLLEGAMENTI;
  protected readonly site = SITE;
  protected readonly telefonoLink = TELEFONO_LINK;

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
