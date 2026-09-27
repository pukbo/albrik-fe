import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { fotoProdotto } from '../../core/immagini';
import { CATEGORIE } from '../../core/prodotti-api';
import { AdminApi } from '../admin-api';

@Component({
  selector: 'app-admin-prodotti',
  imports: [RouterLink, DatePipe],
  template: `
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-bold text-slate-900">Catalogo</h1>
      <a routerLink="/admin/catalogo/nuovo"
        class="rounded-lg bg-orange-700 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-800">+ Nuovo modello</a>
    </div>
    <p class="mt-1 text-sm text-slate-600">
      I modelli attivi compaiono nel catalogo pubblico, nella sitemap e nel modulo contatti del servizio collegato.
    </p>

    @if (prodotti.error()) {
      <p role="alert" class="mt-4 rounded-lg bg-red-50 p-4 text-red-800">Impossibile caricare il catalogo.</p>
    } @else if (prodotti.value(); as elenco) {
      <ul class="mt-5 divide-y divide-slate-200 overflow-hidden rounded-2xl bg-white shadow-sm">
        @for (p of elenco; track p.id) {
          <li>
            <a [routerLink]="['/admin/catalogo', p.id]" class="flex flex-col gap-2 p-4 hover:bg-slate-50 sm:flex-row sm:items-center sm:gap-4">
              @if (foto(p.dati.immagine); as f) {
                <img [src]="f.srcset.split(' ')[0]" width="48" height="48" alt="" class="size-12 shrink-0 rounded-lg border border-slate-200 object-contain" />
              } @else {
                <span class="size-12 shrink-0 rounded-lg bg-slate-100" aria-hidden="true"></span>
              }
              <span class="min-w-0 flex-1">
                <span class="block font-semibold text-slate-900">{{ p.dati.nome }}</span>
                <span class="block truncate text-sm text-slate-500">{{ categorie[p.dati.categoria].plurale }} · {{ p.dati.percorso }}</span>
              </span>
              <span class="font-mono text-xs text-slate-600">LV {{ p.dati.valutazioni.livello }} · {{ euro(p.dati.valutazioni.fasciaPrezzo) }}</span>
              <span class="text-xs text-slate-500">Modificato il {{ p.dati.ultimaModifica | date: 'dd/MM/yyyy' }}</span>
              <span [class]="'w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ' +
                (p.attivo ? 'bg-green-100 text-green-900' : 'bg-slate-200 text-slate-700')">
                {{ p.attivo ? 'Online' : 'Non attivo' }}
              </span>
            </a>
          </li>
        } @empty {
          <li class="p-6 text-slate-600">Nessun modello: aggiungi il primo con "Nuovo modello".</li>
        }
      </ul>
    } @else {
      <p class="mt-4 text-slate-500">Caricamento…</p>
    }
  `,
})
export default class AdminProdotti {
  private readonly api = inject(AdminApi);
  protected readonly prodotti = rxResource({ stream: () => this.api.prodotti() });
  protected readonly categorie = CATEGORIE;
  protected readonly foto = fotoProdotto;

  protected euro(fascia: number): string {
    return '€'.repeat(fascia);
  }
}
