import { Component, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Servizio } from '../../core/servizi-api';
import { Seo } from '../../core/seo';
import { SITE } from '../../core/site.config';
import { aziendaJsonLd } from '../../core/structured-data';
import { CtaContatti } from '../../shared/cta-contatti';
import { ServizioCard } from '../../shared/servizio-card';

type Icona = 'scudo' | 'documento' | 'posizione' | 'garanzia';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ServizioCard, CtaContatti],
  template: `
    <!-- Apertura -->
    <section class="relative overflow-hidden bg-gradient-to-br from-blue-950 to-blue-900 text-white">
      <div class="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:py-24 lg:grid-cols-[1fr_22rem]">
        <div>
          <p class="font-semibold tracking-wide text-orange-300 uppercase">Impiantistica a {{ site.indirizzo.citta }}</p>
          <h1 class="mt-3 max-w-3xl text-4xl leading-tight font-bold md:text-5xl">
            Caldaie, bagni e climatizzazione: installati a regola d'arte
          </h1>
          <p class="mt-5 max-w-2xl text-lg text-blue-100">
            {{ site.nome }} installa caldaie tradizionali e a condensazione, rinnova bagni e monta condizionatori a
            {{ site.zonaServita }}.
          </p>
          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <a routerLink="/contatti" class="rounded-lg bg-orange-700 px-6 py-3 text-center font-semibold hover:bg-orange-800">
              Richiedi un preventivo gratuito
            </a>
            <a routerLink="/servizi" class="rounded-lg border border-white/40 px-6 py-3 text-center font-semibold hover:bg-white/10">
              Scopri i servizi
            </a>
          </div>
          <ul class="mt-8 flex flex-col gap-2 text-sm text-blue-100 sm:flex-row sm:flex-wrap sm:gap-x-6">
            @for (voce of garanzie; track voce) {
              <li class="flex items-center gap-2">
                <svg class="size-5 shrink-0 text-orange-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
                {{ voce }}
              </li>
            }
          </ul>
        </div>

        <!-- Elemento grafico del marchio (solo schermi grandi: sui telefoni conta la velocità) -->
        <div class="relative hidden aspect-square lg:block" aria-hidden="true">
          <div class="absolute inset-0 rounded-full border border-white/10"></div>
          <div class="absolute inset-8 rounded-full border border-white/10"></div>
          <div class="absolute inset-16 rounded-full bg-white/5"></div>
          <svg viewBox="0 0 64 64" class="absolute inset-0 m-auto size-44">
            <path d="M32 5 C32 5 12 27 12 40 A20 20 0 0 0 52 40 C52 27 32 5 32 5 Z" fill="#3b82f6" />
            <path d="M32 24 C34 30 42 33 42 42 A10 10 0 0 1 22 42 C22 37 25 34 27 32 C27 36 29 38 31 38 C29 33 30 28 32 24 Z" fill="#fb923c" />
          </svg>
        </div>
      </div>
    </section>

    <!-- Servizi -->
    <section class="mx-auto max-w-6xl px-4 py-16 md:py-20" aria-labelledby="titolo-servizi">
      <p class="font-semibold tracking-wide text-orange-700 uppercase">Cosa facciamo</p>
      <h2 id="titolo-servizi" class="mt-2 text-3xl font-bold text-blue-950 md:text-4xl">I nostri servizi</h2>
      <p class="mt-3 max-w-2xl text-slate-600">Dal sopralluogo alla certificazione, seguiamo ogni lavoro dall'inizio alla fine.</p>
      <ul class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        @for (servizio of servizi(); track servizio.slug) {
          <li><app-servizio-card [servizio]="servizio" /></li>
        } @empty {
          <li class="text-slate-600">Servizi momentaneamente non disponibili.</li>
        }
      </ul>
    </section>

    <!-- Perché sceglierci -->
    <section class="bg-slate-100" aria-labelledby="titolo-perche">
      <div class="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <p class="font-semibold tracking-wide text-orange-700 uppercase">Perché noi</p>
        <h2 id="titolo-perche" class="mt-2 text-3xl font-bold text-blue-950 md:text-4xl">Perché scegliere {{ site.nome }}</h2>
        <ul class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          @for (punto of puntiDiForza; track punto.titolo) {
            <li class="rounded-2xl bg-white p-6 shadow-sm">
              <span class="inline-flex size-12 items-center justify-center rounded-xl bg-blue-50 text-blue-800" aria-hidden="true">
                <svg class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  @switch (punto.icona) {
                    @case ('scudo') {
                      <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z" /><path d="M9 12l2 2 4-4" />
                    }
                    @case ('documento') {
                      <path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5" /><path d="M10 13h6M10 17h6" />
                    }
                    @case ('posizione') {
                      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" />
                    }
                    @case ('garanzia') {
                      <circle cx="12" cy="9" r="5.5" /><path d="M9 13.8L8 21l4-2 4 2-1-7.2" />
                    }
                  }
                </svg>
              </span>
              <h3 class="mt-4 text-lg font-bold text-slate-900">{{ punto.titolo }}</h3>
              <p class="mt-2 text-slate-600">{{ punto.testo }}</p>
            </li>
          }
        </ul>
      </div>
    </section>

    <!-- Come lavoriamo -->
    <section class="mx-auto max-w-6xl px-4 py-16 md:py-20" aria-labelledby="titolo-come">
      <p class="font-semibold tracking-wide text-orange-700 uppercase">Semplice e trasparente</p>
      <h2 id="titolo-come" class="mt-2 text-3xl font-bold text-blue-950 md:text-4xl">Come lavoriamo</h2>
      <ol class="mt-10 grid gap-8 md:grid-cols-4">
        @for (passo of passi; track passo.titolo; let i = $index, ultimo = $last) {
          <li class="relative">
            <!-- linea di collegamento tra i passi (solo su schermi larghi) -->
            @if (!ultimo) {
              <span class="absolute top-6 left-14 hidden h-0.5 w-[calc(100%-3rem)] bg-slate-200 md:block" aria-hidden="true"></span>
            }
            <span class="font-display relative inline-flex size-12 items-center justify-center rounded-full bg-orange-700 text-lg font-bold text-white">
              {{ i + 1 }}
            </span>
            <h3 class="mt-4 text-lg font-bold text-slate-900">{{ passo.titolo }}</h3>
            <p class="mt-2 text-slate-600">{{ passo.testo }}</p>
          </li>
        }
      </ol>
    </section>

    <app-cta-contatti />
  `,
})
export default class Home {
  /** Dal resolver della route. */
  readonly servizi = input<Servizio[]>([]);

