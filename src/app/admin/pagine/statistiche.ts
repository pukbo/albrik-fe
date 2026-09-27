import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AdminApi } from '../admin-api';
import { euro } from '../totali';

const MESE_BREVE = new Intl.DateTimeFormat('it-IT', { month: 'short' });
const MESE_LUNGO = new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' });

function dataMese(mese: string): Date {
  const [anno, m] = mese.split('-').map(Number);
  return new Date(anno, m - 1, 1);
}

/** "2026-09" -> "set"; a gennaio (o sulla prima barra) aggiunge l'anno: "gen 27". */
export function etichettaMese(mese: string, primo: boolean): string {
  const d = dataMese(mese);
  const breve = MESE_BREVE.format(d).replace('.', '');
  return primo || d.getMonth() === 0 ? `${breve} ${String(d.getFullYear()).slice(2)}` : breve;
}

/** Tempo di risposta leggibile: 3 -> "3 ore", 50 -> "2,1 giorni". */
export function formattaOre(ore: number | null): string {
  if (ore === null) return '–';
  if (ore < 48) return `${ore.toLocaleString('it-IT', { maximumFractionDigits: 1 })} ${ore === 1 ? 'ora' : 'ore'}`;
  return `${(ore / 24).toLocaleString('it-IT', { maximumFractionDigits: 1 })} giorni`;
}

/** Fondo scala "tondo" per l'asse: 7 -> 8, 13 -> 15, 0 -> 1. */
export function fondoScala(massimo: number): number {
  if (massimo <= 1) return 1;
  const passo = massimo <= 10 ? 2 : massimo <= 50 ? 5 : 10 ** Math.floor(Math.log10(massimo));
  return Math.ceil(massimo / passo) * passo;
}

@Component({
  selector: 'app-admin-statistiche',
  template: `
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Statistiche</h1>
        <p class="mt-1 text-sm text-slate-600">Richieste arrivate nel periodo, contate una volta sola anche con più versioni di preventivo.</p>
      </div>
      <label class="text-sm text-slate-700">
        Periodo
        <!-- [selected] sulle opzioni: [value] sul select verrebbe applicato prima che le opzioni esistano -->
        <select class="ml-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5"
          (change)="mesi.set(+$any($event.target).value)">
          @for (m of periodi; track m) { <option [value]="m" [selected]="m === mesi()">Ultimi {{ m }} mesi</option> }
        </select>
      </label>
    </div>

    @if (dati.error()) {
      <p role="alert" class="mt-4 rounded-lg bg-red-50 p-4 text-red-800">Impossibile caricare le statistiche.</p>
    } @else if (dati.value(); as s) {
      <!-- Numeri principali -->
      <dl class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div class="rounded-2xl bg-white p-5 shadow-sm">
          <dt class="text-sm text-slate-600">Richieste ricevute</dt>
          <dd class="mt-1 text-3xl font-bold text-slate-900">{{ s.richieste }}</dd>
        </div>
        <div class="rounded-2xl bg-white p-5 shadow-sm">
          <dt class="text-sm text-slate-600">Con preventivo inviato</dt>
          <dd class="mt-1 text-3xl font-bold text-slate-900">{{ s.conPreventivo }}</dd>
        </div>
        <div class="rounded-2xl bg-white p-5 shadow-sm">
          <dt class="text-sm text-slate-600">Accettate</dt>
          <dd class="mt-1 text-3xl font-bold text-slate-900">
            {{ s.accettate }}
            <span class="text-base font-semibold text-slate-600">{{ tasso(s.tassoAccettazione) }}</span>
          </dd>
          <dd class="mt-1 text-xs text-slate-500">sulle richieste con preventivo · {{ s.rifiutate }} rifiutate</dd>
        </div>
        <div class="rounded-2xl bg-white p-5 shadow-sm">
          <dt class="text-sm text-slate-600">Valore accettato</dt>
          <dd class="mt-1 text-3xl font-bold text-slate-900">{{ euro(s.valoreAccettato) }}</dd>
          <dd class="mt-1 text-xs text-slate-500">IVA inclusa</dd>
        </div>
        <div class="rounded-2xl bg-white p-5 shadow-sm">
          <dt class="text-sm text-slate-600">Tempo medio per il preventivo</dt>
          <dd class="mt-1 text-3xl font-bold text-slate-900">{{ ore(s.oreMediePrimoPreventivo) }}</dd>
          <dd class="mt-1 text-xs text-slate-500">dalla richiesta al primo invio</dd>
        </div>
      </dl>

      <!-- Richieste per mese: una sola serie, niente legenda (la nomina il titolo) -->
      <section class="mt-6 rounded-2xl bg-white p-6 shadow-sm" aria-labelledby="titolo-mesi">
        <h2 id="titolo-mesi" class="font-semibold text-slate-900">Richieste per mese</h2>
        <p class="text-sm text-slate-500">Passa sulle barre per vedere quante sono state accettate.</p>

        <div class="relative mt-6 h-56 pl-8" aria-hidden="true">
          <!-- griglia: linee sottili e neutre -->
          @for (g of griglia(); track g.valore) {
            <div class="absolute right-0 left-8 border-t border-slate-200" [style.bottom.%]="g.posizione">
              <span class="absolute -top-2 -left-8 w-6 text-right text-xs text-slate-500">{{ g.valore }}</span>
            </div>
          }
          <div class="relative flex h-full items-end gap-0.5">
            @for (m of barre(); track m.mese) {
              <div class="group relative flex h-full flex-1 items-end justify-center">
                <div class="w-full max-w-6 rounded-t bg-[#2563eb] transition-opacity group-hover:opacity-80"
                  [style.height.%]="m.altezza" [class.min-h-px]="m.richieste > 0"></div>
                @if (m.etichettaValore) {
                  <span class="absolute text-xs font-semibold text-slate-700" [style.bottom]="'calc(' + m.altezza + '% + 4px)'">
                    {{ m.richieste }}
                  </span>
                }
                <!-- tooltip al passaggio del mouse; da tastiera e screen reader i dati sono nella tabella sotto -->
                <div class="pointer-events-none absolute bottom-full z-10 mb-2 hidden w-max rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg group-hover:block">
                  <p class="font-semibold capitalize">{{ m.nomeMese }}</p>
                  <p>{{ m.richieste }} {{ m.richieste === 1 ? 'richiesta' : 'richieste' }} · {{ m.accettate }} accettate</p>
                </div>
              </div>
            }
          </div>
        </div>
        <div class="mt-2 flex gap-0.5 pl-8 text-center text-xs text-slate-500" aria-hidden="true">
          @for (m of barre(); track m.mese) { <span class="flex-1 truncate">{{ m.etichetta }}</span> }
        </div>

        <details class="mt-4 text-sm">
          <summary class="cursor-pointer font-medium text-blue-800">Mostra i dati in tabella</summary>
          <table class="mt-3 w-full max-w-md">
            <caption class="sr-only">Richieste e accettazioni per mese</caption>
            <thead>
              <tr class="border-b border-slate-300 text-left text-slate-600">
                <th scope="col" class="py-1.5">Mese</th>
                <th scope="col" class="py-1.5 text-right">Richieste</th>
                <th scope="col" class="py-1.5 text-right">Accettate</th>
              </tr>
            </thead>
            <tbody>
              @for (m of barre(); track m.mese) {
                <tr class="border-b border-slate-100">
                  <th scope="row" class="py-1.5 text-left font-normal capitalize">{{ m.nomeMese }}</th>
                  <td class="py-1.5 text-right">{{ m.richieste }}</td>
                  <td class="py-1.5 text-right">{{ m.accettate }}</td>
                </tr>
              }
            </tbody>
          </table>
        </details>
      </section>

      <!-- Per servizio -->
      <section class="mt-6 rounded-2xl bg-white p-6 shadow-sm" aria-labelledby="titolo-servizi">
        <h2 id="titolo-servizi" class="font-semibold text-slate-900">Per servizio</h2>
        @if (s.perServizio.length === 0) {
          <p class="mt-3 text-sm text-slate-600">Nessuna richiesta nel periodo.</p>
        } @else {
          <table class="mt-3 w-full text-sm">
            <thead>
              <tr class="border-b border-slate-300 text-left text-slate-600">
                <th scope="col" class="py-2">Servizio</th>
                <th scope="col" class="w-2/5 py-2"><span class="sr-only">Quota delle richieste</span></th>
                <th scope="col" class="py-2 text-right">Richieste</th>
                <th scope="col" class="py-2 text-right">Accettate</th>
              </tr>
            </thead>
            <tbody>
              @for (r of s.perServizio; track r.slug) {
                <tr class="border-b border-slate-100">
                  <th scope="row" class="py-2 pr-3 text-left font-normal text-slate-900">{{ r.titolo }}</th>
                  <td class="py-2 pr-3" aria-hidden="true">
                    <div class="h-2 rounded-r bg-[#2563eb]" [style.width.%]="(r.richieste / massimoServizio()) * 100"></div>
                  </td>
                  <td class="py-2 text-right font-medium">{{ r.richieste }}</td>
                  <td class="py-2 text-right">{{ r.accettate }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </section>
    } @else {
      <p class="mt-6 text-slate-500">Caricamento…</p>
    }
  `,
})
export default class AdminStatistiche {
  private readonly api = inject(AdminApi);

