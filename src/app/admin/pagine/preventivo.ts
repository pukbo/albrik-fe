import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, linkedSignal, numberAttribute, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AdminApi, DatiPreventivo, EmailPreventivo, Preventivo, RigaPreventivo } from '../admin-api';
import { messaggiErrore } from '../errori';
import { infoStatoPreventivo } from '../stati';
import { calcolaTotali, euro, importoRiga } from '../totali';

type CampoTesto = Exclude<keyof DatiPreventivo, 'righe' | 'validitaGiorni'>;

const CAMPO =
  'mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 ' +
  'focus:border-blue-700 focus:ring-2 focus:ring-blue-200 focus:outline-none disabled:bg-slate-50 disabled:text-slate-600';

/** Solo i campi modificabili, per confrontare la bozza con l'ultima versione salvata. */
function datiDi(p: Preventivo): DatiPreventivo {
  return {
    dataEmissione: p.dataEmissione,
    validitaGiorni: p.validitaGiorni,
    clienteNome: p.clienteNome,
    clienteIndirizzo: p.clienteIndirizzo,
    clienteCodiceFiscale: p.clienteCodiceFiscale,
    clienteEmail: p.clienteEmail,
    luogoIntervento: p.luogoIntervento,
    oggetto: p.oggetto,
    tempiEsecuzione: p.tempiEsecuzione,
    condizioniPagamento: p.condizioniPagamento,
    garanzie: p.garanzie,
    esclusioni: p.esclusioni,
    note: p.note,
    righe: p.righe.map((r) => ({
      descrizione: r.descrizione,
      unitaMisura: r.unitaMisura,
      quantita: r.quantita,
      prezzoUnitario: r.prezzoUnitario,
      aliquotaIva: r.aliquotaIva,
    })),
  };
}

