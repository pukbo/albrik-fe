import { Component, computed, inject, input, linkedSignal, numberAttribute, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';
import { fotoServizio } from '../../core/immagini';
import { CATEGORIE, CategoriaProdotto } from '../../core/prodotti-api';
import { Faq } from '../../core/servizi-api';
import { SITE } from '../../core/site.config';
import { AdminApi, DatiServizio, ServizioAdmin } from '../admin-api';
import { messaggiErrore } from '../errori';

type CampoTesto = 'slug' | 'titolo' | 'sommario' | 'descrizione' | 'metaTitle' | 'metaDescription';

const CAMPO =
  'mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 ' +
  'focus:border-blue-700 focus:ring-2 focus:ring-blue-200 focus:outline-none';

/** Lunghezze consigliate da Google (oltre vengono troncati nei risultati di ricerca). */
const META_TITLE_IDEALE = 60;
const META_DESCRIPTION_IDEALE = 160;

const VUOTO: DatiServizio = {
  slug: '',
  titolo: '',
  sommario: '',
  descrizione: '',
  metaTitle: '',
  metaDescription: '',
  categoriaProdotti: null,
  puntiChiave: [],
  incluso: [],
  faq: [],
  ordine: 10,
  attivo: false,
};

function datiDi(s: ServizioAdmin): DatiServizio {
  const { id: _id, ultimaModifica: _m, immagine: _i, ...dati } = s;
  return dati;
}

/** "Installazione caldaie a Caserta" -> "installazione-caldaie-a-caserta" */
export function creaSlug(testo: string): string {
  return testo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

@Component({
  selector: 'app-admin-servizio',
  imports: [RouterLink],
  template: `
    <a routerLink="/admin/servizi" class="text-sm font-medium text-blue-800 hover:underline">← Tutti i servizi</a>

    @if (servizio.error()) {
      <p role="alert" class="mt-4 rounded-lg bg-red-50 p-4 text-red-800">Servizio non trovato.</p>
    } @else if (bozza(); as b) {
      <div class="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">{{ nuovo() ? 'Nuovo servizio' : b.titolo || 'Servizio' }}</h1>
          @if (modificato()) { <p class="mt-1 text-sm text-amber-800">Modifiche non salvate</p> }
        </div>
        <div class="flex flex-wrap gap-2">
          @if (!nuovo() && servizio.value()?.attivo) {
            <a [href]="'/servizi/' + servizio.value()?.slug" target="_blank" rel="noopener"
              class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50">Vedi sul sito ↗</a>
          }
          <button type="button" (click)="salva()" [disabled]="occupato() || !modificato()"
            class="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
            {{ occupato() ? 'Salvataggio…' : nuovo() ? 'Crea servizio' : 'Salva' }}
          </button>
        </div>
      </div>

      <div aria-live="polite" class="mt-3 space-y-2">
        @if (errori().length) {
          <div role="alert" class="rounded-lg bg-red-50 p-4 text-sm text-red-800">
            <ul class="list-inside list-disc">@for (e of errori(); track $index) { <li>{{ e }}</li> }</ul>
          </div>
        }
        @if (messaggio()) { <p class="rounded-lg bg-green-50 p-3 text-sm text-green-900">{{ messaggio() }}</p> }
      </div>

      <div class="mt-6 grid gap-6 lg:grid-cols-3">
        <div class="space-y-6 lg:col-span-2">
          <section class="rounded-2xl bg-white p-6 shadow-sm" aria-labelledby="titolo-contenuti">
            <h2 id="titolo-contenuti" class="font-semibold text-slate-900">Contenuti della pagina</h2>
            <div class="mt-4 space-y-4">
              <div>
                <label for="titolo" class="text-sm font-medium text-slate-700">Titolo (H1 della pagina) *</label>
                <input id="titolo" type="text" maxlength="120" [class]="campo" [value]="b.titolo" (input)="aggiornaTitolo(testo($event))" />
              </div>
              <div>
                <label for="sommario" class="text-sm font-medium text-slate-700">Sommario (card in home e nell'elenco) *</label>
                <textarea id="sommario" rows="2" maxlength="300" [class]="campo" [value]="b.sommario" (input)="aggiorna('sommario', testo($event))"></textarea>
                <p class="mt-1 text-xs text-slate-500">{{ b.sommario.length }}/300</p>
              </div>
              <div>
                <label for="descrizione" class="text-sm font-medium text-slate-700">Descrizione completa *</label>
                <textarea id="descrizione" rows="12" maxlength="10000" [class]="campo" [value]="b.descrizione" (input)="aggiorna('descrizione', testo($event))"></textarea>
                <p class="mt-1 text-xs text-slate-500">
                  {{ parole() }} parole. Per Google conviene un testo completo (almeno 500 parole): cosa comprende, marche, tempi,
                  detrazioni fiscali. Gli a capo vengono mantenuti sul sito.
                </p>
              </div>
            </div>
          </section>

          <section class="rounded-2xl bg-white p-6 shadow-sm" aria-labelledby="titolo-dettagli">
            <h2 id="titolo-dettagli" class="font-semibold text-slate-900">Punti chiave e cosa comprende</h2>
            <div class="mt-4 space-y-4">
              <div>
                <label for="punti-chiave" class="text-sm font-medium text-slate-700">Punti chiave (badge in cima alla pagina)</label>
                <textarea id="punti-chiave" rows="4" [class]="campo" [value]="b.puntiChiave.join('\\n')"
                  placeholder="Sopralluogo gratuito"
                  (input)="imposta({ puntiChiave: righe(testo($event)) })" aria-describedby="aiuto-punti"></textarea>
                <p id="aiuto-punti" class="mt-1 text-xs" [class]="contaRighe(b.puntiChiave) > 4 ? 'text-red-700' : 'text-slate-500'">
                  Uno per riga, al massimo 4 e brevi (40 caratteri): {{ contaRighe(b.puntiChiave) }}/4.
                </p>
              </div>
              <div>
                <label for="incluso" class="text-sm font-medium text-slate-700">Cosa comprende il servizio</label>
                <textarea id="incluso" rows="8" [class]="campo" [value]="b.incluso.join('\\n')"
                  placeholder="Sopralluogo e verifica dell'impianto esistente"
                  (input)="imposta({ incluso: righe(testo($event)) })" aria-describedby="aiuto-incluso"></textarea>
                <p id="aiuto-incluso" class="mt-1 text-xs" [class]="contaRighe(b.incluso) > 12 ? 'text-red-700' : 'text-slate-500'">
                  Una voce per riga, al massimo 12: {{ contaRighe(b.incluso) }}/12. Nella pagina diventano una lista con le spunte.
                </p>
              </div>
            </div>
          </section>

          <section class="rounded-2xl bg-white p-6 shadow-sm" aria-labelledby="titolo-faq">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <h2 id="titolo-faq" class="font-semibold text-slate-900">Domande frequenti ({{ b.faq.length }}/10)</h2>
              <button type="button" (click)="aggiungiFaq()" [disabled]="b.faq.length >= 10"
                class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50">
                + Aggiungi domanda
              </button>
            </div>
            <p class="mt-1 text-xs text-slate-500">
              Le domande che i clienti fanno davvero al telefono. Google può mostrarle direttamente nei risultati di ricerca.
            </p>
            <ol class="mt-4 space-y-4">
              @for (f of b.faq; track $index; let i = $index, primo = $first, ultimo = $last) {
                <li class="rounded-xl border border-slate-200 p-4">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-sm font-semibold text-slate-500">Domanda {{ i + 1 }}</span>
                    <span class="flex gap-1">
                      <button type="button" (click)="spostaFaq(i, -1)" [disabled]="primo" [attr.aria-label]="'Sposta su la domanda ' + (i + 1)"
                        class="rounded-md px-2 py-1 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-40">↑</button>
                      <button type="button" (click)="spostaFaq(i, 1)" [disabled]="ultimo" [attr.aria-label]="'Sposta giù la domanda ' + (i + 1)"
                        class="rounded-md px-2 py-1 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-40">↓</button>
                      <button type="button" (click)="rimuoviFaq(i)" [attr.aria-label]="'Rimuovi la domanda ' + (i + 1)"
                        class="rounded-md px-2 py-1 text-sm font-semibold text-red-700 hover:bg-red-50">Rimuovi</button>
                    </span>
                  </div>
                  <label [for]="'faq-domanda-' + i" class="mt-2 block text-sm font-medium text-slate-700">Domanda *</label>
                  <input [id]="'faq-domanda-' + i" type="text" maxlength="200" [class]="campo" [value]="f.domanda"
                    (input)="modificaFaq(i, { domanda: testo($event) })" />
                  <label [for]="'faq-risposta-' + i" class="mt-3 block text-sm font-medium text-slate-700">Risposta *</label>
                  <textarea [id]="'faq-risposta-' + i" rows="3" maxlength="1500" [class]="campo" [value]="f.risposta"
                    (input)="modificaFaq(i, { risposta: testo($event) })"></textarea>
                </li>
              } @empty {
                <li class="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Nessuna domanda: la sezione non compare nella pagina.</li>
              }
            </ol>
          </section>

          <section class="rounded-2xl bg-white p-6 shadow-sm" aria-labelledby="titolo-seo">
            <h2 id="titolo-seo" class="font-semibold text-slate-900">SEO</h2>
            <div class="mt-4 space-y-4">
              <div>
                <label for="slug" class="text-sm font-medium text-slate-700">Slug (indirizzo della pagina) *</label>
                <div class="mt-1 flex items-center rounded-lg border border-slate-300 bg-slate-50 focus-within:border-blue-700 focus-within:ring-2 focus-within:ring-blue-200">
                  <span class="pl-3 text-sm text-slate-500">/servizi/</span>
                  <input id="slug" type="text" maxlength="120" class="w-full rounded-r-lg bg-white px-2 py-2 focus:outline-none"
                    [value]="b.slug" (input)="aggiornaSlug(testo($event))" />
                </div>
                @if (slugCambiato()) {
                  <p class="mt-1 text-sm text-amber-800">
                    Cambiando lo slug cambia l'indirizzo della pagina. Il vecchio indirizzo verrà reindirizzato
                    automaticamente (redirect 301), ma Google impiegherà qualche settimana ad aggiornarsi: cambialo solo se serve.
                  </p>
                }
              </div>
              <div>
                <label for="meta-title" class="text-sm font-medium text-slate-700">Meta title (titolo nei risultati di Google) *</label>
                <input id="meta-title" type="text" maxlength="70" [class]="campo" [value]="b.metaTitle" (input)="aggiorna('metaTitle', testo($event))" />
                <p class="mt-1 text-xs" [class]="b.metaTitle.length > metaTitleIdeale ? 'text-amber-800' : 'text-slate-500'">
                  {{ b.metaTitle.length }}/{{ metaTitleIdeale }} consigliati. Includi il servizio e "Caserta".
                </p>
              </div>
              <div>
                <label for="meta-description" class="text-sm font-medium text-slate-700">Meta description *</label>
                <textarea id="meta-description" rows="3" maxlength="170" [class]="campo" [value]="b.metaDescription" (input)="aggiorna('metaDescription', testo($event))"></textarea>
                <p class="mt-1 text-xs" [class]="b.metaDescription.length > metaDescriptionIdeale ? 'text-amber-800' : 'text-slate-500'">
                  {{ b.metaDescription.length }}/{{ metaDescriptionIdeale }} consigliati. Chiudi con un invito all'azione (es. "Richiedi un preventivo").
                </p>
              </div>
            </div>
          </section>
        </div>

        <aside class="space-y-6">
          <section class="rounded-2xl bg-white p-6 shadow-sm" aria-labelledby="titolo-pubblicazione">
            <h2 id="titolo-pubblicazione" class="font-semibold text-slate-900">Pubblicazione</h2>
            <label class="mt-4 flex items-center gap-3">
              <input type="checkbox" class="size-5 accent-blue-800" [checked]="b.attivo"
                (change)="imposta({ attivo: $any($event.target).checked })" />
              <span class="text-sm text-slate-800">Online (visibile sul sito e nella sitemap)</span>
            </label>
            <label for="ordine" class="mt-4 block text-sm font-medium text-slate-700">Ordine di visualizzazione</label>
            <input id="ordine" type="number" min="0" max="9999" [class]="campo" [value]="b.ordine"
              (input)="imposta({ ordine: +testo($event) || 0 })" />
            <p class="mt-1 text-xs text-slate-500">I numeri più bassi vengono mostrati per primi.</p>

            <label for="catalogo" class="mt-4 block text-sm font-medium text-slate-700">Catalogo collegato</label>
            <select id="catalogo" [class]="campo" (change)="impostaCatalogo(testo($event))">
              <option value="" [selected]="!b.categoriaProdotti">Nessuno</option>
              @for (c of categorie; track c.valore) {
                <option [value]="c.valore" [selected]="b.categoriaProdotti === c.valore">{{ c.etichetta }}</option>
              }
            </select>
            <p class="mt-1 text-xs text-slate-500">
              Se scegli un catalogo, nel modulo contatti il cliente potrà indicare il modello (o dire che ce l'ha già)
              e la pagina del servizio mostrerà alcuni modelli.
            </p>
          </section>

          <section class="rounded-2xl bg-white p-6 shadow-sm" aria-labelledby="titolo-foto">
            <h2 id="titolo-foto" class="font-semibold text-slate-900">Foto</h2>
            @if (nuovo()) {
              <p class="mt-3 text-sm text-slate-600">Potrai caricare la foto dopo aver creato il servizio.</p>
            } @else {
              @if (foto(); as f) {
                <img [src]="f.src" [srcset]="f.srcset" sizes="320px" [width]="f.larghezza" [height]="f.altezza"
                  [alt]="'Foto attuale di ' + b.titolo" class="mt-4 aspect-video w-full rounded-lg object-cover" />
              } @else {
                <p class="mt-3 text-sm text-slate-600">Nessuna foto: sul sito viene mostrata un'icona.</p>
              }
              <label for="foto" class="mt-4 inline-block cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 has-[:disabled]:cursor-default has-[:disabled]:opacity-60 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-300">
                {{ caricamento() ? 'Caricamento…' : foto() ? 'Sostituisci foto' : 'Carica foto' }}
                <input id="foto" type="file" accept="image/jpeg,image/png,image/webp" class="sr-only"
                  [disabled]="caricamento()" (change)="caricaFoto($event)" />
              </label>
              @if (foto()) {
                <button type="button" (click)="rimuoviFoto()" [disabled]="caricamento()"
                  class="ml-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60">Rimuovi</button>
              }
              <p class="mt-2 text-xs text-slate-500">
                JPG, PNG o WebP fino a 10 MB, almeno 800×450 pixel. Viene ritagliata al centro in formato 16:9 e
                convertita in WebP. Meglio una foto orizzontale di un lavoro reale.
              </p>
            }
          </section>

          <section class="rounded-2xl bg-white p-6 shadow-sm" aria-labelledby="titolo-anteprima">
            <h2 id="titolo-anteprima" class="font-semibold text-slate-900">Anteprima su Google</h2>
            <div class="mt-4 font-[Arial,sans-serif]">
              <p class="truncate text-xs text-slate-700">{{ dominio }} › servizi › {{ b.slug || '…' }}</p>
              <p class="mt-1 line-clamp-2 text-lg leading-snug text-[#1a0dab]">{{ tronca(b.metaTitle || b.titolo || 'Titolo della pagina', metaTitleIdeale) }}</p>
              <p class="mt-1 line-clamp-3 text-sm text-slate-700">{{ tronca(b.metaDescription || 'Descrizione della pagina…', metaDescriptionIdeale) }}</p>
            </div>
          </section>
        </aside>
      </div>
    } @else {
      <p class="mt-4 text-slate-500">Caricamento…</p>
    }
  `,
})
export default class AdminServizio {
  /** Assente sulla route /admin/servizi/nuovo. */
  readonly id = input(undefined, { transform: (v: unknown) => (v === undefined ? undefined : numberAttribute(v)) });

  private readonly api = inject(AdminApi);
  private readonly router = inject(Router);

  protected readonly campo = CAMPO;
  protected readonly metaTitleIdeale = META_TITLE_IDEALE;
  protected readonly metaDescriptionIdeale = META_DESCRIPTION_IDEALE;
  protected readonly dominio = SITE.url.replace(/^https?:\/\//, '');
  protected readonly categorie = Object.entries(CATEGORIE).map(([valore, c]) => ({ valore, etichetta: c.plurale }));

  protected readonly nuovo = computed(() => this.id() === undefined);

  protected readonly servizio = rxResource({
    params: () => this.id(),
    stream: ({ params }) => (params === undefined ? of(null) : this.api.servizio(params)),
  });

  protected readonly bozza = linkedSignal<DatiServizio | null>(() => {
    if (this.nuovo()) return { ...VUOTO };
    const s = this.servizio.value();
    return s ? datiDi(s) : null;
  });

  /** Nei servizi nuovi lo slug segue il titolo finché non viene modificato a mano. */
  private readonly slugManuale = signal(false);

  protected readonly modificato = computed(() => {
    const b = this.bozza();
    const s = this.servizio.value();
    return JSON.stringify(b) !== JSON.stringify(s ? datiDi(s) : VUOTO);
  });
  protected readonly slugCambiato = computed(() => {
    const s = this.servizio.value();
    return !!s && s.attivo && this.bozza()?.slug !== s.slug;
  });
  protected readonly parole = computed(() => (this.bozza()?.descrizione.trim().split(/\s+/).filter(Boolean).length ?? 0));

  protected readonly foto = computed(() => fotoServizio(this.servizio.value()?.immagine));
  protected readonly caricamento = signal(false);

  protected async caricaFoto(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // permette di ricaricare lo stesso file
    const id = this.id();
    if (!file || id === undefined) return;
    if (file.size > 10 * 1024 * 1024) {
      this.errori.set(['File troppo grande (massimo 10 MB)']);
      return;
    }
    await this.operazioneFoto(() => firstValueFrom(this.api.caricaImmagine(id, file)), 'Foto caricata: è già online.');
  }

  protected async rimuoviFoto(): Promise<void> {
    const id = this.id();
    if (id === undefined || !confirm('Rimuovere la foto del servizio?')) return;
    await this.operazioneFoto(() => firstValueFrom(this.api.eliminaImmagine(id)), 'Foto rimossa.');
  }

  /** La foto si salva subito e da sola: le altre modifiche della bozza restano in sospeso. */
  private async operazioneFoto(azione: () => Promise<ServizioAdmin>, esito: string): Promise<void> {
    this.caricamento.set(true);
    this.errori.set([]);
    this.messaggio.set('');
    const bozzaInCorso = this.bozza();
    try {
      this.servizio.set(await azione());
      // l'aggiornamento del servizio riallinea la bozza: ripristina le modifiche non ancora salvate
      this.bozza.set(bozzaInCorso);
      this.messaggio.set(esito);
    } catch (e) {
      this.errori.set(messaggiErrore(e));
    } finally {
      this.caricamento.set(false);
    }
  }

  protected readonly occupato = signal(false);
  protected readonly errori = signal<string[]>([]);
  protected readonly messaggio = signal('');

  protected testo(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected tronca(testo: string, max: number): string {
    return testo.length > max ? testo.slice(0, max - 1).trimEnd() + '…' : testo;
  }

  /**
   * Applica le modifiche all'ultimo valore della bozza. Non usare mai la variabile del template (b):
   * è la copia dell'ultimo rendering e sovrascriverebbe le modifiche fatte nel frattempo.
   */
  protected imposta(modifica: Partial<DatiServizio>): void {
    this.bozza.update((b) => (b ? { ...b, ...modifica } : b));
  }

  protected aggiorna(campo: CampoTesto, valore: string): void {
    this.imposta({ [campo]: valore });
  }

  /** Testo di una textarea "una voce per riga": le righe vuote restano finché si scrive, si tolgono al salvataggio. */
  protected righe(testo: string): string[] {
    return testo === '' ? [] : testo.split('\n');
  }

  protected contaRighe(voci: string[]): number {
    return voci.filter((v) => v.trim()).length;
  }

  protected aggiungiFaq(): void {
    this.bozza.update((b) => (b ? { ...b, faq: [...b.faq, { domanda: '', risposta: '' }] } : b));
  }

  protected modificaFaq(indice: number, modifica: Partial<Faq>): void {
    this.bozza.update((b) => (b ? { ...b, faq: b.faq.map((f, i) => (i === indice ? { ...f, ...modifica } : f)) } : b));
  }

  protected rimuoviFaq(indice: number): void {
    this.bozza.update((b) => (b ? { ...b, faq: b.faq.filter((_, i) => i !== indice) } : b));
  }

  protected spostaFaq(indice: number, direzione: -1 | 1): void {
    this.bozza.update((b) => {
      if (!b) return b;
      const faq = [...b.faq];
      const destinazione = indice + direzione;
      if (destinazione < 0 || destinazione >= faq.length) return b;
      [faq[indice], faq[destinazione]] = [faq[destinazione], faq[indice]];
      return { ...b, faq };
    });
  }

  protected impostaCatalogo(valore: string): void {
    this.imposta({ categoriaProdotti: (valore || null) as CategoriaProdotto | null });
  }

  protected aggiornaTitolo(titolo: string): void {
    this.bozza.update((b) => (b ? { ...b, titolo, slug: this.nuovo() && !this.slugManuale() ? creaSlug(titolo) : b.slug } : b));
  }

  protected aggiornaSlug(slug: string): void {
    this.slugManuale.set(true);
    this.aggiorna('slug', slug);
  }

  protected async salva(): Promise<void> {
    const bozza = this.bozza();
    if (!bozza) return;
    const pulisci = (voci: string[]) => voci.map((v) => v.trim()).filter(Boolean);
    const dati: DatiServizio = { ...bozza, puntiChiave: pulisci(bozza.puntiChiave), incluso: pulisci(bozza.incluso) };
    this.occupato.set(true);
    this.errori.set([]);
    this.messaggio.set('');
    try {
      const id = this.id();
      if (id === undefined) {
        const creato = await firstValueFrom(this.api.creaServizio(dati));
        await this.router.navigate(['/admin/servizi', creato.id]);
      } else {
        this.servizio.set(await firstValueFrom(this.api.aggiornaServizio(id, dati)));
        this.messaggio.set(dati.attivo ? 'Salvato: le modifiche sono già online.' : 'Salvato (servizio non attivo, non visibile sul sito).');
      }
    } catch (e) {
      this.errori.set(messaggiErrore(e));
    } finally {
      this.occupato.set(false);
    }
  }
}
