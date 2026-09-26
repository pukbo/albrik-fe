import { Component, inject, input } from '@angular/core';
import { Servizio } from '../../core/servizi-api';
import { Seo } from '../../core/seo';
import { SITE, TELEFONO_LINK } from '../../core/site.config';
import { aziendaJsonLd } from '../../core/structured-data';
import { ModuloPreventivo } from '../../shared/modulo-preventivo';

@Component({
  selector: 'app-contatti',
  imports: [ModuloPreventivo],
  template: `
    <section class="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <h1 class="text-3xl font-extrabold text-slate-900 md:text-4xl">Contatti e preventivi</h1>
      <p class="mt-3 max-w-2xl text-lg text-slate-600">
        Compila il modulo per un sopralluogo gratuito a {{ site.zonaServita }}, oppure chiamaci o scrivici direttamente.
      </p>

      <div class="mt-10 grid gap-10 lg:grid-cols-3">
        <div class="rounded-2xl border border-slate-200 p-6 md:p-8 lg:col-span-2">
          <app-modulo-preventivo [servizi]="servizi()" [servizioIniziale]="servizio()" />
        </div>

        <aside class="space-y-4" aria-label="Recapiti">
          <a [href]="telefonoLink" class="block rounded-2xl border border-slate-200 p-6 hover:border-blue-300 hover:bg-blue-50">
            <h2 class="font-bold text-slate-900">Telefono</h2>
            <p class="mt-1 text-blue-800">{{ site.telefono }}</p>
          </a>
          <a [href]="'mailto:' + site.email" class="block rounded-2xl border border-slate-200 p-6 hover:border-blue-300 hover:bg-blue-50">
            <h2 class="font-bold text-slate-900">Email</h2>
            <p class="mt-1 break-all text-blue-800">{{ site.email }}</p>
          </a>
          <div class="rounded-2xl border border-slate-200 p-6">
            <h2 class="font-bold text-slate-900">Sede</h2>
            <address class="mt-1 text-slate-700 not-italic">
              {{ site.indirizzo.via }}<br />
              {{ site.indirizzo.cap }} {{ site.indirizzo.citta }} ({{ site.indirizzo.provincia }})
            </address>
          </div>
        </aside>
      </div>
    </section>
  `,
})
export default class Contatti {
  /** Dal resolver della route. */
  readonly servizi = input<Servizio[]>([]);
  /** Query param ?servizio=slug per preselezionare il servizio nel modulo. */
  readonly servizio = input<string>();

  protected readonly site = SITE;
  protected readonly telefonoLink = TELEFONO_LINK;

  constructor() {
    inject(Seo).aggiorna({
      title: `Contatti e Preventivi | ${SITE.nome} ${SITE.indirizzo.citta}`,
      description: `Richiedi a ${SITE.nome} un preventivo gratuito per caldaie, rinnovo bagno e condizionatori a ${SITE.zonaServita}. Tel. ${SITE.telefono}, ${SITE.email}.`,
      path: '/contatti',
      jsonLd: aziendaJsonLd(),
    });
  }
}
