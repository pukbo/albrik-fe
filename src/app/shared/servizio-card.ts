import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { fotoServizio } from '../core/immagini';
import { Servizio } from '../core/servizi-api';
import { ServizioIcona } from './servizio-icona';

@Component({
  selector: 'app-servizio-card',
  imports: [RouterLink, ServizioIcona],
  template: `
    <article
      class="premi group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      @if (foto(); as f) {
        <!-- decorativa: il titolo del link descrive già il servizio -->
        <img [src]="f.src" [srcset]="f.srcset" sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          [width]="f.larghezza" [height]="f.altezza" loading="lazy" decoding="async" alt=""
          class="aspect-video w-full object-cover" />
      }
      <!-- su telefono l'icona sta accanto al testo (card più bassa), da tablet in su sopra -->
      <div class="flex flex-1 gap-4 p-5 sm:flex-col sm:gap-0 sm:p-6">
        @if (!foto()) {
          <app-servizio-icona [slug]="servizio().slug" class="size-12 shrink-0 rounded-xl bg-blue-50 p-2.5 text-blue-800 sm:mb-4" />
        }
        <div class="flex min-w-0 flex-1 flex-col">
          <h3 class="text-lg font-bold text-slate-900">
            <a [routerLink]="['/servizi', servizio().slug]" class="after:absolute after:inset-0">
              {{ servizio().titolo }}
            </a>
          </h3>
          <p class="mt-1.5 flex-1 text-slate-600 sm:mt-2">{{ servizio().sommario }}</p>
          <p class="mt-3 font-semibold text-blue-800 group-hover:underline sm:mt-4" aria-hidden="true">Scopri di più →</p>
        </div>
      </div>
    </article>
  `,
})
export class ServizioCard {
  readonly servizio = input.required<Servizio>();

  protected readonly foto = computed(() => fotoServizio(this.servizio().immagine));
}
