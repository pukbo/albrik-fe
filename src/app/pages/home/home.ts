import { Component, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Servizio } from '../../core/servizi-api';
import { Seo } from '../../core/seo';
import { SITE } from '../../core/site.config';
import { aziendaJsonLd } from '../../core/structured-data';
import { CtaContatti } from '../../shared/cta-contatti';
import { ServizioCard } from '../../shared/servizio-card';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ServizioCard, CtaContatti],
  template: `
    <section class="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white">
      <div class="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <p class="font-semibold tracking-wide text-orange-300 uppercase">Impiantistica a {{ site.indirizzo.citta }}</p>
        <h1 class="mt-3 max-w-3xl text-3xl leading-tight font-extrabold md:text-5xl">
          Caldaie, bagni e climatizzazione: installati a regola d'arte
        </h1>
        <p class="mt-4 max-w-2xl text-lg text-blue-100">
          {{ site.nome }} installa caldaie tradizionali e a condensazione, rinnova bagni e monta condizionatori a
          {{ site.zonaServita }}.
        </p>
        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          <a routerLink="/contatti" class="rounded-lg bg-orange-700 px-6 py-3 text-center font-semibold hover:bg-orange-800">
            Richiedi un preventivo
          </a>
          <a routerLink="/servizi" class="rounded-lg border border-white/40 px-6 py-3 text-center font-semibold hover:bg-white/10">
            Scopri i servizi
          </a>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-4 py-16" aria-labelledby="titolo-servizi">
      <h2 id="titolo-servizi" class="text-2xl font-bold text-slate-900 md:text-3xl">I nostri servizi</h2>
      <p class="mt-2 text-slate-600">Dal sopralluogo alla certificazione, seguiamo ogni lavoro dall'inizio alla fine.</p>
      <ul class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        @for (servizio of servizi(); track servizio.slug) {
          <li><app-servizio-card [servizio]="servizio" /></li>
        } @empty {
          <li class="text-slate-600">Servizi momentaneamente non disponibili.</li>
        }
      </ul>
    </section>

    <section class="bg-slate-50" aria-labelledby="titolo-perche">
      <div class="mx-auto max-w-6xl px-4 py-16">
        <h2 id="titolo-perche" class="text-2xl font-bold text-slate-900 md:text-3xl">Perché scegliere {{ site.nome }}</h2>
        <ul class="mt-8 grid gap-6 md:grid-cols-3">
          @for (punto of puntiDiForza; track punto.titolo) {
            <li class="rounded-2xl bg-white p-6 shadow-sm">
              <h3 class="font-bold text-slate-900">{{ punto.titolo }}</h3>
              <p class="mt-2 text-slate-600">{{ punto.testo }}</p>
            </li>
          }
        </ul>
      </div>
    </section>

    <app-cta-contatti />
  `,
})
export default class Home {
  /** Dal resolver della route. */
  readonly servizi = input<Servizio[]>([]);

  protected readonly site = SITE;
  protected readonly puntiDiForza = [
    { titolo: 'Tecnici qualificati', testo: 'Installazioni a norma con dichiarazione di conformità per ogni impianto.' },
    { titolo: 'Preventivi chiari', testo: 'Sopralluogo gratuito e preventivo dettagliato, senza sorprese.' },
    { titolo: 'Vicini a te', testo: `Operiamo a ${SITE.zonaServita}, con interventi rapidi.` },
  ];

  constructor() {
    const seo = inject(Seo);
    effect(() => {
      seo.aggiorna({
        title: `${SITE.nome} | Caldaie, Bagni e Condizionatori a ${SITE.indirizzo.citta}`,
        description: `${SITE.descrizione} Sopralluogo e preventivo gratuiti.`,
        path: '/',
        jsonLd: aziendaJsonLd(this.servizi()),
      });
    });
  }
}
