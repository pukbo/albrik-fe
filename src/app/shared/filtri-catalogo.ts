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

/** Colori dell'etichetta energetica europea, dalla classe migliore. */
const COLORI_CLASSE: Record<string, string> = {
  'A+++': '#00854a',
  'A++': '#19a34a',
  'A+': '#6cbd45',
  A: '#b5d334',
  B: '#fcea1b',
  C: '#fbb818',
  D: '#f27b21',
  E: '#e8412a',
  F: '#d9261c',
  G: '#b31b1b',
};

/** Icone dei gruppi di filtri (viewBox 24x24, solo contorno). */
const ICONE = {
  marca: 'M20 12 12 20l-8-8V4h8zM7.5 7.5h.01',
  potenza: 'M13 2 4 14h7l-1 8 9-12h-7z',
  classe: 'M11 20A7 7 0 0 1 4 13c0-6 5-9 16-9 0 11-3 16-9 16zM4 20c3-3 6-5 10-7',
  prezzo: 'M17 6.5A7 7 0 1 0 17 17.5M4 10h9M4 14h9',
  smart: 'M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M2 9a15 15 0 0 1 20 0M12 19.5h.01',
};

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
          class="w-full rounded-xl border border-slate-300 bg-white py-3 pr-4 pl-11 text-slate-900 shadow-sm focus:border-blue-700 focus:ring-2 focus:ring-blue-200 focus:outline-none" />
      </label>

      <div class="flex gap-3">
        <button type="button" (click)="aperto.set(!aperto())" aria-controls="pannello-filtri" [attr.aria-expanded]="aperto()"
          class="premi inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 font-semibold shadow-sm sm:flex-none"
          [class]="attivi() || aperto() ? 'border-blue-800 bg-blue-50 text-blue-900' : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'">
          <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" />
          </svg>
          Filtri
          @if (attivi()) {
            <span class="inline-flex min-w-5 items-center justify-center rounded-full bg-orange-700 px-1.5 text-xs text-white">{{ attivi() }}</span>
          }
        </button>

        <label class="relative flex-1 sm:flex-none">
          <span class="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm text-slate-500" aria-hidden="true">Ordina:</span>
          <span class="sr-only">Ordina per</span>
          <select (change)="imposta({ ordina: $any(testo($event)) })"
            class="w-full appearance-none rounded-xl border border-slate-300 bg-white py-3 pr-10 pl-[4.4rem] font-semibold text-slate-800 shadow-sm focus:border-blue-700 focus:ring-2 focus:ring-blue-200 focus:outline-none">
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
      <div class="sticky top-0 z-10 border-b border-slate-200 bg-white px-5 pt-3 pb-3 sm:hidden">
        <span class="mx-auto mb-2 block h-1.5 w-10 rounded-full bg-slate-300" aria-hidden="true"></span>
        <div class="flex items-center justify-between">
          <p class="text-lg font-bold text-slate-900">
            Filtri
            @if (attivi()) {
              <span class="ml-1 text-sm font-semibold text-orange-700">({{ attivi() }})</span>
            }
          </p>
          <button type="button" (click)="aperto.set(false)" class="-mr-2 inline-flex size-11 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100">
            <span class="sr-only">Chiudi i filtri</span>
            <svg class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
      </div>

      <!-- gruppi: uno sotto l'altro su telefono, in colonne separate da linee da computer -->
      <div class="gruppi">
        @if (opzioni().marche.length > 1) {
          <fieldset class="gruppo">
            <legend class="titolo-gruppo">
              <span class="icona-gruppo" aria-hidden="true"><svg viewBox="0 0 24 24"><path [attr.d]="icone.marca" /></svg></span>
              Marca
            </legend>
            <div class="scelte">
              @for (o of opzioni().marche; track o.valore) {
                <button type="button" class="chip" [attr.aria-pressed]="filtri().marche.includes(o.valore)" (click)="alterna('marche', o.valore)">
                  {{ o.etichetta }}
                  <!-- selezionata: il numero diventa una spunta (stessa larghezza, niente a capo) -->
                  <span class="conteggio">
                    @if (filtri().marche.includes(o.valore)) {
                      <svg class="spunta" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 5 5 9-10" /></svg>
                    } @else {
                      {{ o.conteggio }}
                    }
                  </span>
                </button>
              }
            </div>
          </fieldset>
        }
        @if (opzioni().potenze.length > 1) {
          <fieldset class="gruppo">
            <legend class="titolo-gruppo">
              <span class="icona-gruppo" aria-hidden="true"><svg viewBox="0 0 24 24"><path [attr.d]="icone.potenza" /></svg></span>
              Potenza
            </legend>
            <div class="scelte">
              @for (o of opzioni().potenze; track o.valore) {
                <button type="button" class="chip" [attr.aria-pressed]="filtri().potenze.includes(o.valore)" (click)="alterna('potenze', o.valore)">
                  {{ o.etichetta }}
                  <!-- selezionata: il numero diventa una spunta (stessa larghezza, niente a capo) -->
                  <span class="conteggio">
                    @if (filtri().potenze.includes(o.valore)) {
                      <svg class="spunta" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 5 5 9-10" /></svg>
                    } @else {
                      {{ o.conteggio }}
                    }
                  </span>
                </button>
              }
            </div>
          </fieldset>
        }
        @if (opzioni().classi.length > 1) {
          <fieldset class="gruppo">
            <legend class="titolo-gruppo">
              <span class="icona-gruppo" aria-hidden="true"><svg viewBox="0 0 24 24"><path [attr.d]="icone.classe" /></svg></span>
              Classe energetica
            </legend>
            <div class="scelte">
              @for (o of opzioni().classi; track o.valore) {
                <button type="button" class="chip" [attr.aria-pressed]="filtri().classi.includes(o.valore)" (click)="alterna('classi', o.valore)">
                  <span class="pallino" [style.background]="coloreClasse(o.valore)" aria-hidden="true"></span>
                  {{ o.etichetta }}
                  <!-- selezionata: il numero diventa una spunta (stessa larghezza, niente a capo) -->
                  <span class="conteggio">
                    @if (filtri().classi.includes(o.valore)) {
                      <svg class="spunta" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 5 5 9-10" /></svg>
                    } @else {
                      {{ o.conteggio }}
                    }
                  </span>
                </button>
              }
            </div>
          </fieldset>
        }
        <fieldset class="gruppo">
          <legend class="titolo-gruppo">
            <span class="icona-gruppo" aria-hidden="true"><svg viewBox="0 0 24 24"><path [attr.d]="icone.prezzo" /></svg></span>
            Prezzo massimo
          </legend>
          <!-- selettore a segmenti: una sola scelta, su una riga -->
          <div class="segmenti" role="radiogroup" aria-label="Prezzo massimo">
            <button type="button" role="radio" [attr.aria-checked]="!filtri().prezzoMax" (click)="imposta({ prezzoMax: null })">Tutti</button>
            @for (n of fascePrezzo(); track n) {
              <button type="button" role="radio" [attr.aria-checked]="filtri().prezzoMax === n" (click)="imposta({ prezzoMax: n })"
                [attr.aria-label]="'Fino a ' + n + ' su 5'">
                {{ euro(n) }}
              </button>
            }
          </div>
          <p class="mt-2 text-xs text-slate-500">€ = più economica · €€€€€ = premium</p>
        </fieldset>
      </div>

      <!-- fondo del pannello: interruttore smart + azioni -->
      <div class="fondo">
        @if (opzioni().conSmart) {
          <button type="button" role="switch" [attr.aria-checked]="filtri().soloSmart" (click)="imposta({ soloSmart: !filtri().soloSmart })"
            class="riga-smart">
            <span class="icona-gruppo grande" aria-hidden="true"><svg viewBox="0 0 24 24"><path [attr.d]="icone.smart" /></svg></span>
            <span class="min-w-0 flex-1 text-left">
              <span class="block font-semibold text-slate-900">Solo modelli smart</span>
              <span class="block text-sm text-slate-600">Wi-Fi e controllo da app</span>
            </span>
            <span class="interruttore" [class.acceso]="filtri().soloSmart" aria-hidden="true"><span></span></span>
          </button>
        }
        <!-- azioni da tablet in su (su telefono sono nel piede fisso) -->
        <div class="hidden items-center gap-4 sm:flex">
          <button type="button" (click)="azzera()" class="font-semibold text-slate-600 hover:text-slate-900 hover:underline">Azzera</button>
          <button type="button" (click)="aperto.set(false)"
            class="pulsante rounded-lg bg-blue-900 px-5 py-2.5 font-semibold text-white hover:bg-blue-800">Chiudi</button>
        </div>
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
    /* ---------- gruppi di filtri ---------- */
    .gruppi {
      display: grid;
    }

    .gruppo {
      padding: 1.25rem;
      border-bottom: 1px solid #f1f5f9;
    }

    /* float: il <legend> altrimenti starebbe sul bordo del fieldset, fuori dal suo spazio interno */
    .titolo-gruppo {
      float: left;
      width: 100%;
      margin-bottom: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      font-weight: 700;
      color: #0f172a;
    }

    .icona-gruppo {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.75rem;
      height: 1.75rem;
      flex-shrink: 0;
      border-radius: 0.5rem;
      background: #eff6ff;
      color: #1e40af;
    }

    .icona-gruppo.grande {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 0.75rem;
    }

    .icona-gruppo svg {
      width: 1rem;
      height: 1rem;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .icona-gruppo.grande svg {
      width: 1.25rem;
      height: 1.25rem;
    }

    .scelte {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      clear: both;
    }

    /* ---------- pillole ---------- */
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      min-height: 2.5rem;
      padding: 0 0.75rem;
      border-radius: 9999px;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      font-size: 0.875rem;
      font-weight: 600;
      color: #1e293b;
      transition:
        background-color 0.15s ease,
        border-color 0.15s ease,
        color 0.15s ease,
        box-shadow 0.15s ease;
    }

    .chip:hover {
      border-color: #93c5fd;
      background: white;
    }

    .chip[aria-pressed='true'] {
      border-color: #1e40af;
      background: #1e40af;
      color: white;
      box-shadow: 0 6px 14px -6px rgb(30 64 175 / 0.6);
    }

    /* spunta che compare sulle pillole selezionate */
    /* spunta al posto del numero nel badge (compare con un piccolo rimbalzo) */
    .spunta {
      width: 0.75rem;
      height: 1.25rem;
      fill: none;
      stroke: currentColor;
      stroke-width: 3.5;
      stroke-linecap: round;
      stroke-linejoin: round;
      animation: comparsa-spunta 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes comparsa-spunta {
      from {
        opacity: 0;
        transform: scale(0.4);
      }
    }

    .conteggio {
      display: inline-flex;
      min-width: 1.25rem;
      height: 1.25rem;
      align-items: center;
      justify-content: center;
      padding: 0 0.3rem;
      border-radius: 9999px;
      background: #e2e8f0;
      font-size: 0.6875rem;
      line-height: 1.25rem;
      color: #475569;
    }

    /* selezionata: badge bianco con la spunta blu */
    .chip[aria-pressed='true'] .conteggio {
      background: white;
      color: #1e40af;
    }

    /* pallino colorato come sull'etichetta energetica */
    .pallino {
      width: 0.625rem;
      height: 0.625rem;
      flex-shrink: 0;
      border-radius: 9999px;
      box-shadow: 0 0 0 2px white;
    }

    /* selettore a segmenti (.segmenti) e interruttore (.interruttore): in styles.css */
    .segmenti {
      clear: both;
    }

    /* ---------- fondo: smart + azioni ---------- */
    .fondo {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem 1.25rem;
      background: #f8fafc;
    }

    .riga-smart {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      flex: 1;
      min-width: 16rem;
    }

    /* ---------- telefono: pannello che sale dal basso, con velo scuro ---------- */
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
      max-height: 88dvh;
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

    /* ---------- da tablet in su: riquadro sopra la griglia ---------- */
    @media (min-width: 640px) {
      .pannello-filtri {
        position: static;
        display: none;
        max-height: none;
        overflow: hidden;
        margin-top: 1rem;
        border: 1px solid #e2e8f0;
        border-radius: 1.25rem;
        box-shadow: 0 16px 36px -22px rgb(15 23 42 / 0.35);
        transform: none;
        visibility: visible;
        transition: none;
      }

      .pannello-filtri.aperto {
        display: block;
        animation: comparsa-filtri 0.2s ease;
      }

      .gruppi {
        grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
      }

      .gruppo {
        padding: 1.25rem 1.5rem;
        border-bottom: 0;
      }

      /* linee verticali tra le colonne */
      .gruppo + .gruppo {
        border-left: 1px solid #f1f5f9;
      }

      .fondo {
        border-top: 1px solid #e2e8f0;
        padding: 0.875rem 1.5rem;
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
      .chip {
        transition: none !important;
      }

      .pannello-filtri.aperto,
      .spunta {
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
  protected readonly icone = ICONE;
  protected readonly opzioni = computed(() => opzioniFiltri(this.prodotti()));
  protected readonly attivi = computed(() => contaFiltriAttivi(this.filtri()));
  /** Fasce "fino a": dalla più economica presente fino alla penultima (l'ultima equivale a "tutti"). */
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

  protected coloreClasse(classe: string): string {
    return COLORI_CLASSE[classe.toUpperCase()] ?? '#94a3b8';
  }

  protected euro(n: number): string {
    return '€'.repeat(n);
  }

  protected testo(evento: Event): string {
    return (evento.target as HTMLInputElement).value;
  }
}