@Component({
  selector: 'app-admin-preventivo',
  imports: [RouterLink, DatePipe],
  template: `
    @if (preventivo.error()) {
      <p role="alert" class="rounded-lg bg-red-50 p-4 text-red-800">Preventivo non trovato.</p>
    } @else if (preventivo.value(); as p) {
      @if (bozza(); as b) {
        <a [routerLink]="['/admin/richieste', p.richiestaId]" class="text-sm font-medium text-blue-800 hover:underline">
          ← Torna alla richiesta
        </a>

        <!-- Intestazione e azioni -->
        <div class="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div class="flex flex-wrap items-center gap-3">
              <h1 class="text-2xl font-bold text-slate-900">Preventivo n. {{ p.numero }}</h1>
              <span [class]="'rounded-full px-2.5 py-0.5 text-xs font-semibold ' + infoStato(p.stato).classi">
                {{ infoStato(p.stato).etichetta }}
              </span>
            </div>
            @if (p.inviatoIl) {
              <p class="mt-1 text-sm text-slate-600">
                Inviato a {{ p.inviatoA }} il {{ p.inviatoIl | date: 'dd/MM/yyyy' }} alle {{ p.inviatoIl | date: 'HH:mm' }}.
                Per modificarlo crea una nuova versione.
              </p>
            } @else if (modificato()) {
              <p class="mt-1 text-sm text-amber-800">Modifiche non salvate</p>
            }
          </div>
          <div class="flex flex-wrap gap-2">
            <button type="button" (click)="anteprima()" [disabled]="occupato()" [class]="bottoneSecondario">Anteprima PDF</button>
            @if (solaLettura()) {
              <button type="button" (click)="nuovaVersione()" [disabled]="occupato()" [class]="bottoneSecondario">Crea nuova versione</button>
              @if (p.stato === 'INVIATO' || p.stato === 'ACCETTATO') {
                <button type="button" (click)="apriInvio()" [disabled]="occupato()" [class]="bottoneSecondario">Invia di nuovo</button>
              }
            } @else {
              <button type="button" (click)="elimina()" [disabled]="occupato()"
                class="rounded-lg px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">Elimina bozza</button>
              <button type="button" (click)="salva()" [disabled]="occupato() || !modificato()" [class]="bottoneSecondario">Salva</button>
              <button type="button" (click)="apriInvio()" [disabled]="occupato()"
                class="rounded-lg bg-orange-700 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-800 disabled:opacity-60">
                Invia al cliente
              </button>
            }
          </div>
        </div>

        <div aria-live="polite" class="mt-3 space-y-2">
          @if (errori().length) {
            <div role="alert" class="rounded-lg bg-red-50 p-4 text-sm text-red-800">
              <ul class="list-inside list-disc">
                @for (e of errori(); track $index) { <li>{{ e }}</li> }
              </ul>
            </div>
          }
          @if (messaggio()) {
            <p class="rounded-lg bg-green-50 p-3 text-sm text-green-900">{{ messaggio() }}</p>
          }
        </div>

        <!-- Esito online e link personale del cliente -->
        @if (p.esito; as e) {
          <section [class]="'mt-4 rounded-2xl p-5 ' + (p.stato === 'ACCETTATO' ? 'bg-green-50 text-green-900' : 'bg-slate-100 text-slate-800')"
            aria-label="Risposta del cliente">
            <p class="font-semibold">
              {{ p.stato === 'ACCETTATO' ? 'Accettato online' : 'Rifiutato online' }}
              il {{ e.il | date: 'dd/MM/yyyy' }} alle {{ e.il | date: 'HH:mm' }}
              @if (e.nome) { da {{ e.nome }} }
            </p>
            @if (e.note) { <p class="mt-1 text-sm">Motivo: {{ e.note }}</p> }
            <p class="mt-1 text-xs opacity-75">IP registrato: {{ e.ip }}</p>
          </section>
        }
        @if (p.linkAccettazione) {
          <div class="mt-4 flex flex-wrap items-center gap-2 rounded-2xl bg-white p-4 text-sm shadow-sm">
            <span class="font-medium text-slate-700">Link del cliente:</span>
            <a [href]="p.linkAccettazione" target="_blank" rel="noopener" class="min-w-0 truncate text-blue-800 hover:underline">
              {{ p.linkAccettazione }}
            </a>
            <button type="button" (click)="copiaLink(p.linkAccettazione)" class="ml-auto rounded-md px-2 py-1 font-semibold text-slate-700 hover:bg-slate-100">
              {{ copiato() ? 'Copiato ✓' : 'Copia' }}
            </button>
          </div>
        }

        <!-- Pannello di invio -->
        @if (email(); as m) {
          <section class="mt-4 rounded-2xl border-2 border-orange-200 bg-white p-6 shadow-sm" aria-labelledby="titolo-invio">
            <h2 id="titolo-invio" class="font-semibold text-slate-900">Invia il preventivo al cliente</h2>
            <p class="mt-1 text-sm text-slate-600">Il PDF n. {{ p.numero }} verrà allegato all'email.</p>
            <label for="email-a" class="mt-4 block text-sm font-medium text-slate-700">Destinatario</label>
            <input id="email-a" type="email" [class]="campo" [value]="m.destinatario"
              (input)="modificaEmail({ destinatario: testo($event) })" />
            <label for="email-oggetto" class="mt-3 block text-sm font-medium text-slate-700">Oggetto</label>
            <input id="email-oggetto" type="text" [class]="campo" [value]="m.oggetto"
              (input)="modificaEmail({ oggetto: testo($event) })" />
            <label for="email-testo" class="mt-3 block text-sm font-medium text-slate-700">Messaggio</label>
            <textarea id="email-testo" rows="9" [class]="campo" [value]="m.messaggio"
              (input)="modificaEmail({ messaggio: testo($event) })"></textarea>
            <div class="mt-4 flex flex-wrap justify-end gap-2">
              <button type="button" (click)="email.set(null)" [class]="bottoneSecondario">Annulla</button>
              <button type="button" (click)="invia()" [disabled]="occupato()"
                class="rounded-lg bg-orange-700 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-800 disabled:opacity-60">
                {{ occupato() ? 'Invio in corso…' : 'Conferma e invia' }}
              </button>
            </div>
          </section>
        }

        <fieldset [disabled]="solaLettura()" class="mt-6 space-y-6">
          <legend class="sr-only">Dati del preventivo</legend>

          <!-- Cliente e intestazione -->
          <section class="rounded-2xl bg-white p-6 shadow-sm" aria-labelledby="titolo-cliente">
            <h2 id="titolo-cliente" class="font-semibold text-slate-900">Cliente e intervento</h2>
            <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div class="lg:col-span-2">
                <label for="cliente-nome" class="text-sm font-medium text-slate-700">Nome o ragione sociale *</label>
                <input id="cliente-nome" type="text" [class]="campo" [value]="b.clienteNome" (input)="aggiorna('clienteNome', testo($event))" />
              </div>
              <div>
                <label for="cliente-cf" class="text-sm font-medium text-slate-700">Codice fiscale / P.IVA</label>
                <input id="cliente-cf" type="text" [class]="campo" [value]="b.clienteCodiceFiscale ?? ''" (input)="aggiorna('clienteCodiceFiscale', testo($event))" />
              </div>
              <div class="lg:col-span-2">
                <label for="cliente-indirizzo" class="text-sm font-medium text-slate-700">Indirizzo del cliente</label>
                <input id="cliente-indirizzo" type="text" [class]="campo" [value]="b.clienteIndirizzo ?? ''" (input)="aggiorna('clienteIndirizzo', testo($event))" />
              </div>
              <div>
                <label for="cliente-email" class="text-sm font-medium text-slate-700">Email del cliente</label>
                <input id="cliente-email" type="email" [class]="campo" [value]="b.clienteEmail ?? ''" (input)="aggiorna('clienteEmail', testo($event))" />
              </div>
              <div class="lg:col-span-2">
                <label for="luogo" class="text-sm font-medium text-slate-700">Luogo dell'intervento</label>
                <input id="luogo" type="text" [class]="campo" [value]="b.luogoIntervento ?? ''" (input)="aggiorna('luogoIntervento', testo($event))" />
              </div>
              <div>
                <label for="data" class="text-sm font-medium text-slate-700">Data di emissione *</label>
                <input id="data" type="date" [class]="campo" [value]="b.dataEmissione" (input)="aggiorna('dataEmissione', testo($event))" />
              </div>
              <div class="lg:col-span-2">
                <label for="oggetto" class="text-sm font-medium text-slate-700">Oggetto</label>
                <input id="oggetto" type="text" [class]="campo" [value]="b.oggetto ?? ''" (input)="aggiorna('oggetto', testo($event))" />
              </div>
              <div>
                <label for="validita" class="text-sm font-medium text-slate-700">Validità (giorni) *</label>
                <input id="validita" type="number" min="1" max="365" [class]="campo" [value]="b.validitaGiorni"
                  (input)="imposta({ validitaGiorni: numero($event) ?? 0 })" />
              </div>
            </div>
          </section>

          <!-- Righe -->
          <section class="rounded-2xl bg-white p-6 shadow-sm" aria-labelledby="titolo-righe">
            <h2 id="titolo-righe" class="font-semibold text-slate-900">Voci del preventivo</h2>

            @if (b.righe.length === 0) {
              <p class="mt-3 text-sm text-slate-600">Nessuna voce. Aggiungi la prima riga.</p>
            } @else {
              <div class="mt-4 hidden gap-2 text-xs font-semibold tracking-wide text-slate-500 uppercase lg:grid lg:grid-cols-[1fr_6rem_5.5rem_7.5rem_5rem_7rem_6.5rem]">
                <span>Descrizione</span><span>U.M.</span><span>Q.tà</span><span>Prezzo unit.</span><span>IVA</span>
                <span class="text-right">Importo</span><span></span>
              </div>
            }

            <ol class="mt-2 space-y-4 lg:space-y-2">
              @for (r of b.righe; track $index; let i = $index, primo = $first, ultimo = $last) {
                <li class="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 p-3 lg:grid-cols-[1fr_6rem_5.5rem_7.5rem_5rem_7rem_6.5rem] lg:items-start lg:border-0 lg:p-0">
                  <textarea rows="2" [attr.aria-label]="'Descrizione riga ' + (i + 1)" placeholder="Descrizione"
                    [class]="campo + ' col-span-2 lg:col-span-1 mt-0!'" [value]="r.descrizione"
                    (input)="aggiornaRiga(i, { descrizione: testo($event) })"></textarea>
                  <input type="text" [attr.aria-label]="'Unità di misura riga ' + (i + 1)" placeholder="U.M." list="unita-misura"
                    [class]="campo + ' mt-0!'" [value]="r.unitaMisura ?? ''" (input)="aggiornaRiga(i, { unitaMisura: testo($event) || null })" />
                  <input type="number" min="0.01" step="0.01" [attr.aria-label]="'Quantità riga ' + (i + 1)" placeholder="Q.tà"
                    [class]="campo + ' mt-0!'" [value]="r.quantita ?? ''" (input)="aggiornaRiga(i, { quantita: numero($event) })" />
                  <input type="number" min="0" step="0.01" [attr.aria-label]="'Prezzo unitario riga ' + (i + 1)" placeholder="Prezzo €"
                    [class]="campo + ' mt-0!'" [value]="r.prezzoUnitario ?? ''" (input)="aggiornaRiga(i, { prezzoUnitario: numero($event) })" />
                  <select [attr.aria-label]="'Aliquota IVA riga ' + (i + 1)" [class]="campo + ' mt-0!'" [value]="r.aliquotaIva"
                    (change)="aggiornaRiga(i, { aliquotaIva: numero($event) ?? 22 })">
                    @for (a of aliquote(); track a) { <option [value]="a">{{ a }}%</option> }
                  </select>
                  <span class="self-center text-right font-medium text-slate-900">{{ euro(importo(r)) }}</span>
                  <span class="col-span-2 flex justify-end gap-1 self-center lg:col-span-1" [class.invisible]="solaLettura()">
                    <button type="button" (click)="sposta(i, -1)" [disabled]="primo" [attr.aria-label]="'Sposta su riga ' + (i + 1)"
                      class="rounded-md px-2 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-30">↑</button>
                    <button type="button" (click)="sposta(i, 1)" [disabled]="ultimo" [attr.aria-label]="'Sposta giù riga ' + (i + 1)"
                      class="rounded-md px-2 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-30">↓</button>
                    <button type="button" (click)="rimuovi(i)" [attr.aria-label]="'Elimina riga ' + (i + 1)"
                      class="rounded-md px-2 py-1 text-red-700 hover:bg-red-50">✕</button>
                  </span>
                </li>
              }
            </ol>
            <datalist id="unita-misura">
              <option value="pz"></option><option value="mq"></option><option value="ml"></option>
              <option value="h"></option><option value="a corpo"></option>
            </datalist>

            @if (!solaLettura()) {
              <button type="button" (click)="aggiungiRiga()"
                class="mt-4 rounded-lg border border-dashed border-slate-400 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                + Aggiungi riga
              </button>
            }

            <dl class="mt-6 ml-auto max-w-sm space-y-1 text-sm">
              <div class="flex justify-between"><dt>Imponibile</dt><dd>{{ euro(totali().imponibile) }}</dd></div>
              @for (a of totali().perAliquota; track a.aliquota) {
                <div class="flex justify-between text-slate-600"><dt>IVA {{ a.aliquota }}% su {{ euro(a.imponibile) }}</dt><dd>{{ euro(a.iva) }}</dd></div>
              }
              <div class="flex justify-between border-t border-slate-300 pt-2 text-lg font-bold text-blue-950">
                <dt>Totale</dt><dd>{{ euro(totali().totale) }}</dd>
              </div>
            </dl>
          </section>

          <!-- Condizioni -->
          <section class="rounded-2xl bg-white p-6 shadow-sm" aria-labelledby="titolo-condizioni">
            <h2 id="titolo-condizioni" class="font-semibold text-slate-900">Condizioni</h2>
            <div class="mt-4 grid gap-4 lg:grid-cols-2">
              @for (c of campiCondizioni; track c.campo) {
                <div>
                  <label [for]="c.campo" class="text-sm font-medium text-slate-700">{{ c.etichetta }}</label>
                  <textarea [id]="c.campo" rows="3" [class]="campo" [value]="b[c.campo] ?? ''" (input)="aggiorna(c.campo, testo($event))"></textarea>
                </div>
              }
            </div>
            <p class="mt-3 text-xs text-slate-500">
              IBAN, diritto di recesso, privacy e spazio per la firma vengono aggiunti automaticamente al PDF.
            </p>
          </section>
        </fieldset>
      }
    } @else {
      <p class="text-slate-500">Caricamento…</p>
    }
  `,
})
export default class AdminPreventivo {
  readonly id = input.required({ transform: numberAttribute });

