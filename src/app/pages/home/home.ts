import { Component, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Servizio } from '../../core/servizi-api';
import { Seo } from '../../core/seo';
import { ANNI_ESPERIENZA, SITE, TELEFONO_LINK } from '../../core/site.config';
import { aziendaJsonLd } from '../../core/structured-data';
import { CardEsigenza } from '../../shared/card-esigenza';
import { ComeLavoriamo } from '../../shared/come-lavoriamo';
import { CtaContatti } from '../../shared/cta-contatti';
import { ServizioCard } from '../../shared/servizio-card';

type Icona = 'scudo' | 'documento' | 'posizione' | 'garanzia';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ServizioCard, CtaContatti, ComeLavoriamo, CardEsigenza],
  template: `
    <!-- Apertura -->
    <section class="relative overflow-hidden bg-gradient-to-br from-blue-950 to-blue-900 text-white">
      <div class="griglia-punti pointer-events-none absolute inset-0" aria-hidden="true"></div>
      <!-- goccia del marchio in filigrana: su telefono sostituisce il simbolo animato (solo schermi grandi) -->
      <svg viewBox="0 0 64 64" class="pointer-events-none absolute -right-16 bottom-24 size-72 opacity-[0.06] lg:hidden" aria-hidden="true">
        <path d="M32 5 C32 5 12 27 12 40 A20 20 0 0 0 52 40 C52 27 32 5 32 5 Z" fill="#ffffff" />
      </svg>
      <div class="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pt-10 pb-12 sm:px-4 md:py-24 lg:grid-cols-[1fr_22rem]">
        <div>
          <!-- ingresso alla prima apertura (classi intro-* in styles.css): il titolo resta visibile da subito -->
          <p class="intro-voce inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-semibold text-orange-200 ring-1 ring-white/15">
            <span class="relative flex size-2" aria-hidden="true">
              <span class="anim-punto absolute inset-0 rounded-full bg-orange-400"></span>
              <span class="relative size-2 rounded-full bg-orange-400"></span>
            </span>
            Dal {{ site.attivitaDal }} · {{ site.zonaServita }}
          </p>
          <h1 class="intro-titolo mt-5 max-w-3xl text-[2.35rem] leading-[1.08] font-bold tracking-tight sm:text-5xl sm:leading-tight">
            Caldaie, bagni e climatizzazione
            <span class="evidenza">a regola d'arte</span>
          </h1>
          <p class="intro-voce mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-blue-100 sm:text-lg [--ritardo:120ms]">
            Da {{ anni }} anni installiamo caldaie e condizionatori e rinnoviamo bagni a {{ site.zonaServita }}.
            Un solo referente, dal sopralluogo alla certificazione.
          </p>
          <div class="intro-voce mt-8 flex flex-col gap-3 sm:flex-row [--ritardo:220ms]">
            <a routerLink="/contatti"
              class="pulsante rounded-xl bg-orange-700 px-6 py-4 text-center text-lg font-semibold shadow-lg shadow-orange-950/30 hover:bg-orange-800 sm:rounded-lg sm:py-3 sm:text-base">
              Richiedi un preventivo gratuito <span class="freccia" aria-hidden="true">→</span>
            </a>
            <!-- su telefono chiamare è più utile che scorrere ai servizi (che sono subito sotto) -->
            <a [href]="telefonoLink"
              class="pulsante flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/5 px-6 py-3.5 font-semibold hover:bg-white/10 sm:hidden">
              <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" aria-hidden="true">
                <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
              </svg>
              Chiama ora
            </a>
            <a routerLink="/servizi" class="pulsante hidden rounded-lg border border-white/40 px-6 py-3 text-center font-semibold hover:bg-white/10 sm:block">
              Scopri i servizi
            </a>
          </div>

          <!-- garanzie: riquadro in vetro smerigliato, griglia 2x2 su telefono e 4 colonne da tablet in su -->
          <ul class="intro-voce mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur-sm sm:grid-cols-4 [--ritardo:320ms]">
            @for (g of garanzie; track g.titolo) {
              <li class="flex items-center gap-3 bg-blue-950/40 px-3.5 py-3.5">
                <span class="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-orange-300" aria-hidden="true">
                  <svg class="size-[1.1rem]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path [attr.d]="g.icona" />
                  </svg>
                </span>
                <span class="min-w-0 leading-tight">
                  <span class="block text-sm font-bold text-white">{{ g.titolo }}</span>
                  <span class="block text-xs text-blue-200">{{ g.sotto }}</span>
                </span>
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
        <li class="rivela"><app-card-esigenza /></li>
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

  protected readonly telefonoLink = TELEFONO_LINK;

  /** Garanzie nell'apertura: parola forte + riga di spiegazione, con icona (viewBox 24x24). */
  protected readonly garanzie = [
    { titolo: `${ANNI_ESPERIENZA} anni`, sotto: 'di esperienza', icona: 'M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3zM9 12l2 2 4-4' },
    { titolo: 'Sopralluogo', sotto: 'gratuito', icona: 'M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6' },
    { titolo: 'Impianti', sotto: 'certificati', icona: 'M7 3h7l5 5v13H7zM14 3v5h5M10 14l2 2 4-4' },
    { titolo: 'Detrazioni', sotto: 'ti aiutiamo noi', icona: 'M19 5L5 19M7.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM16.5 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z' },
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
