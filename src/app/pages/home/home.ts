import { Component, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Servizio } from '../../core/servizi-api';
import { Seo } from '../../core/seo';
import { ANNI_ESPERIENZA, SITE } from '../../core/site.config';
import { aziendaJsonLd } from '../../core/structured-data';
import { ComeLavoriamo } from '../../shared/come-lavoriamo';
import { CtaContatti } from '../../shared/cta-contatti';
import { ServizioCard } from '../../shared/servizio-card';

type Icona = 'scudo' | 'documento' | 'posizione' | 'garanzia';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ServizioCard, CtaContatti, ComeLavoriamo],
  template: `
    <!-- Apertura -->
    <section class="relative overflow-hidden bg-gradient-to-br from-blue-950 to-blue-900 text-white">
      <div class="griglia-punti pointer-events-none absolute inset-0" aria-hidden="true"></div>
      <div class="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:py-24 lg:grid-cols-[1fr_22rem]">
        <div>
          <!-- ingresso alla prima apertura (classi intro-* in styles.css): il titolo resta visibile da subito -->
          <p class="intro-voce font-semibold tracking-wide text-orange-300 uppercase">
            Impiantistica a {{ site.indirizzo.citta }} dal {{ site.attivitaDal }}
          </p>
          <h1 class="intro-titolo mt-3 max-w-3xl text-4xl leading-tight font-bold md:text-5xl">
            Caldaie, bagni e climatizzazione: installati a regola d'arte
          </h1>
          <p class="intro-voce mt-5 max-w-2xl text-lg text-blue-100 [--ritardo:120ms]">
            Da {{ anni }} anni {{ site.nome }} installa caldaie tradizionali e a condensazione, rinnova bagni e monta
            condizionatori a {{ site.zonaServita }}.
          </p>
          <div class="intro-voce mt-8 flex flex-col gap-3 sm:flex-row [--ritardo:220ms]">
            <a routerLink="/contatti" class="pulsante rounded-lg bg-orange-700 px-6 py-3 text-center font-semibold hover:bg-orange-800">
              Richiedi un preventivo gratuito <span class="freccia" aria-hidden="true">→</span>
            </a>
            <a routerLink="/servizi" class="pulsante rounded-lg border border-white/40 px-6 py-3 text-center font-semibold hover:bg-white/10">
              Scopri i servizi
            </a>
          </div>
          <ul class="intro-voce mt-8 grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-blue-100 sm:flex sm:flex-row sm:flex-wrap sm:gap-x-6 [--ritardo:320ms]">
            @for (voce of garanzie; track voce) {
              <li class="flex items-start gap-2">
                <svg class="size-5 shrink-0 text-orange-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
                {{ voce }}
              </li>
            }
          </ul>
        </div>

        <!-- Elemento grafico del marchio (solo schermi grandi: sui telefoni conta la velocità) -->
        <!-- Animazioni in CSS (styles.css): onde, orbite, goccia che galleggia, fiamma che tremola.
             Tutto fermo con "riduci movimento" attivo nel sistema operativo. -->
        <div class="relative hidden aspect-square lg:block" aria-hidden="true">
          <!-- onde e orbite: compaiono per prime all'ingresso -->
          <div class="intro-grafica absolute inset-0">
            <!-- onde d'acqua che si allargano -->
            <div class="anim-onda absolute inset-10 rounded-full border border-blue-300/40"></div>
            <div class="anim-onda absolute inset-10 rounded-full border border-blue-300/40 [animation-delay:-1.6s]"></div>
            <div class="anim-onda absolute inset-10 rounded-full border border-blue-300/40 [animation-delay:-3.2s]"></div>

            <!-- orbite con i punti luminosi -->
            <div class="absolute inset-0 rounded-full border border-white/10"></div>
            <div class="anim-orbita absolute inset-0">
              <span class="absolute top-0 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-400 shadow-[0_0_14px_4px_rgba(251,146,60,0.6)]"></span>
            </div>
            <div class="absolute inset-8 rounded-full border border-white/10"></div>
            <div class="anim-orbita-inversa absolute inset-8">
              <span class="absolute bottom-0 left-1/2 size-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-blue-300 shadow-[0_0_12px_3px_rgba(147,197,253,0.6)]"></span>
            </div>
            <div class="absolute inset-16 rounded-full bg-white/5"></div>
          </div>

          <!-- simbolo: la goccia entra con un rimbalzo e poi galleggia; la fiamma si accende e poi tremola -->
          <div class="intro-goccia absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 64 64" class="anim-galleggia size-44 drop-shadow-[0_10px_30px_rgba(59,130,246,0.45)]">
              <path d="M32 5 C32 5 12 27 12 40 A20 20 0 0 0 52 40 C52 27 32 5 32 5 Z" fill="#3b82f6" />
              <g class="intro-fiamma">
                <path class="anim-fiamma" d="M32 24 C34 30 42 33 42 42 A10 10 0 0 1 22 42 C22 37 25 34 27 32 C27 36 29 38 31 38 C29 33 30 28 32 24 Z" fill="#fb923c" />
              </g>
            </svg>
          </div>

          <!-- sigillo esperienza (decorativo: la stessa informazione è nel testo) -->
          <div class="anim-sigillo absolute right-2 bottom-6 flex size-28 flex-col items-center justify-center rounded-full bg-orange-700 text-center ring-4 ring-blue-950">
            <span class="font-display text-4xl leading-none font-bold">{{ anni }}</span>
            <span class="mt-1 text-xs leading-tight font-semibold uppercase">anni di<br />esperienza</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Servizi -->
    <section class="mx-auto max-w-6xl px-4 py-12 md:py-20" aria-labelledby="titolo-servizi">
      <!-- intestazione centrata su telefono, allineata a sinistra da tablet in su -->
      <div class="text-center sm:text-left">
        <p class="font-semibold tracking-wide text-orange-700 uppercase">Cosa facciamo</p>
        <h2 id="titolo-servizi" class="mt-2 text-3xl font-bold text-blue-950 md:text-4xl">I nostri servizi</h2>
        <span class="mx-auto mt-4 block h-1 w-12 rounded-full bg-orange-500 sm:mx-0" aria-hidden="true"></span>
        <p class="mx-auto mt-4 max-w-md text-slate-600 sm:mx-0 sm:max-w-2xl">
          Dal sopralluogo alla certificazione, seguiamo ogni lavoro dall'inizio alla fine.
        </p>
      </div>
      <ul class="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-6 md:mt-10 lg:grid-cols-4">
        @for (servizio of servizi(); track servizio.slug) {
          <li class="rivela"><app-servizio-card [servizio]="servizio" /></li>
        } @empty {
          <li class="text-slate-600">Servizi momentaneamente non disponibili.</li>
        }
        <!-- card d'invito: completa la riga (3 servizi + questa = 4 colonne, 2x2 su tablet) -->
        <li class="rivela">
          <div class="premi relative flex h-full flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900 to-blue-950 p-6 text-white shadow-sm">
            <svg viewBox="0 0 64 64" class="pointer-events-none absolute -right-8 -bottom-10 size-40 opacity-10" aria-hidden="true">
              <path d="M32 5 C32 5 12 27 12 40 A20 20 0 0 0 52 40 C52 27 32 5 32 5 Z" fill="#ffffff" />
            </svg>
            <span class="relative inline-flex size-12 items-center justify-center rounded-xl bg-white/10 text-orange-300" aria-hidden="true">
              <svg class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <!-- fumetto con punto di domanda -->
                <path d="M21 12a8.5 8.5 0 0 1-12.4 7.6L3.5 21l1.4-4.8A8.5 8.5 0 1 1 21 12z" />
                <path d="M9.8 9.6a2.3 2.3 0 1 1 3.2 2.1c-.6.3-1 .8-1 1.4v.4M12 16.4h.01" />
              </svg>
            </span>
            <h3 class="relative mt-4 text-lg font-bold">Hai un'esigenza diversa?</h3>
            <p class="relative mt-2 flex-1 text-blue-100">
              Manutenzione, riparazioni o un impianto su misura: raccontaci cosa ti serve.
            </p>
            <a routerLink="/contatti"
              class="pulsante relative mt-5 block rounded-lg bg-orange-700 px-4 py-2.5 text-center font-semibold hover:bg-orange-800">
              Chiedi un preventivo <span class="freccia" aria-hidden="true">→</span>
            </a>
            <a routerLink="/catalogo" class="relative mt-3 text-center text-sm font-semibold text-blue-200 hover:text-white hover:underline">
              oppure sfoglia il catalogo
            </a>
          </div>
        </li>
      </ul>
    </section>

    <!-- Perché sceglierci -->
    <section class="bg-slate-100" aria-labelledby="titolo-perche">
      <div class="mx-auto max-w-6xl px-4 py-12 md:py-20">
        <div class="text-center sm:text-left">
          <p class="font-semibold tracking-wide text-orange-700 uppercase">Perché noi</p>
          <h2 id="titolo-perche" class="mt-2 text-3xl font-bold text-blue-950 md:text-4xl">Perché scegliere {{ site.nome }}</h2>
          <span class="mx-auto mt-4 block h-1 w-12 rounded-full bg-orange-500 sm:mx-0" aria-hidden="true"></span>
        </div>
        <!-- su telefono: icona e titolo sulla stessa riga, testo sotto a tutta larghezza; da tablet in su: card -->
        <ul class="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-6 md:mt-10 lg:grid-cols-4">
          @for (punto of puntiDiForza; track punto.titolo) {
            <li class="rivela rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-6">
              <div class="flex items-center gap-3 sm:block">
              <span class="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-800 sm:size-12" aria-hidden="true">
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
                <h3 class="text-lg font-bold text-slate-900 sm:mt-4">{{ punto.titolo }}</h3>
              </div>
              <p class="mt-2 text-slate-600">{{ punto.testo }}</p>
            </li>
          }
        </ul>
      </div>
    </section>

    <app-come-lavoriamo />

    <app-cta-contatti />
  `,
})
export default class Home {
  /** Dal resolver della route. */
  readonly servizi = input<Servizio[]>([]);

  protected readonly site = SITE;

  protected readonly anni = ANNI_ESPERIENZA;

  protected readonly garanzie = [
    `${ANNI_ESPERIENZA} anni di esperienza`,
    'Sopralluogo gratuito',
    'Impianti certificati',
    'Aiuto con le detrazioni fiscali',
  ];

  protected readonly puntiDiForza: { icona: Icona; titolo: string; testo: string }[] = [
    {
      icona: 'scudo',
      titolo: `${ANNI_ESPERIENZA} anni di esperienza`,
      testo: `Nel settore dal ${SITE.attivitaDal}: tecnici qualificati e installazioni a norma, con dichiarazione di conformità.`,
    },
    { icona: 'documento', titolo: 'Preventivi chiari', testo: 'Ogni voce dettagliata, IVA indicata a parte e totale chiaro: niente sorprese a fine lavori.' },
    { icona: 'garanzia', titolo: 'Lavori garantiti', testo: 'Garanzia sui lavori eseguiti e assistenza anche dopo l’installazione.' },
    { icona: 'posizione', titolo: 'Vicini a te', testo: `Operiamo a ${SITE.zonaServita}, con interventi rapidi.` },
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
