import { Component, effect, inject, input } from '@angular/core';
import { Servizio } from '../../core/servizi-api';
import { Seo } from '../../core/seo';
import { SITE } from '../../core/site.config';
import { aziendaJsonLd } from '../../core/structured-data';
import { CtaContatti } from '../../shared/cta-contatti';
import { ServizioCard } from '../../shared/servizio-card';

@Component({
  selector: 'app-servizi',
  imports: [ServizioCard, CtaContatti],
  template: `
    <section class="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <h1 class="text-3xl font-extrabold text-slate-900 md:text-4xl">Servizi di impiantistica a {{ site.indirizzo.citta }}</h1>
      <p class="mt-3 max-w-2xl text-lg text-slate-600">
        Installazione e sostituzione di caldaie, rinnovo bagno e climatizzazione per case e attività a {{ site.zonaServita }}.
      </p>
      <ul class="mt-10 grid gap-6 sm:grid-cols-2">
        @for (servizio of servizi(); track servizio.slug) {
          <li><app-servizio-card [servizio]="servizio" /></li>
        } @empty {
          <li class="text-slate-600">Servizi momentaneamente non disponibili.</li>
        }
      </ul>
    </section>
    <app-cta-contatti />
  `,
})
export default class Servizi {
  readonly servizi = input<Servizio[]>([]);

  protected readonly site = SITE;

  constructor() {
    const seo = inject(Seo);
    effect(() => {
      seo.aggiorna({
        title: `Servizi di Impiantistica a ${SITE.indirizzo.citta} | ${SITE.nome}`,
        description: `Caldaie, caldaie a condensazione, rinnovo bagno e condizionatori a ${SITE.zonaServita}. Scopri tutti i servizi di ${SITE.nome}.`,
        path: '/servizi',
        jsonLd: aziendaJsonLd(this.servizi()),
      });
    });
  }
}