  private readonly api = inject(AdminApi);
  private readonly router = inject(Router);

  protected readonly campo = CAMPO;
  protected readonly bottoneSecondario =
    'rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60';
  protected readonly euro = euro;
  protected readonly importo = importoRiga;
  protected readonly campiCondizioni: { campo: CampoTesto; etichetta: string }[] = [
    { campo: 'tempiEsecuzione', etichetta: 'Tempi di esecuzione' },
    { campo: 'condizioniPagamento', etichetta: 'Condizioni di pagamento' },
    { campo: 'garanzie', etichetta: 'Garanzie' },
    { campo: 'esclusioni', etichetta: 'Esclusioni' },
    { campo: 'note', etichetta: 'Note' },
  ];

  protected readonly preventivo = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.api.preventivo(params),
  });
  private readonly configurazione = rxResource({ stream: () => this.api.configurazionePreventivi() });

  /** Copia modificabile, riallineata ogni volta che il preventivo viene (ri)caricato o salvato. */
  protected readonly bozza = linkedSignal<DatiPreventivo | null>(() => {
    const p = this.preventivo.value();
    return p ? datiDi(p) : null;
  });

  protected readonly modificato = computed(() => {
    const p = this.preventivo.value();
    return !!p && JSON.stringify(this.bozza()) !== JSON.stringify(datiDi(p));
  });
  /** Solo le bozze sono modificabili: dall'invio in poi si crea una nuova versione. */
  protected readonly solaLettura = computed(() => {
    const stato = this.preventivo.value()?.stato;
    return !!stato && stato !== 'BOZZA';
  });
  protected readonly infoStato = infoStatoPreventivo;
  protected readonly copiato = signal(false);

  protected async copiaLink(link: string): Promise<void> {
    await navigator.clipboard.writeText(link);
    this.copiato.set(true);
    setTimeout(() => this.copiato.set(false), 2000);
  }
  protected readonly totali = computed(() => calcolaTotali(this.bozza()?.righe ?? []));
  protected readonly aliquote = computed(() => this.configurazione.value()?.aliquoteIva ?? [4, 10, 22]);

  protected readonly occupato = signal(false);
  protected readonly errori = signal<string[]>([]);
  protected readonly messaggio = signal('');
  protected readonly email = signal<EmailPreventivo | null>(null);

  protected testo(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected numero(event: Event): number | null {
    const valore = Number((event.target as HTMLInputElement).value);
    return (event.target as HTMLInputElement).value === '' || Number.isNaN(valore) ? null : valore;
  }

  /**
   * Applica le modifiche all'ultimo valore della bozza. Non usare mai la variabile del template (b):
   * è la copia dell'ultimo rendering e sovrascriverebbe le modifiche fatte nel frattempo.
   */
  protected imposta(modifica: Partial<DatiPreventivo>): void {
    this.bozza.update((b) => (b ? { ...b, ...modifica } : b));
  }

  protected aggiorna(campo: CampoTesto, valore: string): void {
    this.imposta({ [campo]: valore });
  }

  protected modificaEmail(modifica: Partial<EmailPreventivo>): void {
    this.email.update((m) => (m ? { ...m, ...modifica } : m));
  }

  protected aggiornaRiga(indice: number, modifica: Partial<RigaPreventivo>): void {
    this.bozza.update((b) => (b ? { ...b, righe: b.righe.map((r, i) => (i === indice ? { ...r, ...modifica } : r)) } : b));
  }

  protected aggiungiRiga(): void {
    const aliquotaIva = this.configurazione.value()?.aliquotaPredefinita ?? 22;
    this.bozza.update((b) =>
      b ? { ...b, righe: [...b.righe, { descrizione: '', unitaMisura: null, quantita: 1, prezzoUnitario: null, aliquotaIva }] } : b,
    );
  }

  protected rimuovi(indice: number): void {
    this.bozza.update((b) => (b ? { ...b, righe: b.righe.filter((_, i) => i !== indice) } : b));
  }

  protected sposta(indice: number, direzione: -1 | 1): void {
    this.bozza.update((b) => {
      if (!b) return b;
      const righe = [...b.righe];
      [righe[indice], righe[indice + direzione]] = [righe[indice + direzione], righe[indice]];
      return { ...b, righe };
    });
  }

  /** Salva la bozza; restituisce false se il backend ha rifiutato i dati. */
  protected async salva(): Promise<boolean> {
    const dati = this.bozza();
    if (!dati) return false;
    return this.esegui(async () => {
      this.preventivo.set(await firstValueFrom(this.api.salvaPreventivo(this.id(), dati)));
      this.messaggio.set('Preventivo salvato.');
    });
  }

  protected async anteprima(): Promise<void> {
    // aperta subito (non dopo un await) per non essere bloccata dal browser come popup
    const finestra = window.open('', '_blank');
    if (this.modificato() && !(await this.salva())) {
      finestra?.close();
      return;
    }
    if (finestra) {
      finestra.location.href = this.api.urlPdf(this.id());
    }
  }

  protected async apriInvio(): Promise<void> {
    if (this.modificato() && !(await this.salva())) return;
    await this.esegui(async () => {
      this.email.set(await firstValueFrom(this.api.emailProposta(this.id())));
    });
  }

  protected async invia(): Promise<void> {
    const email = this.email();
    if (!email) return;
    await this.esegui(async () => {
      const esito = await firstValueFrom(this.api.inviaPreventivo(this.id(), email));
      this.preventivo.set(esito.preventivo);
      this.email.set(null);
      this.messaggio.set(
        esito.simulato
          ? `SMTP non configurato: l'email NON è partita. PDF e testo sono stati salvati nella cartella "email-sviluppo" del backend.`
          : `Preventivo inviato a ${email.destinatario}.`,
      );
    });
  }

  protected async elimina(): Promise<void> {
    const p = this.preventivo.value();
    if (!p || !confirm(`Eliminare la bozza del preventivo n. ${p.numero}?`)) return;
    await this.esegui(async () => {
      await firstValueFrom(this.api.eliminaPreventivo(p.id));
      await this.router.navigate(['/admin/richieste', p.richiestaId]);
    });
  }

  protected async nuovaVersione(): Promise<void> {
    await this.esegui(async () => {
      const copia = await firstValueFrom(this.api.duplicaPreventivo(this.id()));
      await this.router.navigate(['/admin/preventivi', copia.id]);
    });
  }

  private async esegui(azione: () => Promise<void>): Promise<boolean> {
    this.occupato.set(true);
    this.errori.set([]);
    this.messaggio.set('');
    try {
      await azione();
      return true;
    } catch (e) {
      this.errori.set(messaggiErrore(e));
      return false;
    } finally {
      this.occupato.set(false);
    }
  }
}
