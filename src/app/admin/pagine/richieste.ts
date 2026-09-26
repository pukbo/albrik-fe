import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, numberAttribute } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { AdminApi, StatoRichiesta } from '../admin-api';
import { STATI, infoStato } from '../stati';

@Component({
  selector: 'app-admin-richieste',
  imports: [RouterLink, DatePipe],
  template: `
    <h1 class="text-2xl font-bold text-slate-900">Richieste di preventivo</h1>

    <!-- Filtro per stato con contatori -->
    <nav aria-label="Filtra per stato" class="mt-5 flex flex-wrap gap-2">
      <a routerLink="." [queryParams]="{ testo: testo() || null }"
        [class]="chip(!stato())">Tutte <span class="ml-1 opacity-70">{{ totale() }}</span></a>
      @for (s of stati; track s.valore) {
        <a routerLink="." [queryParams]="{ stato: s.valore, testo: testo() || null }"
          [class]="chip(stato() === s.valore)" [attr.aria-current]="stato() === s.valore ? 'page' : null">
          {{ s.etichetta }} <span class="ml-1 opacity-70">{{ conteggi.value()?.[s.valore] ?? 0 }}</span>
        </a>
      }
    </nav>

    <form role="search" class="mt-4 flex gap-2" (submit)="cerca($event, campoRicerca.value)">
      <label for="ricerca" class="sr-only">Cerca</label>
      <input #campoRicerca id="ricerca" type="search" [value]="testo() ?? ''" placeholder="Cerca per nome, email, telefono o comune"
        class="w-full max-w-md rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-blue-700 focus:ring-2 focus:ring-blue-200 focus:outline-none" />
      <button type="submit" class="rounded-lg bg-blue-900 px-4 py-2 font-semibold text-white hover:bg-blue-800">Cerca</button>
    </form>

    <section class="mt-5" aria-live="polite">
      @if (risultati.error()) {
        <p role="alert" class="rounded-lg bg-red-50 p-4 text-red-800">Impossibile caricare le richieste.</p>
      } @else if (risultati.value(); as pagina) {
        @if (pagina.contenuto.length === 0) {
          <p class="rounded-2xl bg-white p-8 text-center text-slate-600">Nessuna richiesta trovata.</p>
        } @else {
          <ul class="divide-y divide-slate-200 overflow-hidden rounded-2xl bg-white shadow-sm">
            @for (r of pagina.contenuto; track r.id) {
              <li>
                <a [routerLink]="['/admin/richieste', r.id]" class="flex flex-col gap-1 p-4 hover:bg-slate-50 sm:flex-row sm:items-center sm:gap-4">
                  <span class="w-32 shrink-0 text-sm text-slate-500">{{ r.creataIl | date: 'dd/MM/yyyy HH:mm' }}</span>
                  <span class="min-w-0 flex-1">
                    <span class="block font-semibold text-slate-900">{{ r.nome }}</span>
                    <span class="block truncate text-sm text-slate-600">
                      {{ r.servizioTitolo ?? 'Servizio non indicato' }}@if (r.comune) { · {{ r.comune }}} · {{ r.messaggio }}
                    </span>
                  </span>
                  <span [class]="'w-fit shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ' + info(r.stato).classi">
                    {{ info(r.stato).etichetta }}
                  </span>
                </a>
              </li>
            }
          </ul>

          @if (pagina.totalePagine > 1) {
            <nav aria-label="Pagine" class="mt-4 flex items-center justify-between text-sm">
              <a routerLink="." queryParamsHandling="merge" [queryParams]="{ pagina: pagina.pagina - 1 }"
                [class.invisible]="pagina.pagina === 0" class="rounded-lg bg-white px-3 py-2 shadow-sm hover:bg-slate-50">← Precedenti</a>
              <span class="text-slate-600">Pagina {{ pagina.pagina + 1 }} di {{ pagina.totalePagine }}</span>
              <a routerLink="." queryParamsHandling="merge" [queryParams]="{ pagina: pagina.pagina + 1 }"
                [class.invisible]="pagina.pagina + 1 >= pagina.totalePagine" class="rounded-lg bg-white px-3 py-2 shadow-sm hover:bg-slate-50">Successive →</a>
            </nav>
          }
        }
      } @else {
        <p class="p-4 text-slate-500">Caricamento…</p>
      }
    </section>
  `,
})
export default class AdminRichieste {
  // filtri dai query param dell'URL: la pagina si può ricaricare o salvare nei preferiti
  readonly stato = input<StatoRichiesta>();
  readonly testo = input<string>();
  readonly pagina = input(0, { transform: (v: unknown) => numberAttribute(v, 0) });

  private readonly api = inject(AdminApi);
  private readonly router = inject(Router);

  protected readonly stati = STATI;
  protected readonly info = infoStato;

  protected readonly risultati = rxResource({
    params: () => ({ stato: this.stato(), testo: this.testo(), pagina: this.pagina() }),
    stream: ({ params }) => this.api.richieste(params),
  });

  protected readonly conteggi = rxResource({ stream: () => this.api.conteggi() });

  protected readonly totale = computed(() =>
    Object.values(this.conteggi.value() ?? {}).reduce((a, b) => a + b, 0),
  );

  protected chip(attivo: boolean): string {
    return (
      'rounded-full px-3 py-1.5 text-sm font-medium ' +
      (attivo ? 'bg-blue-900 text-white' : 'bg-white text-slate-700 shadow-sm hover:bg-slate-50')
    );
  }

  protected cerca(event: Event, testo: string): void {
    event.preventDefault();
    this.router.navigate([], { queryParams: { stato: this.stato() ?? null, testo: testo.trim() || null } });
  }
}
