import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormField, email, form, maxLength, pattern, required, submit, validate } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';
import { CATEGORIE, ProdottiApi } from '../core/prodotti-api';
import { NuovaRichiesta, RichiesteApi } from '../core/richieste-api';
import { Servizio } from '../core/servizi-api';
import { SITE, TELEFONO_LINK } from '../core/site.config';
import { SchedaTecnica } from './scheda-tecnica';

type Stato = 'compilazione' | 'inviata' | 'errore' | 'troppe';

/** Per i servizi con un catalogo: modello scelto, prodotto già del cliente o consiglio di Albrik. */
type SceltaProdotto = 'catalogo' | 'mio' | 'consiglio';

/** Dati del modulo: quelli della richiesta, più la scelta del prodotto che decide cosa inviare. */
type DatiModulo = Omit<NuovaRichiesta, 'prodottoSlug' | 'prodottoDelCliente'> & {
  sceltaProdotto: SceltaProdotto;
  prodottoSlug: string;
};

const INPUT =
  'mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 ' +
  'focus:border-blue-700 focus:ring-2 focus:ring-blue-200 focus:outline-none ' +
  'aria-invalid:border-red-600 aria-invalid:focus:ring-red-200';

@Component({
  selector: 'app-modulo-preventivo',
  imports: [FormField, RouterLink, SchedaTecnica],
  template: `
    @if (stato() === 'inviata') {
      <div role="status" class="rounded-2xl border border-green-200 bg-green-50 p-6">
        <h2 class="text-xl font-bold text-green-900">Richiesta inviata, grazie!</h2>
        <p class="mt-2 text-green-900">Ti ricontatteremo al più presto, di solito entro un giorno lavorativo.</p>
        <button type="button" class="mt-4 font-semibold text-green-900 underline" (click)="nuovaRichiesta()">
          Invia un'altra richiesta
        </button>
      </div>
    } @else {
      <form novalidate (submit)="invia($event)" class="space-y-5" aria-labelledby="titolo-modulo">
        <h2 id="titolo-modulo" class="text-2xl font-bold text-slate-900">Richiedi un preventivo</h2>
        <p class="text-sm text-slate-600">I campi con * sono obbligatori.</p>

        <div class="grid gap-5 sm:grid-cols-2">
          <div>
            <label for="nome" class="font-medium text-slate-800">Nome e cognome *</label>
            <input id="nome" type="text" autocomplete="name" [formField]="f.nome" [class]="input"
              [attr.aria-invalid]="mostraErrore(f.nome) || null" aria-describedby="nome-errore" />
            <p id="nome-errore" class="mt-1 text-sm text-red-700">{{ errore(f.nome) }}</p>
          </div>
          <div>
            <label for="email" class="font-medium text-slate-800">Email *</label>
            <input id="email" type="email" autocomplete="email" [formField]="f.email" [class]="input"
              [attr.aria-invalid]="mostraErrore(f.email) || null" aria-describedby="email-errore" />
            <p id="email-errore" class="mt-1 text-sm text-red-700">{{ errore(f.email) }}</p>
          </div>
          <div>
            <label for="telefono" class="font-medium text-slate-800">Telefono</label>
            <input id="telefono" type="tel" autocomplete="tel" [formField]="f.telefono" [class]="input"
              [attr.aria-invalid]="mostraErrore(f.telefono) || null" aria-describedby="telefono-errore" />
            <p id="telefono-errore" class="mt-1 text-sm text-red-700">{{ errore(f.telefono) }}</p>
          </div>
          <div>
            <label for="comune" class="font-medium text-slate-800">Comune</label>
            <input id="comune" type="text" autocomplete="address-level2" [formField]="f.comune" [class]="input"
              placeholder="es. Caserta" />
          </div>
        </div>

        <div>
          <label for="servizio" class="font-medium text-slate-800">Servizio di interesse</label>
          <select id="servizio" [formField]="f.servizioSlug" [class]="input">
            <option value="">Altro / non so</option>
            @for (s of servizi(); track s.slug) {
              <option [value]="s.slug">{{ s.titolo }}</option>
            }
          </select>
        </div>

        <!-- servizio con catalogo (es. caldaie): il modulo si espande per la scelta del modello -->
        @if (categoria(); as cat) {
          <fieldset class="entra rounded-2xl border border-blue-200 bg-blue-50/60 p-5">
            <legend class="px-1 font-medium text-slate-800">Quale {{ nomeCategoria().singolare }} vuoi installare?</legend>
            <div class="mt-1 grid gap-2 sm:grid-cols-3">
              @for (o of opzioni(); track o.valore) {
                <label class="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-800 has-checked:border-blue-700 has-checked:ring-2 has-checked:ring-blue-200">
                  <input type="radio" [value]="o.valore" [formField]="f.sceltaProdotto"
                    class="size-4 shrink-0 accent-blue-800" />
                  {{ o.etichetta }}
                </label>
              }
            </div>

            @if (modello().sceltaProdotto === 'catalogo') {
              <div class="mt-4">
                <label for="prodotto" class="font-medium text-slate-800">Modello *</label>
                <select id="prodotto" [formField]="f.prodottoSlug" [class]="input"
                  [attr.aria-invalid]="mostraErrore(f.prodottoSlug) || null" aria-describedby="prodotto-errore">
                  <option value="">{{ prodotti.isLoading() ? 'Caricamento…' : 'Scegli un modello' }}</option>
                  @for (p of prodotti.value(); track p.slug) {
                    <option [value]="p.slug">{{ p.nome }}</option>
                  }
                </select>
                <p id="prodotto-errore" class="mt-1 text-sm text-red-700">{{ errore(f.prodottoSlug) }}</p>
                <p class="text-sm text-slate-600">
                  Non sai quale scegliere?
                  <a [routerLink]="'/' + nomeCategoria().percorso" target="_blank" class="font-medium text-blue-800 underline">
                    Confronta i modelli<span class="sr-only"> (si apre in una nuova scheda)</span></a>.
                </p>
                @if (prodottoScelto(); as p) {
                  <app-scheda-tecnica class="mt-4 block max-w-sm" [prodotto]="p" [compatta]="true" />
                }
              </div>
            } @else if (modello().sceltaProdotto === 'mio') {
              <p class="mt-4 text-sm text-slate-700">
                Perfetto: nel messaggio indicaci marca e modello, così verifichiamo la compatibilità con il tuo impianto.
              </p>
            }
          </fieldset>
        }

        <div>
          <label for="messaggio" class="font-medium text-slate-800">Messaggio *</label>
          <textarea id="messaggio" rows="5" [formField]="f.messaggio" [class]="input"
            placeholder="Descrivi brevemente il lavoro: tipo di intervento, tempi, eventuali dettagli utili."
            [attr.aria-invalid]="mostraErrore(f.messaggio) || null" aria-describedby="messaggio-errore"></textarea>
          <p id="messaggio-errore" class="mt-1 text-sm text-red-700">{{ errore(f.messaggio) }}</p>
        </div>

        <!-- Honeypot: invisibile per le persone, i bot tendono a compilarlo -->
        <div class="absolute -left-[9999px]" aria-hidden="true">
          <label for="sito">Sito web</label>
          <input id="sito" type="text" tabindex="-1" autocomplete="off" [formField]="f.sito" />
        </div>

        <div>
          <div class="flex items-start gap-3">
            <input id="consenso" type="checkbox" [formField]="f.consensoPrivacy"
              class="mt-1 size-5 shrink-0 rounded border-slate-300 accent-blue-800"
              [attr.aria-invalid]="mostraErrore(f.consensoPrivacy) || null" aria-describedby="consenso-errore" />
            <label for="consenso" class="text-sm text-slate-700">
              Ho letto l'<a routerLink="/privacy" class="font-medium text-blue-800 underline">informativa privacy</a>
              e acconsento al trattamento dei miei dati per essere ricontattato. *
            </label>
          </div>
          <p id="consenso-errore" class="mt-1 text-sm text-red-700">{{ errore(f.consensoPrivacy) }}</p>
        </div>

        @if (stato() === 'errore') {
          <p role="alert" class="rounded-lg bg-red-50 p-4 text-red-800">
            Non è stato possibile inviare la richiesta. Riprova tra poco oppure chiamaci al
            <a [href]="telefonoLink" class="font-semibold underline">{{ site.telefono }}</a>.
          </p>
        } @else if (stato() === 'troppe') {
          <p role="alert" class="rounded-lg bg-amber-50 p-4 text-amber-900">
            Hai già inviato diverse richieste. Riprova tra qualche minuto oppure chiamaci al
            <a [href]="telefonoLink" class="font-semibold underline">{{ site.telefono }}</a>.
          </p>
        }

        <button type="submit" [disabled]="f().submitting()"
          class="pulsante w-full rounded-lg bg-orange-700 px-6 py-3 font-semibold text-white hover:bg-orange-800 disabled:opacity-60 sm:w-auto">
          {{ f().submitting() ? 'Invio in corso…' : 'Invia richiesta' }}
        </button>
      </form>
    }
  `,
})
export class ModuloPreventivo {
  /** Servizi selezionabili nel menu a tendina. */
  readonly servizi = input<Servizio[]>([]);
  /** Slug del servizio da preselezionare (es. arrivando dalla pagina di un servizio). */
  readonly servizioIniziale = input<string | undefined>();
  /** Slug del modello da preselezionare (es. arrivando dalla scheda di una caldaia). */
  readonly prodottoIniziale = input<string | undefined>();

