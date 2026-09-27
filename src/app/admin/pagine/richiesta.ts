import { DatePipe } from '@angular/common';
import { Component, inject, input, linkedSignal, numberAttribute, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AdminApi, StatoRichiesta } from '../admin-api';
import { STATI, infoStato, infoStatoPreventivo } from '../stati';
import { euro } from '../totali';

@Component({
  selector: 'app-admin-richiesta',
  imports: [RouterLink, DatePipe],
  template: `
    <a routerLink="/admin/richieste" class="text-sm font-medium text-blue-800 hover:underline">← Tutte le richieste</a>

    @if (richiesta.error()) {
      <p role="alert" class="mt-4 rounded-lg bg-red-50 p-4 text-red-800">Richiesta non trovata.</p>
    } @else if (richiesta.value(); as r) {
      <div class="mt-3 flex flex-wrap items-center gap-3">
        <h1 class="text-2xl font-bold text-slate-900">{{ r.nome }}</h1>
        <span [class]="'rounded-full px-2.5 py-0.5 text-xs font-semibold ' + info(r.stato).classi">{{ info(r.stato).etichetta }}</span>
      </div>
      <p class="mt-1 text-sm text-slate-500">
        Richiesta n. {{ r.id }} del {{ r.creataIl | date: 'dd/MM/yyyy' }} alle {{ r.creataIl | date: 'HH:mm' }}
      </p>

      <div class="mt-6 grid gap-6 lg:grid-cols-3">
        <section class="space-y-6 lg:col-span-2" aria-label="Dati della richiesta">
          <div class="rounded-2xl bg-white p-6 shadow-sm">
            <h2 class="font-semibold text-slate-900">Cliente</h2>
            <dl class="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt class="text-slate-500">Email</dt><dd><a [href]="'mailto:' + r.email" class="text-blue-800 hover:underline">{{ r.email }}</a></dd></div>
              <div><dt class="text-slate-500">Telefono</dt><dd>
                @if (r.telefono) { <a [href]="'tel:' + r.telefono" class="text-blue-800 hover:underline">{{ r.telefono }}</a> } @else { – }
              </dd></div>
              <div><dt class="text-slate-500">Comune</dt><dd>{{ r.comune ?? '–' }}</dd></div>
              <div><dt class="text-slate-500">Servizio</dt><dd>{{ r.servizioTitolo ?? 'Non indicato' }}</dd></div>
            </dl>
          </div>
          <div class="rounded-2xl bg-white p-6 shadow-sm">
            <h2 class="font-semibold text-slate-900">Messaggio</h2>
            <p class="mt-3 whitespace-pre-line text-slate-700">{{ r.messaggio }}</p>
          </div>

          <div class="rounded-2xl bg-white p-6 shadow-sm">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <h2 class="font-semibold text-slate-900">Preventivi</h2>
              <button type="button" (click)="nuovoPreventivo(r.id)" [disabled]="creazione()"
                class="rounded-lg bg-orange-700 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-800 disabled:opacity-60">
                + Nuovo preventivo
              </button>
            </div>
            @if (preventivi.value(); as elenco) {
              @if (elenco.length === 0) {
                <p class="mt-3 text-sm text-slate-600">Nessun preventivo per questa richiesta.</p>
              } @else {
                <ul class="mt-3 divide-y divide-slate-200">
                  @for (p of elenco; track p.id) {
                    <li>
                      <a [routerLink]="['/admin/preventivi', p.id]" class="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 hover:bg-slate-50">
                        <span class="font-semibold text-slate-900">n. {{ p.numero }}</span>
                        <span class="text-sm text-slate-500">{{ p.dataEmissione | date: 'dd/MM/yyyy' }}</span>
                        <span class="ml-auto font-medium text-slate-900">{{ euro(p.totale) }}</span>
                        <span [class]="'rounded-full px-2.5 py-0.5 text-xs font-semibold ' + infoPreventivo(p.stato).classi">
                          {{ infoPreventivo(p.stato).etichetta }}
                        </span>
                      </a>
                    </li>
                  }
                </ul>
              }
            }
            @if (erroreCreazione()) {
              <p role="alert" class="mt-2 text-sm text-red-700">Creazione del preventivo non riuscita.</p>
            }
          </div>
        </section>

        <section class="h-fit rounded-2xl bg-white p-6 shadow-sm" aria-label="Gestione">
          <h2 class="font-semibold text-slate-900">Gestione</h2>
          <label for="stato" class="mt-4 block text-sm font-medium text-slate-700">Stato</label>
          <select id="stato" [value]="stato()" (change)="stato.set($any($event.target).value)"
            class="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-blue-700 focus:ring-2 focus:ring-blue-200 focus:outline-none">
            @for (s of stati; track s.valore) {
              <option [value]="s.valore">{{ s.etichetta }}</option>
            }
          </select>

          <label for="note" class="mt-4 block text-sm font-medium text-slate-700">Note interne</label>
          <textarea id="note" rows="6" maxlength="4000" [value]="note()" (input)="note.set($any($event.target).value)"
            placeholder="Visibili solo a te: sopralluoghi, misure, accordi…"
            class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-700 focus:ring-2 focus:ring-blue-200 focus:outline-none"></textarea>

          <button type="button" (click)="salva(r.id)" [disabled]="salvataggio()"
            class="mt-4 w-full rounded-lg bg-blue-900 px-4 py-2.5 font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
            {{ salvataggio() ? 'Salvataggio…' : 'Salva' }}
          </button>
          <p aria-live="polite" class="mt-2 text-sm" [class.text-green-700]="!erroreSalvataggio()" [class.text-red-700]="erroreSalvataggio()">
            {{ esito() }}
          </p>
          <p class="mt-2 text-xs text-slate-500">Ultima modifica: {{ r.aggiornataIl | date: 'dd/MM/yyyy HH:mm' }}</p>
        </section>
      </div>
    } @else {
      <p class="mt-4 text-slate-500">Caricamento…</p>
    }
  `,
})
export default class AdminRichiesta {
  readonly id = input.required({ transform: numberAttribute });

