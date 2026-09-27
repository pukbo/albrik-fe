import { Component, inject, input } from '@angular/core';
import { Servizio } from '../../core/servizi-api';
import { Seo } from '../../core/seo';
import { ANNI_ESPERIENZA, SITE, TELEFONO_LINK } from '../../core/site.config';
import { aziendaJsonLd } from '../../core/structured-data';
import { IntestazionePagina } from '../../shared/intestazione-pagina';
import { ModuloPreventivo } from '../../shared/modulo-preventivo';

@Component({
  selector: 'app-contatti',
  imports: [ModuloPreventivo, IntestazionePagina],
  template: `
    <app-intestazione-pagina
      etichetta="Preventivo gratuito"
      titolo="Contatti e preventivi"
      [sottotitolo]="'Compila il modulo per un sopralluogo gratuito a ' + site.zonaServita + ', oppure chiamaci o scrivici direttamente.'"
    />
    <section class="mx-auto max-w-6xl px-4 py-12 md:py-16" aria-label="Modulo e recapiti">
      <div class="grid gap-10 lg:grid-cols-3">
        <div class="entra rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 lg:col-span-2">
          <app-modulo-preventivo [servizi]="servizi()" [servizioIniziale]="servizio()" [prodottoIniziale]="prodotto()" />
        </div>

        <aside class="entra space-y-4 [animation-delay:150ms]" aria-label="Recapiti">
          <a [href]="telefonoLink" class="flex gap-4 rounded-2xl border border-slate-200 p-6 hover:border-blue-300 hover:bg-blue-50">
            <span class="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-800" aria-hidden="true">
              <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
              </svg>
            </span>
            <span>
              <span class="block font-bold text-slate-900">Telefono</span>
              <span class="mt-1 block text-blue-800">{{ site.telefono }}</span>
            </span>
          </a>
          <a [href]="'mailto:' + site.email" class="flex gap-4 rounded-2xl border border-slate-200 p-6 hover:border-blue-300 hover:bg-blue-50">
            <span class="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-800" aria-hidden="true">
              <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" />
              </svg>
            </span>
            <span class="min-w-0">
              <span class="block font-bold text-slate-900">Email</span>
              <span class="mt-1 block break-all text-blue-800">{{ site.email }}</span>
            </span>
          </a>
          <div class="flex gap-4 rounded-2xl border border-slate-200 p-6">
            <span class="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-800" aria-hidden="true">
              <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" />
              </svg>
            </span>
            <span>
              <span class="block font-bold text-slate-900">Sede</span>
              <address class="mt-1 text-slate-700 not-italic">
                {{ site.indirizzo.via }}<br />
                {{ site.indirizzo.cap }} {{ site.indirizzo.citta }} ({{ site.indirizzo.provincia }})
              </address>
            </span>
          </div>
          <p class="rounded-2xl bg-slate-100 p-6 text-sm text-slate-700">
            <span class="font-display block text-2xl font-bold text-blue-950">Dal {{ site.attivitaDal }}</span>
            {{ anni }} anni di impianti a {{ site.zonaServita }}.
          </p>
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
  /** Query param ?prodotto=slug per preselezionare il modello del catalogo. */
  readonly prodotto = input<string>();

  protected readonly site = SITE;
  protected readonly anni = ANNI_ESPERIENZA;
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
