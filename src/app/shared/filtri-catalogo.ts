import { Component, DOCUMENT, computed, effect, inject, input, model, signal } from '@angular/core';
import {
  FILTRI_VUOTI,
  Filtri,
  ORDINAMENTI,
  Ordinamento,
  contaFiltriAttivi,
  opzioniFiltri,
} from '../core/filtri-catalogo';
import { Prodotto } from '../core/prodotti-api';

type Elenco = 'marche' | 'potenze' | 'classi';

interface Etichetta {
  testo: string;
  togli: Partial<Filtri>;
}

/**
 * Barra dei filtri del catalogo: ricerca, pulsante "Filtri" e ordinamento, filtri attivi come
 * etichette rimovibili. Il pannello si apre dal basso su telefono (come nelle app) e sopra la
 * griglia da tablet in su. Le opzioni si ricavano dai modelli presenti.
 */
@Component({
  selector: 'app-filtri-catalogo',
  host: { '(document:keydown.escape)': 'aperto.set(false)' },
  template: `
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <label class="relative flex-1">
        <span class="sr-only">Cerca marca o modello</span>
        <svg class="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
        </svg>
        <input type="search" placeholder="Cerca marca o modello" [value]="filtri().q" (input)="imposta({ q: testo($event) })"
          class="w-full rounded-xl border border-slate-300 bg-white py-3 pr-4 pl-11 text-slate-900 focus:border-blue-700 focus:ring-2 focus:ring-blue-200 focus:outline-none" />
      </label>

      <div class="flex gap-3">
        <button type="button" (click)="aperto.set(!aperto())" aria-controls="pannello-filtri" [attr.aria-expanded]="aperto()"
          class="premi inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 font-semibold sm:flex-none"
          [class]="attivi() ? 'border-blue-800 bg-blue-50 text-blue-900' : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'">
          <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" />
          </svg>
          Filtri
          @if (attivi()) {
            <span class="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-800 px-1.5 text-xs text-white">{{ attivi() }}</span>
          }
        </button>

        <label class="relative flex-1 sm:flex-none">
          <span class="sr-only">Ordina per</span>
          <select (change)="imposta({ ordina: $any(testo($event)) })"
            class="w-full appearance-none rounded-xl border border-slate-300 bg-white py-3 pr-10 pl-4 font-semibold text-slate-800 focus:border-blue-700 focus:ring-2 focus:ring-blue-200 focus:outline-none">
            @for (o of ordinamenti; track o.valore) {
              <option [value]="o.valore" [selected]="o.valore === filtri().ordina" [attr.selected]="o.valore === filtri().ordina ? '' : null">
                {{ o.etichetta }}
              </option>
            }
          </select>
          <svg class="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-slate-500" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </label>
      </div>
    </div>

    <!-- risultato e filtri attivi -->
    <div class="mt-3 flex flex-wrap items-center gap-2">
      <p class="mr-auto text-sm text-slate-600" aria-live="polite">
        <span class="font-semibold text-slate-900">{{ risultati() }}</span> {{ risultati() === 1 ? 'modello' : 'modelli' }}
      </p>
      @for (e of etichette(); track e.testo) {
        <button type="button" (click)="imposta(e.togli)" [attr.aria-label]="'Togli il filtro ' + e.testo"
          class="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-900 ring-1 ring-blue-200 hover:bg-blue-100">
          {{ e.testo }}
          <svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      }
      @if (etichette().length || filtri().q) {
        <button type="button" (click)="azzera()" class="inline-flex min-h-9 items-center px-1 text-sm font-semibold text-orange-700 hover:underline">
          Azzera
        </button>
      }
    </div>

    <!-- velo dietro il pannello (solo telefono) -->
    <div class="velo-filtri sm:hidden" [class.aperto]="aperto()" aria-hidden="true" (click)="aperto.set(false)"></div>

    <div id="pannello-filtri" class="pannello-filtri" [class.aperto]="aperto()" [attr.inert]="aperto() ? null : ''"
      role="region" aria-label="Filtri">
      <!-- testata del pannello (solo telefono) -->
      <div class="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3 sm:hidden">
        <span class="absolute top-2 left-1/2 h-1.5 w-10 -translate-x-1/2 rounded-full bg-slate-300" aria-hidden="true"></span>
        <p class="pt-2 text-lg font-bold text-slate-900">Filtri</p>
        <button type="button" (click)="aperto.set(false)" class="-mr-2 inline-flex size-11 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100">
          <span class="sr-only">Chiudi i filtri</span>
          <svg class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>

      <div class="grid gap-6 p-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        @if (opzioni().marche.length > 1) {
          <fieldset>
            <legend class="titolo-gruppo">Marca</legend>
            <div class="mt-2.5 flex flex-wrap gap-2">
              @for (o of opzioni().marche; track o.valore) {
                <button type="button" class="chip" [attr.aria-pressed]="filtri().marche.includes(o.valore)" (click)="alterna('marche', o.valore)">
                  {{ o.etichetta }} <span class="conteggio">{{ o.conteggio }}</span>
                </button>
              }
            </div>
          </fieldset>
        }
        @if (opzioni().potenze.length > 1) {
          <fieldset>
            <legend class="titolo-gruppo">Potenza</legend>
            <div class="mt-2.5 flex flex-wrap gap-2">
              @for (o of opzioni().potenze; track o.valore) {
                <button type="button" class="chip" [attr.aria-pressed]="filtri().potenze.includes(o.valore)" (click)="alterna('potenze', o.valore)">
                  {{ o.etichetta }} <span class="conteggio">{{ o.conteggio }}</span>
                </button>
              }
            </div>
          </fieldset>
        }
        @if (opzioni().classi.length > 1) {
          <fieldset>
            <legend class="titolo-gruppo">Classe energetica</legend>
            <div class="mt-2.5 flex flex-wrap gap-2">
              @for (o of opzioni().classi; track o.valore) {
                <button type="button" class="chip" [attr.aria-pressed]="filtri().classi.includes(o.valore)" (click)="alterna('classi', o.valore)">
                  {{ o.etichetta }} <span class="conteggio">{{ o.conteggio }}</span>
                </button>
              }
            </div>
          </fieldset>
        }
        <fieldset>
          <legend class="titolo-gruppo">Prezzo</legend>
          <div class="mt-2.5 flex flex-wrap gap-2">
            <button type="button" class="chip" [attr.aria-pressed]="!filtri().prezzoMax" (click)="imposta({ prezzoMax: null })">Qualsiasi</button>
            @for (n of fascePrezzo(); track n) {
              <button type="button" class="chip font-mono" [attr.aria-pressed]="filtri().prezzoMax === n" (click)="imposta({ prezzoMax: n })"
                [attr.aria-label]="'Fino a ' + n + ' su 5'">
                fino a {{ euro(n) }}
              </button>
            }
          </div>
          @if (opzioni().conSmart) {
            <button type="button" role="switch" [attr.aria-checked]="filtri().soloSmart" (click)="imposta({ soloSmart: !filtri().soloSmart })"
              class="mt-5 flex w-full items-center justify-between gap-3 text-left">
              <span>
                <span class="block font-semibold text-slate-900">Solo modelli smart</span>
                <span class="block text-sm text-slate-600">Wi-Fi e controllo da app</span>
              </span>
              <span class="interruttore" [class.acceso]="filtri().soloSmart" aria-hidden="true"><span></span></span>
            </button>
          }
        </fieldset>
      </div>

      <!-- piede del pannello (solo telefono) -->
      <div class="sticky bottom-0 flex gap-3 border-t border-slate-200 bg-white px-5 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:hidden">
        <button type="button" (click)="azzera()" class="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-800">Azzera</button>
        <button type="button" (click)="aperto.set(false)" class="pulsante flex-1 rounded-xl bg-orange-700 py-3 font-semibold text-white">
          Mostra {{ risultati() }} {{ risultati() === 1 ? 'modello' : 'modelli' }}
        </button>
      </div>
    </div>
  `,
  styles: `
    .titolo-gruppo {
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #64748b;
    }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      min-height: 2.5rem;
      padding: 0 0.9rem;
      border-radius: 9999px;
      border: 1px solid #cbd5e1;
      background: white;
      font-size: 0.875rem;
      font-weight: 500;
      color: #1e293b;
      transition:
        background-color 0.15s ease,
        border-color 0.15s ease,
        color 0.15s ease;
    }

    .chip:hover {
      border-color: #93c5fd;
    }

    .chip[aria-pressed='true'] {
      border-color: #1e40af;
      background: #1e40af;
      color: white;
    }

    .conteggio {
      font-size: 0.75rem;
      opacity: 0.6;
    }

    /* interruttore "solo smart" */
    .interruttore {
      position: relative;
      flex-shrink: 0;
      width: 2.75rem;
      height: 1.6rem;
      border-radius: 9999px;
      background: #cbd5e1;
      transition: background-color 0.2s ease;
    }

    .interruttore span {
      position: absolute;
      top: 0.2rem;
      left: 0.2rem;
      width: 1.2rem;
      height: 1.2rem;
      border-radius: 9999px;
      background: white;
      box-shadow: 0 1px 3px rgb(0 0 0 / 0.25);
      transition: transform 0.2s ease;
    }

    .interruttore.acceso {
      background: #1e40af;
    }

    .interruttore.acceso span {
      transform: translateX(1.15rem);
    }

    /* telefono: pannello che sale dal basso, con velo scuro */
    .velo-filtri {
      position: fixed;
      inset: 0;
      z-index: 69;
      background: rgb(15 23 42 / 0.45);
      opacity: 0;
      visibility: hidden;
      transition:
        opacity 0.25s ease,
        visibility 0.25s;
    }

    .velo-filtri.aperto {
      opacity: 1;
      visibility: visible;
    }

    .pannello-filtri {
      position: fixed;
      inset: auto 0 0;
      z-index: 70;
      max-height: 85dvh;
      overflow-y: auto;
      overscroll-behavior: contain;
      border-radius: 1.5rem 1.5rem 0 0;
      background: white;
      box-shadow: 0 -20px 40px -20px rgb(15 23 42 / 0.4);
      transform: translateY(100%);
      visibility: hidden;
      transition:
        transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1),
        visibility 0.35s;
    }

    .pannello-filtri.aperto {
      transform: translateY(0);
      visibility: visible;
    }

    /* da tablet in su: riquadro sopra la griglia, che compare quando si apre */
    @media (min-width: 640px) {
      .pannello-filtri {
        position: static;
        display: none;
        max-height: none;
        margin-top: 1rem;
        border: 1px solid #e2e8f0;
        border-radius: 1rem;
        box-shadow: 0 10px 30px -18px rgb(15 23 42 / 0.3);
        transform: none;
        visibility: visible;
        transition: none;
      }

      .pannello-filtri.aperto {
        display: block;
        animation: comparsa-filtri 0.2s ease;
      }
    }

    @keyframes comparsa-filtri {
      from {
        opacity: 0;
        transform: translateY(-6px);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .velo-filtri,
      .pannello-filtri,
      .interruttore,
      .interruttore span,
      .chip {
        transition: none !important;
      }

      .pannello-filtri.aperto {
        animation: none !important;
      }
    }
  `,
})
export class FiltriCatalogo {
  /** Tutti i modelli della categoria: servono a ricavare le opzioni. */
  readonly prodotti = input.required<Prodotto[]>();
  /** Quanti modelli restano con i filtri attuali. */
  readonly risultati = input.required<number>();
  readonly filtri = model.required<Filtri>();

