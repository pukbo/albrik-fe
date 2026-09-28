import { Component, effect, inject, input } from '@angular/core';
import { Servizio } from '../../core/servizi-api';
import { Seo } from '../../core/seo';
import { ANNI_ESPERIENZA, SITE } from '../../core/site.config';
import { aziendaJsonLd } from '../../core/structured-data';
import { CardEsigenza } from '../../shared/card-esigenza';
import { ComeLavoriamo } from '../../shared/come-lavoriamo';
import { CtaContatti } from '../../shared/cta-contatti';
import { IntestazionePagina } from '../../shared/intestazione-pagina';
import { ServizioCard } from '../../shared/servizio-card';

@Component({
  selector: 'app-servizi',
  imports: [ServizioCard, CtaContatti, IntestazionePagina, CardEsigenza, ComeLavoriamo],
  template: `
    <app-intestazione-pagina
      [etichetta]="'I nostri servizi · dal ' + site.attivitaDal"
      [titolo]="'Servizi di impiantistica a ' + site.indirizzo.citta"
      [sottotitolo]="'Installazione e sostituzione di caldaie, rinnovo bagno e climatizzazione per case e attività a ' + site.zonaServita + '.'"
    />
    <section class="mx-auto max-w-6xl px-4 py-10 md:py-16" aria-label="Elenco dei servizi">
      <ul class="grid gap-4 sm:grid-cols-2 sm:gap-6">
        @for (servizio of servizi(); track servizio.slug) {
          <li class="rivela"><app-servizio-card [servizio]="servizio" /></li>
        } @empty {
          <li class="text-slate-600">Servizi momentaneamente non disponibili.</li>
        }
        <li class="rivela"><app-card-esigenza /></li>
      </ul>
    </section>
    <app-come-lavoriamo />
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
