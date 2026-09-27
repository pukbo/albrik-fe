import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { fotoProdotto } from '../core/immagini';
import { Prodotto } from '../core/prodotti-api';
import { SchedaTecnica } from './scheda-tecnica';

/** Card di un modello del catalogo: foto, nome, sommario e scheda tecnica compatta. */
@Component({
  selector: 'app-prodotto-card',
  imports: [RouterLink, SchedaTecnica],
  template: `
    <article
      class="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      @if (foto(); as f) {
        <img [src]="f.src" [srcset]="f.srcset" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          [width]="f.larghezza" [height]="f.altezza" loading="lazy" decoding="async" alt=""
          class="aspect-[4/3] w-full bg-white object-contain p-4" />
      } @else {
        <div class="flex aspect-[4/3] items-center justify-center bg-slate-100" aria-hidden="true">
          <svg viewBox="0 0 64 64" class="size-20">
            <path d="M32 5 C32 5 12 27 12 40 A20 20 0 0 0 52 40 C52 27 32 5 32 5 Z" fill="#1e40af" opacity="0.15" />
            <path d="M32 28 C32 28 24 37 24 43 A8 8 0 0 0 40 43 C40 37 32 28 32 28 Z" fill="#f97316" opacity="0.6" />
          </svg>
        </div>
      }
      <div class="flex flex-1 flex-col p-5">
        <p class="text-sm font-semibold tracking-wide text-orange-700 uppercase">{{ prodotto().marca }}</p>
        <h3 class="text-xl font-bold text-slate-900">
          <a [routerLink]="prodotto().percorso" class="after:absolute after:inset-0">{{ prodotto().nome }}</a>
        </h3>
        <p class="mt-2 flex-1 text-slate-600">{{ prodotto().sommario }}</p>
        <app-scheda-tecnica class="mt-4 block" [prodotto]="prodotto()" [compatta]="true" />
        <p class="mt-4 font-semibold text-blue-800 group-hover:underline" aria-hidden="true">Vedi la scheda →</p>
      </div>
    </article>
  `,
})
export class ProdottoCard {
  readonly prodotto = input.required<Prodotto>();

  protected readonly foto = computed(() => fotoProdotto(this.prodotto().immagine));
}