  protected readonly aperto = signal(false);
  protected readonly ordinamenti = ORDINAMENTI;
  protected readonly opzioni = computed(() => opzioniFiltri(this.prodotti()));
  protected readonly attivi = computed(() => contaFiltriAttivi(this.filtri()));
  /** Fasce "fino a": dalla più economica presente fino alla penultima (l'ultima equivale a "qualsiasi"). */
  protected readonly fascePrezzo = computed(() => {
    const prezzi = this.opzioni().prezzi;
    const max = prezzi.at(-1) ?? 0;
    return [1, 2, 3, 4].filter((n) => n >= (prezzi[0] ?? 1) && n < max);
  });

  /** Filtri attivi come etichette da togliere con la ×. */
  protected readonly etichette = computed<Etichetta[]>(() => {
    const f = this.filtri();
    const o = this.opzioni();
    const nome = (voci: { valore: string; etichetta: string }[], v: string) => voci.find((x) => x.valore === v)?.etichetta ?? v;
    return [
      ...f.marche.map((v) => ({ testo: nome(o.marche, v), togli: { marche: f.marche.filter((x) => x !== v) } })),
      ...f.potenze.map((v) => ({ testo: nome(o.potenze, v), togli: { potenze: f.potenze.filter((x) => x !== v) } })),
      ...f.classi.map((v) => ({ testo: 'Classe ' + v, togli: { classi: f.classi.filter((x) => x !== v) } })),
      ...(f.prezzoMax ? [{ testo: 'Fino a ' + this.euro(f.prezzoMax), togli: { prezzoMax: null } }] : []),
      ...(f.soloSmart ? [{ testo: 'Smart', togli: { soloSmart: false } }] : []),
    ];
  });

  constructor() {
    // su telefono, con il pannello aperto la pagina sotto non scorre (vedi styles.css)
    const documento = inject(DOCUMENT);
    effect(() => documento.documentElement.classList.toggle('filtri-aperti', this.aperto()));
  }

  protected imposta(modifica: Partial<Filtri>): void {
    this.filtri.update((f) => ({ ...f, ...modifica }));
  }

  protected alterna(elenco: Elenco, valore: string): void {
    this.filtri.update((f) => {
      const attuali = f[elenco];
      return { ...f, [elenco]: attuali.includes(valore) ? attuali.filter((v) => v !== valore) : [...attuali, valore] };
    });
  }

  protected azzera(): void {
    this.filtri.set({ ...FILTRI_VUOTI, ordina: this.filtri().ordina as Ordinamento });
  }

  protected euro(n: number): string {
    return '€'.repeat(n);
  }

  protected testo(evento: Event): string {
    return (evento.target as HTMLInputElement).value;
  }
}