  protected readonly periodi = [3, 6, 12, 24];
  protected readonly mesi = signal(12);
  protected readonly euro = euro;
  protected readonly ore = formattaOre;

  protected readonly dati = rxResource({
    params: () => this.mesi(),
    stream: ({ params }) => this.api.statistiche(params),
  });

  private readonly scala = computed(() =>
    fondoScala(Math.max(0, ...(this.dati.value()?.perMese.map((m) => m.richieste) ?? [0]))),
  );

  protected readonly griglia = computed(() => {
    const scala = this.scala();
    const meta = scala / 2;
    const valori = Number.isInteger(meta) && meta > 0 ? [0, meta, scala] : [0, scala];
    return valori.map((valore) => ({ valore, posizione: (valore / scala) * 100 }));
  });

  protected readonly barre = computed(() => {
    const mesi = this.dati.value()?.perMese ?? [];
    const scala = this.scala();
    const massimo = Math.max(...mesi.map((m) => m.richieste), 0);
    const indiceMassimo = mesi.findIndex((m) => m.richieste === massimo);
    return mesi.map((m, i) => ({
      ...m,
      altezza: (m.richieste / scala) * 100,
      etichetta: etichettaMese(m.mese, i === 0),
      nomeMese: MESE_LUNGO.format(dataMese(m.mese)),
      // etichette dirette solo dove raccontano qualcosa: il mese corrente e il picco
      etichettaValore: m.richieste > 0 && (i === mesi.length - 1 || i === indiceMassimo),
    }));
  });

  protected readonly massimoServizio = computed(() =>
    Math.max(1, ...(this.dati.value()?.perServizio.map((r) => r.richieste) ?? [1])),
  );

  protected tasso(t: number | null): string {
    return t === null ? '' : `(${Math.round(t * 100)}%)`;
  }
}
