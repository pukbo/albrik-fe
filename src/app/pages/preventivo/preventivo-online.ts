import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { PreventivoOnline, PreventiviOnlineApi } from '../../core/preventivi-online-api';
import { Seo } from '../../core/seo';
import { TELEFONO_LINK } from '../../core/site.config';
import { euro } from '../../admin/totali';

type Scelta = 'nessuna' | 'accetta' | 'rifiuta';

/**
 * Pagina del link personale inviato con il preventivo: il cliente lo consulta, scarica il PDF
 * e lo accetta o rifiuta. Solo nel browser (niente SSR) e noindex: contiene dati personali.
 */
@Component({
  selector: 'app-preventivo-online',
  imports: [DatePipe],
  template: `
    <section class="mx-auto max-w-4xl px-4 py-10 md:py-14">
      @if (preventivo.error()) {
        <div class="rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 class="text-2xl font-bold text-slate-900">Preventivo non trovato</h1>
          <p class="mt-3 text-slate-600">
            Il link potrebbe essere incompleto. Controlla di averlo copiato per intero dall'email, oppure contattaci al
            <a [href]="telefonoLink" class="font-semibold text-blue-800 underline">telefono</a>.
          </p>
        </div>
      } @else if (preventivo.value(); as p) {
        <p class="text-sm font-semibold tracking-wide text-orange-700 uppercase">{{ p.impresa }}</p>
        <h1 class="mt-1 text-3xl font-extrabold text-slate-900">Preventivo n. {{ p.numero }}</h1>
        <p class="mt-2 text-slate-600">
          Per {{ p.clienteNome }} · emesso il {{ p.dataEmissione | date: 'dd/MM/yyyy' }} · valido fino al {{ p.scadenza | date: 'dd/MM/yyyy' }}
        </p>

        <!-- Stato -->
        <div aria-live="polite" class="mt-6">
          @switch (p.stato) {
            @case ('ACCETTATO') {
              <div role="status" class="rounded-2xl border border-green-200 bg-green-50 p-6 text-green-900">
                <h2 class="text-xl font-bold">Preventivo accettato, grazie!</h2>
                <p class="mt-2">
                  Accettato il {{ p.esitoIl | date: 'dd/MM/yyyy' }} alle {{ p.esitoIl | date: 'HH:mm' }} da {{ p.esitoNome }}.
                  Ti abbiamo inviato un'email di conferma con il PDF: ti contatteremo a breve per concordare l'inizio dei lavori.
                </p>
              </div>
            }
            @case ('RIFIUTATO') {
              <div role="status" class="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-800">
                <h2 class="text-xl font-bold">Preventivo rifiutato</h2>
                <p class="mt-2">Grazie per averci risposto. Se cambi idea o vuoi una proposta diversa, contattaci.</p>
              </div>
            }
            @case ('SOSTITUITO') {
              <div role="status" class="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
                <h2 class="text-xl font-bold">C'è una versione più recente</h2>
                <p class="mt-2">Questo preventivo è stato aggiornato: apri il link contenuto nell'ultima email che ti abbiamo inviato.</p>
              </div>
            }
            @default {
              @if (p.scaduto) {
                <div role="status" class="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
                  <h2 class="text-xl font-bold">Preventivo scaduto</h2>
                  <p class="mt-2">Il periodo di validità è terminato: contattaci e ti invieremo un preventivo aggiornato.</p>
                </div>
              }
            }
          }
        </div>

        <!-- Dettaglio -->
        <article class="mt-6 rounded-2xl bg-white p-6 shadow-sm md:p-8">
          @if (p.oggetto) { <p><span class="font-semibold">Oggetto:</span> {{ p.oggetto }}</p> }
          @if (p.luogoIntervento) { <p class="mt-1"><span class="font-semibold">Luogo dell'intervento:</span> {{ p.luogoIntervento }}</p> }

          <!-- Telefono: voci una sotto l'altra invece di una tabella da scorrere -->
          <ul class="mt-6 divide-y divide-slate-100 border-y border-slate-200 text-sm sm:hidden" aria-label="Voci del preventivo">
            @for (r of p.righe; track $index) {
              <li class="py-3">
                <p class="font-medium whitespace-pre-line text-slate-900">{{ r.descrizione }}</p>
                <p class="mt-1 flex justify-between gap-3 text-slate-600">
                  <span>{{ r.quantita }} {{ r.unitaMisura }} × {{ euro(r.prezzoUnitario) }} · IVA {{ r.aliquotaIva }}%</span>
                  <span class="font-medium whitespace-nowrap text-slate-900">{{ euro(r.importo) }}</span>
                </p>
              </li>
            }
          </ul>

          <div class="mt-6 hidden sm:block">
            <table class="w-full text-sm">
              <caption class="sr-only">Voci del preventivo</caption>
              <thead>
                <tr class="border-b border-slate-300 text-left text-xs tracking-wide text-slate-500 uppercase">
                  <th scope="col" class="py-2 pr-2">Descrizione</th>
                  <th scope="col" class="py-2 pr-2 text-right">Q.tà</th>
                  <th scope="col" class="py-2 pr-2 text-right">Prezzo</th>
                  <th scope="col" class="py-2 pr-2 text-right">IVA</th>
                  <th scope="col" class="py-2 text-right">Importo</th>
                </tr>
              </thead>
              <tbody>
                @for (r of p.righe; track $index) {
                  <tr class="border-b border-slate-100 align-top">
                    <td class="py-2 pr-2 whitespace-pre-line">{{ r.descrizione }}</td>
                    <td class="py-2 pr-2 text-right whitespace-nowrap">{{ r.quantita }} {{ r.unitaMisura }}</td>
                    <td class="py-2 pr-2 text-right whitespace-nowrap">{{ euro(r.prezzoUnitario) }}</td>
                    <td class="py-2 pr-2 text-right">{{ r.aliquotaIva }}%</td>
                    <td class="py-2 text-right whitespace-nowrap">{{ euro(r.importo) }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <dl class="mt-4 ml-auto max-w-xs space-y-1 text-sm">
            <div class="flex justify-between"><dt>Imponibile</dt><dd>{{ euro(p.totali.imponibile) }}</dd></div>
            @for (a of p.totali.perAliquota; track a.aliquota) {
              <div class="flex justify-between text-slate-600"><dt>IVA {{ a.aliquota }}%</dt><dd>{{ euro(a.iva) }}</dd></div>
            }
            <div class="flex justify-between border-t border-slate-300 pt-2 text-lg font-bold text-blue-950">
              <dt>Totale</dt><dd>{{ euro(p.totali.totale) }}</dd>
            </div>
          </dl>

          <div class="mt-6 space-y-4 text-sm text-slate-700">
            @for (c of condizioni(); track c.titolo) {
              <div>
                <h2 class="font-semibold text-slate-900">{{ c.titolo }}</h2>
                <p class="mt-1 whitespace-pre-line">{{ c.testo }}</p>
              </div>
            }
            <div>
              <h2 class="font-semibold text-slate-900">Diritto di recesso</h2>
              <p class="mt-1">{{ p.recesso }}</p>
            </div>
          </div>

          <a [href]="urlPdf()" class="mt-6 inline-block rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50">
            Scarica il PDF
          </a>
        </article>

        <!-- Risposta del cliente -->
        @if (p.stato === 'INVIATO' && !p.scaduto) {
          <section class="mt-6 rounded-2xl bg-white p-6 shadow-sm md:p-8" aria-labelledby="titolo-risposta">
            <h2 id="titolo-risposta" class="text-xl font-bold text-slate-900">La tua risposta</h2>

            @if (errore()) {
              <p role="alert" class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{{ errore() }}</p>
            }

            @switch (scelta()) {
              @case ('accetta') {
                <form class="mt-4 space-y-4" (submit)="accetta($event)" novalidate>
                  <div>
                    <label for="nome" class="font-medium text-slate-800">Nome e cognome *</label>
                    <input id="nome" type="text" autocomplete="name" maxlength="150" [value]="nome()" (input)="nome.set(testo($event))"
                      class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-blue-700 focus:ring-2 focus:ring-blue-200 focus:outline-none" />
                  </div>
                  <label class="flex items-start gap-3 text-sm text-slate-700">
                    <input type="checkbox" class="mt-0.5 size-5 shrink-0 accent-blue-800" [checked]="presaVisione()"
                      (change)="presaVisione.set($any($event.target).checked)" />
                    <span>
                      Dichiaro di aver letto il preventivo n. {{ p.numero }} e le sue condizioni, compreso il diritto di recesso,
                      e di accettarlo per un totale di {{ euro(p.totali.totale) }}. *
                    </span>
                  </label>
                  <div class="flex flex-wrap gap-2">
                    <button type="submit" [disabled]="occupato()"
                      class="rounded-lg bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-60">
                      {{ occupato() ? 'Invio…' : 'Confermo e accetto' }}
                    </button>
                    <button type="button" (click)="scelta.set('nessuna')" class="rounded-lg px-4 py-3 font-semibold text-slate-700 hover:bg-slate-100">Annulla</button>
                  </div>
                </form>
              }
              @case ('rifiuta') {
                <form class="mt-4 space-y-4" (submit)="rifiuta($event)" novalidate>
                  <div>
                    <label for="motivo" class="font-medium text-slate-800">Vuoi dirci il motivo? (facoltativo)</label>
                    <textarea id="motivo" rows="3" maxlength="1000" [value]="motivo()" (input)="motivo.set(testo($event))"
                      class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-blue-700 focus:ring-2 focus:ring-blue-200 focus:outline-none"></textarea>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <button type="submit" [disabled]="occupato()"
                      class="rounded-lg bg-slate-700 px-6 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
                      {{ occupato() ? 'Invio…' : 'Conferma il rifiuto' }}
                    </button>
                    <button type="button" (click)="scelta.set('nessuna')" class="rounded-lg px-4 py-3 font-semibold text-slate-700 hover:bg-slate-100">Annulla</button>
                  </div>
                </form>
              }
              @default {
                <p class="mt-2 text-slate-600">Puoi accettare il preventivo qui online: riceverai subito un'email di conferma.</p>
                <div class="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button type="button" (click)="scelta.set('accetta')"
                    class="rounded-lg bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800">Accetta il preventivo</button>
                  <button type="button" (click)="scelta.set('rifiuta')"
                    class="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50">Non sono interessato</button>
                </div>
              }
            }
          </section>
        }

        <p class="mt-6 text-sm text-slate-600">
          Domande? Chiama il <a [href]="telefonoLink" class="font-semibold text-blue-800 underline">{{ p.telefono }}</a>
          o scrivi a <a [href]="'mailto:' + p.email" class="font-semibold text-blue-800 underline">{{ p.email }}</a>.
        </p>
      } @else {
        <p class="text-slate-500">Caricamento del preventivo…</p>
      }
    </section>
  `,
})
export default class PreventivoOnlinePagina {
  readonly token = input.required<string>();