  private readonly api = inject(RichiesteApi);
  private readonly prodottiApi = inject(ProdottiApi);

  protected readonly site = SITE;
  protected readonly telefonoLink = TELEFONO_LINK;
  protected readonly input = INPUT;
  protected readonly stato = signal<Stato>('compilazione');

  protected readonly modello = linkedSignal<DatiModulo>(() => this.datiIniziali());

  /** Catalogo collegato al servizio selezionato (es. CALDAIA per l'installazione caldaie). */
  protected readonly categoria = computed(
    () => this.servizi().find((s) => s.slug === this.modello().servizioSlug)?.categoriaProdotti ?? null,
  );
  protected readonly nomeCategoria = computed(() => CATEGORIE[this.categoria() ?? 'CALDAIA']);
  protected readonly opzioni = computed(() => [
    { valore: 'catalogo', etichetta: `Voglio sceglierne ${this.nomeCategoria().pronome}` },
    { valore: 'mio', etichetta: `Ho già ${this.nomeCategoria().conArticolo}` },
    { valore: 'consiglio', etichetta: 'Consigliatemi voi' },
  ]);

  /** Modelli del catalogo, caricati solo quando il servizio scelto ne ha uno. */
  protected readonly prodotti = rxResource({
    params: () => this.categoria() ?? undefined,
    stream: ({ params }) => (params ? this.prodottiApi.elenco(params) : of([])),
    defaultValue: [],
  });
  protected readonly prodottoScelto = computed(() =>
    this.prodotti.value().find((p) => p.slug === this.modello().prodottoSlug),
  );