  protected readonly site = SITE;

  protected readonly garanzie = ['Sopralluogo gratuito', 'Impianti certificati', 'Aiuto con le detrazioni fiscali'];

  protected readonly puntiDiForza: { icona: Icona; titolo: string; testo: string }[] = [
    { icona: 'scudo', titolo: 'Tecnici qualificati', testo: 'Installazioni a norma con dichiarazione di conformità per ogni impianto.' },
    { icona: 'documento', titolo: 'Preventivi chiari', testo: 'Ogni voce dettagliata, IVA indicata a parte e totale chiaro: niente sorprese a fine lavori.' },
    { icona: 'garanzia', titolo: 'Lavori garantiti', testo: 'Garanzia sui lavori eseguiti e assistenza anche dopo l’installazione.' },
    { icona: 'posizione', titolo: 'Vicini a te', testo: `Operiamo a ${SITE.zonaServita}, con interventi rapidi.` },
  ];

  protected readonly passi = [
    { titolo: 'Ci contatti', testo: 'Compila il modulo online o chiamaci: ti rispondiamo in giornata.' },
    { titolo: 'Sopralluogo gratuito', testo: 'Veniamo a vedere l’impianto e ascoltiamo cosa ti serve.' },
    { titolo: 'Preventivo chiaro', testo: 'Ricevi il preventivo via email e puoi accettarlo online in un clic.' },
    { titolo: 'Lavori e certificazione', testo: 'Installiamo a regola d’arte e ti consegniamo la documentazione.' },
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
