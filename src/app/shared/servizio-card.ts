import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Servizio } from '../core/servizi-api';
import { ServizioIcona } from './servizio-icona';

@Component({
  selector: 'app-servizio-card',
  imports: [RouterLink, ServizioIcona],
  template: `
    <article
      class="group relative flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <app-servizio-icona [slug]="servizio().slug" class="size-12 rounded-xl bg-blue-50 p-2.5 text-blue-800" />
      <h3 class="mt-4 text-lg font-bold text-slate-900">
        <a [routerLink]="['/servizi', servizio().slug]" class="after:absolute after:inset-0">
          {{ servizio().titolo }}
        </a>
      </h3>
      <p class="mt-2 flex-1 text-slate-600">{{ servizio().sommario }}</p>
      <p class="mt-4 font-semibold text-blue-800 group-hover:underline" aria-hidden="true">Scopri di più →</p>
    </article>
  `,
})
export class ServizioCard {
  readonly servizio = input.required<Servizio>();
}
