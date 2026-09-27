import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { fotoServizio } from '../core/immagini';
import { Servizio } from '../core/servizi-api';
import { ServizioIcona, tonoIcona } from './servizio-icona';

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
      <div class="flex flex-1 flex-col p-5 sm:p-6">
        <!-- su telefono: icona, titolo e freccia sulla stessa riga, descrizione sotto a tutta larghezza;
             da tablet in su: icona sopra il titolo -->
        <div class="flex items-center gap-4 sm:block">
          @if (!foto()) {
            <app-servizio-icona [slug]="servizio().slug" [class]="'size-12 shrink-0 rounded-xl p-2.5 ring-1 sm:mb-4 ' + tono()" />
          }
          <h3 class="min-w-0 flex-1 text-lg leading-snug font-bold text-slate-900">
            <a [routerLink]="['/servizi', servizio().slug]" class="after:absolute after:inset-0">
              {{ servizio().titolo }}
            </a>
          </h3>
          <span class="freccia-card inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 sm:hidden" aria-hidden="true">
            <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </div>
        <p class="mt-3 flex-1 text-slate-600 sm:mt-2">{{ servizio().sommario }}</p>
        <p class="mt-4 hidden font-semibold text-blue-800 group-hover:underline sm:block" aria-hidden="true">Scopri di più →</p>
      </div>
    </article>
  `,
})
export class ServizioCard {
  readonly servizio = input.required<Servizio>();

  protected readonly foto = computed(() => fotoServizio(this.servizio().immagine));
  protected readonly tono = computed(() => tonoIcona(this.servizio().slug));
}
