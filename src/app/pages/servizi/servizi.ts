import { Component, effect, inject, input } from '@angular/core';
import { Servizio } from '../../core/servizi-api';
import { Seo } from '../../core/seo';
import { ANNI_ESPERIENZA, SITE } from '../../core/site.config';
import { aziendaJsonLd } from '../../core/structured-data';
import { CtaContatti } from '../../shared/cta-contatti';
import { IntestazionePagina } from '../../shared/intestazione-pagina';
import { ServizioCard } from '../../shared/servizio-card';

@Component({
  selector: 'app-servizi',
  imports: [ServizioCard, CtaContatti, IntestazionePagina],
  template: `
    <app-intestazione-pagina
      [etichetta]="'I nostri servizi · ' + anni + ' anni di esperienza'"
      [titolo]="'Servizi di impiantistica a ' + site.indirizzo.citta"
      [sottotitolo]="'Installazione e sostituzione di caldaie, rinnovo bagno e climatizzazione per case e attività a ' + site.zonaServita + '.'"
    />
    <section class="mx-auto max-w-6xl px-4 py-12 md:py-16" aria-label="Elenco dei servizi">
      <ul class="grid gap-6 sm:grid-cols-2">
        @for (servizio of servizi(); track servizio.slug) {
          <li class="rivela"><app-servizio-card [servizio]="servizio" /></li>
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
  protected readonly anni = ANNI_ESPERIENZA;

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
