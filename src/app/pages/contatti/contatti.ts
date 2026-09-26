import { Component, inject } from '@angular/core';
import { Seo } from '../../core/seo';
import { SITE, TELEFONO_LINK } from '../../core/site.config';
import { aziendaJsonLd } from '../../core/structured-data';

@Component({
  selector: 'app-contatti',
  template: `
    <section class="mx-auto max-w-4xl px-4 py-12 md:py-16">
      <h1 class="text-3xl font-extrabold text-slate-900 md:text-4xl">Contatti e preventivi</h1>
      <p class="mt-3 text-lg text-slate-600">
        Chiamaci o scrivici per un sopralluogo gratuito a {{ site.zonaServita }}.
      </p>

      <div class="mt-10 grid gap-6 md:grid-cols-3">
        <a [href]="telefonoLink" class="rounded-2xl border border-slate-200 p-6 hover:border-blue-300 hover:bg-blue-50">
          <h2 class="font-bold text-slate-900">Telefono</h2>
          <p class="mt-2 text-blue-800">{{ site.telefono }}</p>
        </a>
        <a [href]="'mailto:' + site.email" class="rounded-2xl border border-slate-200 p-6 hover:border-blue-300 hover:bg-blue-50">
          <h2 class="font-bold text-slate-900">Email</h2>
          <p class="mt-2 break-all text-blue-800">{{ site.email }}</p>
        </a>
        <div class="rounded-2xl border border-slate-200 p-6">
          <h2 class="font-bold text-slate-900">Sede</h2>
          <address class="mt-2 text-slate-700 not-italic">
            {{ site.indirizzo.via }}<br />
            {{ site.indirizzo.cap }} {{ site.indirizzo.citta }} ({{ site.indirizzo.provincia }})
          </address>
        </div>
      </div>
    </section>
  `,
})
export default class Contatti {
  protected readonly site = SITE;
  protected readonly telefonoLink = TELEFONO_LINK;

  constructor() {
    inject(Seo).aggiorna({
      title: `Contatti e Preventivi | ${SITE.nome} ${SITE.indirizzo.citta}`,
      description: `Contatta ${SITE.nome} per un preventivo gratuito su caldaie, rinnovo bagno e condizionatori a ${SITE.zonaServita}. Tel. ${SITE.telefono}, ${SITE.email}.`,
      path: '/contatti',
      jsonLd: aziendaJsonLd(),
    });
  }
}
