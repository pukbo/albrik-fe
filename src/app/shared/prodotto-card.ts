import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { fotoProdotto } from '../core/immagini';
import { Prodotto, potenzaLeggibile } from '../core/prodotti-api';
import { SchedaTecnica } from './scheda-tecnica';

/**
 * Card di un modello del catalogo, in stile "carta da collezione": cornice scura, foto su fondo
 * chiaro, livello e classe energetica come badge, barre compatte delle valutazioni.
 */
@Component({
  selector: 'app-prodotto-card',
  imports: [RouterLink, SchedaTecnica],
  template: `
    <article class="carta group relative flex h-full flex-col rounded-3xl bg-gradient-to-b from-blue-900 to-blue-950 p-3 text-white">
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-200">
        @if (foto(); as f) {
          <!-- decorativa: il titolo del link descrive già il modello -->
          <img [src]="f.src" [srcset]="f.srcset" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            [width]="f.larghezza" [height]="f.altezza" loading="lazy" decoding="async" alt=""
            class="foto aspect-[4/3] w-full object-contain p-5" />
        } @else {
          <div class="flex aspect-[4/3] items-center justify-center" aria-hidden="true">
            @if (p().categoria === 'CONDIZIONATORE') {
              <!-- fiocco di neve -->
              <svg viewBox="0 0 24 24" class="foto size-20 text-blue-800/40" fill="none" stroke="currentColor"
                stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2v20M4.2 7l15.6 10M4.2 17 19.8 7M9 3.5l3 2.5 3-2.5M9 20.5l3-2.5 3 2.5M3 10.5l3.6-.2L5 7M21 13.5l-3.6.2L19 17M3 13.5l3.6.2L5 17M21 10.5l-3.6-.2L19 7" />
              </svg>
            } @else {
              <svg viewBox="0 0 64 64" class="foto size-24">
                <path d="M32 5 C32 5 12 27 12 40 A20 20 0 0 0 52 40 C52 27 32 5 32 5 Z" fill="#1e40af" opacity="0.18" />
                <path d="M32 28 C32 28 24 37 24 43 A8 8 0 0 0 40 43 C40 37 32 28 32 28 Z" fill="#f97316" opacity="0.7" />
              </svg>
            }
          </div>
        }

        <p class="livello absolute top-3 left-3 font-mono font-bold" [attr.aria-label]="'Livello ' + p().valutazioni.livello + ' su 5'">
          <span class="text-[0.6rem] tracking-widest text-orange-100" aria-hidden="true">LV</span>
          <span class="text-base leading-none" aria-hidden="true">{{ p().valutazioni.livello }}</span>
        </p>
        @if (p().classeEnergetica; as classe) {
          <p class="absolute top-3 right-3 rounded-lg bg-emerald-600 px-2 py-1 font-mono text-xs font-bold text-white shadow">
            <span class="sr-only">Classe energetica </span>{{ classe }}
          </p>
        }
      </div>

      <div class="flex flex-1 flex-col px-2 pt-4 pb-2">
        <p class="font-mono text-xs font-semibold tracking-[0.2em] text-orange-300 uppercase">
          {{ p().marca }}@if (potenza(); as pot) { · {{ pot }} }
        </p>
        <h3 class="mt-1 text-xl font-bold">
          <a [routerLink]="p().percorso" class="after:absolute after:inset-0 after:rounded-3xl focus-visible:outline-none">
            {{ p().modello }}<span class="sr-only"> di {{ p().marca }}</span>
          </a>
        </h3>
        <p class="mt-1.5 line-clamp-2 flex-1 text-sm text-blue-100">{{ p().sommario }}</p>

        <app-scheda-tecnica class="mt-4 block border-t border-white/10 pt-4" [prodotto]="p()" [soloBarre]="true" />

        <p class="mt-4 flex items-center justify-between rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold transition-colors group-hover:bg-orange-700" aria-hidden="true">
          Vedi la scheda completa <span class="freccia">→</span>
        </p>
      </div>
    </article>
  `,
  styles: `
    .carta {
      box-shadow:
        0 0 0 1px rgb(96 165 250 / 0.2),
        0 12px 30px -12px rgb(15 23 42 / 0.5);
      transition:
        transform 0.25s ease,
        box-shadow 0.25s ease;
    }

    .carta:hover,
    .carta:focus-within {
      transform: translateY(-4px);
      box-shadow:
        0 0 0 2px rgb(251 146 60 / 0.8),
        0 0 28px -4px rgb(249 115 22 / 0.45),
        0 18px 36px -14px rgb(15 23 42 / 0.6);
    }

    .foto {
      transition: transform 0.35s ease;
    }

    .carta:hover .foto {
      transform: scale(1.05);
    }

    .freccia {
      display: inline-block;
      transition: transform 0.2s ease;
    }

    .carta:hover .freccia {
      transform: translateX(4px);
    }

    .livello {
      display: inline-flex;
      align-items: baseline;
      gap: 0.25rem;
      padding: 0.25rem 0.55rem;
      border-radius: 0.5rem;
      background: linear-gradient(135deg, #c2410c, #f97316);
      box-shadow: 0 0 14px -2px rgb(249 115 22 / 0.6);
    }

    @media (prefers-reduced-motion: reduce) {
      .carta,
      .carta:hover,
      .carta:focus-within,
      .carta:hover .foto,
      .carta:hover .freccia {
        transform: none;
      }
    }
  `,
})
export class ProdottoCard {
  readonly prodotto = input.required<Prodotto>();

  protected readonly p = computed(() => this.prodotto());
  protected readonly foto = computed(() => fotoProdotto(this.prodotto().immagine));
  protected readonly potenza = computed(() => potenzaLeggibile(this.prodotto()));
}
