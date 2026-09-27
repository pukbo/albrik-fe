import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AdminApi } from '../admin-api';

@Component({
  selector: 'app-admin-servizi',
  imports: [RouterLink, DatePipe],
  template: `
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-bold text-slate-900">Servizi</h1>
      <a routerLink="/admin/servizi/nuovo"
        class="rounded-lg bg-orange-700 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-800">+ Nuovo servizio</a>
    </div>
    <p class="mt-1 text-sm text-slate-600">
      Le modifiche sono subito online e aggiornano la sitemap. Un servizio non attivo resta salvato ma non compare sul sito.
    </p>

    @if (servizi.error()) {
      <p role="alert" class="mt-4 rounded-lg bg-red-50 p-4 text-red-800">Impossibile caricare i servizi.</p>
    } @else if (servizi.value(); as elenco) {
      <ul class="mt-5 divide-y divide-slate-200 overflow-hidden rounded-2xl bg-white shadow-sm">
        @for (s of elenco; track s.id) {
          <li>
            <a [routerLink]="['/admin/servizi', s.id]" class="flex flex-col gap-1 p-4 hover:bg-slate-50 sm:flex-row sm:items-center sm:gap-4">
              <span class="w-10 shrink-0 text-sm text-slate-500">#{{ s.ordine }}</span>
              <span class="min-w-0 flex-1">
                <span class="block font-semibold text-slate-900">{{ s.titolo }}</span>
                <span class="block truncate text-sm text-slate-500">/servizi/{{ s.slug }}</span>
              </span>
              <span class="text-xs text-slate-500">Modificato il {{ s.ultimaModifica | date: 'dd/MM/yyyy' }}</span>
              <span [class]="'w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ' +
                (s.attivo ? 'bg-green-100 text-green-900' : 'bg-slate-200 text-slate-700')">
                {{ s.attivo ? 'Online' : 'Non attivo' }}
              </span>
            </a>
          </li>
        }
      </ul>
    } @else {
      <p class="mt-4 text-slate-500">Caricamento…</p>
    }
  `,
})
export default class AdminServizi {
  private readonly api = inject(AdminApi);
  protected readonly servizi = rxResource({ stream: () => this.api.servizi() });
}