  private readonly api = inject(AdminApi);
  private readonly router = inject(Router);

  protected readonly stati = STATI;
  protected readonly info = infoStato;
  protected readonly infoPreventivo = infoStatoPreventivo;

  protected readonly richiesta = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.api.richiesta(params),
  });

  // valori modificabili, riallineati ogni volta che la richiesta viene (ri)caricata
  protected readonly stato = linkedSignal<StatoRichiesta>(() => this.richiesta.value()?.stato ?? 'NUOVA');
  protected readonly note = linkedSignal(() => this.richiesta.value()?.noteInterne ?? '');

  protected readonly preventivi = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.api.preventiviDellaRichiesta(params),
  });
  protected readonly euro = euro;
  protected readonly creazione = signal(false);
  protected readonly erroreCreazione = signal(false);

  protected async nuovoPreventivo(richiestaId: number): Promise<void> {
    this.creazione.set(true);
    this.erroreCreazione.set(false);
    try {
      const p = await firstValueFrom(this.api.nuovoPreventivo(richiestaId));
      await this.router.navigate(['/admin/preventivi', p.id]);
    } catch {
      this.erroreCreazione.set(true);
    } finally {
      this.creazione.set(false);
    }
  }

  protected readonly salvataggio = signal(false);
  protected readonly esito = signal('');
  protected readonly erroreSalvataggio = signal(false);

  protected async salva(id: number): Promise<void> {
    this.salvataggio.set(true);
    this.esito.set('');
    try {
      const aggiornata = await firstValueFrom(this.api.aggiorna(id, { stato: this.stato(), noteInterne: this.note() }));
      this.richiesta.set(aggiornata);
      this.erroreSalvataggio.set(false);
      this.esito.set('Modifiche salvate.');
    } catch {
      this.erroreSalvataggio.set(true);
      this.esito.set('Salvataggio non riuscito. Riprova.');
    } finally {
      this.salvataggio.set(false);
    }
  }
}