  // Stesse regole della validazione del backend (NuovaRichiestaDto)
  protected readonly f = form(this.modello, (p) => {
    required(p.nome, { message: 'Inserisci il tuo nome' });
    maxLength(p.nome, 100, { message: 'Massimo 100 caratteri' });
    required(p.email, { message: 'Inserisci la tua email' });
    email(p.email, { message: 'Email non valida' });
    pattern(p.telefono, /^$|^[+0-9 ./-]{6,30}$/, { message: 'Numero di telefono non valido' });
    maxLength(p.comune, 100, { message: 'Massimo 100 caratteri' });
    required(p.prodottoSlug, {
      message: 'Scegli un modello',
      when: ({ valueOf }) => this.categoria() !== null && valueOf(p.sceltaProdotto) === 'catalogo',
    });
    required(p.messaggio, { message: 'Scrivi un messaggio' });
    maxLength(p.messaggio, 2000, { message: 'Massimo 2000 caratteri' });
    validate(p.consensoPrivacy, ({ value }) =>
      value() ? undefined : { kind: 'consenso', message: "Devi accettare l'informativa privacy" },
    );
  });

  protected mostraErrore(campo: (typeof this.f)[keyof DatiModulo]): boolean {
    const stato = campo();
    return stato.touched() && stato.invalid();
  }

  protected errore(campo: (typeof this.f)[keyof DatiModulo]): string {
    return this.mostraErrore(campo) ? (campo().errors()[0]?.message ?? 'Campo non valido') : '';
  }

  protected async invia(event: Event): Promise<void> {
    event.preventDefault();
    await submit(this.f, {
      action: async () => {
        try {
          await firstValueFrom(this.api.invia(this.richiesta()));
          this.stato.set('inviata');
        } catch (e) {
          this.stato.set(e instanceof HttpErrorResponse && e.status === 429 ? 'troppe' : 'errore');
        }
        return undefined;
      },
      // porta il cursore sul primo campo da correggere (accessibilità da tastiera e screen reader)
      onInvalid: (campo) => campo().errorSummary()[0]?.fieldTree().focusBoundControl(),
    });
  }

  protected nuovaRichiesta(): void {
    this.f().reset({ ...this.datiIniziali(), servizioSlug: '', sceltaProdotto: 'catalogo', prodottoSlug: '' });
    this.stato.set('compilazione');
  }

  /** Dati da inviare: la scelta del prodotto conta solo se il servizio ha un catalogo. */
  private richiesta(): NuovaRichiesta {
    const { sceltaProdotto, prodottoSlug, ...dati } = this.modello();
    const conCatalogo = this.categoria() !== null;
    return {
      ...dati,
      prodottoSlug: conCatalogo && sceltaProdotto === 'catalogo' ? prodottoSlug : null,
      prodottoDelCliente: !conCatalogo || sceltaProdotto === 'consiglio' ? null : sceltaProdotto === 'mio',
    };
  }

  private datiIniziali(): DatiModulo {
    return {
      nome: '',
      email: '',
      telefono: '',
      comune: '',
      servizioSlug: this.servizioIniziale() ?? '',
      sceltaProdotto: 'catalogo',
      prodottoSlug: this.prodottoIniziale() ?? '',
      messaggio: '',
      consensoPrivacy: false,
      sito: '',
    };
  }
}
