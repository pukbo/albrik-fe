import { Component, computed, input } from '@angular/core';
import { Prodotto } from '../core/prodotti-api';

interface Statistica {
  chiave: string;
  etichetta: string;
  valore: number;
  /** Tracciato SVG dell'icona (viewBox 24×24, solo contorno). */
  icona: string;
}

const SEGMENTI = [1, 2, 3, 4, 5];

/**
 * Scheda tecnica "in stile videogioco": livello, barre a segmenti da 1 a 5 e fascia di prezzo in €.
 * Le barre si caricano all'apertura (ferme con "riduci movimento"); per gli screen reader ogni
 * valore è anche scritto per esteso ("4 su 5").
 */
@Component({
  selector: 'app-scheda-tecnica',
  template: `
    <div class="scheda-gioco relative overflow-hidden rounded-2xl border border-blue-400/25 bg-blue-950 text-white"
      [class.p-5]="compatta()" [class.p-6]="!compatta()">
      <!-- angoli "da mirino" -->
      <span class="angolo top-2 left-2 border-t-2 border-l-2" aria-hidden="true"></span>
      <span class="angolo top-2 right-2 border-t-2 border-r-2" aria-hidden="true"></span>
      <span class="angolo bottom-2 left-2 border-b-2 border-l-2" aria-hidden="true"></span>
      <span class="angolo right-2 bottom-2 border-r-2 border-b-2" aria-hidden="true"></span>

      <div class="flex items-center justify-between gap-3">
        <p class="font-mono text-xs font-semibold tracking-[0.2em] text-blue-200 uppercase">Scheda tecnica</p>
        <p class="livello font-mono font-bold" [attr.aria-label]="'Livello ' + v().livello + ' su 5'">
          <span class="text-[0.65rem] tracking-widest text-orange-200" aria-hidden="true">LV</span>
          <span class="text-lg leading-none" aria-hidden="true">{{ v().livello }}</span>
        </p>
      </div>

      @if (!compatta() && (prodotto().classeEnergetica || prodotto().potenzaKw)) {
        <div class="mt-4 flex flex-wrap gap-2 font-mono text-sm">
          @if (prodotto().classeEnergetica; as classe) {
            <span class="rounded-md bg-emerald-400/15 px-2.5 py-1 font-semibold text-emerald-300">
              Classe {{ classe }}
            </span>
          }
          @if (prodotto().potenzaKw; as kw) {
            <span class="rounded-md bg-white/10 px-2.5 py-1 font-semibold text-blue-100">{{ kw }} kW</span>
          }
        </div>
      }

      <dl class="space-y-3" [class.mt-3]="compatta()" [class.mt-5]="!compatta()">
        @for (s of statistiche(); track s.chiave; let riga = $index) {
          <div>
            <dt class="flex items-center justify-between gap-2 text-sm">
              <span class="flex items-center gap-2 font-medium text-blue-100">
                <svg class="size-4 shrink-0 text-orange-300" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path [attr.d]="s.icona" />
                </svg>
                {{ s.etichetta }}
              </span>
              <span class="font-mono text-xs text-blue-200" aria-hidden="true">{{ s.valore }}/5</span>
            </dt>
            <dd class="mt-1.5">
              <span class="sr-only">{{ s.valore }} su 5</span>
              <span class="flex gap-1" aria-hidden="true">
                @for (n of segmenti; track n) {
                  <span class="segmento h-2.5 flex-1 rounded-[3px]"
                    [class.pieno]="n <= s.valore"
                    [style.--ritardo]="riga * 140 + n * 70 + 'ms'"></span>
                }
              </span>
            </dd>
          </div>
        }

        <div class="flex items-center justify-between gap-2 border-t border-white/10 pt-3 text-sm">
          <dt class="flex items-center gap-2 font-medium text-blue-100">
            <svg class="size-4 shrink-0 text-orange-300" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M17 6.5A7 7 0 1 0 17 17.5M4 10h9M4 14h9" />
            </svg>
            Fascia di prezzo
          </dt>
          <dd class="font-mono text-base font-bold tracking-wider">
            <span class="sr-only">{{ v().fasciaPrezzo }} su 5, {{ descrizionePrezzo() }}</span>
            <span aria-hidden="true">
              @for (n of segmenti; track n) {
                <span [class]="n <= v().fasciaPrezzo ? 'text-orange-300' : 'text-white/20'">€</span>
              }
            </span>
          </dd>
        </div>
      </dl>

      @if (!compatta()) {
        <p class="mt-5 text-xs text-blue-200/80">Valutazioni indicative di Albrik, da 1 a 5, basate sull'esperienza di installazione.</p>
      }
    </div>
  `,
  styles: `
    .angolo {
      position: absolute;
      width: 10px;
      height: 10px;
      border-color: rgb(251 146 60 / 0.6);
    }

    .livello {
      display: inline-flex;
      align-items: baseline;
      gap: 0.3rem;
      padding: 0.3rem 0.65rem;
      border-radius: 0.5rem;
      background: linear-gradient(135deg, #c2410c, #f97316);
      box-shadow: 0 0 18px -2px rgb(249 115 22 / 0.55);
    }

    .segmento {
      background: rgb(255 255 255 / 0.1);
    }

    .segmento.pieno {
      background: linear-gradient(90deg, #f97316, #fb923c);
      box-shadow: 0 0 8px -1px rgb(249 115 22 / 0.7);
      transform-origin: left center;
      animation: carica 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) var(--ritardo, 0ms) both;
    }

    @keyframes carica {
      from {
        opacity: 0;
        transform: scaleX(0.2);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .segmento.pieno {
        animation: none;
      }
    }
  `,
})
export class SchedaTecnica {
  readonly prodotto = input.required<Prodotto>();
  /** Versione ridotta per le card dell'elenco: niente classe/potenza e niente nota. */
  readonly compatta = input(false);

  protected readonly segmenti = SEGMENTI;
  protected readonly v = computed(() => this.prodotto().valutazioni);

  protected readonly statistiche = computed<Statistica[]>(() => {
    const v = this.v();
    return [
      { chiave: 'efficienza', etichetta: 'Efficienza energetica', valore: v.efficienza, icona: 'M13 2 4 14h7l-1 8 9-12h-7z' },
      {
        chiave: 'smart',
        etichetta: 'Tecnologia smart',
        valore: v.smart,
        icona: 'M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M2 9a15 15 0 0 1 20 0M12 19.5h.01',
      },
      {
        chiave: 'silenziosita',
        etichetta: 'Silenziosità',
        valore: v.silenziosita,
        icona: 'M11 5 6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6',
      },
    ];
  });

  protected readonly descrizionePrezzo = computed(
    () => ['economica', 'accessibile', 'media', 'alta', 'premium'][this.v().fasciaPrezzo - 1] ?? '',
  );
}