  private readonly api = inject(PreventiviOnlineApi);

  protected readonly telefonoLink = TELEFONO_LINK;
  protected readonly euro = euro;

  protected readonly preventivo = rxResource({
    params: () => this.token(),
    stream: ({ params }) => this.api.preventivo(params),
  });

  protected readonly urlPdf = computed(() => this.api.urlPdf(this.token()));
  protected readonly condizioni = computed(() => {
    const p = this.preventivo.value();
    if (!p) return [];
    return [
      { titolo: 'Tempi di esecuzione', testo: p.tempiEsecuzione },
      { titolo: 'Condizioni di pagamento', testo: p.condizioniPagamento },
      { titolo: 'Garanzie', testo: p.garanzie },
      { titolo: 'Esclusioni', testo: p.esclusioni },
      { titolo: 'Note', testo: p.note },
    ].filter((c): c is { titolo: string; testo: string } => !!c.testo);
  });

  protected readonly scelta = signal<Scelta>('nessuna');
  protected readonly nome = signal('');
  protected readonly presaVisione = signal(false);
  protected readonly motivo = signal('');
  protected readonly occupato = signal(false);
  protected readonly errore = signal('');

  constructor() {
    inject(Seo).aggiorna({
      title: 'Il tuo preventivo | Albrik',
      description: 'Consulta e accetta online il tuo preventivo.',
      path: '/preventivo',
      noindex: true,
    });
  }

  protected testo(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected async accetta(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.nome().trim()) {
      this.errore.set('Scrivi il tuo nome e cognome.');
      return;
    }
    if (!this.presaVisione()) {
      this.errore.set('Spunta la casella per confermare di aver letto il preventivo e le condizioni.');
      return;
    }
    await this.invia(() => this.api.accetta(this.token(), this.nome().trim(), true));
  }

  protected async rifiuta(event: Event): Promise<void> {
    event.preventDefault();
    await this.invia(() => this.api.rifiuta(this.token(), this.motivo().trim()));
  }

  private async invia(azione: () => ReturnType<PreventiviOnlineApi['accetta']>): Promise<void> {
    this.occupato.set(true);
    this.errore.set('');
    try {
      const aggiornato: PreventivoOnline = await firstValueFrom(azione());
      this.preventivo.set(aggiornato);
      this.scelta.set('nessuna');
    } catch (e) {
      const corpo = e instanceof HttpErrorResponse ? (e.error as { errore?: string } | null) : null;
      this.errore.set(corpo?.errore ?? 'Operazione non riuscita. Riprova o contattaci.');
    } finally {
      this.occupato.set(false);
    }
  }
}
